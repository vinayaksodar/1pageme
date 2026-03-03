"use client";

import React, { useState } from "react";
import { Download, ClipboardCopy, X } from "lucide-react";
import { LLM_PROMPT } from "@/lib/prompts";
import { ResumeData } from "@/types/resume";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (resume: Partial<ResumeData>) => void;
}

const ImportModal = ({ isOpen, onClose, onImport }: ImportModalProps) => {
  const [jsonInput, setJsonInput] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleImport = () => {
    try {
      const parsed = JSON.parse(jsonInput) as Partial<ResumeData>;
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 text-slate-900 md:p-12">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="animate-in fade-in zoom-in relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white text-left shadow-2xl duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 px-8 py-6">
          <div>
            <h2 className="text-xl font-black tracking-tight text-slate-900">
              Import
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
          <div className="mb-8 space-y-4 text-left">
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
              <Download size={14} /> Import
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportModal;
