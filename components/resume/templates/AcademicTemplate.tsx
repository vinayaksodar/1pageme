"use client";

import React from "react";
import { Section, SectionItem, TemplateProps } from "@/types/resume";
import { cn, formatDatePeriod } from "@/lib/utils";
import PlainTextEditor from "@/components/ui/PlainTextEditor";
import MultiBlockEditor from "@/components/ui/MultiBlockEditor";
import { MonthYearPicker } from "@/components/ui/MonthYearPicker";
import { EditableImage } from "@/components/ui/EditableImage";
import { TemplateItem, TemplateSection, TemplateHeader } from "./TemplateBase";
import { getTemplateSpacing } from "./templateSpacing";

export const AcademicTemplate = ({
  resume,
  focusedItemId,
  setFocusedItemId,
  pageLayout,
  actions,
  templateStyles,
}: TemplateProps) => {
  const { content, activeTemplateId, layouts } = resume;
  if (!content || !layouts) return null;
  const layout = layouts[activeTemplateId];
  const { accentColor } = templateStyles;
  const spacing = getTemplateSpacing("academic", templateStyles);

  const visibility = content.personalInfo.visibility || {
    showJobTitle: true,
    showEmail: true,
    showPhone: true,
    showAddress: true,
    showPhoto: false,
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
        className="flex items-center justify-center border-b-2 pb-1"
        style={{
          borderColor: "#1f2937",
          marginBottom: `${spacing.continuedHeaderGap}rem`,
        }}
      >
        <span className="inline-block text-sm font-bold tracking-wider text-gray-800 uppercase">
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
        itemSpacing={spacing.itemGap}
        continuedHeader={continuedHeader}
      >
        <div
          className="flex items-baseline justify-between"
          style={{ marginBottom: `${spacing.itemMinorGap}rem` }}
        >
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

        <div
          className="flex flex-wrap items-center gap-2"
          style={{ marginBottom: `${spacing.itemMinorGap}rem` }}
        >
          {itemVisibility.showSubtitle && (
            <PlainTextEditor
              value={item.subtitle || ""}
              onChange={(val) =>
                actions.updateSectionItem(section.id, item.id, "subtitle", val)
              }
              className="text-sm font-semibold text-gray-800"
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
            className="text-sm leading-relaxed text-gray-700"
            style={{ marginBottom: `${spacing.itemDescriptionGap}rem` }}
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
            layout={
              section.type === "skills" || section.type === "interests"
                ? section.variant === "compact"
                  ? "compact"
                  : "horizontal"
                : "vertical"
            }
            className={cn(
              "text-sm text-gray-700",
              section.type === "skills" || section.type === "interests"
                ? section.variant === "compact"
                  ? "list-none"
                  : "gap-y-1 [&>li:not(:last-child)]:after:mx-[0.4em] [&>li:not(:last-child)]:after:text-[0.7em] [&>li:not(:last-child)]:after:text-gray-800 [&>li:not(:last-child)]:after:content-['•']"
                : "list-disc [&>li+li]:mt-[var(--bullet-gap)]",
            )}
            style={
              {
                "--bullet-gap": `${spacing.bulletRowGap}rem`,
              } as React.CSSProperties
            }
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
        className="flex items-center justify-center border-b-2 pb-1"
        style={{
          borderColor: "#1f2937",
          marginBottom: `${spacing.sectionHeaderGap}rem`,
        }}
      >
        <PlainTextEditor
          tagName="h3"
          value={section.title}
          onChange={(val) => actions.updateSectionTitle(section.id, val)}
          className="inline-block text-center text-sm font-bold tracking-wider text-gray-800 uppercase"
        />
      </div>
    );

    return (
      <TemplateSection
        key={section.id}
        section={section}
        config={config}
        pageLayout={pageLayout}
        sectionSpacing={spacing.sectionGap}
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
        sectionSpacing={spacing.sectionGap}
        visibility={visibility}
        className="border-b border-gray-100"
      >
        <header
          className="mt-0 flex flex-1 justify-center gap-6"
          style={{ paddingBottom: `${spacing.headerBottomPadding}rem` }}
        >
          <div className="w-full text-center">
            <PlainTextEditor
              tagName="h1"
              value={content.personalInfo.fullName}
              onChange={(val) => actions.updatePersonalInfo("fullName", val)}
              className="text-4xl font-bold tracking-tight text-gray-900"
              style={{
                marginBottom: `${spacing.headerNameGap}rem`,
              }}
            />
            {visibility.showJobTitle && (
              <PlainTextEditor
                tagName="h2"
                value={content.personalInfo.jobTitle || ""}
                onChange={(val) => actions.updatePersonalInfo("jobTitle", val)}
                className="text-2xl font-medium text-gray-500"
              />
            )}
            {visibility.showPhoto && (
              <div className="mt-4 flex justify-center">
                <EditableImage
                  src={content.personalInfo.profileImage}
                  onChange={(val) =>
                    actions.updatePersonalInfo("profileImage", val)
                  }
                  className={cn(
                    "h-24 w-24 border-2 border-gray-200 shadow-sm",
                    content.personalInfo.profileImageShape === "squircle"
                      ? "rounded-2xl"
                      : "rounded-full",
                  )}
                />
              </div>
            )}
            <div
              className="flex items-center justify-center gap-2 text-sm font-medium text-gray-600"
              style={{
                marginTop: `${spacing.headerContactTopGap}rem`,
              }}
            >
              {visibility.showAddress && (
                <span className="whitespace-nowrap">
                  <PlainTextEditor
                    tagName="span"
                    value={content.personalInfo.address}
                    onChange={(v) => actions.updatePersonalInfo("address", v)}
                  />
                </span>
              )}
              {visibility.showAddress &&
                (visibility.showEmail || visibility.showPhone) && (
                  <span className="text-gray-400">|</span>
                )}
              {visibility.showEmail && (
                <span className="whitespace-nowrap">
                  <PlainTextEditor
                    tagName="span"
                    value={content.personalInfo.email}
                    onChange={(v) => actions.updatePersonalInfo("email", v)}
                  />
                </span>
              )}
              {visibility.showEmail && visibility.showPhone && (
                <span className="text-gray-400">|</span>
              )}
              {visibility.showPhone && (
                <span className="whitespace-nowrap">
                  <PlainTextEditor
                    tagName="span"
                    value={content.personalInfo.phone}
                    onChange={(v) => actions.updatePersonalInfo("phone", v)}
                  />
                </span>
              )}
            </div>
          </div>
        </header>
      </TemplateHeader>

      <div className="flex-1">{layout.sections.map(renderSection)}</div>
    </div>
  );
};
