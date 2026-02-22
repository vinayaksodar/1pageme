"use client";

import React, { useRef } from "react";
import Sidebar from "./Sidebar";
import ResumePreview from "../resume/ResumePreview";
import { useReactToPrint } from "react-to-print";
import { Download, ChevronLeft } from "lucide-react";
import { useResumeStore } from "@/store/useResumeStore";

const EditorLayout = () => {
  const { activeResumeId, resumes, setActiveResume } = useResumeStore();
  const contentRef = useRef<HTMLDivElement>(null);

  const activeResume = resumes.find((r) => r.id === activeResumeId);
  const resumeTitle = activeResume ? activeResume.title : "Resume";

  const handlePrint = useReactToPrint({
    contentRef: contentRef,
    documentTitle: resumeTitle,
  });

  if (!activeResume) return null;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-100 font-sans">
      {/* Left Sidebar - Controls */}
      <div className="z-50 flex h-full w-80 flex-shrink-0 flex-col border-r border-gray-200 bg-white shadow-sm">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex h-full flex-1 flex-col overflow-hidden">
        {/* Top Toolbar */}
        <header className="z-50 flex h-16 flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveResume("")} // Empty string or null to go back
              className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100"
              title="Back to Documents"
            >
              <ChevronLeft size={20} />
            </button>
            <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-gray-800">
              <span className="text-blue-600">1Page</span>Me
              <span className="mx-2 font-light text-gray-300">|</span>
              <span className="text-lg font-medium text-gray-500">
                {resumeTitle}
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handlePrint()}
              className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95"
            >
              <Download size={16} /> Download PDF
            </button>
          </div>
        </header>

        {/* Canvas Scroll Area */}
        <div className="relative flex flex-1 justify-center overflow-auto bg-gray-100 p-8">
          <div ref={contentRef}>
            <ResumePreview />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorLayout;
