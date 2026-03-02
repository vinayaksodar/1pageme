import { ResumeData } from "@/types/resume";

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

export const isLikelyNativeResumeExport = (
  resume: Partial<ResumeData> | unknown,
): resume is ResumeData => {
  if (!isObject(resume)) return false;

  const content = resume.content;
  const layouts = resume.layouts;

  if (!isObject(content) || !Array.isArray(content.sections)) return false;
  if (!isObject(layouts)) return false;
  if (typeof resume.activeTemplateId !== "string") return false;
  if (typeof resume.id !== "string") return false;
  if (typeof resume.createdAt !== "number") return false;
  if (typeof resume.updatedAt !== "number") return false;

  return ["standard", "academic", "modern", "minimal"].every(
    (templateId) => templateId in layouts,
  );
};
