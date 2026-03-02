## 7. Backend & Auth Flow

- **Neon & Drizzle:** The schema under `db/schema.ts` defines `users` and `resumes` (with `owner_id` foreign key). Drizzle generates type-safe queries (`lib/db/*`), and `db/migrations/0000_init.sql` is the migration entry point.
- **API Routes:**
  - `/api/auth/register`, `/api/auth/login`, `/api/auth/logout`, and `/api/auth/me` orchestrate `bcryptjs` hashing, JWT cookies signed with `AUTH_SECRET`, and user lookup.
  - `/api/resumes` and `/api/resumes/[id]` wrap the `lib/db/resumes` helpers to enforce owner-level access and payload validation, returning only `payload` (the `ResumeData` block).
- **Client Sync:** `useResumeStore` exposes `initializeServerSync()`, `syncLocalToServer()`, and `scheduleServerSync()` to keep the local state consistent; server syncs run only when authenticated, and guests remain on local storage.
