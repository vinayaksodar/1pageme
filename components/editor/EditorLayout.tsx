"use client";

import React, { useRef, useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import ResumePreview from "../resume/ResumePreview";
import {
  Download,
  ChevronDown,
  ChevronLeft,
  Plus,
  Copy,
  FileUp,
  Edit2,
  Check,
  Loader2,
} from "lucide-react";
import { useResumeStore } from "@/store/useResumeStore";
import TemplateLibraryModal from "../ui/TemplateLibraryModal";
import ImportModal from "../ui/ImportModal";
import { Logo } from "../ui/Logo";
import { cn } from "@/lib/utils";
import { useResumeCreateImportFlow } from "@/hooks/useResumeCreateImportFlow";
import { useResumeTitleEditor } from "@/hooks/useResumeTitleEditor";

const EditorLayout = () => {
  const {
    activeResumeId,
    resumes,
    setActiveResume,
    setTemplate,
    duplicateResume,
  } = useResumeStore();
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNewResumeModalOpen, setIsNewResumeModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const {
    isImportModalOpen,
    isTemplateModalOpen,
    openImportModal,
    closeImportModal,
    openTemplateModal,
    closeTemplateModal,
    handleImport,
    handleTemplateSelect,
  } = useResumeCreateImportFlow();
  const {
    inputRef: editInputRef,
    editingResumeId,
    tempTitle,
    setTempTitle,
    startEditing,
    saveTitle,
    stopEditing,
  } = useResumeTitleEditor();

  const activeResume = resumes.find((r) => r.id === activeResumeId);
  const resumeTitle = activeResume ? activeResume.title : "Resume";

  // Handle mobile sidebar state
  useEffect(() => {
    const checkMobile = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const [isDownloading, setIsDownloading] = useState(false);

  const handlePrint = async () => {
    if (!activeResume) return;

    setIsDownloading(true);
    const toastId = "downloading-resume";
    const toast = (await import("react-hot-toast")).default;
    toast.loading("Generating PDF...", { id: toastId });

    try {
      const response = await fetch("/api/print", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume: activeResume }),
      });

      if (!response.ok) throw new Error("Failed to generate PDF");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${activeResume.title || "resume"}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);

      toast.success("Resume downloaded!", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Failed to download resume", { id: toastId });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleExportJson = () => {
    if (!activeResume) return;

    const sanitizedTitle = activeResume.title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const fileName = `${sanitizedTitle || "resume"}.json`;

    const json = JSON.stringify(activeResume, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);

    setIsDropdownOpen(false);
  };

  const startTitleEditing = () => {
    if (activeResume) {
      startEditing(activeResume.id, activeResume.title);
      setIsDropdownOpen(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!activeResume) return null;

  if (!activeResume.content || !activeResume.layouts) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          <p className="text-sm font-black tracking-widest text-slate-400 uppercase">
            Loading Resume...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-slate-100 font-sans">
      {/* TOP BAR */}
      <header className="z-50 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm sm:px-6">
        <div className="flex items-center gap-3 sm:gap-5">
          <Logo onClick={() => setActiveResume("")} />
          <div className="hidden h-6 w-[1px] bg-slate-200 sm:block"></div>
          <div className="relative flex flex-col" ref={dropdownRef}>
            {editingResumeId === activeResume.id ? (
              <div className="flex items-center gap-2">
                <input
                  ref={editInputRef}
                  type="text"
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  onBlur={saveTitle}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveTitle();
                    if (e.key === "Escape") stopEditing();
                  }}
                  className="w-24 rounded border-none bg-slate-50 px-2 py-0.5 text-xs font-black text-slate-900 ring-2 ring-blue-600 focus:outline-none sm:w-auto sm:text-sm"
                />
                <button
                  onClick={saveTitle}
                  className="rounded-full bg-blue-600 p-1 text-white shadow-sm hover:bg-blue-700"
                >
                  <Check size={12} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  startTitleEditing();
                }}
                className="group flex items-center gap-1.5 text-xs font-black text-slate-900 sm:gap-2 sm:text-sm"
              >
                <span className="max-w-[100px] truncate sm:max-w-[200px] md:max-w-[300px]">
                  {resumeTitle}
                </span>
                <ChevronDown size={14} className="shrink-0 text-slate-300" />
              </button>
            )}

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="animate-in fade-in zoom-in absolute top-full left-0 z-[100] mt-2 w-56 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl duration-200">
                <div className="p-2">
                  <button
                    onClick={startTitleEditing}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-xs font-black tracking-widest text-slate-600 uppercase transition-colors hover:bg-slate-50 hover:text-blue-600"
                  >
                    <Edit2 size={16} /> Rename
                  </button>
                  <button
                    onClick={() => {
                      openTemplateModal();
                      setIsNewResumeModalOpen(true);
                      setIsDropdownOpen(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-xs font-black tracking-widest text-slate-600 uppercase transition-colors hover:bg-slate-50 hover:text-blue-600"
                  >
                    <Plus size={16} /> Create New
                  </button>
                  <button
                    onClick={() => {
                      duplicateResume(activeResume.id);
                      setIsDropdownOpen(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-xs font-black tracking-widest text-slate-600 uppercase transition-colors hover:bg-slate-50 hover:text-blue-600"
                  >
                    <Copy size={16} /> Duplicate
                  </button>
                  <button
                    onClick={() => {
                      openImportModal();
                      setIsDropdownOpen(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-xs font-black tracking-widest text-slate-600 uppercase transition-colors hover:bg-slate-50 hover:text-blue-600"
                  >
                    <FileUp size={16} /> Import
                  </button>
                  <button
                    onClick={handleExportJson}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-xs font-black tracking-widest text-slate-600 uppercase transition-colors hover:bg-slate-50 hover:text-blue-600"
                  >
                    <Download size={16} /> Export JSON
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => handlePrint()}
            disabled={isDownloading}
            className="flex items-center gap-2.5 rounded-xl bg-blue-600 px-7 py-2.5 text-[10px] font-black tracking-[0.1em] text-white uppercase shadow-xl transition-all hover:bg-blue-700 active:scale-95 disabled:cursor-not-allowed disabled:bg-blue-400"
          >
            {isDownloading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Download size={14} />
            )}
            {isDownloading ? "Generating..." : "Download"}
          </button>
        </div>
      </header>

      <div className="relative flex flex-1 overflow-hidden">
        {/* Sidebar Wrapper */}
        <div
          className={cn(
            "relative z-40 flex h-full flex-shrink-0 flex-col bg-white shadow-sm transition-all duration-300 ease-in-out",
            isSidebarOpen
              ? "w-72 border-r border-slate-200"
              : "w-0 border-r-transparent",
          )}
        >
          {/* Border Toggle Button */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={cn(
              "absolute top-10 z-50 flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-xl transition-all hover:text-blue-600 active:scale-95",
              isSidebarOpen ? "-right-4" : "-right-8 rotate-180",
            )}
            title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            <ChevronLeft size={16} />
          </button>

          {/* Sidebar Content with its own overflow control */}
          <div className="flex h-full flex-1 flex-col overflow-hidden">
            <div className="h-full w-72">
              <Sidebar onOpenLibrary={() => setIsLibraryOpen(true)} />
            </div>
          </div>
        </div>

        {/* Canvas Scroll Area */}
        <div className="custom-scrollbar relative flex flex-1 justify-center overflow-auto scroll-smooth bg-slate-50/50 p-4 md:p-12">
          <div
            ref={contentRef}
            className="hover:shadow-3xl relative mx-auto max-w-fit shadow-2xl transition-all duration-500"
          >
            <ResumePreview />
          </div>
        </div>
      </div>

      {/* MODALS */}
      <TemplateLibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        currentTemplate={activeResume.activeTemplateId}
        onSelect={(id) => setTemplate(id)}
      />

      <TemplateLibraryModal
        isOpen={isTemplateModalOpen || isNewResumeModalOpen}
        onClose={() => {
          closeTemplateModal();
          setIsNewResumeModalOpen(false);
        }}
        currentTemplate="standard"
        onSelect={(templateId) => {
          handleTemplateSelect(templateId);
          setIsNewResumeModalOpen(false);
        }}
      />

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={closeImportModal}
        onImport={(resume) => {
          handleImport(resume);
          closeImportModal();
        }}
      />

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .custom-scrollbar { overscroll-behavior: contain; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        [contenteditable]:focus { outline: none; background: rgba(59, 130, 246, 0.05); }
      `,
        }}
      />
    </div>
  );
};

export default EditorLayout;
