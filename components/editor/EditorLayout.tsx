"use client";

import React, { useRef, useState } from "react";
import Sidebar from "./Sidebar";
import ResumePreview from "../resume/ResumePreview";
import { useReactToPrint } from "react-to-print";
import { Download, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useResumeStore } from "@/store/useResumeStore";
import TemplateLibraryModal from "./TemplateLibraryModal";
import { cn } from "@/lib/utils";

const EditorLayout = () => {
  const { activeResumeId, resumes, setActiveResume, setTemplate } =
    useResumeStore();
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);

  const activeResume = resumes.find((r) => r.id === activeResumeId);
  const resumeTitle = activeResume ? activeResume.title : "Resume";

  const handlePrint = useReactToPrint({
    contentRef: contentRef,
    documentTitle: resumeTitle,
  });

  if (!activeResume) return null;

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-slate-100 font-sans">
      {/* TOP BAR */}
      <header className="z-50 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm">
        <div className="flex items-center gap-5">
          <button
            onClick={() => setActiveResume("")}
            className="group flex items-center gap-3 transition-transform active:scale-95"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-xl font-black text-white italic shadow-lg shadow-blue-100 transition-colors group-hover:bg-blue-700">
              1
            </div>
            <h1 className="hidden text-lg font-black tracking-tighter text-slate-900 uppercase italic sm:block">
              1PageMe
            </h1>
          </button>
          <div className="h-6 w-[1px] bg-slate-200"></div>
          <div className="flex flex-col">
            <span className="mb-1.5 text-[10px] leading-none font-black tracking-[0.2em] text-slate-300 uppercase">
              Project
            </span>
            <button className="group flex items-center gap-2 text-sm font-black text-slate-900">
              {resumeTitle} <ChevronDown size={14} className="text-slate-300" />
            </button>
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

      <TemplateLibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        currentTemplate={activeResume.activeTemplateId}
        onSelect={(id) => setTemplate(id)}
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
