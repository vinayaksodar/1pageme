"use client";

import React, { useRef, useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import ResumePreview from "../resume/ResumePreview";
import { useReactToPrint } from "react-to-print";
import {
  Download,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  Copy,
  FileDown,
  Edit2,
  Check,
} from "lucide-react";
import { useResumeStore } from "@/store/useResumeStore";
import TemplateLibraryModal from "../ui/TemplateLibraryModal";
import ImportModal from "../ui/ImportModal";
import { Logo } from "../ui/Logo";
import { cn } from "@/lib/utils";
import { ResumeData } from "@/types/resume";
import { isLikelyNativeResumeExport } from "@/lib/import-utils";

const EditorLayout = () => {
  const {
    activeResumeId,
    resumes,
    setActiveResume,
    setTemplate,
    createNewResume,
    duplicateResume,
    importResume,
    renameResume,
  } = useResumeStore();
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isNewResumeModalOpen, setIsNewResumeModalOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState("");
  const [pendingImportData, setPendingImportData] =
    useState<Partial<ResumeData> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const activeResume = resumes.find((r) => r.id === activeResumeId);
  const resumeTitle = activeResume ? activeResume.title : "Resume";

  const handlePrint = useReactToPrint({
    contentRef: contentRef,
    documentTitle: resumeTitle,
  });

  const startEditing = () => {
    if (activeResume) {
      setTempTitle(activeResume.title);
      setIsEditingTitle(true);
      setIsDropdownOpen(false);
    }
  };

  const saveTitle = () => {
    if (activeResumeId && tempTitle.trim()) {
      renameResume(activeResumeId, tempTitle.trim());
    }
    setIsEditingTitle(false);
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

  // Focus input when editing starts
  useEffect(() => {
    if (isEditingTitle && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [isEditingTitle]);

  if (!activeResume) return null;

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-slate-100 font-sans">
      {/* TOP BAR */}
      <header className="z-50 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm">
        <div className="flex items-center gap-5">
          <Logo onClick={() => setActiveResume("")} />
          <div className="h-6 w-[1px] bg-slate-200"></div>
          <div className="relative flex flex-col" ref={dropdownRef}>
            {isEditingTitle ? (
              <div className="flex items-center gap-2">
                <input
                  ref={editInputRef}
                  type="text"
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  onBlur={saveTitle}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveTitle();
                    if (e.key === "Escape") setIsEditingTitle(false);
                  }}
                  className="rounded border-none bg-slate-50 px-2 py-0.5 text-sm font-black text-slate-900 ring-2 ring-blue-600 focus:outline-none"
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
                  startEditing();
                }}
                className="group flex items-center gap-2 text-sm font-black text-slate-900"
              >
                {resumeTitle}{" "}
                <ChevronDown size={14} className="text-slate-300" />
              </button>
            )}

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="animate-in fade-in zoom-in absolute top-full left-0 z-[100] mt-2 w-56 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl duration-200">
                <div className="p-2">
                  <button
                    onClick={startEditing}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-xs font-black tracking-widest text-slate-600 uppercase transition-colors hover:bg-slate-50 hover:text-blue-600"
                  >
                    <Edit2 size={16} /> Rename
                  </button>
                  <button
                    onClick={() => {
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
                      setIsImportModalOpen(true);
                      setIsDropdownOpen(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-xs font-black tracking-widest text-slate-600 uppercase transition-colors hover:bg-slate-50 hover:text-blue-600"
                  >
                    <FileDown size={16} /> Import from LLM
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => handlePrint()}
            className="flex items-center gap-2.5 rounded-xl bg-blue-600 px-7 py-2.5 text-[10px] font-black tracking-[0.1em] text-white uppercase shadow-xl transition-all hover:bg-blue-700 active:scale-95"
          >
            <Download size={14} /> Download
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
        <div className="custom-scrollbar relative flex flex-1 justify-center overflow-auto scroll-smooth bg-slate-50/50 p-12">
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
        isOpen={isNewResumeModalOpen || !!pendingImportData}
        onClose={() => {
          setIsNewResumeModalOpen(false);
          setPendingImportData(null);
        }}
        currentTemplate="standard"
        onSelect={(templateId) => {
          if (pendingImportData) {
            importResume(pendingImportData, templateId);
            setPendingImportData(null);
          } else {
            createNewResume(templateId);
          }
          setIsNewResumeModalOpen(false);
        }}
      />

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={(resume) => {
          if (isLikelyNativeResumeExport(resume)) {
            importResume(resume);
          } else {
            setPendingImportData(resume);
          }
          setIsImportModalOpen(false);
        }}
      />

      <style
        dangerouslySetInnerHTML={{
          __html: `
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
