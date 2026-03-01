"use client";

import React from "react";
import { useResumeStore } from "@/store/useResumeStore";
import {
  Section,
  SectionItem,
  ResumeData,
  PersonalInfoVisibility,
  TemplateStyles,
} from "@/types/resume";
import { cn, formatDatePeriod } from "@/lib/utils";
import PlainTextEditor from "@/components/ui/PlainTextEditor";
import MultiBlockEditor from "@/components/ui/MultiBlockEditor";
import FloatingToolbar from "../../ui/FloatingToolbar";
import { MonthYearPicker } from "@/components/ui/MonthYearPicker";
import { PageLayout } from "@/hooks/useResumePagination";
import { Camera } from "lucide-react";
import Image from "next/image";

interface TemplateProps {
  resume: ResumeData;
  focusedItemId: string | null;
  setFocusedItemId: (id: string | null) => void;
  pageLayout?: PageLayout;
  actions: {
    updatePersonalInfo: (field: string, value: string) => void;
    updatePersonalInfoVisibility: (
      visibility: Partial<PersonalInfoVisibility>,
    ) => void;
    updateSectionTitle: (sectionId: string, title: string) => void;
    updateSectionItem: (
      sectionId: string,
      itemId: string,
      field: keyof SectionItem,
      value: SectionItem[keyof SectionItem],
    ) => void;
    addSectionItem: (sectionId: string) => void;
    removeSectionItem: (sectionId: string, itemId: string) => void;
    moveSectionItem: (
      sectionId: string,
      itemId: string,
      direction: "up" | "down",
    ) => void;
  };
  templateStyles: TemplateStyles;
}

const EditableImage = ({
  src,
  onChange,
  className,
}: {
  src?: string;
  onChange: (val: string) => void;
  className?: string;
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div
      className={cn(
        "group relative cursor-pointer overflow-hidden bg-gray-100 print:bg-transparent",
        className,
      )}
      onClick={() => fileInputRef.current?.click()}
    >
      {src ? (
        <Image src={src} alt="Profile" fill style={{ objectFit: "cover" }} />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-gray-400">
          <Camera size={24} />
        </div>
      )}
      <div className="no-print absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100">
        <Camera size={20} />
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
};

export const StandardTemplate = ({
  resume,
  focusedItemId,
  setFocusedItemId,
  pageLayout,
  actions,
  templateStyles,
}: TemplateProps) => {
  const { content, activeTemplateId, layouts } = resume;
  const { isTextSelected } = useResumeStore();
  const layout = layouts[activeTemplateId];
  const { accentColor, sectionSpacing, itemSpacing } = templateStyles;

  const visibility = content.personalInfo.visibility || {
    showJobTitle: true,
    showEmail: true,
    showPhone: true,
    showAddress: true,
    showPhoto: true,
  };

  const renderItem = (
    section: Section,
    item: SectionItem,
    index: number,
    total: number,
  ) => {
    if (pageLayout && !pageLayout.items.has(item.id)) return null;

    const { visibility } = item;
    const isFirstOnPage = pageLayout
      ? section.items.find((i) => pageLayout.items.has(i.id))?.id === item.id
      : index === 0;
    const showContinuedHeader =
      pageLayout?.continued.has(section.id) && isFirstOnPage;

    return (
      <React.Fragment key={item.id}>
        {showContinuedHeader && (
          <div
            className="mb-4 flex items-center justify-between border-b-2 pb-1"
            style={{
              borderColor: accentColor,
            }}
          >
            <span
              className="inline-block text-sm font-bold tracking-wider uppercase"
              style={{ color: accentColor }}
            >
              {section.title}{" "}
              <span className="ml-2 text-[10px] opacity-70">(Continued)</span>
            </span>
          </div>
        )}
        <div
          data-resume-item={item.id}
          data-resume-section-id={section.id}
          data-resume-item-index={index}
          className={cn(
            "group/item relative -mx-1 break-inside-avoid rounded p-1 transition-colors",
            focusedItemId === item.id
              ? "z-30 print:!bg-transparent print:!shadow-none"
              : "z-20 hover:bg-gray-50/50",
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
              onAdd={() => actions.addSectionItem(section.id)}
              onDelete={() => actions.removeSectionItem(section.id, item.id)}
              isFirst={index === 0}
              isLast={index === total - 1}
              onMoveUp={() =>
                actions.moveSectionItem(section.id, item.id, "up")
              }
              onMoveDown={() =>
                actions.moveSectionItem(section.id, item.id, "down")
              }
            />
          )}

          <div className="mb-1 flex items-baseline justify-between">
            {visibility.showTitle && (
              <PlainTextEditor
                value={item.title}
                onChange={(val) =>
                  actions.updateSectionItem(section.id, item.id, "title", val)
                }
                className="font-bold text-gray-800"
                placeholder="Job Title / Project Name"
              />
            )}
            {visibility.showDatePeriod && (
              <MonthYearPicker
                initialDate={item.datePeriod}
                onSelect={(val) =>
                  actions.updateSectionItem(
                    section.id,
                    item.id,
                    "datePeriod",
                    val,
                  )
                }
              >
                <div className="ml-4 text-xs font-medium whitespace-nowrap text-gray-500 transition-colors hover:text-gray-800">
                  {formatDatePeriod(item.datePeriod) || (
                    <span className="text-gray-300 italic">Select Date</span>
                  )}
                </div>
              </MonthYearPicker>
            )}
          </div>

          <div className="mb-1 flex flex-wrap items-center gap-2">
            {visibility.showSubtitle && (
              <PlainTextEditor
                value={item.subtitle || ""}
                onChange={(val) =>
                  actions.updateSectionItem(
                    section.id,
                    item.id,
                    "subtitle",
                    val,
                  )
                }
                className="text-sm font-semibold"
                style={{ color: accentColor }}
                placeholder="Company / Institution"
              />
            )}
            {visibility.showLocation && item.location && (
              <span className="text-xs text-gray-300">|</span>
            )}
            {visibility.showLocation && (
              <PlainTextEditor
                value={item.location || ""}
                onChange={(val) =>
                  actions.updateSectionItem(
                    section.id,
                    item.id,
                    "location",
                    val,
                  )
                }
                className="text-xs text-gray-400"
                placeholder="Location"
              />
            )}
          </div>

          {visibility.showDescription && item.description && (
            <MultiBlockEditor
              value={item.description}
              onChange={(val) =>
                actions.updateSectionItem(
                  section.id,
                  item.id,
                  "description",
                  val,
                )
              }
              className="mb-2 text-sm leading-relaxed text-gray-700"
              placeholder="Description..."
            />
          )}

          {visibility.showBullets && item.bullets && (
            <MultiBlockEditor
              value={item.bullets}
              onChange={(newBullets) =>
                actions.updateSectionItem(
                  section.id,
                  item.id,
                  "bullets",
                  newBullets,
                )
              }
              type="bullets"
              className="list-disc space-y-1 text-sm text-gray-700"
            />
          )}
        </div>
      </React.Fragment>
    );
  };

  const renderSection = (config: { id: string; isVisible: boolean }) => {
    const section = content.sections.find((s) => s.id === config.id);
    if (!section || !config.isVisible) return null;

    const showMainHeader = pageLayout
      ? pageLayout.headers.has(section.id)
      : true;

    return (
      <div
        key={section.id}
        className="group/section relative"
        style={{ marginBottom: `${sectionSpacing}rem` }}
      >
        {showMainHeader && (
          <div
            className="mb-4 flex items-center justify-between border-b-2 pb-1"
            style={{ borderColor: accentColor }}
            data-resume-section-header={section.id}
          >
            <PlainTextEditor
              tagName="h3"
              value={section.title}
              onChange={(val) => actions.updateSectionTitle(section.id, val)}
              className="inline-block text-sm font-bold tracking-wider uppercase"
              style={{ color: accentColor }}
            />
          </div>
        )}
        <div>
          {section.items.map((item, index) =>
            renderItem(section, item, index, section.items.length),
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full flex-col">
      {(!pageLayout || pageLayout.pageIndex === 0) && (
        <div
          className={cn(
            "group/header relative -mx-1 flex items-start justify-between gap-6 rounded border-b border-gray-100 px-1 pb-8 transition-colors",
            focusedItemId === "header"
              ? "z-30 print:!bg-transparent print:!shadow-none"
              : "z-20 hover:bg-gray-50/50",
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
          <header className="mt-0 flex-1">
            <PlainTextEditor
              tagName="h1"
              value={content.personalInfo.fullName}
              onChange={(val) => actions.updatePersonalInfo("fullName", val)}
              className="mb-2 text-5xl font-black tracking-tighter uppercase"
              style={{ color: accentColor }}
            />
            {visibility.showJobTitle && (
              <PlainTextEditor
                tagName="h2"
                value={content.personalInfo.jobTitle || ""}
                onChange={(val) => actions.updatePersonalInfo("jobTitle", val)}
                className="text-2xl font-medium text-gray-500"
              />
            )}
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-gray-400">
              {visibility.showAddress && (
                <span>
                  📍{" "}
                  <PlainTextEditor
                    tagName="span"
                    value={content.personalInfo.address}
                    onChange={(v) => actions.updatePersonalInfo("address", v)}
                  />
                </span>
              )}
              {visibility.showEmail && (
                <span>
                  📧{" "}
                  <PlainTextEditor
                    tagName="span"
                    value={content.personalInfo.email}
                    onChange={(v) => actions.updatePersonalInfo("email", v)}
                  />
                </span>
              )}
              {visibility.showPhone && (
                <span>
                  📞{" "}
                  <PlainTextEditor
                    tagName="span"
                    value={content.personalInfo.phone}
                    onChange={(v) => actions.updatePersonalInfo("phone", v)}
                  />
                </span>
              )}
            </div>
          </header>
          {visibility.showPhoto && (
            <EditableImage
              src={content.personalInfo.profileImage}
              onChange={(val) =>
                actions.updatePersonalInfo("profileImage", val)
              }
              className={cn(
                "h-32 w-32 border-4 border-gray-100 shadow-sm",
                content.personalInfo.profileImageShape === "squircle"
                  ? "rounded-3xl"
                  : "rounded-full",
              )}
            />
          )}
        </div>
      )}

      <div className="flex-1">{layout.sections.map(renderSection)}</div>
    </div>
  );
};
