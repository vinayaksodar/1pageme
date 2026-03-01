import React, { useState } from "react";
import { useResumeStore } from "@/store/useResumeStore";
import {
  Plus,
  FileText,
  Trash2,
  Clock,
  Copy,
  Download,
  ClipboardCopy,
  X,
  Edit2,
} from "lucide-react";
import { LLM_PROMPT } from "@/lib/resume-config";
import { ResumeData } from "@/types/resume";

const RenameModal = ({
  isOpen,
  onClose,
  onRename,
  initialTitle,
}: {
  isOpen: boolean;
  onClose: () => void;
  onRename: (title: string) => void;
  initialTitle: string;
}) => {
  const [title, setTitle] = useState(initialTitle);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="animate-in fade-in zoom-in w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 px-8 py-6">
          <h2 className="text-xl font-black tracking-tight text-slate-900">
            Rename Resume
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-900"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8">
          <input
            autoFocus
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && title.trim()) {
                onRename(title);
                onClose();
              }
            }}
            placeholder="Enter new title..."
            className="w-full rounded-xl border-none bg-slate-50 p-4 text-sm font-bold text-slate-900 shadow-inner ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-600"
          />

          <div className="mt-8 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="rounded-xl px-6 py-3 text-xs font-black tracking-widest text-slate-400 uppercase transition-all hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (title.trim()) {
                  onRename(title);
                  onClose();
                }
              }}
              disabled={!title.trim()}
              className="rounded-xl bg-blue-600 px-8 py-3 text-xs font-black tracking-widest text-white uppercase shadow-xl transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50"
            >
              Rename
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ImportModal = ({
  isOpen,
  onClose,
  onImport,
}: {
  isOpen: boolean;
  onClose: () => void;
  onImport: (resume: ResumeData) => void;
}) => {
  const [jsonInput, setJsonInput] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleImport = () => {
    try {
      const parsed = JSON.parse(jsonInput) as ResumeData;
      onImport(parsed);
      onClose();
      setJsonInput("");
      setError("");
    } catch {
      setError("Invalid JSON format. Please check the LLM output.");
    }
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(LLM_PROMPT);
    alert("Prompt copied to clipboard!");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="animate-in fade-in zoom-in w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 px-8 py-6">
          <div>
            <h2 className="text-xl font-black tracking-tight text-slate-900">
              Import from LLM
            </h2>
            <p className="text-sm font-medium text-slate-500">
              Follow the steps to import your resume.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-900"
          >
            <X size={20} />
          </button>
        </div>

        <div className="custom-scrollbar max-h-[70vh] overflow-auto p-8">
          <div className="mb-8 space-y-4">
            <div className="flex items-start gap-4 rounded-2xl bg-blue-50/50 p-6">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-black text-white">
                1
              </div>
              <div className="flex-1">
                <h4 className="mb-2 text-sm font-black text-slate-900">
                  Copy the prompt
                </h4>
                <p className="mb-4 text-xs leading-relaxed font-medium text-slate-500">
                  Copy this prompt and paste it into ChatGPT, Claude, or Gemini
                  along with your resume PDF or text.
                </p>
                <button
                  onClick={copyPrompt}
                  className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-[10px] font-black tracking-widest text-blue-600 uppercase shadow-sm ring-1 ring-blue-100 transition-all hover:bg-blue-600 hover:text-white"
                >
                  <ClipboardCopy size={14} /> Copy Prompt
                </button>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-2xl bg-slate-50/50 p-6">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-black text-white">
                2
              </div>
              <div className="flex-1">
                <h4 className="mb-2 text-sm font-black text-slate-900">
                  Paste the JSON output
                </h4>
                <p className="mb-4 text-xs leading-relaxed font-medium text-slate-500">
                  Once the LLM generates the JSON structure, paste it here to
                  create your resume.
                </p>
                <textarea
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  placeholder='{ "title": "My Resume", ... }'
                  className="h-48 w-full rounded-xl border-none bg-white p-4 font-mono text-xs text-slate-600 shadow-inner ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-600"
                />
                {error && (
                  <p className="mt-2 text-[10px] font-black tracking-wider text-red-500 uppercase">
                    {error}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="rounded-xl px-6 py-3 text-xs font-black tracking-widest text-slate-400 uppercase transition-all hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={!jsonInput.trim()}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3 text-xs font-black tracking-widest text-white uppercase shadow-xl transition-all hover:bg-blue-700 active:scale-95"
            >
              <Download size={14} /> Import Resume
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

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
  const {
    resumes,
    createNewResume,
    setActiveResume,
    deleteResume,
    duplicateResume,
    importResume,
    renameResume,
  } = useResumeStore();

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [renamingResumeId, setRenamingResumeId] = useState<string | null>(null);

  const sortedResumes = [...resumes].sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-slate-50 font-sans text-slate-900">
      {/* TOP BAR */}
      <header className="z-50 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="group flex items-center gap-3 transition-transform">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-xl font-black text-white italic shadow-lg shadow-blue-100 transition-colors group-hover:bg-blue-700">
              1
            </div>
            <h1 className="hidden text-lg font-black tracking-tighter text-slate-900 uppercase italic sm:block">
              1PageMe
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-[10px] font-black tracking-[0.1em] text-slate-600 uppercase transition-all hover:border-blue-600 hover:text-blue-600 active:scale-95"
          >
            <Download size={14} /> Import from LLM
          </button>
          <button
            onClick={createNewResume}
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
                  className="flex-1 cursor-pointer p-8"
                >
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 transition-all group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-blue-100">
                    <FileText size={28} />
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="truncate text-xl font-black text-slate-900">
                      {resume.title || "Untitled Resume"}
                    </h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setRenamingResumeId(resume.id);
                      }}
                      className="mt-1 shrink-0 text-slate-300 transition-colors group-hover:opacity-100 hover:text-blue-600 lg:opacity-0"
                    >
                      <Edit2 size={14} />
                    </button>
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
                onClick={createNewResume}
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
        onClose={() => setIsImportModalOpen(false)}
        onImport={(resume) => importResume(resume)}
      />

      {renamingResumeId && (
        <RenameModal
          isOpen={!!renamingResumeId}
          onClose={() => setRenamingResumeId(null)}
          onRename={(title) => renameResume(renamingResumeId, title)}
          initialTitle={
            resumes.find((r) => r.id === renamingResumeId)?.title || ""
          }
        />
      )}

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
