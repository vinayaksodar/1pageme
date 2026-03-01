import {
  SectionType,
  ItemVisibility,
  SectionItem,
  TemplateStyles,
  TemplateLayout,
  Section,
  ResumeData,
  TemplateId,
} from "@/types/resume";
import { INITIAL_PERSONAL_INFO, INITIAL_SECTIONS } from "./initial-data";

export const SECTION_SCHEMAS: Record<
  SectionType,
  {
    fields: (keyof ItemVisibility)[];
    defaults: Partial<
      Omit<SectionItem, "title" | "subtitle" | "description" | "bullets">
    > & {
      title?: string;
      subtitle?: string;
      description?: string;
      bullets?: string[];
    };
  }
> = {
  summary: {
    fields: ["showDescription"],
    defaults: { description: "Professional summary..." },
  },
  experience: {
    fields: [
      "showTitle",
      "showSubtitle",
      "showDescription",
      "showBullets",
      "showLocation",
      "showDatePeriod",
      "showLogo",
    ],
    defaults: {
      title: "Job Title",
      subtitle: "Company Name",
      location: "City, State",
      datePeriod: {
        startDate: { month: "Jan", year: 2020 },
        endDate: "Present",
      },
    },
  },
  education: {
    fields: [
      "showTitle",
      "showSubtitle",
      "showDescription",
      "showBullets",
      "showLocation",
      "showDatePeriod",
    ],
    defaults: {
      title: "Degree Name",
      subtitle: "University Name",
      location: "City, State",
      datePeriod: {
        startDate: { month: "Aug", year: 2016 },
        endDate: { month: "May", year: 2020 },
      },
    },
  },
  projects: {
    fields: [
      "showTitle",
      "showDescription",
      "showBullets",
      "showDatePeriod",
      "showLink",
    ],
    defaults: {
      title: "Project Name",
      description: "Brief project overview...",
      datePeriod: {
        startDate: { month: "Jan", year: 2023 },
        endDate: { month: "Dec", year: 2023 },
      },
    },
  },
  skills: {
    fields: ["showTitle", "showDescription", "showBullets"],
    defaults: { title: "Skill Category", bullets: ["Skill 1", "Skill 2"] },
  },
  custom: {
    fields: [
      "showTitle",
      "showSubtitle",
      "showDescription",
      "showBullets",
      "showLocation",
      "showDatePeriod",
      "showLink",
      "showLogo",
    ],
    defaults: { title: "New Entry" },
  },
};

export const getInitialVisibility = (type: SectionType): ItemVisibility => {
  const schema = SECTION_SCHEMAS[type];
  const visibility = {
    showTitle: false,
    showSubtitle: false,
    showDescription: false,
    showBullets: false,
    showLocation: false,
    showDatePeriod: false,
    showLink: false,
    showLogo: false,
  };

  schema.fields.forEach((field) => {
    visibility[field] = true;
  });

  return visibility;
};

export const DEFAULT_STYLES: TemplateStyles = {
  fontFamily: "Rubik",
  fontSize: 1, // 1rem
  accentColor: "#38bdf8",
  pageMargins: 2, // 2rem
  sectionSpacing: 2, // 2rem
  itemSpacing: 1, // 1rem
  lineHeight: 1.5,
  layout: "one-column",
  columnWidths: [65, 35],
  columnGap: 2.5, // in rem
};

export const getStandardLayout = (sectionIds: string[]): TemplateLayout => ({
  templateStyles: {
    ...DEFAULT_STYLES,
    layout: "one-column",
  },
  sections: sectionIds.map((id) => ({
    id,
    isVisible: true,
    column: 1,
  })),
});

export const getModernLayout = (sectionIds: string[]): TemplateLayout => ({
  templateStyles: {
    ...DEFAULT_STYLES,
    layout: "two-column",
  },
  sections: sectionIds.map((id) => ({
    id,
    isVisible: true,
    column: id === "education" || id === "skills" ? 2 : 1,
  })),
});

export const getMinimalLayout = (sectionIds: string[]): TemplateLayout => ({
  templateStyles: {
    ...DEFAULT_STYLES,
    layout: "one-column",
  },
  sections: sectionIds.map((id) => ({
    id,
    isVisible: true,
    column: 1,
  })),
});

export const createInitialResume = (
  id: string,
  title: string,
  templateId: TemplateId = "standard",
): ResumeData => {
  const initialSections = structuredClone(INITIAL_SECTIONS);
  const sectionIds = initialSections.map((s) => s.id);
  const now = Date.now();

  return {
    id,
    title: title,
    updatedAt: now,
    createdAt: now,
    content: {
      personalInfo: structuredClone(INITIAL_PERSONAL_INFO),
      sections: initialSections,
    },
    activeTemplateId: templateId,
    layouts: {
      standard: getStandardLayout(sectionIds),
      modern: getModernLayout(sectionIds),
      minimal: getMinimalLayout(sectionIds),
    },
  };
};
