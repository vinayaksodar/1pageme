import React from "react";
import { useResumeStore } from "@/store/useResumeStore";
import { Plus, FileText, Trash2, Clock } from "lucide-react";

const Dashboard = () => {
  const { resumes, createNewResume, setActiveResume, deleteResume } =
    useResumeStore();

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
      </header>

      <main className="flex-1 overflow-auto bg-slate-50/50 p-8 lg:p-12">
        <div className="mx-auto max-w-7xl">
          <header className="mb-10 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900">
                My Resumes
              </h1>
              <p className="mt-1 font-medium text-slate-500">
                Select a document to edit or create a new one.
              </p>
            </div>
            <button
              onClick={createNewResume}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-xs font-black tracking-widest text-white uppercase shadow-xl transition-all hover:bg-blue-700 active:scale-95"
            >
              <Plus size={18} /> Create New
            </button>
          </header>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {resumes.map((resume) => (
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
                  <h3 className="truncate text-xl font-black text-slate-900">
                    {resume.title || "Untitled Resume"}
                  </h3>
                  <div className="mt-3 flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-300 uppercase">
                    <Clock size={12} />
                    <span>Last edited recently</span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-8 py-5">
                  <span className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">
                    {resume?.activeTemplateId || "standard"} Layout
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (
                        confirm("Are you sure you want to delete this resume?")
                      ) {
                        deleteResume(resume.id);
                      }
                    }}
                    className="p-1 text-slate-300 transition-colors hover:text-red-500"
                  >
                    <Trash2 size={18} />
                  </button>
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
    </div>
  );
};

export default Dashboard;
