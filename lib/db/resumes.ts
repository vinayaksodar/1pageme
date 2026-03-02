import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { resumes } from "@/db/schema";
import { type ResumeData } from "@/types/resume";

export const listResumesByOwner = async (ownerId: string) => {
  const db = getDb();
  return db
    .select()
    .from(resumes)
    .where(eq(resumes.ownerId, ownerId))
    .orderBy(desc(resumes.updatedAt));
};

export const getResumeByIdForOwner = async (id: string, ownerId: string) => {
  const db = getDb();
  const [row] = await db
    .select()
    .from(resumes)
    .where(and(eq(resumes.id, id), eq(resumes.ownerId, ownerId)))
    .limit(1);

  return row ?? null;
};

export const createResume = async (ownerId: string, resume: ResumeData) => {
  const db = getDb();
  const [created] = await db
    .insert(resumes)
    .values({
      id: resume.id,
      ownerId,
      title: resume.title,
      payload: resume,
      createdAt: resume.createdAt,
      updatedAt: resume.updatedAt,
    })
    .returning();

  return created;
};

export const updateResume = async (
  id: string,
  ownerId: string,
  resume: ResumeData,
) => {
  const db = getDb();
  const [updated] = await db
    .update(resumes)
    .set({
      title: resume.title,
      payload: resume,
      updatedAt: resume.updatedAt,
    })
    .where(and(eq(resumes.id, id), eq(resumes.ownerId, ownerId)))
    .returning();

  return updated ?? null;
};

export const deleteResume = async (id: string, ownerId: string) => {
  const db = getDb();
  const [deleted] = await db
    .delete(resumes)
    .where(and(eq(resumes.id, id), eq(resumes.ownerId, ownerId)))
    .returning({ id: resumes.id });

  return deleted ?? null;
};
