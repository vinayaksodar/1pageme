import {
  pgTable,
  text,
  bigint,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { type ResumeData } from "@/types/resume";

export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    createdAt: bigint("created_at", { mode: "number" }).notNull(),
    updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
  },
  (table) => ({
    emailUniqueIdx: uniqueIndex("users_email_unique_idx").on(table.email),
  }),
);

export const resumes = pgTable(
  "resumes",
  {
    id: text("id").primaryKey(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    activeTemplateId: text("active_template_id").notNull().default("standard"),
    createdAt: bigint("created_at", { mode: "number" }).notNull(),
    updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
  },
  (table) => ({
    ownerIdIdx: index("resumes_owner_id_idx").on(table.ownerId),
    updatedAtIdx: index("resumes_updated_at_idx").on(table.updatedAt),
  }),
);

export const resumeContents = pgTable("resume_contents", {
  id: text("id")
    .primaryKey()
    .references(() => resumes.id, { onDelete: "cascade" }),
  content: jsonb("content").$type<ResumeData["content"]>().notNull(),
  layouts: jsonb("layouts").$type<ResumeData["layouts"]>().notNull(),
});

export type ResumeRow = typeof resumes.$inferSelect;
export type NewResumeRow = typeof resumes.$inferInsert;
export type ResumeContentRow = typeof resumeContents.$inferSelect;
export type NewResumeContentRow = typeof resumeContents.$inferInsert;
export type UserRow = typeof users.$inferSelect;
export type NewUserRow = typeof users.$inferInsert;
