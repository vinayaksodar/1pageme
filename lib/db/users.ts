import { eq } from "drizzle-orm";
import { users } from "@/db/schema";
import { getDb } from "@/lib/db/client";

export const getUserByEmail = async (email: string) => {
  const db = getDb();
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return user ?? null;
};

export const getUserById = async (id: string) => {
  const db = getDb();
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return user ?? null;
};

export const createUser = async (email: string, passwordHash: string) => {
  const db = getDb();
  const now = Date.now();
  const [created] = await db
    .insert(users)
    .values({
      id: crypto.randomUUID(),
      email,
      passwordHash,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  return created;
};
