"use client";

import React, { useRef } from 'react';
import Sidebar from './Sidebar';
import ResumePreview from '../resume/ResumePreview';
import { useReactToPrint } from 'react-to-print';
import { Download, Share2, ChevronLeft } from 'lucide-react';
import { useResumeStore } from '@/store/useResumeStore';

const EditorLayout = () => {
  const { activeResumeId, resumes, setActiveResume } = useResumeStore();
  const contentRef = useRef<HTMLDivElement>(null);

  const activeResume = resumes.find(r => r.id === activeResumeId);

  const handlePrint = useReactToPrint({
    contentRef: contentRef,
    documentTitle: activeResume?.title || 'Resume',
  });

  if (!activeResume) return null;

  return (
    <div className="flex h-screen w-full bg-gray-100 overflow-hidden font-sans">
      {/* Left Sidebar - Controls */}
      <div className="w-80 h-full bg-white border-r border-gray-200 flex-shrink-0 z-50 shadow-sm flex flex-col">
         <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Top Toolbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0 z-50">
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => setActiveResume('')} // Empty string or null to go back
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                    title="Back to Documents"
                >
                    <ChevronLeft size={20} />
                </button>
                <h1 className="font-bold text-xl text-gray-800 tracking-tight flex items-center gap-2">
                    <span className="text-blue-600">1Page</span>Me
                    <span className="text-gray-300 font-light mx-2">|</span>
                    <span className="text-gray-500 font-medium text-lg">{activeResume.title}</span>
                </h1>
            </div>

            <div className="flex items-center gap-3">
                <button 
                    onClick={() => handlePrint()}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md font-medium text-sm hover:bg-blue-700 transition-all shadow-sm active:scale-95"
                >
                    <Download size={16} /> Download PDF
                </button>
            </div>
        </header>

        {/* Canvas Scroll Area */}
        <div className="flex-1 overflow-auto flex justify-center p-8 bg-gray-100 relative">
            <div ref={contentRef}>
                <ResumePreview />
            </div>
        </div>
      </div>
    </div>
  );
};

export default EditorLayout;
