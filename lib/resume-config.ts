import {
  SectionType,
  ItemVisibility,
  SectionItem,
  TemplateStyles,
  TemplateLayout,
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
  const now = Date.now();

  return {
    id,
    title: title,
    updatedAt: now,
    createdAt: now,
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
      standard: getStandardLayout(sectionIds),
      modern: getModernLayout(sectionIds),
      minimal: getMinimalLayout(sectionIds),
    },
  };
};

export const LLM_PROMPT = `I want you to act as a resume parser. I will provide you with a resume PDF (or text content), and I want you to extract the information into a specific JSON format.

### TYPE DEFINITIONS
- TextNode: { type: "text", text: string }
- Block: { id: string, content: TextNode[] }
- SectionType: "summary" | "experience" | "education" | "projects" | "skills" | "custom"
- SectionConfig: { id: string, column: number, isVisible: boolean }

### TARGET JSON STRUCTURE
{
  "title": "Resume Title",
  "content": {
    "personalInfo": {
      "fullName": "Name",
      "email": "Email",
      "phone": "Phone",
      "address": "Address",
      "jobTitle": "Job Title",
      "visibility": { "showPhone": true, "showEmail": true, "showAddress": true, "showJobTitle": true, "showPhoto": false }
    },
    "sections": [
      {
        "id": "unique-section-id",
        "type": "SectionType",
        "title": "SECTION TITLE",
        "items": [
          {
            "id": "unique-item-id",
            "title": "Role/Degree",
            "subtitle": "Company/University",
            "location": "Location",
            "datePeriod": "Dates",
            "description": [ { "id": "block-1", "content": [{ "type": "text", "text": "..." }] } ],
            "bullets": [ { "id": "bullet-1", "content": [{ "type": "text", "text": "..." }] } ],
            "visibility": { "showTitle": true, "showSubtitle": true, "showDescription": true, "showBullets": true, "showLocation": true, "showDatePeriod": true, "showLink": false, "showLogo": false }
          }
        ]
      }
    ]
  },
  "activeTemplateId": "standard",
  "layouts": {
    "standard": {
      "templateStyles": { "fontFamily": "Inter", "fontSize": 1, "accentColor": "#3b82f6", "pageMargins": 2, "sectionSpacing": 2, "itemSpacing": 1, "lineHeight": 1.5, "layout": "one-column", "columnWidths": [100, 0], "columnGap": 0 },
      "sections": [ { "id": "section-id-from-above", "column": 1, "isVisible": true } ]
    },
    "modern": {
      "templateStyles": { "fontFamily": "Inter", "fontSize": 1, "accentColor": "#3b82f6", "pageMargins": 2, "sectionSpacing": 2, "itemSpacing": 1, "lineHeight": 1.5, "layout": "two-column", "columnWidths": [65, 35], "columnGap": 2.5 },
      "sections": [ { "id": "section-id-from-above", "column": 1, "isVisible": true } ]
    },
    "minimal": {
      "templateStyles": { "fontFamily": "Inter", "fontSize": 1, "accentColor": "#3b82f6", "pageMargins": 2, "sectionSpacing": 2, "itemSpacing": 1, "lineHeight": 1.5, "layout": "one-column", "columnWidths": [100, 0], "columnGap": 0 },
      "sections": [ { "id": "section-id-from-above", "column": 1, "isVisible": true } ]
    }
  }
}

You are acting as a deterministic resume parser.

STRICT REQUIREMENTS:
- Extract ALL sections and ALL items from the resume.
- Do NOT summarize.
- Do NOT omit any entries.
- Do NOT infer missing data.
- Preserve exact wording.
- If a section contains N items, the output must contain exactly N items.

Before returning the final JSON:
1. Count items in each section in the source.
2. Verify counts match in the output.
3. If mismatch exists, fix it before outputting.

Completeness and structural accuracy are mandatory.
Return only valid JSON.

Please parse my resume now.`;
