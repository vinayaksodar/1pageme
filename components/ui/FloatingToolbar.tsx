"use client";

import React, { useState } from "react";
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
} from "@/types/resume";
import { SECTION_SCHEMAS } from "@/lib/resume-config";
import { MonthYearPicker } from "@/components/ui/MonthYearPicker";

interface FloatingToolbarProps {
  sectionId: string;
  itemId: string;
  sectionType: SectionType | "header";
  settings: ItemVisibility | PersonalInfoVisibility;
  onAdd: () => void;
  onDelete: () => void;
  isFirst?: boolean;
  isLast?: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  itemDatePeriod?: string;
  onDateChange?: (newVal: string) => void;
}

const FloatingToolbar = ({
  sectionId,
  itemId,
  sectionType,
  settings,
  onAdd,
  onDelete,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  itemDatePeriod,
  onDateChange,
}: FloatingToolbarProps) => {
  const {
    updateItemVisibility,
    resumes,
    activeResumeId,
    updatePersonalInfo,
    updatePersonalInfoVisibility,
  } = useResumeStore();
  const [showSettings, setShowSettings] = useState(false);

  const activeResume = resumes.find((r) => r.id === activeResumeId);
  const profileImageShape =
    activeResume?.content.personalInfo.profileImageShape || "circle";

  const allOptions = [
    { id: "showTitle", label: "Title" },
    { id: "showSubtitle", label: "Company/School" },
    { id: "showDescription", label: "Description" },
    { id: "showBullets", label: "Bullets" },
    { id: "showLocation", label: "Location" },
    { id: "showDatePeriod", label: "Date Period" },
    { id: "showLink", label: "Link" },
    { id: "showLogo", label: "Company Logo" },
  ];

  const PERSONAL_INFO_OPTIONS = [
    { id: "showJobTitle", label: "Job Title" },
    { id: "showEmail", label: "Email" },
    { id: "showPhone", label: "Phone" },
    { id: "showAddress", label: "Address" },
    { id: "showPhoto", label: "Profile Photo" },
  ];

  const isHeader = sectionType === "header";
  const schema = !isHeader ? SECTION_SCHEMAS[sectionType as SectionType] : null;
  const options = isHeader
    ? PERSONAL_INFO_OPTIONS
    : allOptions.filter((opt) =>
        schema?.fields.includes(opt.id as keyof ItemVisibility),
      );
  const hasDatePeriod = !isHeader && schema?.fields.includes("showDatePeriod");

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

      {hasDatePeriod && onDateChange && (
        <div className="flex items-center border-r border-gray-100 px-1">
          <MonthYearPicker
            initialDate={itemDatePeriod}
            onSelect={onDateChange}
          />
        </div>
      )}

      <div className="relative">
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
              <label
                key={opt.id}
                className="group flex cursor-pointer items-center justify-between"
              >
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FloatingToolbar;
