"use client";

import React, { useState } from "react";
import { useResumeStore } from "@/store/useResumeStore";
import { SectionType } from "@/types/resume";
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
  className,
}: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  statusText?: string;
  className?: string;
}) => (
  <div
    className={cn(
      "flex flex-col border-b border-slate-100 transition-all duration-300",
      isOpen && className ? className : "flex-none",
      !isOpen && "overflow-hidden",
    )}
  >
    <button
      onClick={onToggle}
      className="group flex w-full flex-none items-center justify-between px-6 py-4 transition-colors hover:bg-slate-50/50"
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
        "flex flex-col px-6 transition-all duration-300 ease-in-out",
        isOpen
          ? "pb-6 opacity-100"
          : "max-h-0 flex-none overflow-hidden opacity-0",
        isOpen && className ? "flex-1" : isOpen ? "max-h-[2000px]" : "",
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
    design: true,
    sections: true,
  });
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showFontMenu, setShowFontMenu] = useState(false);

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

  const fonts = ["Rubik", "Inter", "Serif", "Roboto", "Lato"] as const;

  return (
    <div className="flex h-full flex-col overflow-hidden bg-white">
      <div className="custom-scrollbar flex-1 overflow-y-auto">
        <div className="flex min-h-full flex-col pt-4 pb-12">
          {/* PANEL 1: Templates */}
          <CollapsiblePanel
            title="Template"
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

          {/* PANEL 2: Design & Layout */}
          <CollapsiblePanel
            title="Design & Layout"
            isOpen={openPanels.design}
            onToggle={() => togglePanel("design")}
          >
            <div className="px-1">
              <div className="mb-6 space-y-2">
                <label className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                  Typography
                </label>
                <div className="relative">
                  <button
                    onClick={() => setShowFontMenu(!showFontMenu)}
                    className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-black tracking-widest text-slate-900 uppercase shadow-sm transition-all hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none"
                  >
                    <span>{currentStyles.fontFamily}</span>
                    <div className="text-slate-400">
                      <ChevronDown
                        size={14}
                        className={cn(
                          "transition-transform",
                          showFontMenu && "rotate-180",
                        )}
                      />
                    </div>
                  </button>

                  {showFontMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-[55]"
                        onClick={() => setShowFontMenu(false)}
                      />
                      <div className="animate-in zoom-in-95 absolute top-full left-0 z-[60] mt-2 w-full rounded-2xl border border-slate-100 bg-white p-2 shadow-2xl">
                        {fonts.map((f) => (
                          <button
                            key={f}
                            onClick={() => {
                              updateGlobalStyle("fontFamily", f);
                              setShowFontMenu(false);
                            }}
                            className={cn(
                              "flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-xs font-bold transition-colors",
                              currentStyles.fontFamily === f
                                ? "bg-blue-50 text-blue-600"
                                : "text-slate-600 hover:bg-slate-50",
                            )}
                          >
                            <span className="tracking-widest uppercase">
                              {f}
                            </span>
                            {currentStyles.fontFamily === f && (
                              <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                            )}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

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
                label="Item Spacing"
                value={currentStyles.itemSpacing}
                min={0.3}
                max={3}
                step={0.1}
                suffix="rem"
                onChange={(v) => updateGlobalStyle("itemSpacing", v)}
              />
              <SliderControl
                label="Line Height"
                value={currentStyles.lineHeight}
                min={1}
                max={2.5}
                step={0.1}
                onChange={(v) => updateGlobalStyle("lineHeight", v)}
              />

              <div className="mt-6 space-y-3">
                <label className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                  Accent Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    "#2563eb", // Blue 600
                    "#0f172a", // Slate 900
                    "#991b1b", // Red 800
                    "#065f46", // Emerald 800
                    "#4338ca", // Indigo 700
                    "#b45309", // Amber 700
                    "#be185d", // Pink 700
                  ].map((color) => (
                    <button
                      key={color}
                      onClick={() => updateGlobalStyle("accentColor", color)}
                      className={cn(
                        "h-6 w-6 rounded-full border border-slate-200 transition-all hover:scale-110",
                        currentStyles.accentColor === color &&
                          "ring-2 ring-blue-500 ring-offset-2",
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
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
            title="Sections"
            isOpen={openPanels.sections}
            onToggle={() => togglePanel("sections")}
            statusText={`${activeResume.content.sections.length} Sections`}
            className="flex-1"
          >
            <div className="flex flex-1 flex-col space-y-4">
              <div className="flex flex-none items-center justify-between">
                <label className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                  <Layers size={12} /> Rearrange and add
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
              <div className="flex-none">
                <SortableSectionList />
              </div>
            </div>
          </CollapsiblePanel>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
