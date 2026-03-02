import {
  ResumeData,
  SectionConfig,
  TemplateId,
  TemplateLayout,
} from "@/types/resume";
import {
  getStandardLayout,
  getAcademicLayout,
  getModernLayout,
} from "@/lib/resume-config";

export const mergeResumes = (
  localResumes: ResumeData[],
  serverResumes: ResumeData[],
): ResumeData[] => {
  const byId = new Map<string, ResumeData>();

  for (const resume of serverResumes) {
    byId.set(resume.id, resume);
  }

  for (const resume of localResumes) {
    const serverVersion = byId.get(resume.id);
    if (!serverVersion || resume.updatedAt >= serverVersion.updatedAt) {
      byId.set(resume.id, resume);
    }
  }

  return Array.from(byId.values()).sort((a, b) => b.updatedAt - a.updatedAt);
};

const ensureSectionConfig = (
  sections?: SectionConfig[] | string[],
): SectionConfig[] => {
  if (!Array.isArray(sections)) return [];
  return sections.map((s: SectionConfig | string) => {
    if (typeof s === "string") {
      return { id: s, column: "mainColumn", isVisible: true };
    }
    return {
      id: s.id,
      column: s.column || "mainColumn",
      isVisible: s.isVisible !== undefined ? s.isVisible : true,
    };
  });
};

const buildMergedLayouts = (
  sectionIds: string[],
  importedLayouts?: Record<TemplateId, TemplateLayout>,
): Record<TemplateId, TemplateLayout> => {
  const defaultLayouts = {
    standard: getStandardLayout(sectionIds),
    academic: getAcademicLayout(sectionIds),
    modern: getModernLayout(sectionIds),
  };

  const mergedLayouts: Record<TemplateId, TemplateLayout> = {
    standard: {
      ...defaultLayouts.standard,
      templateStyles: {
        ...defaultLayouts.standard.templateStyles,
      },
      sections: defaultLayouts.standard.sections,
    },
    academic: {
      ...defaultLayouts.academic,
      templateStyles: {
        ...defaultLayouts.academic.templateStyles,
      },
      sections: defaultLayouts.academic.sections,
    },
    modern: {
      ...defaultLayouts.modern,
      templateStyles: {
        ...defaultLayouts.modern.templateStyles,
      },
      sections: defaultLayouts.modern.sections,
    },
  };

  if (!importedLayouts) return mergedLayouts;

  (Object.keys(mergedLayouts) as TemplateId[]).forEach((templateId) => {
    const importedLayout = importedLayouts[templateId];
    if (!importedLayout) return;

    mergedLayouts[templateId] = {
      templateStyles: {
        ...mergedLayouts[templateId].templateStyles,
        ...(importedLayout.templateStyles || {}),
      },
      sections: ensureSectionConfig(
        importedLayout.sections || mergedLayouts[templateId].sections,
      ),
    };
  });

  return mergedLayouts;
};

interface BuildImportedResumeOptions {
  resume: Partial<ResumeData>;
  id: string;
  now?: number;
  templateId?: TemplateId;
}

export const buildImportedResume = ({
  resume,
  id,
  now = Date.now(),
  templateId,
}: BuildImportedResumeOptions): ResumeData => {
  const sectionIds = resume.content?.sections?.map((s) => s.id) ?? [];

  const layouts = buildMergedLayouts(sectionIds, resume.layouts);

  return {
    id,
    title: resume.title || "Imported Resume",
    createdAt: resume.createdAt || now,
    updatedAt: now,
    content: {
      personalInfo: {
        fullName: resume.content?.personalInfo?.fullName || "",
        jobTitle: resume.content?.personalInfo?.jobTitle || "",
        email: resume.content?.personalInfo?.email || "",
        phone: resume.content?.personalInfo?.phone || "",
        address: resume.content?.personalInfo?.address || "",
        profileImage: resume.content?.personalInfo?.profileImage || "",
        profileImageShape:
          resume.content?.personalInfo?.profileImageShape || "circle",
        visibility: {
          showPhone: true,
          showEmail: true,
          showAddress: true,
          showJobTitle: true,
          showPhoto: !!resume.content?.personalInfo?.profileImage,
          ...resume.content?.personalInfo?.visibility,
        },
      },
      sections: resume.content?.sections || [],
    },
    activeTemplateId: templateId || resume.activeTemplateId || "standard",
    layouts,
  };
};
