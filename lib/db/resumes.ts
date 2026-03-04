import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { resumes, resumeContents } from "@/db/schema";
import { type ResumeData, type TemplateId } from "@/types/resume";

export const listResumesByOwner = async (ownerId: string) => {
  const db = getDb();
  return db
    .select({
      id: resumes.id,
      title: resumes.title,
      activeTemplateId: resumes.activeTemplateId,
      createdAt: resumes.createdAt,
      updatedAt: resumes.updatedAt,
    })
    .from(resumes)
    .where(eq(resumes.ownerId, ownerId))
    .orderBy(desc(resumes.updatedAt));
};

export const getResumeByIdForOwner = async (
  id: string,
  ownerId: string,
): Promise<ResumeData | null> => {
  const db = getDb();
  const rows = await db
    .select()
    .from(resumes)
    .innerJoin(resumeContents, eq(resumes.id, resumeContents.id))
    .where(and(eq(resumes.id, id), eq(resumes.ownerId, ownerId)))
    .limit(1);

  if (rows.length === 0) return null;
  const row = rows[0];

  return {
    id: row.resumes.id,
    title: row.resumes.title,
    activeTemplateId: row.resumes.activeTemplateId as TemplateId,
    createdAt: row.resumes.createdAt,
    updatedAt: row.resumes.updatedAt,
    content: row.resume_contents.content,
    layouts: row.resume_contents.layouts,
  };
};

export const createResume = async (ownerId: string, resume: ResumeData) => {
  const db = getDb();

  // Sequential updates because neon-http doesn't support transactions
  const [createdMeta] = await db
    .insert(resumes)
    .values({
      id: resume.id,
      ownerId,
      title: resume.title,
      activeTemplateId: resume.activeTemplateId || "standard",
      createdAt: resume.createdAt,
      updatedAt: resume.updatedAt,
    })
    .returning();

  const [createdContent] = await db
    .insert(resumeContents)
    .values({
      id: resume.id,
      content: resume.content,
      layouts: resume.layouts,
    })
    .returning();

  return {
    id: createdMeta.id,
    title: createdMeta.title,
    activeTemplateId: createdMeta.activeTemplateId,
    createdAt: createdMeta.createdAt,
    updatedAt: createdMeta.updatedAt,
    content: createdContent.content,
    layouts: createdContent.layouts,
  };
};

export const updateResume = async (
  id: string,
  ownerId: string,
  resume: ResumeData,
  lastSyncedVersion?: number,
) => {
  const db = getDb();

  const [existing] = await db
    .select({ id: resumes.id, updatedAt: resumes.updatedAt })
    .from(resumes)
    .where(and(eq(resumes.id, id), eq(resumes.ownerId, ownerId)))
    .limit(1);

  if (!existing) return null;

  // Optimistic locking check:
  // If lastSyncedVersion is provided, it must match the server's current version.
  if (
    lastSyncedVersion !== undefined &&
    existing.updatedAt !== lastSyncedVersion
  ) {
    throw new Error("CONFLICT");
  }

  const [updatedMeta] = await db
    .update(resumes)
    .set({
      title: resume.title,
      activeTemplateId: resume.activeTemplateId || "standard",
      updatedAt: resume.updatedAt,
    })
    .where(eq(resumes.id, id))
    .returning();

  const [updatedContent] = await db
    .insert(resumeContents)
    .values({
      id: resume.id,
      content: resume.content,
      layouts: resume.layouts,
    })
    .onConflictDoUpdate({
      target: resumeContents.id,
      set: {
        content: resume.content,
        layouts: resume.layouts,
      },
    })
    .returning();

  return {
    id: updatedMeta.id,
    title: updatedMeta.title,
    activeTemplateId: updatedMeta.activeTemplateId,
    createdAt: updatedMeta.createdAt,
    updatedAt: updatedMeta.updatedAt,
    content: updatedContent.content,
    layouts: updatedContent.layouts,
  };
};

export const deleteResume = async (id: string, ownerId: string) => {
  const db = getDb();
  // Cascading deletes on the database side handle the content removal
  const [deleted] = await db
    .delete(resumes)
    .where(and(eq(resumes.id, id), eq(resumes.ownerId, ownerId)))
    .returning({ id: resumes.id });

  return deleted ?? null;
};
