import { type ResumeData } from "@/types/resume";

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

export const isResumeData = (value: unknown): value is ResumeData => {
  if (!isObject(value)) return false;

  const candidate = value as Partial<ResumeData>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.createdAt === "number" &&
    typeof candidate.updatedAt === "number" &&
    isObject(candidate.content) &&
    isObject(candidate.content.personalInfo) &&
    Array.isArray(candidate.content.sections) &&
    typeof candidate.activeTemplateId === "string" &&
    isObject(candidate.layouts)
  );
};
