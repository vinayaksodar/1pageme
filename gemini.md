# Gemini CLI - Project Context & Architecture

This file serves as the primary source of truth for the Resume Builder project architecture.

## 1. System Overview

A multi-document, template-based resume builder with real-time editing, drag-and-drop section reordering, and PDF export capabilities.

## 2. Core Tech Stack

- **Framework:** Next.js 16 (App Router, Client-side heavy)
- **State Management:** Zustand with `persist` middleware (Storage: LocalStorage/IndexedDB via browser)
- **Drag & Drop:** `@dnd-kit`
- **PDF Generation:** `react-to-print` (Browser print-to-pdf)
- **Styling:** Tailwind CSS

## 3. Data Model (The "What" vs. The "How")

The data model is defined in `types/resume.ts`. Constants and helpers are in `lib/resume-config.ts`.

The state is strictly separated into **Semantic Content** and **Rendering Configuration**.

### `ResumeData` Structure

```typescript
// Defined in types/resume.ts

interface ResumeData {
  id: string;
  title: string;

  // 1. Semantic Content (The "What")
  content: {
    personalInfo: {
      fullName: string;
      email: string;
      phone: string;
      address: string;
      jobTitle?: string;
      profileImage?: string;
    };
    sections: Section[]; // Array of semantic sections (Summary, Experience, etc.)
  };

  // 2. Rendering Configuration (The "How")
  activeTemplateId: TemplateId; // 'standard' | 'modern' | 'minimal'

  // Per-template layout configuration
  layouts: Record<TemplateId, TemplateLayout>;
}

interface TemplateLayout {
  templateStyles: TemplateStyles; // { fontFamily, accentColor, margins, lineHeight }
  sections: SectionConfig[]; // Order & visibility configuration for sections
}

interface SectionConfig {
  id: string; // Links to content.sections[].id
  column: number; // 1 (Main) or 2 (Sidebar) - used by multi-column templates
  isVisible: boolean;
}
```

## 4. Component Layers

- **Dashboard (`/components/Dashboard.tsx`)**: Document management (CRUD, active resume selection).
- **Editor Layout (`/components/editor/EditorLayout.tsx`)**: Three-pane shell (Sidebar, Header, Canvas).
- **Templates (`/components/resume/templates/`)**:
  - `StandardTemplate.tsx`: Classic single-column.
  - `ModernTemplate.tsx`: Two-column (Main/Sidebar) based on section `column` data.
- **Controls**:
  - `FloatingToolbar.tsx`: Per-item semantic field toggles (appears on focus).
  - `TextSelectionToolbar.tsx`: Rich text formatting (Bold, Italic, etc.) appearing on text selection.
  - `ContentEditable.tsx`: Custom `innerHTML` based editor component.

## 5. Key Workflows

- **Switching Layouts**: Updating `activeTemplateId` swaps the entire rendering component in `ResumePreview.tsx`.
- **Multi-Column**: Modern template filters sections into two columns based on the `sectionConfig.column` property (1 or 2).
- **State Updates**: All edits (text, toggles, styles) flow through the central `useResumeStore`.

## 6. Known Constraints & Notes

- **Browser Persistence**: Storage name is `resume-storage-v3` (versioned to handle breaking changes).
- **Formatting**: Rich text is handled via `document.execCommand` and stored as `innerHTML`.
- **Print Safety**: UI elements (toolbars, buttons) use the `no-print` class to be excluded from PDF exports.
