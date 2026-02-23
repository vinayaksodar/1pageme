import {
  SectionType,
  ItemVisibility,
  SectionItem,
  GlobalStyles,
  TemplateId,
  TemplateLayout,
  SectionConfig,
  Section,
  ResumeData,
} from "@/types/resume";

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
      datePeriod: "2020 - Present",
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
      datePeriod: "2016 - 2020",
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
      datePeriod: "2023",
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

export const DEFAULT_STYLES: GlobalStyles = {
  fontFamily: "Rubik",
  accentColor: "#38bdf8",
  margins: "standard",
  lineHeight: 1.5,
};

export const getInitialLayout = (
  templateId: TemplateId,
  sectionIds: string[],
): TemplateLayout => {
  const configs: SectionConfig[] = sectionIds.map((id) => ({
    id,
    isVisible: true,
    column:
      templateId === "modern" && (id === "education" || id === "skills")
        ? 2
        : 1,
  }));

  return {
    globalStyles: { ...DEFAULT_STYLES },
    sections: configs,
  };
};

export const createInitialResume = (id: string, title: string): ResumeData => {
  const initialSections: Section[] = [
    {
      id: "summary",
      type: "summary",
      title: "SUMMARY",
      items: [
        {
          id: "s1",
          title: "",
          description: [
            {
              id: "summary-block-1",
              content: [
                {
                  type: "text",
                  text: "Experienced software engineer with a focus on React and Next.js...",
                },
              ],
            },
          ],
          visibility: {
            showTitle: false,
            showSubtitle: false,
            showDescription: true,
            showBullets: false,
            showLocation: false,
            showDatePeriod: false,
            showLink: false,
            showLogo: false,
          },
        },
      ],
    },
    {
      id: "experience",
      type: "experience",
      title: "EXPERIENCE",
      items: [],
    },
  ];

  const sectionIds = initialSections.map((s) => s.id);

  return {
    id,
    title: title,
    content: {
      personalInfo: {
        fullName: "VINAYAK SODAR",
        jobTitle: "Software Engineer",
        email: "vinayak@example.com",
        phone: "+1 234 567 890",
        address: "San Francisco, CA",
        profileImage: "",
        profileImageShape: "circle",
        visibility: {
          showPhone: true,
          showEmail: true,
          showAddress: true,
          showJobTitle: true,
          showPhoto: true,
        },
      },
      sections: initialSections,
    },
    activeTemplateId: "standard",
    layouts: {
      standard: getInitialLayout("standard", sectionIds),
      modern: getInitialLayout("modern", sectionIds),
      minimal: getInitialLayout("minimal", sectionIds),
    },
  };
};
