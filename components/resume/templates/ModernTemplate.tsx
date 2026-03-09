"use client";

import React from "react";
import { Section, SectionItem, TemplateProps } from "@/types/resume";
import { cn, formatDatePeriod, getProficiencyLabel } from "@/lib/utils";
import PlainTextEditor from "@/components/ui/PlainTextEditor";
import MultiBlockEditor from "@/components/ui/MultiBlockEditor";
import { MonthYearPicker } from "@/components/ui/MonthYearPicker";
import { EditableImage } from "@/components/ui/EditableImage";
import { ProficiencySlider } from "@/components/ui/ProficiencySlider";
import { TemplateItem, TemplateSection, TemplateHeader } from "./TemplateBase";
import { getTemplateSpacing } from "./templateSpacing";

export const ModernTemplate = ({
  resume,
  focusedItemId,
  setFocusedItemId,
  pageLayout,
  actions,
  templateStyles,
}: TemplateProps) => {
  const { content, activeTemplateId, layouts } = resume;
  if (!content || !layouts) return null;
  const layoutConfig = layouts[activeTemplateId];

  const {
    accentColor,
    layout,
    columnWidths = { mainColumn: 65, secondaryColumn: 35 },
  } = templateStyles;
  const spacing = getTemplateSpacing("modern", templateStyles);

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
      <h3
        className="flex items-center gap-4 text-xs font-black tracking-widest uppercase"
        style={{ marginBottom: `${spacing.continuedHeaderGap}rem` }}
      >
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
        itemSpacing={spacing.itemGap}
        continuedHeader={continuedHeader}
      >
        {section.type === "languages" ? (
          <div
            className="flex items-center justify-between gap-4"
            style={{ marginBottom: `${spacing.itemMinorGap}rem` }}
          >
            <div className="flex-1 overflow-hidden">
              {itemVisibility.showTitle && (
                <PlainTextEditor
                  value={item.title}
                  onChange={(val) =>
                    actions.updateSectionItem(section.id, item.id, "title", val)
                  }
                  className="text-sm font-bold text-gray-900"
                  placeholder="Language"
                />
              )}
            </div>
            <div className="flex flex-shrink-0 items-center gap-3">
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
                  className="text-[10px] font-bold tracking-tight text-gray-400 uppercase"
                  placeholder="Proficiency"
                />
              )}
              {itemVisibility.showSlider && (
                <div className="w-[56px] flex-shrink-0">
                  <ProficiencySlider
                    value={item.sliderValue || 0}
                    type={item.sliderType || "dots"}
                    onChange={(val) => {
                      actions.updateSectionItem(
                        section.id,
                        item.id,
                        "sliderValue",
                        val,
                      );
                      if (section.type === "languages") {
                        actions.updateSectionItem(
                          section.id,
                          item.id,
                          "subtitle",
                          getProficiencyLabel(val),
                        );
                      }
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ marginBottom: `${spacing.itemMinorGap}rem` }}>
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
            <div
              className="flex items-center justify-between"
              style={{ marginTop: `${spacing.itemSubtleGap}rem` }}
            >
              <div className="flex items-center gap-2">
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
                {itemVisibility.showLocation && item.location && (
                  <span className="text-xs text-gray-300">|</span>
                )}
                {itemVisibility.showLocation && (
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
                    className="text-xs font-bold text-gray-400 uppercase"
                    placeholder="Location"
                  />
                )}
              </div>
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
            {itemVisibility.showSlider && (
              <div className="mt-2 max-w-[120px]">
                <ProficiencySlider
                  value={item.sliderValue || 0}
                  type={item.sliderType || "dots"}
                  onChange={(val) => {
                    actions.updateSectionItem(
                      section.id,
                      item.id,
                      "sliderValue",
                      val,
                    );
                    if (section.type === "languages") {
                      actions.updateSectionItem(
                        section.id,
                        item.id,
                        "subtitle",
                        getProficiencyLabel(val),
                      );
                    }
                  }}
                />
              </div>
            )}
          </div>
        )}

        {itemVisibility.showDescription && item.description && (
          <MultiBlockEditor
            value={item.description}
            onChange={(val) =>
              actions.updateSectionItem(section.id, item.id, "description", val)
            }
            className="text-xs leading-snug text-gray-600 italic"
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
              "text-xs text-gray-700",
              section.type === "skills" || section.type === "interests"
                ? section.variant === "compact"
                  ? "list-none"
                  : "gap-x-[0.5em] gap-y-3 [&>li]:border-b [&>li]:border-gray-800 [&>li]:px-[0.4em] [&>li]:pb-[0.1em]"
                : "list-disc [&>li+li]:mt-[var(--bullet-gap)]",
            )}
            style={
              {
                "--accent-color": accentColor,
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
      <h3
        className="flex items-center gap-4 text-xs font-black tracking-widest uppercase"
        style={{ marginBottom: `${spacing.sectionHeaderGap}rem` }}
      >
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
        sectionSpacing={spacing.sectionGap}
        header={header}
      >
        {section.items.map((item, index) =>
          renderItem(section, item, index, section.items.length),
        )}
      </TemplateSection>
    );
  };

  const mainSections = layoutConfig.sections.filter(
    (s) => s.column === "mainColumn" || !s.column,
  );
  const sideSections = layoutConfig.sections.filter(
    (s) => s.column === "secondaryColumn",
  );

  return (
    <div className="flex h-full w-full flex-col">
      <div
        className="grid w-full"
        style={{
          gridTemplateColumns:
            layout === "two-column"
              ? `${columnWidths.mainColumn}fr ${columnWidths.secondaryColumn}fr`
              : "1fr",
          columnGap: `${spacing.columnGap}rem`,
          rowGap: `${spacing.sectionGap}rem`,
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
                className="text-6xl leading-[0.9] font-black tracking-tighter uppercase"
                style={{ marginBottom: `${spacing.headerNameGap}rem` }}
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
            <div
              className="flex flex-col text-right text-[10px] font-bold tracking-widest text-gray-400 uppercase"
              style={{ gap: `${spacing.headerContactsRowGap}rem` }}
            >
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
