import React from "react";
import { useResumeStore } from "@/store/useResumeStore";
import {
  Plus,
  FileText,
  Trash2,
  Clock,
  Copy,
  Download,
  Edit2,
  Check,
} from "lucide-react";
import TemplateLibraryModal from "./ui/TemplateLibraryModal";
import ImportModal from "./ui/ImportModal";
import { Logo } from "./ui/Logo";
import { useResumeCreateImportFlow } from "@/hooks/useResumeCreateImportFlow";
import { useResumeTitleEditor } from "@/hooks/useResumeTitleEditor";

const formatDate = (timestamp: number) => {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const Dashboard = () => {
  const { resumes, setActiveResume, deleteResume, duplicateResume } =
    useResumeStore();

  const {
    isImportModalOpen,
    isTemplateModalOpen,
    openImportModal,
    openTemplateModal,
    closeImportModal,
    closeTemplateModal,
    handleImport,
    handleTemplateSelect,
  } = useResumeCreateImportFlow();
  const {
    inputRef: editInputRef,
    editingResumeId,
    tempTitle,
    setTempTitle,
    startEditing,
    saveTitle,
    stopEditing,
  } = useResumeTitleEditor();

  const sortedResumes = [...resumes].sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-slate-50 font-sans text-slate-900">
      {/* TOP BAR */}
      <header className="z-50 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm">
        <div className="flex items-center gap-5">
          <Logo />
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={openImportModal}
            className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-[10px] font-black tracking-[0.1em] text-slate-600 uppercase transition-all hover:border-blue-600 hover:text-blue-600 active:scale-95"
          >
            <Download size={14} /> Import from LLM
          </button>
          <button
            onClick={openTemplateModal}
            className="flex items-center gap-2.5 rounded-xl bg-blue-600 px-6 py-2.5 text-[10px] font-black tracking-[0.1em] text-white uppercase shadow-xl transition-all hover:bg-blue-700 active:scale-95"
          >
            <Plus size={14} /> Create New
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-auto bg-slate-50/50 p-8 lg:p-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sortedResumes.map((resume) => (
              <div
                key={resume.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5"
              >
                <div
                  onClick={() => setActiveResume(resume.id)}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    startEditing(resume.id, resume.title);
                  }}
                  className="flex-1 cursor-pointer p-8"
                >
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 transition-all group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-blue-100">
                    <FileText size={28} />
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    {editingResumeId === resume.id ? (
                      <div className="flex w-full items-center gap-2">
                        <input
                          ref={editInputRef}
                          type="text"
                          value={tempTitle}
                          onChange={(e) => setTempTitle(e.target.value)}
                          onBlur={saveTitle}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveTitle();
                            if (e.key === "Escape") stopEditing();
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full rounded-lg border-none bg-slate-50 px-2 py-1 text-xl font-black text-slate-900 ring-2 ring-blue-600 focus:outline-none"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            saveTitle();
                          }}
                          className="rounded-full bg-blue-600 p-1 text-white shadow-md hover:bg-blue-700"
                        >
                          <Check size={14} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <h3 className="truncate text-xl font-black text-slate-900">
                          {resume.title || "Untitled Resume"}
                        </h3>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditing(resume.id, resume.title);
                          }}
                          className="mt-1 shrink-0 text-slate-300 transition-colors group-hover:opacity-100 hover:text-blue-600 lg:opacity-0"
                        >
                          <Edit2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-300 uppercase">
                    <Clock size={12} />
                    <span>Last edited {formatDate(resume.updatedAt)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-8 py-5">
                  <span className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">
                    {resume?.activeTemplateId || "standard"} Layout
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicateResume(resume.id);
                      }}
                      title="Duplicate"
                      className="p-1 text-slate-300 transition-colors hover:text-blue-600"
                    >
                      <Copy size={18} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (
                          confirm(
                            "Are you sure you want to delete this resume?",
                          )
                        ) {
                          deleteResume(resume.id);
                        }
                      }}
                      title="Delete"
                      className="p-1 text-slate-300 transition-colors hover:text-red-500"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {resumes.length === 0 && (
              <div
                onClick={openTemplateModal}
                className="col-span-full flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white p-20 text-slate-300 transition-all hover:border-blue-400 hover:bg-blue-50/30 hover:text-blue-500"
              >
                <Plus size={48} className="mb-4 opacity-20" />
                <p className="text-lg font-black tracking-tight">
                  No resumes found. Click to create your first one!
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={closeImportModal}
        onImport={handleImport}
      />

      <TemplateLibraryModal
        isOpen={isTemplateModalOpen}
        onClose={closeTemplateModal}
        currentTemplate="standard"
        onSelect={handleTemplateSelect}
      />

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `,
        }}
      />
    </div>
  );
};

export default Dashboard;
