"use client";

import React, { useState, useRef } from "react";
import { useResumeStore } from "@/store/useResumeStore";
import { useResumePagination, PageLayout } from "@/hooks/useResumePagination";
import { StandardTemplate } from "./templates/StandardTemplate";
import { ModernTemplate } from "./templates/ModernTemplate";
import { cn } from "@/lib/utils";
import { fontVariables } from "@/lib/fonts";
import { useClickOutside } from "@/hooks/useClickOutside";

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
  } = useResumeStore();

  const [focusedItemId, setFocusedItemId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDeselect = () => {
    setFocusedItemId(null);
    // Force blur any active contentEditable
    if (
      document.activeElement instanceof HTMLElement &&
      document.activeElement.isContentEditable
    ) {
      document.activeElement.blur();
    }
  };

  // Handle clicks completely outside the resume (Grey canvas, Sidebar, etc)
  useClickOutside(containerRef, handleDeselect);

  const activeResume = resumes.find((r) => r.id === activeResumeId);

  const templateStyles =
    activeResume?.layouts[activeResume.activeTemplateId].templateStyles;

  // Pagination Logic
  const pages = useResumePagination(
    activeResume,
    "measurement-container",
    (templateStyles?.pageMargins ?? 2) * 16, // Convert rem to px
  );

  if (!activeResume || !templateStyles) return null;

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
    templateStyles: templateStyles, // Pass styles to templates
  };

  const renderTemplate = (pageLayout?: PageLayout) => {
    switch (activeResume.activeTemplateId) {
      case "modern":
        return <ModernTemplate {...templateProps} pageLayout={pageLayout} />;
      case "standard":
      default:
        return <StandardTemplate {...templateProps} pageLayout={pageLayout} />;
    }
  };

  const { fontFamily, lineHeight, fontSize, pageMargins } = templateStyles;
  const fontScale = Math.min(Math.max(1 + (fontSize - 1) * 0.5, 0.7), 1.6);

  const getFontFamily = (family: string) => {
    switch (family) {
      case "Rubik":
        return "var(--font-rubik)";
      case "Inter":
        return "var(--font-inter)";
      case "Roboto":
        return "var(--font-roboto)";
      case "Lato":
        return "var(--font-lato)";
      case "Serif":
        return "serif";
      default:
        return "var(--font-rubik)";
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative mb-20 flex flex-col items-center print:mb-0",
        fontVariables,
      )}
      style={{
        fontFamily: getFontFamily(fontFamily),
        lineHeight: lineHeight,
        fontSize: "1rem",
        ["--accent-color" as string]: templateStyles.accentColor,
      }}
      // Handle clicks on empty space inside the resume pages
      onClick={handleDeselect}
    >
      {/* Hidden Measurement Container - Renders full content to measure heights */}
      <div
        id="measurement-container"
        className="pointer-events-none absolute top-0 left-0 w-[210mm] opacity-0"
        style={{ padding: `${pageMargins}rem` }}
      >
        <div style={{ zoom: fontScale } as React.CSSProperties}>
          {renderTemplate()}
        </div>
      </div>

      {/* Visible Pages */}
      {pages.map((page, index) => (
        <div
          key={index}
          className={cn(
            "relative h-[297mm] w-[210mm] bg-white shadow-2xl transition-all duration-300 print:min-h-0 print:min-w-full print:shadow-none",
            index > 0 ? "mt-8 print:mt-0 print:break-before-page" : "",
          )}
          style={{ padding: `${pageMargins}rem` }}
        >
          {/* Visual Page Number */}
          <div className="absolute top-2 right-[-40px] text-xs font-medium text-gray-400 print:hidden">
            Page {index + 1}
          </div>

          <div style={{ zoom: fontScale } as React.CSSProperties}>
            {renderTemplate(page)}
          </div>

          {/* Page Break Visual (Bottom) - Optional, just margin is usually enough */}
        </div>
      ))}

      {/* Fallback if no pages calculated yet (initial render) */}
      {pages.length === 0 && (
        <div className="h-[297mm] w-[210mm] animate-pulse bg-white shadow" />
      )}
    </div>
  );
};

export default ResumePreview;
