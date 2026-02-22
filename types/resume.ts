export type SectionType =
  | "summary"
  | "experience"
  | "education"
  | "projects"
  | "skills"
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

export interface TextNode {
  type: "text";
  text: string;
  marks?: Mark[];
}

export interface ItemVisibility {
  showTitle: boolean;
  showSubtitle: boolean;
  showDescription: boolean;
  showBullets: boolean;
  showLocation: boolean;
  showDatePeriod: boolean;
  showLink: boolean;
  showLogo: boolean;
}

export interface SectionItem {
  id: string;
  // Semantic Data
  title: string;
  subtitle?: string; // Company Name / Institution
  description?: TextNode[];
  bullets?: TextNode[][];
  location?: string;
  datePeriod?: string;
  link?: string;
  logo?: string;

  // Rendering settings for this specific item
  visibility: ItemVisibility;
}

export interface Section {
  id: string;
  type: SectionType;
  title: string;
  items: SectionItem[];
}

export interface GlobalStyles {
  fontFamily: "Rubik" | "Inter" | "Serif";
  accentColor: string;
  margins: "compact" | "standard" | "spacious";
  lineHeight: number;
}

export interface SectionConfig {
  id: string;
  column: number;
  isVisible: boolean;
}

export interface TemplateLayout {
  globalStyles: GlobalStyles;
  sections: SectionConfig[]; // The order of this array determines rendering order
}

export type TemplateId = "standard" | "modern" | "minimal";

export interface PersonalInfoVisibility {
  showPhone: boolean;
  showEmail: boolean;
  showAddress: boolean;
  showJobTitle: boolean;
  showPhoto: boolean;
}

export interface ResumeData {
  id: string;
  title: string;
  content: {
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
  };
  activeTemplateId: TemplateId;
  layouts: Record<TemplateId, TemplateLayout>;
}
