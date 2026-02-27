import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  ResumeData,
  SectionType,
  SectionItem,
  ItemVisibility,
  SectionConfig,
  TemplateStyles,
  TemplateId,
  TemplateLayout,
  Section,
  PersonalInfoVisibility,
} from "@/types/resume";
import {
  SECTION_SCHEMAS,
  getInitialVisibility,
  createInitialResume,
} from "@/lib/resume-config";
import { emptyBlock, createBlock } from "@/lib/utils";

export interface ResumeState {
  resumes: ResumeData[];
  activeResumeId: string | null;
  isTextSelected: boolean;

  // Actions
  createNewResume: () => void;
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
}

export const useResumeStore = create<ResumeState>()(
  persist(
    (set) => ({
      resumes: [],
      activeResumeId: null,
      isTextSelected: false,

      createNewResume: () => {
        const id = Math.random().toString(36).substr(2, 9);
        const newResume = createInitialResume(id, "New Resume");
        set((state) => ({
          resumes: [...state.resumes, newResume],
          activeResumeId: id,
        }));
      },

      deleteResume: (id) =>
        set((state) => ({
          resumes: state.resumes.filter((r) => r.id !== id),
          activeResumeId:
            state.activeResumeId === id
              ? state.resumes[0]?.id || null
              : state.activeResumeId,
        })),

      setActiveResume: (id) => set({ activeResumeId: id }),

      setIsTextSelected: (isSelected) => set({ isTextSelected: isSelected }),

      updatePersonalInfo: (field, value) =>
        set((state) => ({
          resumes: state.resumes.map((r) =>
            r.id === state.activeResumeId
              ? {
                  ...r,
                  content: {
                    ...r.content,
                    personalInfo: { ...r.content.personalInfo, [field]: value },
                  },
                }
              : r,
          ),
        })),

      updatePersonalInfoVisibility: (visibility) =>
        set((state) => ({
          resumes: state.resumes.map((r) =>
            r.id === state.activeResumeId
              ? {
                  ...r,
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
        })),

      updateSectionTitle: (sectionId, title) =>
        set((state) => ({
          resumes: state.resumes.map((r) =>
            r.id === state.activeResumeId
              ? {
                  ...r,
                  content: {
                    ...r.content,
                    sections: r.content.sections.map((s) =>
                      s.id === sectionId ? { ...s, title } : s,
                    ),
                  },
                }
              : r,
          ),
        })),

      updateSectionItem: (sectionId, itemId, field, value) =>
        set((state) => ({
          resumes: state.resumes.map((r) =>
            r.id === state.activeResumeId
              ? {
                  ...r,
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
        })),

      updateItemVisibility: (sectionId, itemId, visibility) =>
        set((state) => ({
          resumes: state.resumes.map((r) =>
            r.id === state.activeResumeId
              ? {
                  ...r,
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
        })),

      addSectionItem: (sectionId) =>
        set((state) => ({
          resumes: state.resumes.map((r) =>
            r.id === state.activeResumeId
              ? {
                  ...r,
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
                        id: Math.random().toString(36).substr(2, 9),
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
                        datePeriod: "",
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
        })),

      removeSectionItem: (sectionId, itemId) =>
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
              content: {
                ...r.content,
                sections: newSections,
              },
            };
          }),
        })),

      moveSectionItem: (sectionId, itemId, direction) =>
        set((state) => ({
          resumes: state.resumes.map((r) =>
            r.id === state.activeResumeId
              ? {
                  ...r,
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
        })),

      addSection: (type) =>
        set((state) => {
          const newSectionId = Math.random().toString(36).substr(2, 9);

          const { defaults } = SECTION_SCHEMAS[type];
          const {
            description: defaultDescription,
            bullets: defaultBullets,
            ...restDefaults
          } = defaults;

          const initialItem: SectionItem = {
            id: Math.random().toString(36).substr(2, 9),
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
            datePeriod: "",
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
                              column: 1,
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
        }),

      removeSection: (id) =>
        set((state) => ({
          resumes: state.resumes.map((r) =>
            r.id === state.activeResumeId
              ? {
                  ...r,
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
        })),

      reorderSections: (newOrder) =>
        set((state) => ({
          resumes: state.resumes.map((r) =>
            r.id === state.activeResumeId
              ? {
                  ...r,
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
        })),

      updateSectionConfig: (sectionId, config) =>
        set((state) => ({
          resumes: state.resumes.map((r) =>
            r.id === state.activeResumeId
              ? {
                  ...r,
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
        })),

      updateGlobalStyle: (field, value) =>
        set((state) => ({
          resumes: state.resumes.map((r) =>
            r.id === state.activeResumeId
              ? {
                  ...r,
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
        })),

      setTemplate: (templateId) =>
        set((state) => ({
          resumes: state.resumes.map((r) =>
            r.id === state.activeResumeId
              ? {
                  ...r,
                  activeTemplateId: templateId,
                }
              : r,
          ),
        })),
    }),
    {
      name: "resume-storage-v6",
      version: 7,
      migrate: (persistedState: unknown, version: number) => {
        if (version < 7) {
          const state = persistedState as Record<string, unknown>;
          if (state.resumes && Array.isArray(state.resumes)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            state.resumes = state.resumes.map((resume: any) => ({
              ...resume,
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
                          id: Math.random().toString(36).substr(2, 9),
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
                        id: Math.random().toString(36).substr(2, 9),
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
        return persistedState;
      },
    },
  ),
);
