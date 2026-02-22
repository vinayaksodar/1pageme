"use client";

import React from "react";
import { useResumeStore } from "@/store/useResumeStore";
import {
  Section,
  SectionItem,
  ResumeData,
  PersonalInfoVisibility,
} from "@/types/resume";
import { cn } from "@/lib/utils";
import PlainTextEditor from "@/components/ui/PlainTextEditor";
import RichTextEditor from "@/components/ui/RichTextEditor";
import FloatingToolbar from "../FloatingToolbar";
import { PageLayout } from "@/hooks/useResumePagination";
import { Camera } from "lucide-react";
import { ResumeBulletList } from "@/components/resume/ResumeBulletList";
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

export const ModernTemplate = ({
  resume,
  focusedItemId,
  setFocusedItemId,
  pageLayout,
  actions,
}: TemplateProps) => {
  const { content, activeTemplateId, layouts } = resume;
  const { isTextSelected } = useResumeStore();
  const layout = layouts[activeTemplateId];
  const { accentColor } = layout.globalStyles;

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
          <h3 className="mb-6 flex items-center gap-4 text-xs font-black tracking-widest uppercase">
            <span style={{ color: accentColor }}>
              {section.title}{" "}
              <span className="ml-1 text-[10px] opacity-50">(CONT.)</span>
            </span>
            <div className="h-[1px] flex-1 bg-gray-100" />
          </h3>
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
          style={
            focusedItemId === item.id
              ? {
                  boxShadow: `0 0 0 2px ${accentColor}`,
                  backgroundColor: `${accentColor}10`,
                }
              : {}
          }
          onFocus={() => setFocusedItemId(item.id)}
          onClick={() => setFocusedItemId(item.id)}
        >
          {focusedItemId === item.id && !isTextSelected && (
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
              itemDatePeriod={item.datePeriod || ""}
              onDateChange={(val) =>
                actions.updateSectionItem(
                  section.id,
                  item.id,
                  "datePeriod",
                  val,
                )
              }
            />
          )}

          <div className="mb-1">
            {visibility.showTitle && (
              <PlainTextEditor
                value={item.title}
                onChange={(val) =>
                  actions.updateSectionItem(section.id, item.id, "title", val)
                }
                className="text-base font-bold text-gray-900"
                placeholder="Title"
              />
            )}
            <div className="mt-0.5 flex items-center justify-between">
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
                  className="text-sm font-bold tracking-tight uppercase"
                  style={{ color: accentColor }}
                  placeholder="Company"
                />
              )}
              {visibility.showDatePeriod && (
                <div className="group/date flex items-center gap-1">
                  <PlainTextEditor
                    value={item.datePeriod || ""}
                    onChange={(val) =>
                      actions.updateSectionItem(
                        section.id,
                        item.id,
                        "datePeriod",
                        val,
                      )
                    }
                    className="rounded bg-gray-50 px-1.5 py-0.5 text-[10px] font-black text-gray-400 uppercase"
                    placeholder="Date"
                  />
                </div>
              )}
            </div>
          </div>

          {visibility.showDescription && (
            <RichTextEditor
              value={item.description || []}
              onChange={(val) =>
                actions.updateSectionItem(
                  section.id,
                  item.id,
                  "description",
                  val,
                )
              }
              className="mb-2 text-xs leading-snug text-gray-600 italic"
              multiline
            />
          )}

          {visibility.showBullets && item.bullets && (
            <ResumeBulletList
              items={item.bullets}
              onUpdate={(newBullets) =>
                actions.updateSectionItem(
                  section.id,
                  item.id,
                  "bullets",
                  newBullets,
                )
              }
              className="list-none space-y-1.5"
              itemClassName="text-xs text-gray-700 flex gap-2"
              renderBullet={() => (
                <span
                  className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: accentColor }}
                />
              )}
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
      <div key={section.id} className="group/section relative mb-10">
        {showMainHeader && (
          <h3
            className="mb-6 flex items-center gap-4 text-xs font-black tracking-widest uppercase"
            data-resume-section-header={section.id}
          >
            <PlainTextEditor
              tagName="span"
              value={section.title}
              onChange={(val) => actions.updateSectionTitle(section.id, val)}
              style={{ color: accentColor }}
            />
            <div className="h-[1px] flex-1 bg-gray-100" />
          </h3>
        )}
        <div className="space-y-6">
          {section.items.map((item, index) =>
            renderItem(section, item, index, section.items.length),
          )}
        </div>
      </div>
    );
  };

  const mainSections = layout.sections.filter(
    (s) => s.column === 1 || !s.column,
  );
  const sideSections = layout.sections.filter((s) => s.column === 2);

  return (
    <div className="flex h-full w-full flex-col">
      <div className="grid w-full grid-cols-[2fr_1fr] gap-x-10">
        {(!pageLayout || pageLayout.pageIndex === 0) && (
          <div
            className={cn(
              "group/header relative col-span-2 -mx-1 mb-10 flex items-start justify-between gap-8 rounded px-1 transition-colors",
              focusedItemId === "header"
                ? "z-30 print:!bg-transparent print:!shadow-none"
                : "z-20 hover:bg-gray-50/50",
            )}
            style={
              focusedItemId === "header"
                ? {
                    boxShadow: `0 0 0 2px ${accentColor}`,
                    backgroundColor: `${accentColor}10`,
                  }
                : {}
            }
            onFocus={() => setFocusedItemId("header")}
            onClick={() => setFocusedItemId("header")}
          >
            {focusedItemId === "header" && !isTextSelected && (
              <FloatingToolbar
                sectionId="header"
                itemId="header"
                sectionType="header"
                settings={visibility}
                onAdd={() => {}}
                onDelete={() => {}}
              />
            )}
            <header className="mt-0 flex w-full flex-1 items-start justify-between gap-8">
              <div className="max-w-[50%]">
                <PlainTextEditor
                  tagName="h1"
                  value={content.personalInfo.fullName}
                  onChange={(val) =>
                    actions.updatePersonalInfo("fullName", val)
                  }
                  className="mb-4 text-6xl leading-[0.9] font-black tracking-tighter uppercase"
                />
                {visibility.showJobTitle && (
                  <PlainTextEditor
                    tagName="h2"
                    value={content.personalInfo.jobTitle || ""}
                    onChange={(val) =>
                      actions.updatePersonalInfo("jobTitle", val)
                    }
                    className="text-lg font-bold tracking-widest uppercase"
                    style={{ color: accentColor }}
                  />
                )}
              </div>
              {visibility.showPhoto && (
                <div className="flex flex-1 justify-center">
                  <EditableImage
                    src={content.personalInfo.profileImage}
                    onChange={(val) =>
                      actions.updatePersonalInfo("profileImage", val)
                    }
                    className={cn(
                      "h-24 w-24 border-4 border-gray-50 shadow-sm",
                      content.personalInfo.profileImageShape === "squircle"
                        ? "rounded-2xl"
                        : "rounded-full",
                    )}
                  />
                </div>
              )}
              <div className="space-y-2 text-right text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                {visibility.showAddress && (
                  <PlainTextEditor
                    value={content.personalInfo.address}
                    onChange={(v) => actions.updatePersonalInfo("address", v)}
                    placeholder="Address"
                  />
                )}
                {visibility.showEmail && (
                  <PlainTextEditor
                    value={content.personalInfo.email}
                    onChange={(v) => actions.updatePersonalInfo("email", v)}
                    placeholder="Email"
                  />
                )}
                {visibility.showPhone && (
                  <PlainTextEditor
                    value={content.personalInfo.phone}
                    onChange={(v) => actions.updatePersonalInfo("phone", v)}
                    placeholder="Phone"
                  />
                )}
              </div>
            </header>
          </div>
        )}

        <div className="col-span-1 flex flex-col">
          {mainSections.map(renderSection)}
        </div>
        <div className="col-span-1 flex flex-col">
          {sideSections.map(renderSection)}
        </div>
      </div>
    </div>
  );
};
