import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ResumeState } from "./types";
import { createSyncSlice } from "./slices/syncSlice";
import { createResumeSlice } from "./slices/resumeSlice";
import { createPersonalInfoSlice } from "./slices/personalInfoSlice";
import { createSectionSlice } from "./slices/sectionSlice";
import { createStyleSlice } from "./slices/styleSlice";

export const useResumeStore = create<ResumeState>()(
  persist(
    (...args) => ({
      // Initial State
      resumes: [],
      activeResumeId: null,
      isTextSelected: false,
      isAuthenticated: false,
      isSessionExpired: false,
      hasInitializedSync: false,
      authAttempted: false,
      currentUser: null,
      syncTimers: new Map<string, ReturnType<typeof setTimeout>>(),
      syncedResumeVersions: new Map<string, number>(),
      knownServerResumeIds: new Set<string>(),

      // Combined Slices
      ...createSyncSlice(...args),
      ...createResumeSlice(...args),
      ...createPersonalInfoSlice(...args),
      ...createSectionSlice(...args),
      ...createStyleSlice(...args),
    }),
    {
      name: "resume-storage-v6",
      version: 10,
      partialize: (state) => ({
        resumes: state.resumes,
        activeResumeId: state.activeResumeId,
        isTextSelected: state.isTextSelected,
      }),
      migrate: (persistedState: unknown) => {
        return persistedState;
      },
    },
  ),
);

export type { ResumeState };
