import {
  SectionType,
  SectionItem,
  ItemVisibility,
  SectionConfig,
  Section,
  TemplateId,
  TemplateLayout,
} from "@/types/resume";
import { SECTION_SCHEMAS, getInitialVisibility } from "@/lib/resume-config";
import { emptyBlock, createBlock } from "@/lib/utils";
import { generateId } from "../resumeUtils";
import { StoreSlice } from "../types";

export interface SectionSlice {
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
}

export const createSectionSlice: StoreSlice<SectionSlice> = (set, get) => ({
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
    if (state.activeResumeId) get().scheduleServerSync(state.activeResumeId);
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
    if (state.activeResumeId) get().scheduleServerSync(state.activeResumeId);
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
    if (state.activeResumeId) get().scheduleServerSync(state.activeResumeId);
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
    if (state.activeResumeId) get().scheduleServerSync(state.activeResumeId);
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
    if (state.activeResumeId) get().scheduleServerSync(state.activeResumeId);
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
    if (state.activeResumeId) get().scheduleServerSync(state.activeResumeId);
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
          ? defaultBullets.map((b) => createBlock([{ type: "text", text: b }]))
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
    if (state.activeResumeId) get().scheduleServerSync(state.activeResumeId);
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
    if (state.activeResumeId) get().scheduleServerSync(state.activeResumeId);
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
    if (state.activeResumeId) get().scheduleServerSync(state.activeResumeId);
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
      ([key, val]) => currentConfig[key as keyof typeof currentConfig] !== val,
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
                  sections: r.layouts![r.activeTemplateId].sections.map((s) =>
                    s.id === sectionId ? { ...s, ...config } : s,
                  ),
                },
              },
            }
          : r,
      ),
    }));
    if (state.activeResumeId) get().scheduleServerSync(state.activeResumeId);
  },
});
