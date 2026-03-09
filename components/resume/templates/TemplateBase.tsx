"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useResumeStore } from "@/store/useResumeStore";
import {
  Section,
  SectionItem,
  TemplateActions,
  PersonalInfoVisibility,
} from "@/types/resume";
import FloatingToolbar from "../../ui/FloatingToolbar";
import { PageLayout } from "@/hooks/useResumePagination";

interface TemplateItemProps {
  section: Section;
  item: SectionItem;
  index: number;
  total: number;
  focusedItemId: string | null;
  setFocusedItemId: (id: string | null) => void;
  pageLayout?: PageLayout;
  actions: TemplateActions;
  accentColor: string;
  itemSpacing: number;
  children: React.ReactNode;
  continuedHeader?: React.ReactNode;
  className?: string;
}

export const TemplateItem = ({
  section,
  item,
  index,
  total,
  focusedItemId,
  setFocusedItemId,
  pageLayout,
  actions,
  accentColor,
  itemSpacing,
  children,
  continuedHeader,
  className,
}: TemplateItemProps) => {
  const { isTextSelected } = useResumeStore();

  if (pageLayout && !pageLayout.items.has(item.id)) return null;

  const isFirstOnPage = pageLayout
    ? section.items.find((i) => pageLayout.items.has(i.id))?.id === item.id
    : index === 0;
  const showContinuedHeader =
    pageLayout?.continued.has(section.id) && isFirstOnPage;

  return (
    <React.Fragment>
      {showContinuedHeader && continuedHeader}
      <div
        data-resume-item={item.id}
        data-resume-section-id={section.id}
        data-resume-item-index={index}
        className={cn(
          "group/item relative -mx-1 rounded p-1 transition-colors",
          focusedItemId === item.id
            ? "z-30 print:!bg-transparent print:!shadow-none"
            : "z-20 hover:bg-gray-50/50",
          className,
        )}
        style={{
          marginBottom: `${itemSpacing}rem`,
          ...(focusedItemId === item.id
            ? {
                boxShadow: `0 0 0 2px ${accentColor}`,
                backgroundColor: `${accentColor}10`,
              }
            : {}),
        }}
        onFocus={() => setFocusedItemId(item.id)}
        onClick={(e) => {
          e.stopPropagation();
          setFocusedItemId(item.id);
        }}
      >
        {focusedItemId === item.id && !isTextSelected && pageLayout && (
          <FloatingToolbar
            sectionId={section.id}
            itemId={item.id}
            sectionType={section.type}
            settings={item.visibility}
            variant={section.variant}
            onVariantChange={(v) => actions.updateSectionVariant(section.id, v)}
            onAdd={() => actions.addSectionItem(section.id)}
            onDelete={() => actions.removeSectionItem(section.id, item.id)}
            isFirst={index === 0}
            isLast={index === total - 1}
            onMoveUp={() => actions.moveSectionItem(section.id, item.id, "up")}
            onMoveDown={() =>
              actions.moveSectionItem(section.id, item.id, "down")
            }
          />
        )}
        {children}
      </div>
    </React.Fragment>
  );
};

interface TemplateSectionProps {
  section: Section;
  config: { id: string; isVisible: boolean };
  pageLayout?: PageLayout;
  sectionSpacing: number;
  header: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const TemplateSection = ({
  section,
  config,
  pageLayout,
  sectionSpacing,
  header,
  children,
  className,
}: TemplateSectionProps) => {
  if (!section || !config.isVisible) return null;

  const showMainHeader = pageLayout ? pageLayout.headers.has(section.id) : true;
  const hasItemsOnPage = pageLayout
    ? section.items.some((item) => pageLayout.items.has(item.id))
    : true;

  // In paginated mode, skip sections that have neither a header nor items on this page.
  if (pageLayout && !showMainHeader && !hasItemsOnPage) return null;

  return (
    <div
      key={section.id}
      className={cn("group/section relative", className)}
      style={{ marginBottom: `${sectionSpacing}rem` }}
    >
      {showMainHeader && (
        <div data-resume-section-header={section.id} className="flow-root">
          {header}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
};

interface TemplateHeaderProps {
  focusedItemId: string | null;
  setFocusedItemId: (id: string | null) => void;
  pageLayout?: PageLayout;
  accentColor: string;
  sectionSpacing: number;
  visibility: PersonalInfoVisibility;
  children: React.ReactNode;
  className?: string;
}

export const TemplateHeader = ({
  focusedItemId,
  setFocusedItemId,
  pageLayout,
  accentColor,
  sectionSpacing,
  visibility,
  children,
  className,
}: TemplateHeaderProps) => {
  const { isTextSelected } = useResumeStore();

  if (pageLayout && pageLayout.pageIndex !== 0) return null;

  return (
    <div
      className={cn(
        "group/header relative -mx-1 rounded px-1 transition-colors",
        focusedItemId === "header"
          ? "z-30 print:!bg-transparent print:!shadow-none"
          : "z-20 hover:bg-gray-50/50",
        className,
      )}
      style={{
        marginBottom: `${sectionSpacing}rem`,
        ...(focusedItemId === "header"
          ? {
              boxShadow: `0 0 0 2px ${accentColor}`,
              backgroundColor: `${accentColor}10`,
            }
          : {}),
      }}
      onFocus={() => setFocusedItemId("header")}
      onClick={(e) => {
        e.stopPropagation();
        setFocusedItemId("header");
      }}
    >
      {focusedItemId === "header" && !isTextSelected && pageLayout && (
        <FloatingToolbar
          sectionId="header"
          itemId="header"
          sectionType="header"
          settings={visibility}
          onAdd={() => {}}
          onDelete={() => {}}
        />
      )}
      {children}
    </div>
  );
};
