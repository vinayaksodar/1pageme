"use client";

import React from "react";
import { Bold, Italic, Underline, Strikethrough, Link } from "lucide-react";

interface TextSelectionToolbarProps {
  position: { top: number; left: number };
}

const TextSelectionToolbar = ({ position }: TextSelectionToolbarProps) => {
  const applyFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
  };

  const handleLink = () => {
    const url = window.prompt("Enter the URL:");
    if (url) {
      // Ensure the URL is absolute by checking for a protocol
      const absoluteUrl = /^(?:[a-z+]+:)?\/\//i.test(url)
        ? url
        : `https://${url}`;
      applyFormat("createLink", absoluteUrl);
    }
  };

  return (
    <div
      className="no-print animate-in fade-in zoom-in fixed z-[100] flex items-center rounded-lg border border-gray-200 bg-white p-1 text-gray-900 shadow-2xl duration-150"
      style={{
        top: position.top - 50,
        left: position.left,
        transform: "translateX(-50%)",
      }}
      onMouseDown={(e) => e.preventDefault()} // Prevent losing selection
    >
      <div className="flex items-center px-1">
        <button
          onClick={() => applyFormat("bold")}
          className="rounded-md p-2 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900"
          title="Bold"
        >
          <Bold size={14} />
        </button>
        <button
          onClick={() => applyFormat("underline")}
          className="rounded-md p-2 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900"
          title="Underline"
        >
          <Underline size={14} />
        </button>
        <button
          onClick={() => applyFormat("italic")}
          className="rounded-md p-2 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900"
          title="Italic"
        >
          <Italic size={14} />
        </button>
        <button
          onClick={() => applyFormat("strikeThrough")}
          className="rounded-md p-2 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900"
          title="Strikethrough"
        >
          <Strikethrough size={14} />
        </button>
        <button
          onClick={handleLink}
          className="rounded-md p-2 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900"
          title="Add Link"
        >
          <Link size={14} />
        </button>
      </div>
    </div>
  );
};

export default TextSelectionToolbar;
