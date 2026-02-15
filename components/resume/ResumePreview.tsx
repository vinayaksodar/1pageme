"use client";

import React, { useState } from 'react';
import { useResumeStore } from '@/store/useResumeStore';
import { StandardTemplate } from './templates/StandardTemplate';
import { ModernTemplate } from './templates/ModernTemplate';
import { cn } from '@/lib/utils';

const ResumePreview = () => {
  const { 
    resumes,
    activeResumeId,
    updatePersonalInfo, 
    updateSectionTitle, 
    updateSectionItem, 
    addSectionItem, 
    removeSectionItem,
    moveSectionItem
  } = useResumeStore();

  const [focusedItemId, setFocusedItemId] = useState<string | null>(null);

  const activeResume = resumes.find(r => r.id === activeResumeId);
  if (!activeResume) return null;

  const templateProps = {
    resume: activeResume,
    focusedItemId,
    setFocusedItemId,
    actions: {
      updatePersonalInfo,
      updateSectionTitle,
      updateSectionItem,
      addSectionItem,
      removeSectionItem,
      moveSectionItem
    }
  };

  const renderTemplate = () => {
    switch (activeResume.activeTemplateId) {
      case 'modern':
        return <ModernTemplate {...templateProps} />;
      case 'standard':
      default:
        return <StandardTemplate {...templateProps} />;
    }
  };

  const layout = activeResume.layouts[activeResume.activeTemplateId];
  const { margins, fontFamily, lineHeight } = layout.globalStyles;

  const getMargins = () => {
    switch(margins) {
      case 'compact': return 'p-8';
      case 'standard': return 'p-12';
      case 'spacious': return 'p-16';
      default: return 'p-12';
    }
  };

  return (
    <div 
      className="min-w-[210mm] min-h-[297mm] bg-white shadow-2xl transition-all duration-300 origin-top mb-20 overflow-hidden"
      style={{ 
        fontFamily: fontFamily === 'Serif' ? 'serif' : fontFamily,
        lineHeight: lineHeight 
      }}
      onClick={(e) => {
        // Clear focus if clicking outside items
        if (e.target === e.currentTarget) setFocusedItemId(null);
      }}
    >
      <div className={cn("w-full h-full flex flex-col", getMargins())}>
        {renderTemplate()}
      </div>
    </div>
  );
};

export default ResumePreview;
