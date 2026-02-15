export type SectionType = 'summary' | 'experience' | 'education' | 'projects' | 'skills' | 'custom';

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
  description?: string;
  bullets?: string[];
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
  fontFamily: 'Rubik' | 'Inter' | 'Serif';
  accentColor: string;
  margins: 'compact' | 'standard' | 'spacious';
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

export type TemplateId = 'standard' | 'modern' | 'minimal';

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
    };
    sections: Section[];
  };
  activeTemplateId: TemplateId;
  layouts: Record<TemplateId, TemplateLayout>;
}
