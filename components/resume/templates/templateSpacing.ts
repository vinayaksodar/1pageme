import { TemplateId, TemplateStyles } from "@/types/resume";

type SpacingMultipliers = {
  sectionGap: number;
  itemGap: number;
  sectionHeaderGap: number;
  continuedHeaderGap: number;
  itemMinorGap: number;
  itemSubtleGap: number;
  itemDescriptionGap: number;
  bulletRowGap: number;
  headerNameGap: number;
  headerContactTopGap: number;
  headerContactsRowGap: number;
  headerBottomPadding: number;
  columnGap: number;
};

export type TemplateSpacing = {
  sectionGap: number;
  itemGap: number;
  sectionHeaderGap: number;
  continuedHeaderGap: number;
  itemMinorGap: number;
  itemSubtleGap: number;
  itemDescriptionGap: number;
  bulletRowGap: number;
  headerNameGap: number;
  headerContactTopGap: number;
  headerContactsRowGap: number;
  headerBottomPadding: number;
  columnGap: number;
};

const DEFAULT_FONT_SIZE = 1;
const DEFAULT_LINE_HEIGHT = 1.5;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const MULTIPLIERS: Record<TemplateId, SpacingMultipliers> = {
  standard: {
    sectionGap: 1,
    itemGap: 1,
    sectionHeaderGap: 0.28,
    continuedHeaderGap: 0.28,
    itemMinorGap: 0.14,
    itemSubtleGap: 0.14,
    itemDescriptionGap: 0.25,
    bulletRowGap: 0.2,
    headerNameGap: 0.22,
    headerContactTopGap: 0.65,
    headerContactsRowGap: 0.2,
    headerBottomPadding: 0.9,
    columnGap: 1,
  },
  academic: {
    sectionGap: 1,
    itemGap: 1,
    sectionHeaderGap: 0.28,
    continuedHeaderGap: 0.28,
    itemMinorGap: 0.14,
    itemSubtleGap: 0.14,
    itemDescriptionGap: 0.25,
    bulletRowGap: 0.2,
    headerNameGap: 0.22,
    headerContactTopGap: 0.65,
    headerContactsRowGap: 0.2,
    headerBottomPadding: 0.9,
    columnGap: 1,
  },
  modern: {
    sectionGap: 0.9,
    itemGap: 0.85,
    sectionHeaderGap: 0.32,
    continuedHeaderGap: 0.32,
    itemMinorGap: 0.16,
    itemSubtleGap: 0.1,
    itemDescriptionGap: 0.22,
    bulletRowGap: 0.24,
    headerNameGap: 0.38,
    headerContactTopGap: 0.4,
    headerContactsRowGap: 0.22,
    headerBottomPadding: 0.2,
    columnGap: 1.05,
  },
};

export const getTemplateSpacing = (
  templateId: TemplateId,
  styles: TemplateStyles,
): TemplateSpacing => {
  const multipliers = MULTIPLIERS[templateId];
  // Keep spacing responsive to typography changes with dampened font scaling.
  const fontScale = Math.min(
    Math.max(1 + (styles.fontSize - DEFAULT_FONT_SIZE) * 0.5, 0.7),
    1.6,
  );
  const typographyScale = fontScale * (styles.lineHeight / DEFAULT_LINE_HEIGHT);

  const baseSectionGap = styles.sectionSpacing * typographyScale;
  const baseItemGap = styles.itemSpacing * typographyScale;

  return {
    sectionGap: clamp(baseSectionGap * multipliers.sectionGap, 0.25, 6),
    itemGap: clamp(baseItemGap * multipliers.itemGap, 0.1, 4),
    sectionHeaderGap: clamp(baseItemGap * multipliers.sectionHeaderGap, 0.1, 2),
    continuedHeaderGap: clamp(
      baseItemGap * multipliers.continuedHeaderGap,
      0.1,
      2,
    ),
    itemMinorGap: clamp(baseItemGap * multipliers.itemMinorGap, 0.05, 1),
    itemSubtleGap: clamp(baseItemGap * multipliers.itemSubtleGap, 0.05, 1),
    itemDescriptionGap: clamp(
      baseItemGap * multipliers.itemDescriptionGap,
      0.1,
      1.5,
    ),
    bulletRowGap: clamp(baseItemGap * multipliers.bulletRowGap, 0.05, 1.5),
    headerNameGap: clamp(baseItemGap * multipliers.headerNameGap, 0.1, 2),
    headerContactTopGap: clamp(
      baseItemGap * multipliers.headerContactTopGap,
      0.1,
      2.5,
    ),
    headerContactsRowGap: clamp(
      baseItemGap * multipliers.headerContactsRowGap,
      0.05,
      1.5,
    ),
    headerBottomPadding: clamp(
      baseSectionGap * multipliers.headerBottomPadding,
      0.1,
      4,
    ),
    columnGap: clamp(styles.columnGap * multipliers.columnGap, 0, 6),
  };
};
