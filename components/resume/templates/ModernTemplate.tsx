"use client";

import React from "react";
import { Section, SectionItem, TemplateProps } from "@/types/resume";
import { cn, formatDatePeriod } from "@/lib/utils";
import PlainTextEditor from "@/components/ui/PlainTextEditor";
import MultiBlockEditor from "@/components/ui/MultiBlockEditor";
import { MonthYearPicker } from "@/components/ui/MonthYearPicker";
import { EditableImage } from "@/components/ui/EditableImage";
import { TemplateItem, TemplateSection, TemplateHeader } from "./TemplateBase";

export const ModernTemplate = ({
  resume,
  focusedItemId,
  setFocusedItemId,
  pageLayout,
  actions,
  templateStyles,
}: TemplateProps) => {
  const { content, activeTemplateId, layouts } = resume;
  const layoutConfig = layouts[activeTemplateId];

  const {
    accentColor,
    sectionSpacing,
    itemSpacing,
    layout,
    columnWidths = [65, 35],
    columnGap = 2.5,
  } = templateStyles;

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
      <h3 className="mb-3 flex items-center gap-4 text-xs font-black tracking-widest uppercase">
        <span style={{ color: accentColor }}>
          {section.title}{" "}
          <span className="ml-1 text-[10px] opacity-50">(CONT.)</span>
        </span>
        <div className="h-[1px] flex-1 bg-gray-100" />
      </h3>
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
        <div className="mb-1">
          {itemVisibility.showTitle && (
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
            {itemVisibility.showSubtitle && (
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
                <div className="rounded bg-gray-50 px-1.5 py-0.5 text-[10px] font-black text-gray-400 uppercase transition-colors hover:bg-gray-100 hover:text-gray-600">
                  {formatDatePeriod(item.datePeriod) || "DATE"}
                </div>
              </MonthYearPicker>
            )}
          </div>
        </div>

        {itemVisibility.showDescription && item.description && (
          <MultiBlockEditor
            value={item.description}
            onChange={(val) =>
              actions.updateSectionItem(section.id, item.id, "description", val)
            }
            className="mb-2 text-xs leading-snug text-gray-600 italic"
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
            className="list-disc space-y-1.5 text-xs text-gray-700"
            style={{ "--accent-color": accentColor } as React.CSSProperties}
          />
        )}
      </TemplateItem>
    );
  };

  const renderSection = (config: { id: string; isVisible: boolean }) => {
    const section = content.sections.find((s) => s.id === config.id);
    if (!section) return null;

    const header = (
      <h3 className="mb-3 flex items-center gap-4 text-xs font-black tracking-widest uppercase">
        <PlainTextEditor
          tagName="span"
          value={section.title}
          onChange={(val) => actions.updateSectionTitle(section.id, val)}
          style={{ color: accentColor }}
        />
        <div className="h-[1px] flex-1 bg-gray-100" />
      </h3>
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

  const mainSections = layoutConfig.sections.filter(
    (s) => s.column === 1 || !s.column,
  );
  const sideSections = layoutConfig.sections.filter((s) => s.column === 2);

  return (
    <div className="flex h-full w-full flex-col">
      <div
        className="grid w-full"
        style={{
          gridTemplateColumns:
            layout === "two-column"
              ? `${columnWidths[0]}fr ${columnWidths[1]}fr`
              : "1fr",
          columnGap: `${columnGap}rem`,
          rowGap: `${sectionSpacing}rem`,
        }}
      >
        <TemplateHeader
          focusedItemId={focusedItemId}
          setFocusedItemId={setFocusedItemId}
          pageLayout={pageLayout}
          accentColor={accentColor}
          sectionSpacing={0}
          visibility={visibility}
          className="col-span-full"
        >
          <header className="mt-0 flex w-full flex-1 items-start justify-between gap-8">
            <div className="max-w-[50%]">
              <PlainTextEditor
                tagName="h1"
                value={content.personalInfo.fullName}
                onChange={(val) => actions.updatePersonalInfo("fullName", val)}
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
        </TemplateHeader>

        <div className="col-span-1 flex flex-col">
          {mainSections.map(renderSection)}
        </div>
        {layout === "two-column" && (
          <div className="col-span-1 flex flex-col">
            {sideSections.map(renderSection)}
          </div>
        )}
      </div>
    </div>
  );
};
