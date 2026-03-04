import { ResumeData, TemplateId } from "@/types/resume";
import { createInitialResume } from "@/lib/resume-config";
import { buildImportedResume, generateId } from "../resumeUtils";
import { StoreSlice } from "../types";

export interface ResumeSlice {
  createNewResume: (templateId?: TemplateId) => void;
  deleteResume: (id: string) => Promise<void>;
  setActiveResume: (id: string) => void;
  duplicateResume: (id: string) => void;
  importResume: (resume: Partial<ResumeData>, templateId?: TemplateId) => void;
  renameResume: (id: string, title: string) => void;
  setIsTextSelected: (isSelected: boolean) => void;
  markLoggedOut: () => void;
  setSessionExpired: (isExpired: boolean) => void;
}

export const createResumeSlice: StoreSlice<ResumeSlice> = (set, get) => ({
  createNewResume: (templateId?: TemplateId) => {
    const id = generateId();
    const newResume = createInitialResume(id, "New Resume", templateId);
    set((state) => ({
      resumes: [...state.resumes, newResume],
      activeResumeId: id,
    }));
    void get().syncResume(id);
  },

  deleteResume: async (id) => {
    const state = get();
    const isKnown = state.isAuthenticated && state.knownServerResumeIds.has(id);

    if (isKnown) {
      const success = await get().syncDelete(id);
      if (!success) return;
    }

    set((state) => ({
      resumes: state.resumes.filter((r) => r.id !== id),
      activeResumeId:
        state.activeResumeId === id
          ? state.resumes[0]?.id || null
          : state.activeResumeId,
    }));

    if (!isKnown && state.isAuthenticated) {
      void get().syncDelete(id);
    }
  },

  setActiveResume: (id) => {
    set({ activeResumeId: id });
    if (id) {
      void get().fetchFullResume(id);
    }
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

  importResume: (resume: Partial<ResumeData>, templateId?: TemplateId) => {
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

  renameResume: (id, title) => {
    set((state) => ({
      resumes: state.resumes.map((r) =>
        r.id === id ? { ...r, title, updatedAt: Date.now() } : r,
      ),
    }));
    get().scheduleServerSync(id);
  },

  setIsTextSelected: (isSelected: boolean) =>
    set({ isTextSelected: isSelected }),

  setSessionExpired: (isExpired: boolean) =>
    set({ isSessionExpired: isExpired }),

  markLoggedOut: () => {
    const state = get();
    state.syncTimers.forEach((timer) => clearTimeout(timer));

    set({
      resumes: [],
      activeResumeId: null,
      isTextSelected: false,
      isAuthenticated: false,
      currentUser: null,
      hasInitializedSync: true,
      authAttempted: true,
      syncedResumeVersions: new Map<string, number>(),
      knownServerResumeIds: new Set<string>(),
      syncTimers: new Map<string, ReturnType<typeof setTimeout>>(),
    });
  },
});
