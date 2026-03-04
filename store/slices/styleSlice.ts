import { TemplateId, TemplateStyles } from "@/types/resume";
import { StoreSlice } from "../types";

export interface StyleSlice {
  updateGlobalStyle: (
    field: keyof TemplateStyles,
    value: TemplateStyles[keyof TemplateStyles],
  ) => void;
  setTemplate: (templateId: TemplateId) => void;
}

export const createStyleSlice: StoreSlice<StyleSlice> = (set, get) => ({
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
    } else if (currentStyles[field as keyof typeof currentStyles] === value) {
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
    if (state.activeResumeId) get().scheduleServerSync(state.activeResumeId);
  },

  setTemplate: (templateId) => {
    const state = get();
    const activeResume = state.resumes.find(
      (r) => r.id === state.activeResumeId,
    );
    if (!activeResume || activeResume.activeTemplateId === templateId) return;

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
    if (state.activeResumeId) get().scheduleServerSync(state.activeResumeId);
  },
});
