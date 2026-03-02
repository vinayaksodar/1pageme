import { create } from "zustand";
import { persist } from "zustand/middleware";
import toast from "react-hot-toast";
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
  getStandardLayout,
  getAcademicLayout,
  getModernLayout,
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
  isSyncing: boolean;
  hasInitializedSync: boolean;
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
  initializeServerSync: () => Promise<void>;
  syncLocalToServer: () => Promise<void>;
  scheduleServerSync: () => void;
  markLoggedOut: () => void;
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
        isSyncing: false,
        hasInitializedSync: false,
        currentUser: null,

        // Sync tracking initial state
        syncTimer: null,
        syncedResumeVersions: new Map<string, number>(),
        knownServerResumeIds: new Set<string>(),

        initializeServerSync: async () => {
          if (get().isSyncing) return;

          set({ isSyncing: true });
          try {
            const meResponse = await fetch("/api/auth/me", {
              credentials: "include",
            });

            if (!meResponse.ok) {
              set({
                isAuthenticated: false,
                currentUser: null,
                hasInitializedSync: true,
                isSyncing: false,
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
                isSyncing: false,
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
                isSyncing: false,
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
              isSyncing: false,
              knownServerResumeIds: newKnownServerResumeIds,
              syncedResumeVersions: newSyncedResumeVersions,
            });

            await get().syncLocalToServer();
          } catch (error) {
            console.error("Failed to initialize server sync", error);
            toast.error("Sync failed");
            set({
              hasInitializedSync: true,
              isSyncing: false,
            });
          }
        },
        syncLocalToServer: async () => {
          const state = get();
          if (!state.isAuthenticated || state.isSyncing) return;

          set({ isSyncing: true });

          try {
            const localIds = new Set(state.resumes.map((resume) => resume.id));
            const newKnownServerResumeIds = new Set(state.knownServerResumeIds);
            const newSyncedResumeVersions = new Map(state.syncedResumeVersions);

            for (const resume of state.resumes) {
              if (
                state.syncedResumeVersions.get(resume.id) === resume.updatedAt
              ) {
                continue;
              }

              const putResponse = await fetch(`/api/resumes/${resume.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ resume }),
              });

              if (putResponse.status === 404) {
                const createResponse = await fetch("/api/resumes", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  credentials: "include",
                  body: JSON.stringify({ resume }),
                });

                if (!createResponse.ok && createResponse.status !== 409)
                  continue;
              } else if (!putResponse.ok) {
                continue;
              }

              newKnownServerResumeIds.add(resume.id);
              newSyncedResumeVersions.set(resume.id, resume.updatedAt);
            }

            const removedIds = Array.from(state.knownServerResumeIds).filter(
              (resumeId) => !localIds.has(resumeId),
            );

            for (const resumeId of removedIds) {
              const deleteResponse = await fetch(`/api/resumes/${resumeId}`, {
                method: "DELETE",
                credentials: "include",
              });

              if (deleteResponse.ok || deleteResponse.status === 404) {
                newKnownServerResumeIds.delete(resumeId);
                newSyncedResumeVersions.delete(resumeId);
              }
            }

            set({
              knownServerResumeIds: newKnownServerResumeIds,
              syncedResumeVersions: newSyncedResumeVersions,
            });
          } catch (error) {
            console.error("Sync failed", error);
            if (
              error instanceof TypeError &&
              error.message === "Failed to fetch"
            ) {
              toast.error(
                "Network error: Sync paused until connection returns",
                {
                  id: "sync-error",
                },
              );
            } else {
              toast.error("Sync failed");
            }
          } finally {
            set({ isSyncing: false });
          }
        },
        scheduleServerSync: () => {
          const { syncTimer } = get();
          if (syncTimer) clearTimeout(syncTimer);
          const newTimer = setTimeout(() => {
            void get().syncLocalToServer();
          }, SYNC_DEBOUNCE_MS);
          set({ syncTimer: newTimer });
        },

        markLoggedOut: () => {
          set({
            isAuthenticated: false,
            currentUser: null,
            isSyncing: false,
            hasInitializedSync: true,
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
          get().scheduleServerSync();
        },

        renameResume: (id, title) => {
          set((state) => ({
            resumes: state.resumes.map((r) =>
              r.id === id ? { ...r, title, updatedAt: Date.now() } : r,
            ),
          }));
          get().scheduleServerSync();
        },

        duplicateResume: (id) => {
          set((state) => {
            const resumeToDuplicate = state.resumes.find((r) => r.id === id);
            if (!resumeToDuplicate) return state;

            const newId = generateId();
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
          get().scheduleServerSync();
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
          get().scheduleServerSync();
        },

        deleteResume: (id) => {
          set((state) => ({
            resumes: state.resumes.filter((r) => r.id !== id),
            activeResumeId:
              state.activeResumeId === id
                ? state.resumes[0]?.id || null
                : state.activeResumeId,
          }));
          get().scheduleServerSync();
        },

        setActiveResume: (id) => set({ activeResumeId: id }),

        setIsTextSelected: (isSelected) => set({ isTextSelected: isSelected }),

        updatePersonalInfo: (field, value) => {
          set((state) => ({
            resumes: state.resumes.map((r) =>
              r.id === state.activeResumeId
                ? {
                    ...r,
                    updatedAt: Date.now(),
                    content: {
                      ...r.content,
                      personalInfo: {
                        ...r.content.personalInfo,
                        [field]: value,
                      },
                    },
                  }
                : r,
            ),
          }));
          get().scheduleServerSync();
        },

        updatePersonalInfoVisibility: (visibility) => {
          set((state) => ({
            resumes: state.resumes.map((r) =>
              r.id === state.activeResumeId
                ? {
                    ...r,
                    updatedAt: Date.now(),
                    content: {
                      ...r.content,
                      personalInfo: {
                        ...r.content.personalInfo,
                        visibility: {
                          ...r.content.personalInfo.visibility,
                          ...visibility,
                        },
                      },
                    },
                  }
                : r,
            ),
          }));
          get().scheduleServerSync();
        },

        updateSectionTitle: (sectionId, title) => {
          set((state) => ({
            resumes: state.resumes.map((r) =>
              r.id === state.activeResumeId
                ? {
                    ...r,
                    updatedAt: Date.now(),
                    content: {
                      ...r.content,
                      sections: r.content.sections.map((s) =>
                        s.id === sectionId ? { ...s, title } : s,
                      ),
                    },
                  }
                : r,
            ),
          }));
          get().scheduleServerSync();
        },

        updateSectionItem: (sectionId, itemId, field, value) => {
          set((state) => ({
            resumes: state.resumes.map((r) =>
              r.id === state.activeResumeId
                ? {
                    ...r,
                    updatedAt: Date.now(),
                    content: {
                      ...r.content,
                      sections: r.content.sections.map((s) =>
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
          get().scheduleServerSync();
        },

        updateItemVisibility: (sectionId, itemId, visibility) => {
          set((state) => ({
            resumes: state.resumes.map((r) =>
              r.id === state.activeResumeId
                ? {
                    ...r,
                    updatedAt: Date.now(),
                    content: {
                      ...r.content,
                      sections: r.content.sections.map((s) =>
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
          get().scheduleServerSync();
        },

        addSectionItem: (sectionId) => {
          set((state) => ({
            resumes: state.resumes.map((r) =>
              r.id === state.activeResumeId
                ? {
                    ...r,
                    updatedAt: Date.now(),
                    content: {
                      ...r.content,
                      sections: r.content.sections.map((s) => {
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
          get().scheduleServerSync();
        },

        removeSectionItem: (sectionId, itemId) => {
          set((state) => ({
            resumes: state.resumes.map((r) => {
              if (r.id !== state.activeResumeId) return r;

              const newSections = r.content.sections.map((section) => {
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
                  ...r.content,
                  sections: newSections,
                },
              };
            }),
          }));
          get().scheduleServerSync();
        },

        moveSectionItem: (sectionId, itemId, direction) => {
          set((state) => ({
            resumes: state.resumes.map((r) =>
              r.id === state.activeResumeId
                ? {
                    ...r,
                    updatedAt: Date.now(),
                    content: {
                      ...r.content,
                      sections: r.content.sections.map((s) => {
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
          get().scheduleServerSync();
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
                        ...r.content,
                        sections: [...r.content.sections, newSection],
                      },
                      layouts: Object.keys(r.layouts).reduce(
                        (acc, tid) => {
                          const templateId = tid as TemplateId;
                          acc[templateId] = {
                            ...r.layouts[templateId],
                            sections: [
                              ...r.layouts[templateId].sections,
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
          get().scheduleServerSync();
        },

        removeSection: (id) => {
          set((state) => ({
            resumes: state.resumes.map((r) =>
              r.id === state.activeResumeId
                ? {
                    ...r,
                    updatedAt: Date.now(),
                    content: {
                      ...r.content,
                      sections: r.content.sections.filter((s) => s.id !== id),
                    },
                    layouts: Object.keys(r.layouts).reduce(
                      (acc, tid) => {
                        const templateId = tid as TemplateId;
                        acc[templateId] = {
                          ...r.layouts[templateId],
                          sections: r.layouts[templateId].sections.filter(
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
          get().scheduleServerSync();
        },

        reorderSections: (newOrder) => {
          set((state) => ({
            resumes: state.resumes.map((r) =>
              r.id === state.activeResumeId
                ? {
                    ...r,
                    updatedAt: Date.now(),
                    layouts: {
                      ...r.layouts,
                      [r.activeTemplateId]: {
                        ...r.layouts[r.activeTemplateId],
                        sections: newOrder,
                      },
                    },
                  }
                : r,
            ),
          }));
          get().scheduleServerSync();
        },

        updateSectionConfig: (sectionId, config) => {
          set((state) => ({
            resumes: state.resumes.map((r) =>
              r.id === state.activeResumeId
                ? {
                    ...r,
                    updatedAt: Date.now(),
                    layouts: {
                      ...r.layouts,
                      [r.activeTemplateId]: {
                        ...r.layouts[r.activeTemplateId],
                        sections: r.layouts[r.activeTemplateId].sections.map(
                          (s) => (s.id === sectionId ? { ...s, ...config } : s),
                        ),
                      },
                    },
                  }
                : r,
            ),
          }));
          get().scheduleServerSync();
        },

        updateGlobalStyle: (field, value) => {
          set((state) => ({
            resumes: state.resumes.map((r) =>
              r.id === state.activeResumeId
                ? {
                    ...r,
                    updatedAt: Date.now(),
                    layouts: {
                      ...r.layouts,
                      [r.activeTemplateId]: {
                        ...r.layouts[r.activeTemplateId],
                        templateStyles: {
                          ...r.layouts[r.activeTemplateId].templateStyles,
                          [field]: value,
                        },
                      },
                    },
                  }
                : r,
            ),
          }));
          get().scheduleServerSync();
        },

        setTemplate: (templateId) => {
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
          get().scheduleServerSync();
        },
      };
    },
    {
      name: "resume-storage-v6",
      version: 9,
      partialize: (state) => ({
        resumes: state.resumes,
        activeResumeId: state.activeResumeId,
        isTextSelected: state.isTextSelected,
      }),
      migrate: (persistedState: unknown, version: number) => {
        if (version < 7) {
          const state = persistedState as Record<string, unknown>;
          if (state.resumes && Array.isArray(state.resumes)) {
            const now = Date.now();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            state.resumes = state.resumes.map((resume: any) => ({
              ...resume,
              createdAt: resume.createdAt || now,
              updatedAt: resume.updatedAt || now,
              content: {
                ...resume.content,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                sections: resume.content.sections.map((section: any) => ({
                  ...section,
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  items: section.items.map((item: any) => {
                    // Migrate description from TextNode[] to Block[]
                    let description = item.description;
                    if (
                      description &&
                      Array.isArray(description) &&
                      description.length > 0 &&
                      !("id" in description[0])
                    ) {
                      description = [
                        {
                          id: generateId(),
                          content: description,
                        },
                      ];
                    }

                    // Migrate bullets from TextNode[][] to Block[]
                    let bullets = item.bullets;
                    if (
                      bullets &&
                      Array.isArray(bullets) &&
                      bullets.length > 0 &&
                      Array.isArray(bullets[0])
                    ) {
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      bullets = bullets.map((b: any) => ({
                        id: generateId(),
                        content: b,
                      }));
                    }

                    return {
                      ...item,
                      description,
                      bullets,
                    };
                  }),
                })),
              },
            }));
          }
          return state;
        }
        if (version < 8) {
          const state = persistedState as Record<string, unknown>;
          if (state.resumes && Array.isArray(state.resumes)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            state.resumes = state.resumes.map((resume: any) => {
              const sectionIds =
                resume.content?.sections?.map(
                  (section: Section) => section.id,
                ) || [];

              const defaultLayouts = {
                standard: getStandardLayout(sectionIds),
                academic: getAcademicLayout(sectionIds),
                modern: getModernLayout(sectionIds),
              };

              return {
                ...resume,
                layouts: {
                  ...defaultLayouts,
                  ...resume.layouts,
                  standard: {
                    ...defaultLayouts.standard,
                    ...(resume.layouts?.standard || {}),
                    templateStyles: {
                      ...defaultLayouts.standard.templateStyles,
                      ...(resume.layouts?.standard?.templateStyles || {}),
                    },
                  },
                  academic: {
                    ...defaultLayouts.academic,
                    ...(resume.layouts?.academic || {}),
                    templateStyles: {
                      ...defaultLayouts.academic.templateStyles,
                      ...(resume.layouts?.academic?.templateStyles || {}),
                    },
                  },
                  modern: {
                    ...defaultLayouts.modern,
                    ...(resume.layouts?.modern || {}),
                    templateStyles: {
                      ...defaultLayouts.modern.templateStyles,
                      ...(resume.layouts?.modern?.templateStyles || {}),
                    },
                  },
                },
                activeTemplateId: resume.activeTemplateId || "standard",
              };
            });
          }
          return state;
        }
        if (version < 9) {
          const state = persistedState as Record<string, unknown>;
          if (state.resumes && Array.isArray(state.resumes)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            state.resumes = state.resumes.map((resume: any) => {
              const sectionIds =
                resume.content?.sections?.map(
                  (section: Section) => section.id,
                ) || [];

              const defaultLayouts = {
                standard: getStandardLayout(sectionIds),
                academic: getAcademicLayout(sectionIds),
                modern: getModernLayout(sectionIds),
              };

              return {
                ...resume,
                layouts: {
                  ...defaultLayouts,
                  ...resume.layouts,
                  standard: {
                    ...defaultLayouts.standard,
                    ...(resume.layouts?.standard || {}),
                    templateStyles: {
                      ...defaultLayouts.standard.templateStyles,
                      ...(resume.layouts?.standard?.templateStyles || {}),
                    },
                  },
                  academic: {
                    ...defaultLayouts.academic,
                    ...(resume.layouts?.academic || {}),
                    templateStyles: {
                      ...defaultLayouts.academic.templateStyles,
                      ...(resume.layouts?.academic?.templateStyles || {}),
                    },
                  },
                  modern: {
                    ...defaultLayouts.modern,
                    ...(resume.layouts?.modern || {}),
                    templateStyles: {
                      ...defaultLayouts.modern.templateStyles,
                      ...(resume.layouts?.modern?.templateStyles || {}),
                    },
                  },
                },
                activeTemplateId:
                  resume.activeTemplateId === "minimal"
                    ? "standard"
                    : (resume.activeTemplateId ?? "standard"),
              };
            });
          }
          return state;
        }
        return persistedState;
      },
    },
  ),
);
