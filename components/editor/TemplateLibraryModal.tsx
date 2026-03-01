"use client";

import React from "react";
import { X, Layers } from "lucide-react";
import { TemplateId } from "@/types/resume";

interface Template {
  id: TemplateId;
  name: string;
  category: string;
  color: string;
  secondary: string;
}

const ALL_TEMPLATES: Template[] = [
  {
    id: "standard",
    name: "Standard Professional",
    category: "Professional",
    color: "bg-slate-900",
    secondary: "bg-stone-50",
  },
  {
    id: "modern",
    name: "Modern Side-by-Side",
    category: "Creative",
    color: "bg-blue-600",
    secondary: "bg-blue-50",
  },
  {
    id: "minimal",
    name: "Clean Minimal",
    category: "Minimal",
    color: "bg-white",
    secondary: "bg-slate-50",
  },
];

interface TemplateLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTemplate: TemplateId;
  onSelect: (templateId: TemplateId) => void;
}

const TemplateLibraryModal: React.FC<TemplateLibraryModalProps> = ({
  isOpen,
  onClose,
  currentTemplate,
  onSelect,
}) => {
  if (!isOpen) return null;

  return (
    <div className="animate-in fade-in fixed inset-0 z-[100] flex items-center justify-center p-4 duration-200 md:p-12">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
        onClick={onClose}
      />
      <div className="animate-in zoom-in-95 relative flex h-full max-h-[85vh] w-full max-w-6xl flex-col overflow-hidden rounded-[32px] bg-white shadow-2xl duration-300">
        <div className="flex items-center justify-between border-b px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
              <Layers size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900">
                Template Library
              </h2>
              <p className="text-sm text-[10px] font-medium tracking-widest text-slate-400 uppercase">
                Select a design base
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-2xl p-3 text-slate-400 transition-colors hover:bg-slate-100"
          >
            <X size={24} />
          </button>
        </div>
        <div className="grid flex-1 grid-cols-1 gap-8 overflow-y-auto p-8 sm:grid-cols-2 md:grid-cols-3">
          {ALL_TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                onSelect(t.id);
                onClose();
              }}
              className={`flex aspect-[3/4] flex-col rounded-2xl border-2 p-4 transition-all ${
                currentTemplate === t.id
                  ? "border-blue-600 bg-blue-50"
                  : "border-slate-100 bg-white hover:border-slate-200"
              }`}
            >
              <div
                className={`w-full flex-1 ${t.secondary} relative mb-4 overflow-hidden rounded-lg opacity-50`}
              >
                {/* Fake template preview lines */}
                <div className="absolute inset-4 space-y-2">
                  <div className="h-2 w-1/2 rounded bg-slate-300"></div>
                  <div className="h-1 w-full rounded bg-slate-200"></div>
                  <div className="h-1 w-full rounded bg-slate-200"></div>
                </div>
              </div>
              <p className="text-center text-xs font-black tracking-widest text-slate-700 uppercase">
                {t.name}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TemplateLibraryModal;
