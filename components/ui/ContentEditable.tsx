"use client";

import React, { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { ExternalLink, Trash2, Edit2 } from "lucide-react";
import TextSelectionToolbar from "./TextSelectionToolbar";
import { useResumeStore } from "@/store/useResumeStore";
import { StructuredText } from "@/types/resume";
import { structuredTextToHtml, htmlToStructuredText } from "@/lib/utils";

interface ContentEditableProps {
  value: StructuredText | string;
  onChange: (value: StructuredText) => void;
  tagName?: string;
  className?: string;
  placeholder?: string;
  multiline?: boolean;
  style?: React.CSSProperties;
  onKeyDown?: (e: React.KeyboardEvent<HTMLElement>) => void;
  autoFocus?: boolean;
}

const ContentEditable = ({
  value,
  onChange,
  tagName = "div",
  className,
  placeholder,
  multiline = false,
  style,
  onKeyDown,
  autoFocus,
}: ContentEditableProps) => {
  const { setIsTextSelected } = useResumeStore();
  const contentEditableRef = useRef<HTMLElement>(null);
  const [toolbarPosition, setToolbarPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [activeLinkInfo, setActiveLinkInfo] = useState<{
    url: string;
    element: HTMLAnchorElement;
    position: { top: number; left: number };
  } | null>(null);

  const lastValue = useRef(value);

  useEffect(() => {
    if (autoFocus && contentEditableRef.current) {
      contentEditableRef.current.focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    if (contentEditableRef.current && document.activeElement !== contentEditableRef.current) {
      const currentHtml = contentEditableRef.current.innerHTML;
      const newHtml = structuredTextToHtml(value);
      if (currentHtml !== newHtml) {
        contentEditableRef.current.innerHTML = newHtml;
      }
    }
    lastValue.current = value;
  }, [value]);

  const handleBlur = (e: React.FocusEvent<HTMLElement>) => {
    const newHtml = e.target.innerHTML;
    const newStructuredText = htmlToStructuredText(newHtml);
    if (JSON.stringify(newStructuredText) !== JSON.stringify(lastValue.current)) {
      onChange(newStructuredText);
    }
    setToolbarPosition(null);
    setIsTextSelected(false);
    setTimeout(() => setActiveLinkInfo(null), 200);
  };

  const handleInput = (e: React.FormEvent<HTMLElement>) => {
    const newHtml = e.currentTarget.innerHTML;
    const newStructuredText = htmlToStructuredText(newHtml);
    lastValue.current = newStructuredText;
    onChange(newStructuredText);
  };

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.target as HTMLElement;
    const anchor = target.closest("a");

    if (anchor) {
      e.preventDefault();
      const rect = anchor.getBoundingClientRect();
      setActiveLinkInfo({
        url: anchor.href,
        element: anchor,
        position: {
          top: rect.bottom + window.scrollY + 8,
          left: rect.left + rect.width / 2 + window.scrollX,
        },
      });
    } else {
      setActiveLinkInfo(null);
    }
  };

  const removeLink = () => {
    if (activeLinkInfo?.element && contentEditableRef.current) {
      const anchor = activeLinkInfo.element;
      const parent = anchor.parentNode;
      if (parent) {
        while (anchor.firstChild) {
          parent.insertBefore(anchor.firstChild, anchor);
        }
        parent.removeChild(anchor);
        onChange(htmlToStructuredText(contentEditableRef.current.innerHTML));
      }
      setActiveLinkInfo(null);
    }
  };

  const editLink = () => {
    const newUrl = window.prompt("Edit URL:", activeLinkInfo?.url);
    if (newUrl && activeLinkInfo?.element && contentEditableRef.current) {
      const absoluteUrl = /^(?:[a-z+]+:)?\/\//i.test(newUrl) ? newUrl : `https://${newUrl}`;
      const anchor = contentEditableRef.current.querySelector(`a[href="${activeLinkInfo.element.href}"]`) as HTMLAnchorElement;
      if (anchor) {
        anchor.href = absoluteUrl;
        onChange(htmlToStructuredText(contentEditableRef.current.innerHTML));
        setActiveLinkInfo({ ...activeLinkInfo, url: absoluteUrl, element: anchor });
      }
    }
  };

  const handleSelect = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setToolbarPosition({
        top: rect.top + window.scrollY,
        left: rect.left + rect.width / 2 + window.scrollX,
      });
      setIsTextSelected(true);
    } else {
      setToolbarPosition(null);
      setIsTextSelected(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (onKeyDown) {
      onKeyDown(e);
      if (e.defaultPrevented) return;
    }
    
    if (!multiline && e.key === "Enter") {
      e.preventDefault();
      e.currentTarget.blur();
    }
  };

  const CustomTag = tagName as React.ElementType;

  return (
    <>
      {toolbarPosition && <TextSelectionToolbar position={toolbarPosition} />}

      {activeLinkInfo && (
        <div
          className="fixed bg-white border border-gray-200 rounded-lg shadow-xl p-2 z-[130] flex items-center gap-3 animate-in fade-in zoom-in duration-150 no-print"
          style={{
            top: activeLinkInfo.position.top,
            left: activeLinkInfo.position.left,
            transform: "translateX(-50%)",
          }}
          onMouseDown={(e) => e.preventDefault()}
        >
          <a
            href={activeLinkInfo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline flex items-center gap-1 max-w-[200px] truncate"
          >
            <ExternalLink size={12} />
            {activeLinkInfo.url}
          </a>
          <div className="w-[1px] h-4 bg-gray-100" />
          <button
            onClick={editLink}
            className="p-1.5 hover:bg-blue-50 text-gray-400 hover:text-blue-500 rounded transition-colors"
            title="Edit Link"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={removeLink}
            className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded transition-colors"
            title="Remove Link"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}

      <CustomTag
        ref={contentEditableRef}
        className={cn(
          "outline-none min-w-[10px] empty:before:content-[attr(placeholder)] empty:before:text-gray-300 hover:bg-gray-100/50 transition-colors rounded px-1 -mx-1 border border-transparent cursor-text",
          className,
        )}
        contentEditable
        suppressContentEditableWarning
        onBlur={handleBlur}
        onInput={handleInput}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onSelect={handleSelect}
        placeholder={placeholder}
        tabIndex={0}
        role="textbox"
        style={style}
      />
    </>
  );
};

export default ContentEditable;
