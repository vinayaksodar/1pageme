import { PersonalInfoVisibility } from "@/types/resume";
import { StoreSlice } from "../types";

export interface PersonalInfoSlice {
  updatePersonalInfo: (field: string, value: string) => void;
  updatePersonalInfoVisibility: (
    visibility: Partial<PersonalInfoVisibility>,
  ) => void;
}

export const createPersonalInfoSlice: StoreSlice<PersonalInfoSlice> = (
  set,
  get,
) => ({
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
    if (state.activeResumeId) get().scheduleServerSync(state.activeResumeId);
  },

  updatePersonalInfoVisibility: (visibility) => {
    const state = get();
    const activeResume = state.resumes.find(
      (r) => r.id === state.activeResumeId,
    );
    if (!activeResume) return;

    const currentVisibility = activeResume.content?.personalInfo.visibility;
    const isChanged = Object.entries(visibility).some(
      ([key, val]) =>
        currentVisibility?.[key as keyof typeof currentVisibility] !== val,
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
    if (state.activeResumeId) get().scheduleServerSync(state.activeResumeId);
  },
});
