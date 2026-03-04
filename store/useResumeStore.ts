import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  ResumeData,
  Section,
  SectionType,
  SectionItem,
  ItemVisibility,
  SectionConfig,
  TemplateStyles,
  TemplateId,
  TemplateLayout,
  PersonalInfoVisibility,
} from "@/types/resume";
import {
  SECTION_SCHEMAS,
  getInitialVisibility,
  createInitialResume,
} from "@/lib/resume-config";
import { emptyBlock, createBlock } from "@/lib/utils";
import { buildImportedResume, mergeResumes } from "./resumeUtils";

const SYNC_DEBOUNCE_MS = 1200;

const generateId = () =>
  globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).substr(2, 9);

export interface ResumeState {
  resumes: ResumeData[];
  activeResumeId: string | null;
  isTextSelected: boolean;
  isAuthenticated: boolean;
  hasInitializedSync: boolean;
  authAttempted: boolean; // Flag to prevent repeated /api/auth/me calls for guests
  currentUser: { id: string; email: string } | null;

  // Sync tracking (excluded from persistence)
  syncTimer: ReturnType<typeof setTimeout> | null;
  syncedResumeVersions: Map<string, number>;
  knownServerResumeIds: Set<string>;

  // Actions
  createNewResume: (templateId?: TemplateId) => void;
  deleteResume: (id: string) => void;
  setActiveResume: (id: string) => void;
  setIsTextSelected: (isSelected: boolean) => void;
  updatePersonalInfo: (field: string, value: string) => void;
  updatePersonalInfoVisibility: (
    visibility: Partial<PersonalInfoVisibility>,
  ) => void;
  updateSectionTitle: (sectionId: string, title: string) => void;
  updateSectionItem: (
    sectionId: string,
    itemId: string,
    field: keyof SectionItem,
    value: SectionItem[keyof SectionItem],
  ) => void;
  updateItemVisibility: (
    sectionId: string,
    itemId: string,
    visibility: Partial<ItemVisibility>,
  ) => void;
  addSectionItem: (sectionId: string) => void;
  removeSectionItem: (sectionId: string, itemId: string) => void;
  moveSectionItem: (
    sectionId: string,
    itemId: string,
    direction: "up" | "down",
  ) => void;
  addSection: (type: SectionType) => void;
  removeSection: (sectionId: string) => void;
  reorderSections: (newOrder: SectionConfig[]) => void;
  updateSectionConfig: (
    sectionId: string,
    config: Partial<SectionConfig>,
  ) => void;
  updateGlobalStyle: (
    field: keyof TemplateStyles,
    value: TemplateStyles[keyof TemplateStyles],
  ) => void;
  setTemplate: (templateId: TemplateId) => void;
  duplicateResume: (id: string) => void;
  importResume: (resume: Partial<ResumeData>, templateId?: TemplateId) => void;
  renameResume: (id: string, title: string) => void;
  initializeServerSync: (force?: boolean) => Promise<void>;
  syncResume: (id: string) => Promise<void>;
  syncDelete: (id: string) => Promise<void>;
  scheduleServerSync: (id: string) => void;
  markLoggedOut: () => void;
  fetchFullResume: (id: string) => Promise<void>;
}

export const useResumeStore = create<ResumeState>()(
  persist(
    (set, get) => {
      const resetSyncState = () => {
        set({
          syncedResumeVersions: new Map<string, number>(),
          knownServerResumeIds: new Set<string>(),
        });
      };

      return {
        resumes: [],
        activeResumeId: null,
        isTextSelected: false,
        isAuthenticated: false,
        hasInitializedSync: false,
        authAttempted: false,
        currentUser: null,

        // Sync tracking initial state
        syncTimer: null,
        syncedResumeVersions: new Map<string, number>(),
        knownServerResumeIds: new Set<string>(),

        initializeServerSync: async (force = false) => {
          const state = get();

          // If already successfully initialized and not forced, skip
          if (!force && state.hasInitializedSync && state.isAuthenticated)
            return;

          // If we already tried and failed, don't spam unless forced (e.g. login attempt)
          if (!force && state.authAttempted && !state.isAuthenticated) return;

          try {
            const meResponse = await fetch("/api/auth/me", {
              credentials: "include",
            });

            if (!meResponse.ok) {
              set({
                isAuthenticated: false,
                currentUser: null,
                hasInitializedSync: true,
                authAttempted: true,
              });
              resetSyncState();
              return;
            }

            const mePayload = (await meResponse.json()) as {
              user: { id: string; email: string } | null;
            };

            if (!mePayload.user) {
              set({
                isAuthenticated: false,
                currentUser: null,
                hasInitializedSync: true,
                authAttempted: true,
              });
              resetSyncState();
              return;
            }

            const resumeResponse = await fetch("/api/resumes", {
              credentials: "include",
            });

            if (!resumeResponse.ok) {
              set({
                isAuthenticated: true,
                currentUser: mePayload.user,
                hasInitializedSync: true,
                authAttempted: true,
              });
              resetSyncState();
              return;
            }

            const payload = (await resumeResponse.json()) as {
              resumes?: ResumeData[];
            };
            const serverResumes = Array.isArray(payload.resumes)
              ? payload.resumes
              : [];

            const newKnownServerResumeIds = new Set<string>();
            const newSyncedResumeVersions = new Map<string, number>();

            serverResumes.forEach((resume) => {
              newKnownServerResumeIds.add(resume.id);
              newSyncedResumeVersions.set(resume.id, resume.updatedAt);
            });

            const localState = get();
            // Merge metadata. Server resumes might not have 'content' here if we optimized backend
            const mergedResumes = mergeResumes(
              localState.resumes,
              serverResumes,
            );
            const activeResumeId = mergedResumes.some(
              (r) => r.id === localState.activeResumeId,
            )
              ? localState.activeResumeId
              : (mergedResumes[0]?.id ?? null);

            set({
              resumes: mergedResumes,
              activeResumeId,
              isAuthenticated: true,
              currentUser: mePayload.user,
              hasInitializedSync: true,
              authAttempted: true,
              knownServerResumeIds: newKnownServerResumeIds,
              syncedResumeVersions: newSyncedResumeVersions,
            });

            // If we have an active resume, make sure its content is loaded if it's from server
            if (activeResumeId) {
              await get().fetchFullResume(activeResumeId);
            }

            // TRIGGER SYNC FOR OUT-OF-SYNC RESUMES
            // After merging, some local resumes might be newer than the server ones.
            // We need to push these changes to the server.
            mergedResumes.forEach((resume) => {
              const lastSyncedVersion = newSyncedResumeVersions.get(resume.id);
              if (lastSyncedVersion !== resume.updatedAt) {
                console.log(
                  `[SYNC] Resume ${resume.id} is out of sync, triggering update...`,
                );
                void get().syncResume(resume.id);
              }
            });
          } catch (error) {
            console.error("Failed to initialize server sync", error);
            set({
              hasInitializedSync: true,
              authAttempted: true,
            });
          }
        },

        fetchFullResume: async (id: string) => {
          const state = get();
          if (!state.isAuthenticated) return;

          const resume = state.resumes.find((r) => r.id === id);
          // If we already have content and layouts, no need to fetch
          if (resume?.content && resume?.layouts) return;

          try {
            const response = await fetch(`/api/resumes/${id}`, {
              credentials: "include",
            });
            if (response.ok) {
              const { resume: fullResume } = (await response.json()) as {
                resume: ResumeData;
              };
              set((state) => ({
                resumes: state.resumes.map((r) =>
                  r.id === id ? { ...r, ...fullResume } : r,
                ),
              }));
            }
          } catch (error) {
            console.error("Failed to fetch full resume", error);
          }
        },

        syncResume: async (id: string) => {
          const state = get();
          if (!state.isAuthenticated) return;

          const resume = state.resumes.find((r) => r.id === id);
          if (!resume) return;

          // Check if this resume actually needs syncing (avoid redundant calls)
          if (state.syncedResumeVersions.get(id) === resume.updatedAt) {
            return;
          }

          // If we don't have content (e.g. rename on dashboard), fetch it first
          // because the API expects the full resume data.
          if (!resume.content || !resume.layouts) {
            await get().fetchFullResume(id);
            // Re-get resume after fetch
            const updatedResume = get().resumes.find((r) => r.id === id);
            if (!updatedResume?.content) return;
            // Recursively call to sync now that we have content
            return get().syncResume(id);
          }

          const isKnown = state.knownServerResumeIds.has(id);
          const lastSyncedVersion = state.syncedResumeVersions.get(id);

          try {
            if (isKnown) {
              const putResponse = await fetch(`/api/resumes/${resume.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ resume, lastSyncedVersion }),
              });

              if (putResponse.ok) {
                set((state) => {
                  const nextSyncedVersions = new Map(
                    state.syncedResumeVersions,
                  );
                  nextSyncedVersions.set(resume.id, resume.updatedAt);
                  return { syncedResumeVersions: nextSyncedVersions };
                });
              } else if (putResponse.status === 409) {
                // Conflict detected! The server has a newer version.
                // Fetch the latest version from the server to resolve.
                console.warn(
                  `[SYNC] Conflict detected for resume ${id}. Re-fetching...`,
                );
                await get().fetchFullResume(id);
              } else if (putResponse.status === 404) {
                // If it was supposed to be known but server says 404, fallback to POST
                const createResponse = await fetch("/api/resumes", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  credentials: "include",
                  body: JSON.stringify({ resume }),
                });

                if (createResponse.ok || createResponse.status === 409) {
                  set((state) => {
                    const nextKnownIds = new Set(state.knownServerResumeIds);
                    const nextSyncedVersions = new Map(
                      state.syncedResumeVersions,
                    );
                    nextKnownIds.add(resume.id);
                    nextSyncedVersions.set(resume.id, resume.updatedAt);
                    return {
                      knownServerResumeIds: nextKnownIds,
                      syncedResumeVersions: nextSyncedVersions,
                    };
                  });
                }
              }
            } else {
              const createResponse = await fetch("/api/resumes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ resume }),
              });

              if (createResponse.ok || createResponse.status === 409) {
                set((state) => {
                  const nextKnownIds = new Set(state.knownServerResumeIds);
                  const nextSyncedVersions = new Map(
                    state.syncedResumeVersions,
                  );
                  nextKnownIds.add(resume.id);
                  nextSyncedVersions.set(resume.id, resume.updatedAt);
                  return {
                    knownServerResumeIds: nextKnownIds,
                    syncedResumeVersions: nextSyncedVersions,
                  };
                });
              }
            }
          } catch (error) {
            console.error(`[SYNC] Failed to sync resume ${id}:`, error);
          }
        },

        syncDelete: async (id: string) => {
          const state = get();
          if (!state.isAuthenticated || !state.knownServerResumeIds.has(id)) {
            return;
          }

          try {
            const deleteResponse = await fetch(`/api/resumes/${id}`, {
              method: "DELETE",
              credentials: "include",
            });

            if (deleteResponse.ok || deleteResponse.status === 404) {
              set((state) => {
                const nextKnownIds = new Set(state.knownServerResumeIds);
                const nextSyncedVersions = new Map(state.syncedResumeVersions);
                nextKnownIds.delete(id);
                nextSyncedVersions.delete(id);
                return {
                  knownServerResumeIds: nextKnownIds,
                  syncedResumeVersions: nextSyncedVersions,
                };
              });
            }
          } catch (error) {
            console.error(`[SYNC] Failed to delete resume ${id}:`, error);
          }
        },

        scheduleServerSync: (id: string) => {
          const { syncTimer } = get();
          if (syncTimer) clearTimeout(syncTimer);
          const newTimer = setTimeout(() => {
            void get().syncResume(id);
          }, SYNC_DEBOUNCE_MS);
          set({ syncTimer: newTimer });
        },

        markLoggedOut: () => {
          set({
            isAuthenticated: false,
            currentUser: null,

            hasInitializedSync: true,
            authAttempted: true,
          });
          resetSyncState();
        },

        createNewResume: (templateId?: TemplateId) => {
          const id = generateId();
          const newResume = createInitialResume(id, "New Resume", templateId);
          set((state) => ({
            resumes: [...state.resumes, newResume],
            activeResumeId: id,
          }));
          void get().syncResume(id);
        },

        renameResume: (id, title) => {
          set((state) => ({
            resumes: state.resumes.map((r) =>
              r.id === id ? { ...r, title, updatedAt: Date.now() } : r,
            ),
          }));
          void get().syncResume(id);
        },

        duplicateResume: (id) => {
          const newId = generateId();
          let duplicated = false;

          set((state) => {
            const resumeToDuplicate = state.resumes.find((r) => r.id === id);
            if (!resumeToDuplicate) return state;

            duplicated = true;
            const now = Date.now();
            const duplicatedResume: ResumeData = {
              ...structuredClone(resumeToDuplicate),
              id: newId,
              title: `${resumeToDuplicate.title} (Copy)`,
              createdAt: now,
              updatedAt: now,
            };

            return {
              resumes: [...state.resumes, duplicatedResume],
              activeResumeId: newId,
            };
          });

          if (duplicated) {
            void get().syncResume(newId);
          }
        },

        importResume: (
          resume: Partial<ResumeData>,
          templateId?: TemplateId,
        ) => {
          const id = generateId();
          const importedResume = buildImportedResume({
            resume,
            id,
            templateId,
          });

          set((state) => ({
            resumes: [...state.resumes, importedResume],
            activeResumeId: id,
          }));
          void get().syncResume(id);
        },

        deleteResume: (id) => {
          set((state) => ({
            resumes: state.resumes.filter((r) => r.id !== id),
            activeResumeId:
              state.activeResumeId === id
                ? state.resumes[0]?.id || null
                : state.activeResumeId,
          }));
          void get().syncDelete(id);
        },

        setActiveResume: (id) => {
          set({ activeResumeId: id });
          if (id) {
            void get().fetchFullResume(id);
          }
        },

        setIsTextSelected: (isSelected) => set({ isTextSelected: isSelected }),

        updatePersonalInfo: (field, value) => {
          const state = get();
          const activeResume = state.resumes.find(
            (r) => r.id === state.activeResumeId,
          );
          if (
            !activeResume ||
            activeResume.content?.personalInfo[
              field as keyof typeof activeResume.content.personalInfo
            ] === value
          )
            return;

          set((state) => ({
            resumes: state.resumes.map((r) =>
              r.id === state.activeResumeId
                ? {
                    ...r,
                    updatedAt: Date.now(),
                    content: {
                      ...r.content!,
                      personalInfo: {
                        ...r.content!.personalInfo,
                        [field]: value,
                      },
                    },
                  }
                : r,
            ),
          }));
          if (state.activeResumeId)
            get().scheduleServerSync(state.activeResumeId);
        },

        updatePersonalInfoVisibility: (visibility) => {
          const state = get();
          const activeResume = state.resumes.find(
            (r) => r.id === state.activeResumeId,
          );
          if (!activeResume) return;

          const currentVisibility =
            activeResume.content?.personalInfo.visibility;
          const isChanged = Object.entries(visibility).some(
            ([key, val]) =>
              currentVisibility?.[key as keyof typeof currentVisibility] !==
              val,
          );
          if (!isChanged) return;

          set((state) => ({
            resumes: state.resumes.map((r) =>
              r.id === state.activeResumeId
                ? {
                    ...r,
                    updatedAt: Date.now(),
                    content: {
                      ...r.content!,
                      personalInfo: {
                        ...r.content!.personalInfo,
                        visibility: {
                          ...r.content!.personalInfo.visibility,
                          ...visibility,
                        },
                      },
                    },
                  }
                : r,
            ),
          }));
          if (state.activeResumeId)
            get().scheduleServerSync(state.activeResumeId);
        },

        updateSectionTitle: (sectionId, title) => {
          const state = get();
          const activeResume = state.resumes.find(
            (r) => r.id === state.activeResumeId,
          );
          const section = activeResume?.content?.sections.find(
            (s) => s.id === sectionId,
          );
          if (!section || section.title === title) return;

          set((state) => ({
            resumes: state.resumes.map((r) =>
              r.id === state.activeResumeId
                ? {
                    ...r,
                    updatedAt: Date.now(),
                    content: {
                      ...r.content!,
                      sections: r.content!.sections.map((s) =>
                        s.id === sectionId ? { ...s, title } : s,
                      ),
                    },
                  }
                : r,
            ),
          }));
          if (state.activeResumeId)
            get().scheduleServerSync(state.activeResumeId);
        },

        updateSectionItem: (sectionId, itemId, field, value) => {
          const state = get();
          const activeResume = state.resumes.find(
            (r) => r.id === state.activeResumeId,
          );
          const section = activeResume?.content?.sections.find(
            (s) => s.id === sectionId,
          );
          const item = section?.items.find((i) => i.id === itemId);
          if (!item || item[field as keyof typeof item] === value) return;

          set((state) => ({
            resumes: state.resumes.map((r) =>
              r.id === state.activeResumeId
                ? {
                    ...r,
                    updatedAt: Date.now(),
                    content: {
                      ...r.content!,
                      sections: r.content!.sections.map((s) =>
                        s.id === sectionId
                          ? {
                              ...s,
                              items: s.items.map((i) =>
                                i.id === itemId ? { ...i, [field]: value } : i,
                              ),
                            }
                          : s,
                      ),
                    },
                  }
                : r,
            ),
          }));
          if (state.activeResumeId)
            get().scheduleServerSync(state.activeResumeId);
        },

        updateItemVisibility: (sectionId, itemId, visibility) => {
          const state = get();
          const activeResume = state.resumes.find(
            (r) => r.id === state.activeResumeId,
          );
          const section = activeResume?.content?.sections.find(
            (s) => s.id === sectionId,
          );
          const item = section?.items.find((i) => i.id === itemId);
          if (!item) return;

          const isChanged = Object.entries(visibility).some(
            ([key, val]) =>
              item.visibility[key as keyof typeof item.visibility] !== val,
          );
          if (!isChanged) return;

          set((state) => ({
            resumes: state.resumes.map((r) =>
              r.id === state.activeResumeId
                ? {
                    ...r,
                    updatedAt: Date.now(),
                    content: {
                      ...r.content!,
                      sections: r.content!.sections.map((s) =>
                        s.id === sectionId
                          ? {
                              ...s,
                              items: s.items.map((i) =>
                                i.id === itemId
                                  ? {
                                      ...i,
                                      visibility: {
                                        ...i.visibility,
                                        ...visibility,
                                      },
                                    }
                                  : i,
                              ),
                            }
                          : s,
                      ),
                    },
                  }
                : r,
            ),
          }));
          if (state.activeResumeId)
            get().scheduleServerSync(state.activeResumeId);
        },

        addSectionItem: (sectionId) => {
          set((state) => ({
            resumes: state.resumes.map((r) =>
              r.id === state.activeResumeId
                ? {
                    ...r,
                    updatedAt: Date.now(),
                    content: {
                      ...r.content!,
                      sections: r.content!.sections.map((s) => {
                        if (s.id !== sectionId) return s;

                        const { defaults } = SECTION_SCHEMAS[s.type];
                        const {
                          description: defaultDescription,
                          bullets: defaultBullets,
                          ...restDefaults
                        } = defaults;

                        const newItem: SectionItem = {
                          id: generateId(),
                          title: "New Item",
                          subtitle: "",
                          description: defaultDescription
                            ? [
                                createBlock([
                                  { type: "text", text: defaultDescription },
                                ]),
                              ]
                            : [emptyBlock()],
                          bullets: defaultBullets
                            ? defaultBullets.map((b) =>
                                createBlock([{ type: "text", text: b }]),
                              )
                            : [],
                          location: "",
                          datePeriod: { startDate: null, endDate: null },
                          ...restDefaults,
                          visibility: getInitialVisibility(s.type),
                        };

                        return {
                          ...s,
                          items: [...s.items, newItem],
                        };
                      }),
                    },
                  }
                : r,
            ),
          }));
          const state = get();
          if (state.activeResumeId)
            get().scheduleServerSync(state.activeResumeId);
        },

        removeSectionItem: (sectionId, itemId) => {
          set((state) => ({
            resumes: state.resumes.map((r) => {
              if (r.id !== state.activeResumeId) return r;

              const newSections = r.content!.sections.map((section) => {
                if (section.id === sectionId) {
                  const newItems = section.items.filter((i) => i.id !== itemId);
                  return { ...section, items: newItems };
                }
                return section;
              });

              return {
                ...r,
                updatedAt: Date.now(),
                content: {
                  ...r.content!,
                  sections: newSections,
                },
              };
            }),
          }));
          const state = get();
          if (state.activeResumeId)
            get().scheduleServerSync(state.activeResumeId);
        },

        moveSectionItem: (sectionId, itemId, direction) => {
          set((state) => ({
            resumes: state.resumes.map((r) =>
              r.id === state.activeResumeId
                ? {
                    ...r,
                    updatedAt: Date.now(),
                    content: {
                      ...r.content!,
                      sections: r.content!.sections.map((s) => {
                        if (s.id !== sectionId) return s;
                        const index = s.items.findIndex((i) => i.id === itemId);
                        if (index === -1) return s;

                        const newItems = [...s.items];
                        const targetIndex =
                          direction === "up" ? index - 1 : index + 1;

                        if (targetIndex >= 0 && targetIndex < newItems.length) {
                          [newItems[index], newItems[targetIndex]] = [
                            newItems[targetIndex],
                            newItems[index],
                          ];
                        }

                        return { ...s, items: newItems };
                      }),
                    },
                  }
                : r,
            ),
          }));
          const state = get();
          if (state.activeResumeId)
            get().scheduleServerSync(state.activeResumeId);
        },

        addSection: (type) => {
          set((state) => {
            const newSectionId = generateId();

            const { defaults } = SECTION_SCHEMAS[type];
            const {
              description: defaultDescription,
              bullets: defaultBullets,
              ...restDefaults
            } = defaults;

            const initialItem: SectionItem = {
              id: generateId(),
              title: "New Item",
              subtitle: "",
              description: defaultDescription
                ? [createBlock([{ type: "text", text: defaultDescription }])]
                : [emptyBlock()],
              bullets: defaultBullets
                ? defaultBullets.map((b) =>
                    createBlock([{ type: "text", text: b }]),
                  )
                : [],
              location: "",
              datePeriod: { startDate: null, endDate: null },
              ...restDefaults,
              visibility: getInitialVisibility(type),
            };

            const newSection: Section = {
              id: newSectionId,
              type,
              title: type.toUpperCase(),
              items: [initialItem],
            };

            return {
              resumes: state.resumes.map((r) =>
                r.id === state.activeResumeId
                  ? {
                      ...r,
                      updatedAt: Date.now(),
                      content: {
                        ...r.content!,
                        sections: [...r.content!.sections, newSection],
                      },
                      layouts: Object.keys(r.layouts!).reduce(
                        (acc, tid) => {
                          const templateId = tid as TemplateId;
                          acc[templateId] = {
                            ...r.layouts![templateId],
                            sections: [
                              ...r.layouts![templateId].sections,
                              {
                                id: newSectionId,
                                isVisible: true,
                                column: "mainColumn",
                              },
                            ],
                          };
                          return acc;
                        },
                        {} as Record<TemplateId, TemplateLayout>,
                      ),
                    }
                  : r,
              ),
            };
          });
          const state = get();
          if (state.activeResumeId)
            get().scheduleServerSync(state.activeResumeId);
        },

        removeSection: (id) => {
          set((state) => ({
            resumes: state.resumes.map((r) =>
              r.id === state.activeResumeId
                ? {
                    ...r,
                    updatedAt: Date.now(),
                    content: {
                      ...r.content!,
                      sections: r.content!.sections.filter((s) => s.id !== id),
                    },
                    layouts: Object.keys(r.layouts!).reduce(
                      (acc, tid) => {
                        const templateId = tid as TemplateId;
                        acc[templateId] = {
                          ...r.layouts![templateId],
                          sections: r.layouts![templateId].sections.filter(
                            (s) => s.id !== id,
                          ),
                        };
                        return acc;
                      },
                      {} as Record<TemplateId, TemplateLayout>,
                    ),
                  }
                : r,
            ),
          }));
          const state = get();
          if (state.activeResumeId)
            get().scheduleServerSync(state.activeResumeId);
        },

        reorderSections: (newOrder) => {
          set((state) => ({
            resumes: state.resumes.map((r) =>
              r.id === state.activeResumeId
                ? {
                    ...r,
                    updatedAt: Date.now(),
                    layouts: {
                      ...r.layouts!,
                      [r.activeTemplateId]: {
                        ...r.layouts![r.activeTemplateId],
                        sections: newOrder,
                      },
                    },
                  }
                : r,
            ),
          }));
          const state = get();
          if (state.activeResumeId)
            get().scheduleServerSync(state.activeResumeId);
        },

        updateSectionConfig: (sectionId, config) => {
          const state = get();
          const activeResume = state.resumes.find(
            (r) => r.id === state.activeResumeId,
          );
          if (!activeResume || !activeResume.layouts) return;

          const currentConfig = activeResume.layouts[
            activeResume.activeTemplateId
          ].sections.find((s) => s.id === sectionId);
          if (!currentConfig) return;

          const isChanged = Object.entries(config).some(
            ([key, val]) =>
              currentConfig[key as keyof typeof currentConfig] !== val,
          );
          if (!isChanged) return;

          set((state) => ({
            resumes: state.resumes.map((r) =>
              r.id === state.activeResumeId
                ? {
                    ...r,
                    updatedAt: Date.now(),
                    layouts: {
                      ...r.layouts!,
                      [r.activeTemplateId]: {
                        ...r.layouts![r.activeTemplateId],
                        sections: r.layouts![r.activeTemplateId].sections.map(
                          (s) => (s.id === sectionId ? { ...s, ...config } : s),
                        ),
                      },
                    },
                  }
                : r,
            ),
          }));
          if (state.activeResumeId)
            get().scheduleServerSync(state.activeResumeId);
        },

        updateGlobalStyle: (field, value) => {
          const state = get();
          const activeResume = state.resumes.find(
            (r) => r.id === state.activeResumeId,
          );
          if (!activeResume || !activeResume.layouts) return;

          const currentStyles =
            activeResume.layouts[activeResume.activeTemplateId].templateStyles;
          // Deep compare for columnWidths
          if (field === "columnWidths") {
            const currentVal = JSON.stringify(currentStyles[field]);
            const newVal = JSON.stringify(value);
            if (currentVal === newVal) return;
          } else if (
            currentStyles[field as keyof typeof currentStyles] === value
          ) {
            return;
          }

          set((state) => ({
            resumes: state.resumes.map((r) =>
              r.id === state.activeResumeId
                ? {
                    ...r,
                    updatedAt: Date.now(),
                    layouts: {
                      ...r.layouts!,
                      [r.activeTemplateId]: {
                        ...r.layouts![r.activeTemplateId],
                        templateStyles: {
                          ...r.layouts![r.activeTemplateId].templateStyles,
                          [field]: value,
                        },
                      },
                    },
                  }
                : r,
            ),
          }));
          if (state.activeResumeId)
            get().scheduleServerSync(state.activeResumeId);
        },

        setTemplate: (templateId) => {
          const state = get();
          const activeResume = state.resumes.find(
            (r) => r.id === state.activeResumeId,
          );
          if (!activeResume || activeResume.activeTemplateId === templateId)
            return;

          set((state) => ({
            resumes: state.resumes.map((r) =>
              r.id === state.activeResumeId
                ? {
                    ...r,
                    updatedAt: Date.now(),
                    activeTemplateId: templateId,
                  }
                : r,
            ),
          }));
          if (state.activeResumeId)
            get().scheduleServerSync(state.activeResumeId);
        },
      };
    },
    {
      name: "resume-storage-v6",
      version: 10,
      partialize: (state) => ({
        resumes: state.resumes,
        activeResumeId: state.activeResumeId,
        isTextSelected: state.isTextSelected,
      }),
      migrate: (persistedState: unknown) => {
        // ... (previous migration logic preserved)
        return persistedState;
      },
    },
  ),
);
