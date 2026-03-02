# 1PageMe – Modern Resume Builder

A multi-document, template-based resume builder with real-time editing, drag-and-drop section reordering, and automatic A4 pagination. Designed for simplicity and semantic integrity.

## 🚀 Features

- **Real-time Editing:** See changes instantly with a focus-on-click editor.
- **Multi-Template Support:** Switch between Standard, Modern, and Academic layouts seamlessly.
- **Automatic Pagination:** Intelligently splits content across A4 pages with "continued" headers.
- **Drag & Drop:** Reorder sections easily using `@dnd-kit`.
- **Rich Text Formatting:** Bold, italic, underline, and link support within a structured data model.
- **Dynamic Styling:** Customize fonts, accent colors, and spacing in real-time.
- **Local Persistence:** Your data is saved locally in your browser (Zustand + `localStorage`).
- **PDF Export:** Clean, print-ready exports via `react-to-print`.
- **AI-Powered Parsing:** Import existing resumes using an LLM-driven parsing engine.

## 🛠️ Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **UI Library:** [React 19](https://react.dev/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **State Management:** [Zustand 5](https://zustand-demo.pmnd.rs/)
- **Drag & Drop:** [@dnd-kit](https://dndkit.com/)
- **Icons:** [Lucide React](https://lucide.dev/)

## 📂 Project Structure

- `app/`: Next.js App Router pages and layouts.
- `components/`:
  - `editor/`: Core editor shell and sidebar controls.
  - `resume/`: Templates and preview rendering logic.
  - `ui/`: Reusable primitive components and custom editors.
- `store/`: Zustand state management and persistence logic.
- `types/`: TypeScript interfaces for the structured resume data model.
- `lib/`: Utility functions, initial data, and LLM prompts.
- `hooks/`: Custom React hooks (e.g., `useResumePagination`).

## 🏁 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/1pageme.git
   cd 1pageme
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📜 Commands

- `npm run dev`: Start the development server.
- `npm run build`: Build the application for production.
- `npm run lint`: Run ESLint to check for code issues.
- `npm run format`: Format the codebase using Prettier.
- `npm run typecheck`: Run TypeScript compiler check.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
