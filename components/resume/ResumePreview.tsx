"use client";

import React, { useState, useRef, useEffect } from "react";
import { useResumeStore } from "@/store/useResumeStore";
import { useResumePagination, PageLayout } from "@/hooks/useResumePagination";
import { StandardTemplate } from "./templates/StandardTemplate";
import { AcademicTemplate } from "./templates/AcademicTemplate";
import { ModernTemplate } from "./templates/ModernTemplate";
import { cn, mmToPx } from "@/lib/utils";
import { fontVariables } from "@/lib/fonts";
import { useClickOutside } from "@/hooks/useClickOutside";
import { debounce } from "lodash";

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
  const [containerScale, setContainerScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;

      // Use documentElement.clientWidth as it represents the layout viewport width
      // and is generally more stable than window.innerWidth during pinch-zoom on mobile.
      const viewportWidth = document.documentElement.clientWidth;
      const isMobile = viewportWidth < 768;
      const padding = isMobile ? 32 : 96;

      const sidebarWidth =
        !isMobile && document.querySelector(".w-72") ? 288 : 0;

      const availableWidth = viewportWidth - sidebarWidth - padding;
      const pageWidthPx = mmToPx(210);

      if (availableWidth < pageWidthPx) {
        const newScale = availableWidth / pageWidthPx;
        setContainerScale(Math.max(newScale, 0.1));
      } else {
        setContainerScale(1);
      }
    };

    const debouncedUpdate = debounce(updateScale, 150);
    updateScale();

    const parent = containerRef.current?.parentElement;
    if (parent) {
      const ro = new ResizeObserver(() => debouncedUpdate());
      ro.observe(parent);
      ro.observe(document.body);
      return () => {
        ro.disconnect();
        debouncedUpdate.cancel();
      };
    }

    window.addEventListener("resize", debouncedUpdate);
    return () => {
      window.removeEventListener("resize", debouncedUpdate);
      debouncedUpdate.cancel();
    };
  }, []);

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
    activeResume?.layouts?.[activeResume.activeTemplateId]?.templateStyles;

  // Pagination Logic
  const pages = useResumePagination(
    activeResume,
    "measurement-container",
    (templateStyles?.pageMargins ?? 2) * 16, // Convert rem to px
  );

  if (!activeResume || !templateStyles || !activeResume.content) return null;

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
      case "academic":
        return <AcademicTemplate {...templateProps} pageLayout={pageLayout} />;
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

  const fontStyles = {
    fontFamily: getFontFamily(fontFamily),
    lineHeight: lineHeight,
    fontSize: `${fontSize}rem`,
    ["--accent-color" as string]: templateStyles.accentColor,
  };

  return (
    <div
      className="flex flex-col items-center"
      style={{
        width:
          containerScale < 1 ? `${mmToPx(210) * containerScale}px` : "auto",
        height: "auto",
        transition: "width 0.3s ease",
      }}
    >
      {/* Hidden Measurement Container - Moved OUTSIDE scaled div to maintain measurement accuracy */}
      <div
        id="measurement-container"
        className={cn(
          "pointer-events-none absolute top-0 left-0 w-[210mm] opacity-0",
          fontVariables,
        )}
        style={{
          ...fontStyles,
          padding: `${pageMargins}rem`,
        }}
      >
        <div
          style={{
            transform: `scale(${fontScale})`,
            transformOrigin: "top left",
            width: `${100 / fontScale}%`,
          }}
        >
          {renderTemplate()}
        </div>
      </div>

      <div
        ref={containerRef}
        className={cn(
          "relative mb-20 flex flex-col items-center print:mb-0",
          fontVariables,
        )}
        style={{
          ...fontStyles,
          transform: `scale(${containerScale})`,
          transformOrigin: "top center",
          width: "210mm",
        }}
        // Handle clicks on empty space inside the resume pages
        onClick={handleDeselect}
      >
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

            <div
              style={{
                transform: `scale(${fontScale})`,
                transformOrigin: "top left",
                width: `${100 / fontScale}%`,
              }}
            >
              {renderTemplate(page)}
            </div>
          </div>
        ))}

        {/* Fallback if no pages calculated yet (initial render) */}
        {pages.length === 0 && (
          <div className="h-[297mm] w-[210mm] animate-pulse bg-white shadow" />
        )}
      </div>
    </div>
  );
};

export default ResumePreview;
