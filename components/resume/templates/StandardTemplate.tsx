"use client";

import React from "react";
import { Section, SectionItem, TemplateProps } from "@/types/resume";
import { cn, formatDatePeriod } from "@/lib/utils";
import PlainTextEditor from "@/components/ui/PlainTextEditor";
import MultiBlockEditor from "@/components/ui/MultiBlockEditor";
import { MonthYearPicker } from "@/components/ui/MonthYearPicker";
import { EditableImage } from "@/components/ui/EditableImage";
import { TemplateItem, TemplateSection, TemplateHeader } from "./TemplateBase";

export const StandardTemplate = ({
  resume,
  focusedItemId,
  setFocusedItemId,
  pageLayout,
  actions,
  templateStyles,
}: TemplateProps) => {
  const { content, activeTemplateId, layouts } = resume;
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
    const { visibility: itemVisibility } = item;

    const continuedHeader = (
      <div
        className="mb-2 flex items-center justify-between border-b-2 pb-1"
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
    );

    return (
      <TemplateItem
        key={item.id}
        section={section}
        item={item}
        index={index}
        total={total}
        focusedItemId={focusedItemId}
        setFocusedItemId={setFocusedItemId}
        pageLayout={pageLayout}
        actions={actions}
        accentColor={accentColor}
        itemSpacing={itemSpacing}
        continuedHeader={continuedHeader}
      >
        <div className="mb-1 flex items-baseline justify-between">
          {itemVisibility.showTitle && (
            <PlainTextEditor
              value={item.title}
              onChange={(val) =>
                actions.updateSectionItem(section.id, item.id, "title", val)
              }
              className="font-bold text-gray-800"
              placeholder="Job Title / Project Name"
            />
          )}
          {itemVisibility.showDatePeriod && (
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
          {itemVisibility.showSubtitle && (
            <PlainTextEditor
              value={item.subtitle || ""}
              onChange={(val) =>
                actions.updateSectionItem(section.id, item.id, "subtitle", val)
              }
              className="text-sm font-semibold"
              style={{ color: accentColor }}
              placeholder="Company / Institution"
            />
          )}
          {itemVisibility.showLocation && item.location && (
            <span className="text-xs text-gray-300">|</span>
          )}
          {itemVisibility.showLocation && (
            <PlainTextEditor
              value={item.location || ""}
              onChange={(val) =>
                actions.updateSectionItem(section.id, item.id, "location", val)
              }
              className="text-xs text-gray-400"
              placeholder="Location"
            />
          )}
        </div>

        {itemVisibility.showDescription && item.description && (
          <MultiBlockEditor
            value={item.description}
            onChange={(val) =>
              actions.updateSectionItem(section.id, item.id, "description", val)
            }
            className="mb-2 text-sm leading-relaxed text-gray-700"
            placeholder="Description..."
          />
        )}

        {itemVisibility.showBullets && item.bullets && (
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
      </TemplateItem>
    );
  };

  const renderSection = (config: { id: string; isVisible: boolean }) => {
    const section = content.sections.find((s) => s.id === config.id);
    if (!section) return null;

    const header = (
      <div
        className="mb-2 flex items-center justify-between border-b-2 pb-1"
        style={{ borderColor: accentColor }}
      >
        <PlainTextEditor
          tagName="h3"
          value={section.title}
          onChange={(val) => actions.updateSectionTitle(section.id, val)}
          className="inline-block text-sm font-bold tracking-wider uppercase"
          style={{ color: accentColor }}
        />
      </div>
    );

    return (
      <TemplateSection
        key={section.id}
        section={section}
        config={config}
        pageLayout={pageLayout}
        sectionSpacing={sectionSpacing}
        header={header}
      >
        {section.items.map((item, index) =>
          renderItem(section, item, index, section.items.length),
        )}
      </TemplateSection>
    );
  };

  return (
    <div className="flex h-full flex-col">
      <TemplateHeader
        focusedItemId={focusedItemId}
        setFocusedItemId={setFocusedItemId}
        pageLayout={pageLayout}
        accentColor={accentColor}
        sectionSpacing={sectionSpacing}
        visibility={visibility}
        className="border-b border-gray-100 pb-8"
      >
        <header className="mt-0 flex flex-1 justify-between gap-6">
          <div className="flex-1">
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
          </div>
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
        </header>
      </TemplateHeader>

      <div className="flex-1">{layout.sections.map(renderSection)}</div>
    </div>
  );
};
