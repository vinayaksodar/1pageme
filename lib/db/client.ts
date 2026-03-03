import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "@/db/schema";

let db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export const getDb = () => {
  if (db) return db;

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }

  const sql = neon(databaseUrl);
  db = drizzle(sql, { schema });
  return db;
};
