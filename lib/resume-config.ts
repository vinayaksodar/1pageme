import {
  SectionType,
  ItemVisibility,
  SectionItem,
  TemplateStyles,
  TemplateLayout,
  ResumeData,
  TemplateId,
  SectionColumn,
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
  certifications: {
    fields: [
      "showTitle",
      "showSubtitle",
      "showDatePeriod",
      "showDescription",
      "showLink",
    ],
    defaults: {
      title: "Certification Name",
      subtitle: "Issuing Organization",
      datePeriod: {
        startDate: { month: "Jan", year: 2024 },
        endDate: null,
      },
      description: "Credential ID: XXXXX",
      link: "https://",
    },
  },
  languages: {
    fields: ["showTitle", "showSubtitle", "showSlider"],
    defaults: {
      title: "Language",
      subtitle: "Proficiency",
      sliderValue: 80,
      sliderType: "dots",
    },
  },
  volunteering: {
    fields: [
      "showTitle",
      "showSubtitle",
      "showDescription",
      "showBullets",
      "showLocation",
      "showDatePeriod",
    ],
    defaults: {
      title: "Volunteer Role",
      subtitle: "Organization",
      location: "City, State",
      datePeriod: {
        startDate: { month: "Jan", year: 2023 },
        endDate: { month: "Dec", year: 2023 },
      },
    },
  },
  awards: {
    fields: ["showTitle", "showSubtitle", "showDatePeriod", "showDescription"],
    defaults: {
      title: "Award Name",
      subtitle: "Awarding Organization",
      datePeriod: {
        startDate: { month: "Jan", year: 2024 },
        endDate: null,
      },
      description: "Brief context or impact...",
    },
  },
  publications: {
    fields: [
      "showTitle",
      "showSubtitle",
      "showDatePeriod",
      "showDescription",
      "showLink",
    ],
    defaults: {
      title: "Publication Title",
      subtitle: "Journal / Conference",
      datePeriod: {
        startDate: { month: "Jan", year: 2024 },
        endDate: null,
      },
      description: "Authors, volume(issue), pages",
      link: "https://doi.org/",
    },
  },
  patents: {
    fields: [
      "showTitle",
      "showSubtitle",
      "showDatePeriod",
      "showDescription",
      "showLink",
    ],
    defaults: {
      title: "Patent Title",
      subtitle: "Patent Number",
      datePeriod: {
        startDate: { month: "Jan", year: 2024 },
        endDate: null,
      },
      description: "Short summary of invention...",
      link: "https://",
    },
  },
  courses: {
    fields: ["showTitle", "showSubtitle", "showDatePeriod", "showDescription"],
    defaults: {
      title: "Course Name",
      subtitle: "Provider / Institution",
      datePeriod: {
        startDate: { month: "Jan", year: 2024 },
        endDate: null,
      },
      description: "Relevant topics covered...",
    },
  },
  references: {
    fields: ["showTitle", "showSubtitle", "showDescription", "showLink"],
    defaults: {
      title: "Reference Name",
      subtitle: "Role, Company",
      description: "Email | Phone",
      link: "https://linkedin.com/in/",
    },
  },
  leadership: {
    fields: [
      "showTitle",
      "showSubtitle",
      "showDescription",
      "showBullets",
      "showLocation",
      "showDatePeriod",
    ],
    defaults: {
      title: "Leadership Role",
      subtitle: "Organization",
      location: "City, State",
      datePeriod: {
        startDate: { month: "Jan", year: 2023 },
        endDate: { month: "Dec", year: 2023 },
      },
    },
  },
  "professional-affiliations": {
    fields: ["showTitle", "showSubtitle", "showDatePeriod", "showDescription"],
    defaults: {
      title: "Association Name",
      subtitle: "Membership Level / Role",
      datePeriod: {
        startDate: { month: "Jan", year: 2022 },
        endDate: "Present",
      },
      description: "Relevant committees or contributions...",
    },
  },
  conferences: {
    fields: [
      "showTitle",
      "showSubtitle",
      "showDatePeriod",
      "showLocation",
      "showDescription",
      "showLink",
    ],
    defaults: {
      title: "Talk / Session Title",
      subtitle: "Conference Name",
      location: "City, Country",
      datePeriod: {
        startDate: { month: "Jan", year: 2024 },
        endDate: null,
      },
      description: "Brief topic or contribution...",
      link: "https://",
    },
  },
  achievements: {
    fields: ["showTitle", "showSubtitle", "showDatePeriod", "showDescription"],
    defaults: {
      title: "Achievement",
      subtitle: "Context",
      datePeriod: {
        startDate: { month: "Jan", year: 2024 },
        endDate: null,
      },
      description: "Outcome and measurable impact...",
    },
  },
  interests: {
    fields: ["showTitle", "showDescription", "showBullets"],
    defaults: {
      title: "Interest Area",
      bullets: ["Interest 1", "Interest 2"],
    },
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
    showSlider: false,
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
  columnWidths: {
    mainColumn: 65,
    secondaryColumn: 35,
  },
  columnGap: 2.5, // in rem
};

const getDefaultSectionColumn = (sectionId: string): SectionColumn =>
  sectionId === "education" ||
  sectionId === "skills" ||
  sectionId === "certifications" ||
  sectionId === "languages" ||
  sectionId === "courses" ||
  sectionId === "professional-affiliations" ||
  sectionId === "interests"
    ? "secondaryColumn"
    : "mainColumn";

export const getStandardLayout = (sectionIds: string[]): TemplateLayout => ({
  templateStyles: {
    ...DEFAULT_STYLES,
    fontFamily: "Serif",
    accentColor: "#111827",
    lineHeight: 1,
    layout: "one-column",
  },
  sections: sectionIds.map((id) => ({
    id,
    isVisible: true,
    column: getDefaultSectionColumn(id),
  })),
});

export const getAcademicLayout = (sectionIds: string[]): TemplateLayout => ({
  templateStyles: {
    ...DEFAULT_STYLES,
    fontFamily: "Serif",
    accentColor: "#111827",
    lineHeight: 1,
    layout: "one-column",
  },
  sections: sectionIds.map((id) => ({
    id,
    isVisible: true,
    column: getDefaultSectionColumn(id),
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
    column: getDefaultSectionColumn(id),
  })),
});

export const createInitialResume = (
  id: string,
  title: string,
  templateId: TemplateId = "standard",
): ResumeData => {
  const initialSections = structuredClone(INITIAL_SECTIONS);
  const preferredOrder: SectionType[] = [
    "summary",
    "experience",
    "leadership",
    "projects",
    "education",
    "certifications",
    "skills",
    "languages",
    "publications",
    "patents",
    "awards",
    "achievements",
    "volunteering",
    "professional-affiliations",
    "conferences",
    "courses",
    "interests",
    "references",
    "custom",
  ];
  const rank = new Map(preferredOrder.map((type, index) => [type, index]));
  initialSections.sort((a, b) => {
    const aRank = rank.get(a.type) ?? Number.MAX_SAFE_INTEGER;
    const bRank = rank.get(b.type) ?? Number.MAX_SAFE_INTEGER;
    return aRank - bRank;
  });

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
      academic: getAcademicLayout(sectionIds),
      modern: getModernLayout(sectionIds),
    },
  };
};
