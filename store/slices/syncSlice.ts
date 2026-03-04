import { ResumeData } from "@/types/resume";
import { mergeResumes } from "../resumeUtils";
import { StoreSlice } from "../types";

const SYNC_DEBOUNCE_MS = 1200;

export interface SyncSlice {
  initializeServerSync: (force?: boolean) => Promise<void>;
  syncResume: (id: string) => Promise<void>;
  syncDelete: (id: string) => Promise<void>;
  scheduleServerSync: (id: string) => void;
  fetchFullResume: (id: string) => Promise<void>;
}

export const createSyncSlice: StoreSlice<SyncSlice> = (set, get) => ({
  initializeServerSync: async (force = false) => {
    const state = get();

    if (!force && state.hasInitializedSync && state.isAuthenticated) return;
    if (!force && state.authAttempted && !state.isAuthenticated) return;

    try {
      const meResponse = await fetch("/api/auth/me", {
        credentials: "include",
      });

      if (!meResponse.ok) {
        // Clear all pending timers on initialization failure/logout
        state.syncTimers.forEach((timer) => clearTimeout(timer));
        set({
          isAuthenticated: false,
          currentUser: null,
          hasInitializedSync: true,
          authAttempted: true,
          syncedResumeVersions: new Map<string, number>(),
          knownServerResumeIds: new Set<string>(),
          syncTimers: new Map<string, ReturnType<typeof setTimeout>>(),
        });
        return;
      }

      const mePayload = (await meResponse.json()) as {
        user: { id: string; email: string } | null;
      };

      if (!mePayload.user) {
        state.syncTimers.forEach((timer) => clearTimeout(timer));
        set({
          isAuthenticated: false,
          currentUser: null,
          hasInitializedSync: true,
          authAttempted: true,
          syncedResumeVersions: new Map<string, number>(),
          knownServerResumeIds: new Set<string>(),
          syncTimers: new Map<string, ReturnType<typeof setTimeout>>(),
        });
        return;
      }

      const resumeResponse = await fetch("/api/resumes", {
        credentials: "include",
      });

      if (!resumeResponse.ok) {
        state.syncTimers.forEach((timer) => clearTimeout(timer));
        set({
          isAuthenticated: true,
          currentUser: mePayload.user,
          hasInitializedSync: true,
          authAttempted: true,
          syncedResumeVersions: new Map<string, number>(),
          knownServerResumeIds: new Set<string>(),
          syncTimers: new Map<string, ReturnType<typeof setTimeout>>(),
        });
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
      const mergedResumes = mergeResumes(localState.resumes, serverResumes);
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

      if (activeResumeId) {
        await get().fetchFullResume(activeResumeId);
      }

      mergedResumes.forEach((resume) => {
        const lastSyncedVersion = newSyncedResumeVersions.get(resume.id);
        if (lastSyncedVersion !== resume.updatedAt) {
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

    if (state.syncedResumeVersions.get(id) === resume.updatedAt) {
      return;
    }

    if (!resume.content || !resume.layouts) {
      await get().fetchFullResume(id);
      const updatedResume = get().resumes.find((r) => r.id === id);
      if (!updatedResume?.content) return;
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
            const nextSyncedVersions = new Map(state.syncedResumeVersions);
            nextSyncedVersions.set(resume.id, resume.updatedAt);
            return { syncedResumeVersions: nextSyncedVersions };
          });
        } else if (putResponse.status === 409) {
          console.warn(
            `[SYNC] Conflict detected for resume ${id}. Re-fetching...`,
          );
          await get().fetchFullResume(id);
        } else if (putResponse.status === 404) {
          const createResponse = await fetch("/api/resumes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ resume }),
          });

          if (createResponse.ok || createResponse.status === 409) {
            set((state) => {
              const nextKnownIds = new Set(state.knownServerResumeIds);
              const nextSyncedVersions = new Map(state.syncedResumeVersions);
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
            const nextSyncedVersions = new Map(state.syncedResumeVersions);
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

    // Clear and remove specific timer for this resume
    const existingTimer = state.syncTimers.get(id);
    if (existingTimer) {
      clearTimeout(existingTimer);
      // We modify the map in-place here for efficiency before the set call
      state.syncTimers.delete(id);
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
    const state = get();
    const existingTimer = state.syncTimers.get(id);
    if (existingTimer) clearTimeout(existingTimer);

    const newTimer = setTimeout(() => {
      void get().syncResume(id);
      // Clean up timer map after execution
      set((state) => {
        const nextTimers = new Map(state.syncTimers);
        nextTimers.delete(id);
        return { syncTimers: nextTimers };
      });
    }, SYNC_DEBOUNCE_MS);

    set((state) => {
      const nextTimers = new Map(state.syncTimers);
      nextTimers.set(id, newTimer);
      return { syncTimers: nextTimers };
    });
  },
});
