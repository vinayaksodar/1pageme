"use client";

import React, { useRef, useEffect, useState } from "react";
import { cn, blocksToHtml, htmlToBlocks } from "@/lib/utils";
import { ExternalLink, Trash2, Edit2 } from "lucide-react";
import TextSelectionToolbar from "./TextSelectionToolbar";
import { useResumeStore } from "@/store/useResumeStore";
import { Block } from "@/types/resume";

interface MultiBlockEditorProps {
  value: Block[];
  onChange: (value: Block[]) => void;
  type?: "paragraphs" | "bullets";
  className?: string;
  placeholder?: string;
  style?: React.CSSProperties;
  autoFocus?: boolean;
}

const MultiBlockEditor = ({
  value,
  onChange,
  type = "paragraphs",
  className,
  placeholder,
  style,
  autoFocus,
}: MultiBlockEditorProps) => {
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
  const blockTagName = type === "bullets" ? "li" : "p";

  useEffect(() => {
    if (autoFocus && contentEditableRef.current) {
      contentEditableRef.current.focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    if (
      contentEditableRef.current &&
      document.activeElement !== contentEditableRef.current
    ) {
      const currentHtml = contentEditableRef.current.innerHTML;
      const newHtml = blocksToHtml(value, blockTagName);
      if (currentHtml !== newHtml) {
        contentEditableRef.current.innerHTML = newHtml;
      }
    }
    lastValue.current = value;
  }, [value, blockTagName]);

  const processChange = (html: string) => {
    const newBlocks = htmlToBlocks(html, blockTagName);
    if (JSON.stringify(newBlocks) !== JSON.stringify(lastValue.current)) {
      onChange(newBlocks);
      lastValue.current = newBlocks;
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLElement>) => {
    processChange(e.target.innerHTML);
    setToolbarPosition(null);
    setIsTextSelected(false);
    setTimeout(() => setActiveLinkInfo(null), 200);
  };

  const handleInput = (e: React.FormEvent<HTMLElement>) => {
    processChange(e.currentTarget.innerHTML);
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
        processChange(contentEditableRef.current.innerHTML);
      }
      setActiveLinkInfo(null);
    }
  };

  const editLink = () => {
    const newUrl = window.prompt("Edit URL:", activeLinkInfo?.url);
    if (newUrl && activeLinkInfo?.element && contentEditableRef.current) {
      const absoluteUrl = /^(?:[a-z+]+:)?\/\//i.test(newUrl)
        ? newUrl
        : `https://${newUrl}`;
      const anchor = contentEditableRef.current.querySelector(
        `a[href="${activeLinkInfo.element.href}"]`,
      ) as HTMLAnchorElement;
      if (anchor) {
        anchor.href = absoluteUrl;
        processChange(contentEditableRef.current.innerHTML);
        setActiveLinkInfo({
          ...activeLinkInfo,
          url: absoluteUrl,
          element: anchor,
        });
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

  const handleKeyDown = () => {
    // Basic block-level behavior for list items is handled natively by the browser
    // when the container is a <ul> and we are inside <li>.
  };

  const ContainerTag = type === "bullets" ? "ul" : "div";

  return (
    <>
      {toolbarPosition && <TextSelectionToolbar position={toolbarPosition} />}

      {activeLinkInfo && (
        <div
          className="animate-in fade-in zoom-in no-print fixed z-[130] flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-2 shadow-xl duration-150"
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
            className="flex max-w-[200px] items-center gap-1 truncate text-xs text-blue-600 hover:underline"
          >
            <ExternalLink size={12} />
            {activeLinkInfo.url}
          </a>
          <div className="h-4 w-[1px] bg-gray-100" />
          <button
            onClick={editLink}
            className="rounded p-1.5 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-500"
            title="Edit Link"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={removeLink}
            className="rounded p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
            title="Remove Link"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}

      <ContainerTag
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ref={contentEditableRef as React.RefObject<any>}
        className={cn(
          "min-w-[10px] cursor-text rounded border border-transparent transition-colors outline-none hover:bg-gray-100/50",
          type === "bullets" && "list-outside pl-4",
          className,
        )}
        contentEditable
        suppressContentEditableWarning
        onBlur={handleBlur}
        onInput={handleInput}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onSelect={handleSelect}
        {...(ContainerTag === "div" ? { placeholder } : {})}
        tabIndex={0}
        role="textbox"
        style={style}
      />
    </>
  );
};

export default MultiBlockEditor;
