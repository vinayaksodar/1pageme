import { ResumeData } from "@/types/resume";
import { mergeResumes } from "../resumeUtils";
import { StoreSlice } from "../types";

const SYNC_DEBOUNCE_MS = 1200;

export interface SyncSlice {
  initializeServerSync: (force?: boolean) => Promise<void>;
  syncResume: (id: string) => Promise<void>;
  syncDelete: (id: string) => Promise<boolean>;
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
        const errorData = await meResponse.json().catch(() => ({}));
        const isExpired = errorData.error === "Session expired";

        if (isExpired) {
          const toast = (await import("react-hot-toast")).default;
          toast.error("Session expired. Please login again to sync.", {
            id: "session-expired",
          });
          set({
            isAuthenticated: true, // Keep it true to avoid UI flickering if they are already in app
            isSessionExpired: true,
            hasInitializedSync: true,
            authAttempted: true,
          });
          return;
        }

        // Clear all pending timers on initialization failure/logout
        state.syncTimers.forEach((timer) => clearTimeout(timer));
        set({
          isAuthenticated: false,
          isSessionExpired: false,
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
      const activeResumeId = localState.activeResumeId
        ? mergedResumes.some((r) => r.id === localState.activeResumeId)
          ? localState.activeResumeId
          : null
        : null;

      set({
        resumes: mergedResumes,
        activeResumeId,
        isAuthenticated: true,
        isSessionExpired: false,
        lastSyncFailed: false,
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
          lastSyncFailed: false,
          resumes: state.resumes.map((r) =>
            r.id === id ? { ...r, ...fullResume } : r,
          ),
        }));
      } else if (response.status === 401) {
        const errorData = await response.json().catch(() => ({}));
        if (errorData.error === "Session expired") {
          const toast = (await import("react-hot-toast")).default;
          toast.error("Session expired. Please login again to sync.", {
            id: "session-expired",
          });
          set({ isSessionExpired: true });
        }
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

    // Migration: If profileImage is base64 and user is authenticated, upload to Vercel Blob first
    let updatedResume = { ...resume };
    const profileImage = resume.content?.personalInfo?.profileImage;
    if (profileImage?.startsWith("data:")) {
      try {
        const response = await fetch(profileImage);
        const blob = await response.blob();
        const filename = `migrated-${id}-${Date.now()}.png`;

        const uploadResponse = await fetch(
          `/api/upload?filename=${encodeURIComponent(filename)}`,
          {
            method: "POST",
            body: blob,
          },
        );

        if (uploadResponse.ok) {
          const blobData = await uploadResponse.json();
          const cloudUrl = blobData.url;

          // Update the resume object with the cloud URL
          updatedResume = {
            ...resume,
            content: {
              ...resume.content!,
              personalInfo: {
                ...resume.content!.personalInfo,
                profileImage: cloudUrl,
              },
            },
          };

          // Cache the base64 against the new URL
          try {
            localStorage.setItem("1pm_img_cache_" + cloudUrl, profileImage);
          } catch {
            console.warn("Failed to cache migrated image");
          }

          // Update local state with the new URL as well to keep it in sync
          set((state) => ({
            resumes: state.resumes.map((r) =>
              r.id === id ? updatedResume : r,
            ),
          }));
        }
      } catch (migrationError) {
        console.error(
          "Failed to migrate base64 image to Vercel Blob:",
          migrationError,
        );
        // Continue with sync anyway, it will just store the base64 in Neon (fallback)
      }
    }

    try {
      if (isKnown) {
        const putResponse = await fetch(`/api/resumes/${resume.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ resume: updatedResume, lastSyncedVersion }),
        });

        if (putResponse.ok) {
          set((state) => {
            const nextSyncedVersions = new Map(state.syncedResumeVersions);
            nextSyncedVersions.set(resume.id, resume.updatedAt);
            return {
              syncedResumeVersions: nextSyncedVersions,
              lastSyncFailed: false,
            };
          });
        } else if (putResponse.status === 401) {
          const errorData = await putResponse.json().catch(() => ({}));
          if (errorData.error === "Session expired") {
            const toast = (await import("react-hot-toast")).default;
            toast.error(
              "Session expired. Please login again to save changes.",
              {
                id: "session-expired",
              },
            );
            set({ isSessionExpired: true });
          }
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
            body: JSON.stringify({ resume: updatedResume }),
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
                lastSyncFailed: false,
              };
            });
          } else if (createResponse.status === 401) {
            const errorData = await createResponse.json().catch(() => ({}));
            if (errorData.error === "Session expired") {
              const toast = (await import("react-hot-toast")).default;
              toast.error(
                "Session expired. Please login again to save changes.",
                {
                  id: "session-expired",
                },
              );
              set({ isSessionExpired: true });
            }
          }
        }
      } else {
        const createResponse = await fetch("/api/resumes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ resume: updatedResume }),
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
              lastSyncFailed: false,
            };
          });
        } else if (createResponse.status === 401) {
          const errorData = await createResponse.json().catch(() => ({}));
          if (errorData.error === "Session expired") {
            const toast = (await import("react-hot-toast")).default;
            toast.error(
              "Session expired. Please login again to save changes.",
              {
                id: "session-expired",
              },
            );
            set({ isSessionExpired: true });
          }
        }
      }
    } catch (error) {
      console.error(`[SYNC] Failed to sync resume ${id}:`, error);
      set({ lastSyncFailed: true });
    }
  },

  syncDelete: async (id: string): Promise<boolean> => {
    const state = get();
    if (!state.isAuthenticated || !state.knownServerResumeIds.has(id)) {
      return true;
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
            lastSyncFailed: false,
          };
        });
        return true;
      } else if (deleteResponse.status === 401) {
        const errorData = await deleteResponse.json().catch(() => ({}));
        if (errorData.error === "Session expired") {
          const toast = (await import("react-hot-toast")).default;
          toast.error("Session expired. Please login again to delete.", {
            id: "session-expired",
          });
          set({ isSessionExpired: true });
        }
        return false;
      }
      return false;
    } catch (error) {
      console.error(`[SYNC] Failed to delete resume ${id}:`, error);
      set({ lastSyncFailed: true });
      const toast = (await import("react-hot-toast")).default;
      toast.error("No internet connection. Could not delete resume.", {
        id: "sync-error",
      });
      return false;
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
