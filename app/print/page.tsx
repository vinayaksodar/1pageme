"use client";

import React, { useState, useEffect } from "react";
import { useResumePagination, PageLayout } from "@/hooks/useResumePagination";
import { StandardTemplate } from "@/components/resume/templates/StandardTemplate";
import { AcademicTemplate } from "@/components/resume/templates/AcademicTemplate";
import { ModernTemplate } from "@/components/resume/templates/ModernTemplate";
import { cn } from "@/lib/utils";
import { fontVariables } from "@/lib/fonts";
import { ResumeData } from "@/types/resume";

declare global {
  interface Window {
    __RESUME_DATA__?: ResumeData;
  }
}

const PrintRendererPage = () => {
  const [resume, setResume] = useState<ResumeData | null>(null);

  useEffect(() => {
    // Check if data is already in window (injected by Puppeteer)
    if (window.__RESUME_DATA__) {
      const data = window.__RESUME_DATA__;
      // Wrap in a microtask to avoid synchronous setState during effect execution
      void Promise.resolve().then(() => setResume(data));
      return;
    }

    // Fallback for local testing: check localStorage if needed or just wait
    const checkData = setInterval(() => {
      if (window.__RESUME_DATA__) {
        setResume(window.__RESUME_DATA__);
        clearInterval(checkData);
      }
    }, 100);

    return () => clearInterval(checkData);
  }, []);

  // Pagination Logic
  const templateStyles =
    resume?.layouts?.[resume.activeTemplateId]?.templateStyles;
  const pages = useResumePagination(
    resume || undefined,
    "measurement-container",
    (templateStyles?.pageMargins ?? 2) * 16,
  );

  if (!resume || !templateStyles || !resume.content || !resume.layouts) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
      </div>
    );
  }

  const templateProps = {
    resume: resume as ResumeData,
    focusedItemId: null,
    setFocusedItemId: () => {},
    actions: {
      updatePersonalInfo: () => {},
      updatePersonalInfoVisibility: () => {},
      updateSectionTitle: () => {},
      updateSectionVariant: () => {},
      updateSectionItem: () => {},
      addSectionItem: () => {},
      removeSectionItem: () => {},
      moveSectionItem: () => {},
    },
    templateStyles: templateStyles,
  };

  const renderTemplate = (pageLayout?: PageLayout) => {
    switch (resume.activeTemplateId) {
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
    <div className={cn("min-h-screen bg-white", fontVariables)}>
      {/* Hidden Measurement Container */}
      <div
        id="measurement-container"
        className="pointer-events-none absolute top-0 left-0 w-[210mm] opacity-0"
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
        className="mx-auto flex w-[210mm] flex-col items-center print:w-full"
        style={fontStyles}
      >
        {pages.map((page, index) => (
          <div
            key={index}
            className={cn(
              "relative h-[297mm] w-[210mm] bg-white print:h-auto print:min-h-[297mm] print:w-full",
              index > 0 ? "mt-8 print:mt-0 print:break-before-page" : "",
            )}
            style={{ padding: `${pageMargins}rem` }}
          >
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
      </div>

      {/* Ready indicator for Puppeteer */}
      {pages.length > 0 && <div id="pdf-ready" className="hidden" />}
    </div>
  );
};

export default PrintRendererPage;
