import { StateCreator } from "zustand";
import {
  ResumeData,
  SectionType,
  SectionItem,
  ItemVisibility,
  SectionConfig,
  TemplateStyles,
  TemplateId,
  PersonalInfoVisibility,
} from "@/types/resume";

export interface ResumeState {
  resumes: ResumeData[];
  activeResumeId: string | null;
  isTextSelected: boolean;
  isAuthenticated: boolean;
  isSessionExpired: boolean;
  hasInitializedSync: boolean;
  authAttempted: boolean;
  currentUser: { id: string; email: string } | null;

  // Sync tracking (excluded from persistence)
  syncTimers: Map<string, ReturnType<typeof setTimeout>>;
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
  setSessionExpired: (isExpired: boolean) => void;
  fetchFullResume: (id: string) => Promise<void>;
}

export type StoreSlice<T> = StateCreator<ResumeState, [], [], T>;
