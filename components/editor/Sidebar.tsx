"use client";

import React from "react";
import { useResumeStore } from "@/store/useResumeStore";
import { TemplateId, SectionType } from "@/types/resume";
import { LayoutTemplate, Palette, MoveVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { SortableSectionList } from "./SortableSectionList";
import ThemeSidebar from "./ThemeSidebar"; // Import ThemeSidebar

const Sidebar = () => {
  const { resumes, activeResumeId, addSection, setTemplate } = useResumeStore();
  const [activeTab, setActiveTab] = React.useState<
    "design" | "rearrange" | "templates"
  >("design");

  const activeResume = resumes.find((r) => r.id === activeResumeId);
  if (!activeResume) return null;
  const { activeTemplateId } = activeResume;

  return (
    <div className="flex h-full flex-col">
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("design")}
          className={cn(
            "flex flex-1 flex-col items-center justify-center gap-1 py-3 text-[10px] font-black tracking-widest transition-colors",
            activeTab === "design"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-400 hover:text-gray-600",
          )}
        >
          <Palette size={16} /> DESIGN
        </button>
        <button
          onClick={() => setActiveTab("templates")}
          className={cn(
            "flex flex-1 flex-col items-center justify-center gap-1 py-3 text-[10px] font-black tracking-widest transition-colors",
            activeTab === "templates"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-400 hover:text-gray-600",
          )}
        >
          <LayoutTemplate size={16} /> TEMPLATES
        </button>
        <button
          onClick={() => setActiveTab("rearrange")}
          className={cn(
            "flex flex-1 flex-col items-center justify-center gap-1 py-3 text-[10px] font-black tracking-widest transition-colors",
            activeTab === "rearrange"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-400 hover:text-gray-600",
          )}
        >
          <MoveVertical size={16} /> REARRANGE
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-6 overflow-y-auto">
        {activeTab === "design" && <ThemeSidebar />}

        {activeTab === "templates" && (
          <div className="space-y-4 p-4">
            <label className="text-[10px] font-black tracking-widest text-gray-400 uppercase">
              Layout Layers
            </label>
            <div className="grid grid-cols-1 gap-3">
              {[
                {
                  id: "standard",
                  name: "Standard Professional",
                  desc: "Classic single column layout",
                },
                {
                  id: "modern",
                  name: "Modern Side-by-Side",
                  desc: "Sleek 2-column layout",
                },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTemplate(t.id as TemplateId)}
                  className={cn(
                    "flex flex-col items-start rounded-2xl border-2 p-4 text-left transition-all",
                    activeTemplateId === t.id
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-50 bg-gray-50/50 hover:border-gray-100",
                  )}
                >
                  <span
                    className={cn(
                      "mb-1 text-xs font-black uppercase",
                      activeTemplateId === t.id
                        ? "text-blue-600"
                        : "text-gray-900",
                    )}
                  >
                    {t.name}
                  </span>
                  <span className="text-[10px] text-gray-500">{t.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === "rearrange" && (
          <div className="space-y-6 p-4">
            <div>
              <label className="mb-4 block text-[10px] font-black tracking-widest text-gray-400 uppercase">
                Rearrange Sections
              </label>
              <SortableSectionList />
            </div>

            <div className="mt-8 border-t border-gray-100 pt-8">
              <label className="mb-4 block text-[10px] font-black tracking-widest text-gray-400 uppercase">
                Add New Section
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  "experience",
                  "education",
                  "projects",
                  "skills",
                  "custom",
                ].map((type) => (
                  <button
                    key={type}
                    onClick={() => addSection(type as SectionType)}
                    className="rounded-xl border-2 border-gray-50 bg-white px-3 py-2.5 text-left text-[10px] font-black tracking-tighter uppercase transition-all hover:border-blue-500 hover:text-blue-600"
                  >
                    + {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
