# Gemini CLI - Project Context & Architecture

This file serves as the primary source of truth for the Resume Builder project architecture.

## 1. System Overview

A multi-document, template-based resume builder with real-time editing, drag-and-drop section reordering, and PDF export capabilities. It uses a structured data model to ensure semantic integrity while allowing for rich visual customization and automatic A4 pagination.

## 2. Core Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Library:** React 19
- **State Management:** Zustand 5 with `persist` middleware (Storage: `resume-storage-v6`, version 7)
- **Drag & Drop:** `@dnd-kit` (sortable)
- **PDF Generation:** `react-to-print` (Browser print-to-pdf)
- **Styling:** Tailwind CSS 4 (using `@tailwindcss/postcss`)
- **Icons:** `lucide-react`

## 3. Data Model (The "What" vs. The "How")

The data model is defined in `types/resume.ts`. Constants and helpers are in `lib/resume-config.ts`.

The state is strictly separated into **Semantic Content** and **Rendering Configuration**.

### `ResumeData` Structure

```typescript
// Defined in types/resume.ts

interface ResumeData {
  id: string;
  title: string;
  updatedAt: number;
  createdAt: number;

  // 1. Semantic Content (The "What")
  content: {
    personalInfo: {
      fullName: string;
      email: string;
      phone: string;
      address: string;
      jobTitle?: string;
      profileImage?: string;
      profileImageShape?: "circle" | "squircle";
      visibility: PersonalInfoVisibility;
    };
    sections: Section[]; // Array of semantic sections (Summary, Experience, etc.)
  };

  // 2. Rendering Configuration (The "How")
  activeTemplateId: TemplateId; // 'standard' | 'modern' | 'minimal'

  // Per-template layout configuration
  layouts: Record<TemplateId, TemplateLayout>;
}

interface TemplateLayout {
  templateStyles: TemplateStyles; // { fontFamily, fontSize, accentColor, pageMargins, sectionSpacing, itemSpacing, lineHeight, layout, columnWidths, columnGap }
  sections: SectionConfig[]; // Order & visibility configuration for sections
}

interface SectionConfig {
  id: string; // Links to content.sections[].id
  column: number; // 1 (Main) or 2 (Sidebar) - used by multi-column templates
  isVisible: boolean;
}
```

### Rich Text Model

Rich text (descriptions, bullets) is stored as an array of `Block` objects, each containing `TextNode` items with `Mark` metadata (bold, italic, link, etc.). This avoids raw `innerHTML` storage and allows for clean rendering and structured updates.

## 4. Component Layers

- **Navigation Shell (`/app/page.tsx`)**: Conditional rendering between `Dashboard` (document management) and `EditorLayout` (active editing) based on `activeResumeId`.
- **Dashboard (`/components/Dashboard.tsx`)**: Document management (CRUD, active resume selection, duplication).
- **Editor Layout (`/components/editor/EditorLayout.tsx`)**: Three-pane shell (Sidebar, Header, Canvas).
- **Resume Preview (`/components/resume/ResumePreview.tsx`)**: The rendering canvas that selects the appropriate template and applies pagination.
- **Templates (`/components/resume/templates/`)**:
  - `StandardTemplate.tsx`: Classic single-column.
  - `ModernTemplate.tsx`: Two-column (Main/Sidebar) based on section `column` data.
- **Editors**:
  - `MultiBlockEditor.tsx`: Handles structured blocks (paragraphs/bullets) with real-time sync.
  - `PlainTextEditor.tsx`: Handles simple string fields with semantic integrity.
- **Controls**:
  - `FloatingToolbar.tsx`: Per-item semantic field toggles (appears on focus).
  - `TextSelectionToolbar.tsx`: Rich text formatting appearing on text selection (uses `document.execCommand` for UX, then syncs to blocks).
  - `SortableSectionList.tsx`: Handles section reordering via `@dnd-kit`.

## 5. Key Workflows

- **Real-time Sync**: Editors use a `DOM -> Block[] -> State` sync loop with debouncing to ensure the state remains the source of truth without sacrificing typing performance.
- **Dynamic Pagination**: `useResumePagination.ts` calculates how sections should be split across A4 pages (297mm height) based on real-time DOM measurements. It handles "continued" section headers across page breaks.
- **Multi-Column Layout**: The Modern template filters sections into two columns based on the `sectionConfig.column` property (1 or 2).
- **Template Switching**: Updating `activeTemplateId` swaps the entire rendering component while preserving the semantic content and layout configuration.
- **Resume Parsing**: Uses a deterministic deterministic LLM prompt (`lib/prompts.ts`) to extract resume data from raw text/PDF into the structured `ResumeData` format.

## 6. Known Constraints & Notes

- **Persistence Migration**: Storage versioning is handled in `useResumeStore.ts` to migrate legacy data models (e.g., migrating plain text to structured blocks).
- **Print Safety**: UI elements (toolbars, buttons) use the `no-print` class to be excluded from PDF exports via `react-to-print`.
- **Styling**: Uses Tailwind CSS 4 features like CSS variables for dynamic accent colors and spacing.
- **Hydration**: Uses a `mounted` state check in `app/page.tsx` to prevent hydration mismatches from `localStorage` persistence.
