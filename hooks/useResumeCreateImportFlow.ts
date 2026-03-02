import { useState } from "react";
import { useResumeStore } from "@/store/useResumeStore";
import { ResumeData, TemplateId } from "@/types/resume";
import { isLikelyNativeResumeExport } from "@/lib/import-utils";

export function useResumeCreateImportFlow() {
  const createNewResume = useResumeStore((state) => state.createNewResume);
  const importResume = useResumeStore((state) => state.importResume);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [pendingImportData, setPendingImportData] =
    useState<Partial<ResumeData> | null>(null);

  const openImportModal = () => setIsImportModalOpen(true);
  const closeImportModal = () => setIsImportModalOpen(false);

  const openTemplateModal = () => setIsTemplateModalOpen(true);
  const closeTemplateModal = () => {
    setIsTemplateModalOpen(false);
    setPendingImportData(null);
  };

  const handleImport = (resume: Partial<ResumeData>) => {
    if (isLikelyNativeResumeExport(resume)) {
      importResume(resume);
      return;
    }

    setPendingImportData(resume);
    setIsTemplateModalOpen(true);
  };

  const handleTemplateSelect = (templateId: TemplateId) => {
    if (pendingImportData) {
      importResume(pendingImportData, templateId);
      setPendingImportData(null);
    } else {
      createNewResume(templateId);
    }

    setIsTemplateModalOpen(false);
  };

  return {
    isImportModalOpen,
    isTemplateModalOpen,
    openImportModal,
    closeImportModal,
    openTemplateModal,
    closeTemplateModal,
    handleImport,
    handleTemplateSelect,
  };
}
