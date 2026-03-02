import React from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
  onClick?: () => void;
  className?: string;
}

export const Logo = ({ onClick, className }: LogoProps) => {
  const Component = onClick ? "button" : "div";

  return (
    <Component
      onClick={onClick}
      className={cn(
        "group flex items-center gap-1 transition-transform",
        onClick && "active:scale-95",
        className,
      )}
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-xl font-bold text-white italic shadow-lg shadow-blue-100 transition-colors group-hover:bg-blue-700">
        1
      </div>
      <h1 className="hidden text-lg font-bold tracking-tighter text-slate-900 italic sm:block">
        PageMe
      </h1>
    </Component>
  );
};
