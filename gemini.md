# 1PageMe Project Context

## 1. Core Routes

- **`/`**: The landing page. Highlights the open-source, ATS-friendly, and advanced WYSIWYG editing experience.
- **`/app`**: The core resume builder application and user dashboard. Handles both local-first guest editing and authenticated server sync.
- **`/blog`**: Career advice, resume writing tips, and interview insights.
- **`/api/*`**: Backend API endpoints for authentication and resume persistence.

## 2. Technical Stack

- **Framework**: Next.js (App Router)
- **Styling**: TailwindCSS 4 (Vanilla CSS preferred over Tailwind where specified)
- **State Management**: Zustand (Local-first with optional server sync)
- **Database**: Neon (PostgreSQL) with Drizzle ORM
- **Authentication**: Custom JWT-based session management

## 3. Infrastructure & API Flow

- **Neon & Drizzle:** The schema under `db/schema.ts` defines `users` and `resumes` (with `owner_id` foreign key). Drizzle generates type-safe queries (`lib/db/*`), and `db/migrations/0000_init.sql` is the migration entry point.
- **API Routes:**
  - `/api/auth/register`, `/api/auth/login`, `/api/auth/logout`, and `/api/auth/me` orchestrate `bcryptjs` hashing, JWT cookies signed with `AUTH_SECRET`, and user lookup.
  - `/api/resumes` and `/api/resumes/[id]` wrap the `lib/db/resumes` helpers to enforce owner-level access and payload validation, returning only `payload` (the `ResumeData` block).
- **Client Sync:** `useResumeStore` exposes `initializeServerSync()`, `syncLocalToServer()`, and `scheduleServerSync()` to keep the local state consistent; server syncs run only when authenticated, and guests remain on local storage.

## 4. Design Philosophy

- **WYSIWYG Editing:** Direct on-page editing that feels like Word or Google Docs, avoiding separate input boxes.
- **ATS-Friendly:** Templates are optimized for readability by Applicant Tracking Systems.
- **Speed & Simplicity:** Focus on high-impact one-page resumes with automated formatting and intelligent layout logic.
