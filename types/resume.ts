export type SectionType =
  | "summary"
  | "experience"
  | "education"
  | "projects"
  | "skills"
  | "certifications"
  | "languages"
  | "volunteering"
  | "awards"
  | "publications"
  | "patents"
  | "courses"
  | "references"
  | "leadership"
  | "professional-affiliations"
  | "conferences"
  | "achievements"
  | "interests"
  | "custom";

// Structured Text Types
export type MarkType = "bold" | "italic" | "underline" | "strikethrough";
export interface LinkMark {
  type: "link";
  attrs: {
    href: string;
  };
}
export type Mark = MarkType | LinkMark;

export interface TextNode {
  type: "text";
  text: string;
  marks?: Mark[];
}

export interface Block {
  id: string;
  content: TextNode[];
}

export interface ItemVisibility {
  showTitle: boolean;
  showSubtitle: boolean;
  showDescription: boolean;
  showBullets: boolean;
  showLocation: boolean;
  showDatePeriod: boolean;
  showLink: boolean;
  showSlider: boolean;
}

export type SliderType = "dots" | "line" | "bars";

export type DateValue = { year: number; month?: string } | "Present" | null;

export interface DatePeriod {
  startDate: DateValue;
  endDate: DateValue;
}

export interface SectionItem {
  id: string;
  // Semantic Data
  title: string;
  subtitle?: string; // Company Name / Institution
  description?: Block[];
  bullets?: Block[];
  location?: string;
  datePeriod?: DatePeriod;
  link?: string;

  // Proficiency Slider
  sliderValue?: number; // 0-100
  sliderType?: SliderType;

  // Rendering settings for this specific item
  visibility: ItemVisibility;
}

export interface Section {
  id: string;
  type: SectionType;
  title: string;
  items: SectionItem[];
  variant?: "bullets" | "compact";
}

export interface TemplateStyles {
  fontFamily: "Rubik" | "Inter" | "Serif" | "Roboto" | "Lato";
  fontSize: number; // in rem
  accentColor: string;
  pageMargins: number; // in rem
  sectionSpacing: number; // in rem
  itemSpacing: number; // in rem
  lineHeight: number;
  layout: "one-column" | "two-column";
  columnWidths: {
    mainColumn: number;
    secondaryColumn: number;
  }; // percentages
  columnGap: number; // in rem
}

export type SectionColumn = "mainColumn" | "secondaryColumn";

export interface SectionConfig {
  id: string;
  column: SectionColumn;
  isVisible: boolean;
}

export interface TemplateLayout {
  templateStyles: TemplateStyles;
  sections: SectionConfig[]; // The order of this array determines rendering order
}

export type TemplateId = "standard" | "academic" | "modern";

export interface PersonalInfoVisibility {
  showPhone: boolean;
  showEmail: boolean;
  showAddress: boolean;
  showJobTitle: boolean;
  showPhoto: boolean;
}

export interface TemplateActions {
  updatePersonalInfo: (field: string, value: string) => void;
  updatePersonalInfoVisibility: (
    visibility: Partial<PersonalInfoVisibility>,
  ) => void;
  updateSectionTitle: (sectionId: string, title: string) => void;
  updateSectionVariant: (
    sectionId: string,
    variant: Section["variant"],
  ) => void;
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
}

export interface TemplateProps {
  resume: ResumeData;
  focusedItemId: string | null;
  setFocusedItemId: (id: string | null) => void;
  pageLayout?: import("@/hooks/useResumePagination").PageLayout;
  actions: TemplateActions;
  templateStyles: TemplateStyles;
}

export interface ResumeMetadata {
  id: string;
  title: string;
  updatedAt: number;
  createdAt: number;
  activeTemplateId: TemplateId;
}

export interface ResumeContent {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    jobTitle?: string;
    profileImage?: string;
    profileImageShape?: "circle" | "squircle";
    visibility: PersonalInfoVisibility;
  };
  sections: Section[];
}

export interface ResumeData extends ResumeMetadata {
  content: ResumeContent;
  layouts: Record<TemplateId, TemplateLayout>;
}
