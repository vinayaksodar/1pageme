"use client";
import React from "react";
import { useResumeStore, ResumeState } from "@/store/useResumeStore";
import { TemplateStyles } from "@/types/resume";

const useLayout = () => {
  const layout = useResumeStore((state: ResumeState) => {
    const activeResume = state.resumes.find(
      (r) => r.id === state.activeResumeId,
    );
    return activeResume
      ? activeResume.layouts[activeResume.activeTemplateId].templateStyles
      : undefined;
  });

  const updateGlobalStyle = useResumeStore(
    (state: ResumeState) => state.updateGlobalStyle,
  );
  const activeTemplateId = useResumeStore((state: ResumeState) => {
    const activeResume = state.resumes.find(
      (r) => r.id === state.activeResumeId,
    );
    return activeResume?.activeTemplateId;
  });

  return { layout, updateGlobalStyle, activeTemplateId };
};

const ThemeSidebar = () => {
  const { layout, updateGlobalStyle, activeTemplateId } = useLayout();
  if (!layout || !activeTemplateId) return <div>Loading...</div>;

  const handleStyleChange = (
    field: keyof TemplateStyles,
    value: string | number | [number, number],
  ) => {
    updateGlobalStyle(field, value);
  };
  return (
    <div className="p-4">
      {/* Page Margins */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Page Margins
        </label>
        <input
          type="range"
          min="0.5"
          max="4"
          step="0.1"
          value={layout.pageMargins}
          onChange={(e) =>
            handleStyleChange("pageMargins", parseFloat(e.target.value))
          }
          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200"
        />
      </div>

      {/* Section Spacing */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Section Spacing
        </label>
        <input
          type="range"
          min="0.5"
          max="4"
          step="0.1"
          value={layout.sectionSpacing}
          onChange={(e) =>
            handleStyleChange("sectionSpacing", parseFloat(e.target.value))
          }
          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200"
        />
      </div>

      {/* Item Spacing */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Item Spacing
        </label>
        <input
          type="range"
          min="0.2"
          max="2"
          step="0.1"
          value={layout.itemSpacing}
          onChange={(e) =>
            handleStyleChange("itemSpacing", parseFloat(e.target.value))
          }
          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200"
        />
      </div>

      {/* Font Family */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Font Family
        </label>
        <select
          value={layout.fontFamily}
          onChange={(e) => handleStyleChange("fontFamily", e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 py-2 pr-10 pl-3 text-base focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm"
        >
          <option>Rubik</option>
          <option>Inter</option>
          <option>Serif</option>
          <option>Roboto</option>
          <option>Lato</option>
        </select>
      </div>

      {/* Font Size */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Font Size
        </label>
        <input
          type="range"
          min="0.8"
          max="1.2"
          step="0.05"
          value={layout.fontSize}
          onChange={(e) =>
            handleStyleChange("fontSize", parseFloat(e.target.value))
          }
          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200"
        />
      </div>

      {/* Line Height */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Line Height
        </label>
        <input
          type="range"
          min="1.2"
          max="2"
          step="0.1"
          value={layout.lineHeight}
          onChange={(e) =>
            handleStyleChange("lineHeight", parseFloat(e.target.value))
          }
          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200"
        />
      </div>

      {/* Column Widths */}
      {layout.layout === "two-column" && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Column Ratio
          </label>
          <input
            type="range"
            min="30"
            max="70"
            step="1"
            value={layout.columnWidths?.[0] || 65}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              handleStyleChange("columnWidths", [val, 100 - val]);
            }}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200"
          />
          <div className="mt-1 flex justify-between text-xs text-gray-500">
            <span>{layout.columnWidths?.[0] || 65}%</span>
            <span>{layout.columnWidths?.[1] || 35}%</span>
          </div>
        </div>
      )}

      {/* Column Gap */}
      {layout.layout === "two-column" && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Column Gap
          </label>
          <input
            type="range"
            min="1"
            max="4"
            step="0.25"
            value={layout.columnGap || 2.5}
            onChange={(e) =>
              handleStyleChange("columnGap", parseFloat(e.target.value))
            }
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200"
          />
        </div>
      )}

      {/* Accent Color */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Accent Color
        </label>
        <input
          type="color"
          value={layout.accentColor}
          onChange={(e) => handleStyleChange("accentColor", e.target.value)}
          className="mt-1 block h-8 w-full rounded-md border border-gray-300"
        />
      </div>
    </div>
  );
};

export default ThemeSidebar;
