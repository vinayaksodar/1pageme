"use client";

import React, { useState, useRef } from "react";
import {
  Plus,
  Trash2,
  Settings,
  ChevronDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useResumeStore } from "@/store/useResumeStore";
import {
  ItemVisibility,
  SectionType,
  PersonalInfoVisibility,
  SliderType,
} from "@/types/resume";
import { SECTION_SCHEMAS } from "@/lib/resume-config";
import { useClickOutside } from "@/hooks/useClickOutside";

interface FloatingToolbarProps {
  sectionId: string;
  itemId: string;
  sectionType: SectionType | "header";
  settings: ItemVisibility | PersonalInfoVisibility;
  variant?: "bullets" | "compact";
  onVariantChange?: (variant: "bullets" | "compact") => void;
  onAdd: () => void;
  onDelete: () => void;
  isFirst?: boolean;
  isLast?: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

const FloatingToolbar = ({
  sectionId,
  itemId,
  sectionType,
  settings,
  variant,
  onVariantChange,
  onAdd,
  onDelete,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
}: FloatingToolbarProps) => {
  const {
    updateItemVisibility,
    resumes,
    activeResumeId,
    updatePersonalInfo,
    updatePersonalInfoVisibility,
  } = useResumeStore();
  const [showSettings, setShowSettings] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  useClickOutside(settingsRef, () => {
    if (showSettings) setShowSettings(false);
  });

  const activeResume = resumes.find((r) => r.id === activeResumeId);
  const profileImageShape =
    activeResume?.content?.personalInfo.profileImageShape || "circle";

  const isHeader = sectionType === "header";

  const item = !isHeader
    ? activeResume?.content?.sections
        .find((s) => s.id === sectionId)
        ?.items.find((i) => i.id === itemId)
    : null;

  const currentSliderType = item?.sliderType || "dots";

  const allOptions = [
    { id: "showTitle", label: "Title" },
    { id: "showSubtitle", label: "Proficiency / Subtitle" },
    { id: "showDescription", label: "Description" },
    { id: "showBullets", label: "Bullets" },
    { id: "showLocation", label: "Location" },
    { id: "showDatePeriod", label: "Date Period" },
    { id: "showLink", label: "Link" },
    { id: "showSlider", label: "Proficiency Slider" },
  ];

  const PERSONAL_INFO_OPTIONS = [
    { id: "showJobTitle", label: "Job Title" },
    { id: "showEmail", label: "Email" },
    { id: "showPhone", label: "Phone" },
    { id: "showAddress", label: "Address" },
    { id: "showPhoto", label: "Profile Photo" },
  ];

  const schema = !isHeader ? SECTION_SCHEMAS[sectionType as SectionType] : null;
  const options = isHeader
    ? PERSONAL_INFO_OPTIONS
    : allOptions.filter((opt) =>
        schema?.fields.includes(opt.id as keyof ItemVisibility),
      );

  return (
    <div className="no-print animate-in fade-in zoom-in absolute -top-12 left-1/2 z-[110] flex -translate-x-1/2 items-center rounded-lg border border-gray-200 bg-white p-1 text-gray-900 shadow-xl duration-200">
      {!isHeader && (
        <button
          onClick={onAdd}
          className="flex items-center gap-1.5 rounded-md border-r border-gray-100 px-3 py-1.5 text-[10px] font-black tracking-widest transition-colors hover:bg-gray-50"
        >
          <Plus size={14} /> ENTRY
        </button>
      )}

      {!isHeader && (
        <button
          onClick={onDelete}
          className="rounded-md border-r border-gray-100 p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
        >
          <Trash2 size={14} />
        </button>
      )}

      {!isHeader && !isFirst && (
        <button
          onClick={onMoveUp}
          className="rounded-md border-r border-gray-100 p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-900"
          title="Move Up"
        >
          <ArrowUp size={14} />
        </button>
      )}

      {!isHeader && !isLast && (
        <button
          onClick={onMoveDown}
          className="rounded-md border-r border-gray-100 p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-900"
          title="Move Down"
        >
          <ArrowDown size={14} />
        </button>
      )}

      <div className="relative" ref={settingsRef}>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={cn(
            "flex items-center gap-1 rounded-md p-2 transition-colors hover:bg-gray-50",
            showSettings
              ? "bg-gray-100 text-gray-900"
              : "text-gray-400 hover:text-gray-900",
          )}
        >
          <Settings size={14} />
          <ChevronDown size={10} />
        </button>

        {showSettings && (
          <div className="absolute top-full left-0 z-[120] mt-2 w-56 space-y-3 rounded-xl border border-gray-200 bg-white p-4 text-gray-900 shadow-2xl">
            {isHeader && (
              <div className="mb-2 border-b border-gray-100 pb-3">
                <div className="mb-3 text-[10px] font-black tracking-widest text-gray-400 uppercase">
                  Photo Shape
                </div>
                <div className="flex rounded-lg bg-gray-50 p-1">
                  <button
                    onClick={() =>
                      updatePersonalInfo("profileImageShape", "circle")
                    }
                    className={cn(
                      "flex-1 rounded-md py-1 text-[10px] font-bold transition-all",
                      profileImageShape === "circle"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-400 hover:text-gray-600",
                    )}
                  >
                    CIRCLE
                  </button>
                  <button
                    onClick={() =>
                      updatePersonalInfo("profileImageShape", "squircle")
                    }
                    className={cn(
                      "flex-1 rounded-md py-1 text-[10px] font-bold transition-all",
                      profileImageShape === "squircle"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-400 hover:text-gray-600",
                    )}
                  >
                    SQUIRCLE
                  </button>
                </div>
              </div>
            )}

            <div className="mb-3 text-[10px] font-black tracking-widest text-gray-400 uppercase">
              Display Options
            </div>

            {options.map((opt) => (
              <div key={opt.id} className="space-y-3">
                <label className="group flex cursor-pointer items-center justify-between">
                  <span className="text-xs font-bold text-gray-600 transition-colors group-hover:text-gray-900">
                    {opt.label}
                  </span>
                  <div className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={settings[opt.id as keyof typeof settings]}
                      onChange={(e) => {
                        if (isHeader) {
                          updatePersonalInfoVisibility({
                            [opt.id]: e.target.checked,
                          });
                        } else {
                          updateItemVisibility(sectionId, itemId, {
                            [opt.id]: e.target.checked,
                          });
                        }
                      }}
                    />
                    <div className="peer h-4 w-8 rounded-full bg-gray-100 peer-checked:bg-blue-600 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-3 after:w-3 after:rounded-full after:border after:border-gray-200 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                  </div>
                </label>

                {opt.id === "showSlider" &&
                  !isHeader &&
                  (settings as ItemVisibility).showSlider && (
                    <div className="ml-2 border-l-2 border-gray-100 pb-2 pl-3">
                      <div className="mb-2 text-[9px] font-black tracking-widest text-gray-400 uppercase">
                        Slider Style
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {["dots", "line", "bars"].map((type) => (
                          <button
                            key={type}
                            onClick={() => {
                              const store = useResumeStore.getState();
                              store.updateSectionItem(
                                sectionId,
                                itemId,
                                "sliderType",
                                type as SliderType,
                              );
                            }}
                            className={cn(
                              "rounded-md border px-2 py-1 text-[9px] font-black tracking-widest uppercase transition-all",
                              currentSliderType === type
                                ? "border-blue-200 bg-blue-50 text-blue-600"
                                : "border-gray-100 text-gray-400 hover:border-gray-200 hover:text-gray-600",
                            )}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            ))}

            {(sectionType === "skills" || sectionType === "interests") &&
              onVariantChange && (
                <label className="group mt-2 flex cursor-pointer items-center justify-between border-t border-gray-100 pt-2">
                  <span className="text-xs font-bold text-gray-600 transition-colors group-hover:text-gray-900">
                    Compact Mode
                  </span>
                  <div className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={variant === "compact"}
                      onChange={(e) =>
                        onVariantChange(
                          e.target.checked ? "compact" : "bullets",
                        )
                      }
                    />
                    <div className="peer h-4 w-8 rounded-full bg-gray-100 peer-checked:bg-blue-600 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-3 after:w-3 after:rounded-full after:border after:border-gray-200 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                  </div>
                </label>
              )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FloatingToolbar;
