'use client'

import React, { useState } from 'react'
import { useResumeStore } from '@/store/useResumeStore'
import { useResumePagination, PageLayout } from '@/hooks/useResumePagination'
import { StandardTemplate } from './templates/StandardTemplate'
import { ModernTemplate } from './templates/ModernTemplate'
import { cn } from '@/lib/utils'

const ResumePreview = () => {
  const {
    resumes,
    activeResumeId,
    updatePersonalInfo,
    updatePersonalInfoVisibility,
    updateSectionTitle,
    updateSectionItem,
    addSectionItem,
    removeSectionItem,
    moveSectionItem,
  } = useResumeStore()

  const [focusedItemId, setFocusedItemId] = useState<string | null>(null)

  const activeResume = resumes.find((r) => r.id === activeResumeId)

  // Calculate margin in pixels for the hook
  const currentMargins =
    activeResume?.layouts[activeResume.activeTemplateId].globalStyles.margins ||
    'standard'
  const marginPx =
    {
      compact: 32,
      standard: 48,
      spacious: 64,
    }[currentMargins] || 48

  // Pagination Logic
  const pages = useResumePagination(
    activeResume,
    'measurement-container',
    marginPx,
  )

  if (!activeResume) return null

  const templateProps = {
    resume: activeResume,
    focusedItemId,
    setFocusedItemId,
    actions: {
      updatePersonalInfo,
      updatePersonalInfoVisibility,
      updateSectionTitle,
      updateSectionItem,
      addSectionItem,
      removeSectionItem,
      moveSectionItem,
    },
  }

  const renderTemplate = (pageLayout?: PageLayout) => {
    switch (activeResume.activeTemplateId) {
      case 'modern':
        return <ModernTemplate {...templateProps} pageLayout={pageLayout} />
      case 'standard':
      default:
        return <StandardTemplate {...templateProps} pageLayout={pageLayout} />
    }
  }

  const layout = activeResume.layouts[activeResume.activeTemplateId]
  const { margins, fontFamily, lineHeight } = layout.globalStyles

  const getMargins = () => {
    switch (margins) {
      case 'compact':
        return 'p-8'
      case 'standard':
        return 'p-12'
      case 'spacious':
        return 'p-16'
      default:
        return 'p-12'
    }
  }

  return (
    <div
      className="relative mb-20 flex flex-col items-center print:mb-0"
      style={{
        fontFamily: fontFamily === 'Serif' ? 'serif' : fontFamily,
        lineHeight: lineHeight,
      }}
      onClick={(e) => {
        // Clear focus if clicking outside items
        if (e.target === e.currentTarget) setFocusedItemId(null)
      }}
    >
      {/* Hidden Measurement Container - Renders full content to measure heights */}
      <div
        id="measurement-container"
        className={cn(
          'pointer-events-none absolute top-0 left-0 w-[210mm] opacity-0',
          getMargins(),
        )}
      >
        {renderTemplate()}
      </div>

      {/* Visible Pages */}
      {pages.map((page, index) => (
        <div
          key={index}
          className={cn(
            'relative h-[297mm] w-[210mm] bg-white shadow-2xl transition-all duration-300 print:min-h-0 print:min-w-full print:shadow-none',
            getMargins(),
            index > 0 ? 'mt-8 print:mt-0 print:break-before-page' : '',
          )}
        >
          {/* Visual Page Number */}
          <div className="absolute top-2 right-[-40px] text-xs font-medium text-gray-400 print:hidden">
            Page {index + 1}
          </div>

          {renderTemplate(page)}

          {/* Page Break Visual (Bottom) - Optional, just margin is usually enough */}
        </div>
      ))}

      {/* Fallback if no pages calculated yet (initial render) */}
      {pages.length === 0 && (
        <div className="h-[297mm] w-[210mm] animate-pulse bg-white shadow" />
      )}
    </div>
  )
}

export default ResumePreview
