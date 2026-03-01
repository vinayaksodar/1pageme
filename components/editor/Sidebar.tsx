"use client";

import React, { useState } from "react";
import { useResumeStore } from "@/store/useResumeStore";
import { SectionType, TemplateStyles } from "@/types/resume";
import {
  Layout,
  Settings,
  Plus,
  FileText,
  ChevronDown,
  ChevronUp,
  Layers,
  Type,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SortableSectionList } from "./SortableSectionList";

const AVAILABLE_SECTIONS: {
  type: SectionType;
  label: string;
  icon: React.ElementType;
}[] = [
  { type: "summary", label: "Summary", icon: FileText },
  { type: "experience", label: "Work Experience", icon: Layout },
  { type: "education", label: "Education", icon: Type },
  { type: "skills", label: "Skills & Expertise", icon: Settings },
  { type: "projects", label: "Projects", icon: Layout },
  { type: "custom", label: "Custom Section", icon: Sparkles },
];

const CollapsiblePanel = ({
  title,
  isOpen,
  onToggle,
  children,
  statusText,
}: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  statusText?: string;
}) => (
  <div className="overflow-hidden border-b border-slate-100">
    <button
      onClick={onToggle}
      className="group flex w-full items-center justify-between px-6 py-4 transition-colors hover:bg-slate-50/50"
    >
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase transition-colors group-hover:text-slate-600">
          {title}
        </span>
        {statusText && !isOpen && (
          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[9px] font-bold tracking-tighter text-blue-500 uppercase">
            {statusText}
          </span>
        )}
      </div>
      <div className="text-slate-300">
        {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </div>
    </button>
    <div
      className={cn(
        "px-6 transition-all duration-300 ease-in-out",
        isOpen ? "max-h-[2000px] pb-6 opacity-100" : "max-h-0 opacity-0",
      )}
    >
      {children}
    </div>
  </div>
);

interface SidebarProps {
  onOpenLibrary: () => void;
}

const SliderControl = ({
  label,
  value,
  min,
  max,
  step,
  onChange,
  suffix = "",
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (val: number) => void;
  suffix?: string;
}) => {
  const [localValue, setLocalValue] = React.useState(value);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Sync local value when external value changes
  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    setLocalValue(newValue);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      onChange(newValue);
    }, 100); // 100ms debounce
  };

  return (
    <div className="mb-4 space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
          {label}
        </label>
        <span className="text-[10px] font-black text-slate-900">
          {localValue}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={localValue}
        onChange={handleChange}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-100 accent-blue-600"
      />
    </div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ onOpenLibrary }) => {
  const activeResume = useResumeStore((state) =>
    state.resumes.find((r) => r.id === state.activeResumeId),
  );
  const addSection = useResumeStore((state) => state.addSection);
  const updateGlobalStyle = useResumeStore((state) => state.updateGlobalStyle);

  const [openPanels, setOpenPanels] = useState({
    config: true,
    layout: true,
    sections: true,
    typography: false,
  });
  const [showAddMenu, setShowAddMenu] = useState(false);

  if (!activeResume) return null;

  const togglePanel = (id: keyof typeof openPanels) =>
    setOpenPanels((prev) => ({ ...prev, [id]: !prev[id] }));

  const currentTemplateId = activeResume.activeTemplateId;
  const currentStyles = activeResume.layouts[currentTemplateId].templateStyles;

  const handleAddSection = (type: SectionType) => {
    addSection(type);
    setShowAddMenu(false);
    setOpenPanels((prev) => ({ ...prev, sections: true }));
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="custom-scrollbar flex-1 overflow-y-auto pt-4">
        {/* PANEL 1: Templates */}
        <CollapsiblePanel
          title="Templates"
          isOpen={openPanels.config}
          onToggle={() => togglePanel("config")}
          statusText={currentTemplateId}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3.5">
              <div className="flex min-w-0 flex-col">
                <span className="mb-1 text-[10px] leading-none font-bold tracking-widest text-slate-400 uppercase">
                  Theme
                </span>
                <span className="truncate pr-2 text-xs font-black text-slate-900 capitalize">
                  {currentTemplateId}
                </span>
              </div>
              <button
                onClick={onOpenLibrary}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[9px] font-black tracking-tighter text-blue-600 uppercase shadow-sm transition-colors hover:bg-blue-50"
              >
                Change
              </button>
            </div>
          </div>
        </CollapsiblePanel>

        {/* PANEL 2: Layout & Styles */}
        <CollapsiblePanel
          title="Layout & Styles"
          isOpen={openPanels.layout}
          onToggle={() => togglePanel("layout")}
        >
          <div className="px-1">
            <SliderControl
              label="Page Margins"
              value={currentStyles.pageMargins}
              min={0.5}
              max={4}
              step={0.1}
              suffix="rem"
              onChange={(v) => updateGlobalStyle("pageMargins", v)}
            />
            <SliderControl
              label="Font Size"
              value={currentStyles.fontSize}
              min={0.5}
              max={2.0}
              step={0.01}
              suffix="rem"
              onChange={(v) => updateGlobalStyle("fontSize", v)}
            />
            <SliderControl
              label="Section Spacing"
              value={currentStyles.sectionSpacing}
              min={0.5}
              max={4}
              step={0.1}
              suffix="rem"
              onChange={(v) => updateGlobalStyle("sectionSpacing", v)}
            />
            <SliderControl
              label="Line Height"
              value={currentStyles.lineHeight}
              min={1}
              max={2.5}
              step={0.1}
              onChange={(v) => updateGlobalStyle("lineHeight", v)}
            />

            <div className="mt-6 space-y-2">
              <label className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                Accent Color
              </label>
              <div className="flex items-center gap-3">
                <div
                  className="relative h-10 w-10 overflow-hidden rounded-xl border border-slate-200 shadow-sm"
                  style={{ backgroundColor: currentStyles.accentColor }}
                >
                  <input
                    type="color"
                    value={currentStyles.accentColor}
                    onChange={(e) =>
                      updateGlobalStyle("accentColor", e.target.value)
                    }
                    className="absolute inset-0 h-full w-full scale-150 cursor-pointer opacity-0"
                  />
                </div>
                <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <span className="font-mono text-xs font-bold text-slate-600">
                    {currentStyles.accentColor.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CollapsiblePanel>

        {/* PANEL 3: Manage Sections */}
        <CollapsiblePanel
          title="Manage Sections"
          isOpen={openPanels.sections}
          onToggle={() => togglePanel("sections")}
          statusText={`${activeResume.content.sections.length} Sections`}
        >
          <div className="space-y-4">
            <div className="mb-4 flex items-center justify-between">
              <label className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                <Layers size={12} /> Structure
              </label>
              <div className="relative">
                <button
                  onClick={() => setShowAddMenu(!showAddMenu)}
                  className="rounded-lg bg-blue-600 p-1.5 text-white shadow-lg shadow-blue-100 transition-transform hover:bg-blue-700 active:scale-90"
                >
                  <Plus size={14} />
                </button>
                {showAddMenu && (
                  <div className="animate-in zoom-in-95 absolute top-full right-0 z-[60] mt-2 w-56 rounded-2xl border border-slate-100 bg-white p-2 shadow-2xl">
                    <p className="mb-1 border-b p-2 text-[8px] font-black tracking-widest text-slate-400 uppercase">
                      Add Content
                    </p>
                    {AVAILABLE_SECTIONS.map((s) => {
                      const IconComp = s.icon;
                      return (
                        <button
                          key={s.type}
                          onClick={() => handleAddSection(s.type)}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-600 transition-colors hover:bg-blue-50 hover:text-blue-600"
                        >
                          <IconComp size={14} /> {s.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            <SortableSectionList />
          </div>
        </CollapsiblePanel>

        {/* PANEL 3: Typography */}
        <CollapsiblePanel
          title="Typography"
          isOpen={openPanels.typography}
          onToggle={() => togglePanel("typography")}
          statusText={currentStyles.fontFamily}
        >
          <div className="grid grid-cols-1 gap-2">
            {(["Rubik", "Inter", "Serif", "Roboto", "Lato"] as const).map(
              (f) => (
                <button
                  key={f}
                  onClick={() => updateGlobalStyle("fontFamily", f)}
                  className={cn(
                    "rounded-xl border-2 px-4 py-3.5 text-left text-[10px] font-bold tracking-widest uppercase transition-all",
                    currentStyles.fontFamily === f
                      ? "border-blue-600 bg-blue-50 text-blue-600 shadow-sm"
                      : "border-slate-50 text-slate-400 hover:border-slate-200",
                  )}
                >
                  {f}
                </button>
              ),
            )}
          </div>
        </CollapsiblePanel>
      </div>
    </div>
  );
};

export default Sidebar;
