"use client";

import React from "react";
import { SliderType } from "@/types/resume";
import { cn } from "@/lib/utils";

interface ProficiencySliderProps {
  value: number;
  type: SliderType;
  onChange?: (value: number) => void;
  className?: string;
  editable?: boolean;
}

export const ProficiencySlider = ({
  value,
  type,
  onChange,
  className,
  editable = true,
}: ProficiencySliderProps) => {
  const handleContinuousClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!editable || !onChange) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newValue = Math.round((x / rect.width) * 100);
    onChange(Math.max(0, Math.min(100, newValue)));
  };

  const handleDiscreteClick = (step: number) => {
    if (!editable || !onChange) return;
    // Map 1-5 to 20-100%
    onChange(step * 20);
  };

  if (type === "dots") {
    return (
      <div
        className={cn("flex w-[56px] items-center justify-between", className)}
        onClick={(e) => e.stopPropagation()}
      >
        {[1, 2, 3, 4, 5].map((dot) => {
          const isActive = value >= dot * 20 - 10;
          return (
            <div
              key={dot}
              className={cn(
                "h-2 w-2 rounded-full transition-all",
                editable && "cursor-pointer hover:scale-125",
              )}
              style={{
                backgroundColor: isActive ? "#111827" : "#e5e7eb",
              }}
              onClick={() => handleDiscreteClick(dot)}
            />
          );
        })}
      </div>
    );
  }

  if (type === "bars") {
    return (
      <div
        className={cn("flex h-4 w-[56px] items-end justify-between", className)}
        onClick={(e) => e.stopPropagation()}
      >
        {[1, 2, 3, 4, 5].map((bar) => {
          const isActive = value >= bar * 20 - 10;
          return (
            <div
              key={bar}
              className={cn(
                "w-1.5 transition-all",
                editable && "cursor-pointer hover:opacity-80",
              )}
              style={{
                height: `${(bar / 5) * 100}%`,
                backgroundColor: isActive ? "#111827" : "#e5e7eb",
              }}
              onClick={() => handleDiscreteClick(bar)}
            />
          );
        })}
      </div>
    );
  }

  // Default to "line"
  return (
    <div
      className={cn(
        "h-1 w-[56px] overflow-hidden rounded-full bg-gray-100",
        editable && "cursor-pointer",
        className,
      )}
      onClick={handleContinuousClick}
    >
      <div
        className="h-full transition-all duration-300"
        style={{
          width: `${value}%`,
          backgroundColor: "#111827",
        }}
      />
    </div>
  );
};
