"use client";

import React, { useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cn, blocksToHtml, htmlToBlocks } from "@/lib/utils";
import { ExternalLink, Trash2, Edit2 } from "lucide-react";
import TextSelectionToolbar from "./TextSelectionToolbar";
import { useResumeStore } from "@/store/useResumeStore";
import { Block } from "@/types/resume";

interface MultiBlockEditorProps {
  value: Block[];
  onChange: (value: Block[]) => void;
  type?: "paragraphs" | "bullets";
  layout?: "vertical" | "horizontal" | "compact";
  className?: string;
  placeholder?: string;
  style?: React.CSSProperties;
  autoFocus?: boolean;
}

const MultiBlockEditor = ({
  value,
  onChange,
  type = "paragraphs",
  layout = "vertical",
  className,
  placeholder,
  style,
  autoFocus,
}: MultiBlockEditorProps) => {
  const { setIsTextSelected } = useResumeStore();

  const contentEditableRef = useRef<HTMLElement>(null);
  const lastValue = useRef(value);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isComposing = useRef(false);

  const [toolbarPosition, setToolbarPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const [activeLinkInfo, setActiveLinkInfo] = useState<{
    url: string;
    element: HTMLAnchorElement;
    position: { top: number; left: number };
  } | null>(null);

  const blockTagName = type === "bullets" && layout !== "compact" ? "li" : "p";
  const ContainerTag =
    type === "bullets" && layout !== "compact" ? "ul" : "div";

  /* ---------------- Autofocus ---------------- */

  useEffect(() => {
    if (autoFocus && contentEditableRef.current) {
      contentEditableRef.current.focus();
    }
  }, [autoFocus]);

  /* ---------------- Mount initializer ---------------- */

  useEffect(() => {
    const el = contentEditableRef.current;
    if (!el) return;

    let initialHtml = "";
    if (layout === "compact") {
      const text = value
        .map((b) => b.content.map((c) => c.text).join(""))
        .join(", ");
      initialHtml = `<p>${text}</p>`;
    } else {
      initialHtml = blocksToHtml(lastValue.current, blockTagName);
    }

    if (el.innerHTML !== initialHtml) {
      el.innerHTML = initialHtml;
    }
  }, [blockTagName, layout]);

  /* ---------------- External sync ---------------- */

  useEffect(() => {
    const el = contentEditableRef.current;
    if (!el) return;

    const isFocused = document.activeElement === el;

    if (!isFocused && value !== lastValue.current) {
      let newHtml = "";
      if (layout === "compact") {
        const text = value
          .map((b) => b.content.map((c) => c.text).join(""))
          .join(", ");
        newHtml = `<p>${text}</p>`;
      } else {
        newHtml = blocksToHtml(value, blockTagName);
      }

      if (el.innerHTML !== newHtml) {
        el.innerHTML = newHtml;
      }
      lastValue.current = value;
    }
  }, [value, blockTagName, layout]);

  /* ---------------- Debounced commit ---------------- */

  const commitChange = (val: Block[]) => {
    onChange(val);
  };

  const scheduleCommit = (val: Block[]) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      commitChange(val);
    }, 250);
  };

  const processChange = () => {
    const el = contentEditableRef.current;
    if (!el) return;

    const html = el.innerHTML;
    let newBlocks: Block[] = [];

    if (layout === "compact") {
      // In compact mode, we split by comma to create separate blocks
      const text = el.innerText || "";
      const parts = text
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean);
      newBlocks = parts.map((p) => ({
        id: crypto.randomUUID(),
        content: [{ type: "text", text: p }],
      }));
    } else {
      newBlocks = htmlToBlocks(html, blockTagName);
    }

    if (JSON.stringify(newBlocks) !== JSON.stringify(lastValue.current)) {
      lastValue.current = newBlocks;
      scheduleCommit(newBlocks);
    }
  };

  /* ---------------- Events ---------------- */

  const handleInput = () => {
    if (isComposing.current) return;
    processChange();
  };

  const handleBlur = (e: React.FocusEvent<HTMLElement>) => {
    const nextTarget = e.relatedTarget;
    if (
      nextTarget instanceof HTMLElement &&
      nextTarget.closest('[data-editor-overlay="true"]')
    ) {
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }

    commitChange(lastValue.current);

    setToolbarPosition(null);
    setIsTextSelected(false);
    setTimeout(() => setActiveLinkInfo(null), 200);
  };

  const handleCompositionStart = () => {
    isComposing.current = true;
  };

  const handleCompositionEnd = () => {
    isComposing.current = false;
    processChange();
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
          top: rect.bottom + 8,
          left: rect.left + rect.width / 2,
        },
      });
    } else {
      setActiveLinkInfo(null);
    }
  };

  const handleSelect = () => {
    const editor = contentEditableRef.current;
    const selection = window.getSelection();
    if (!editor || !selection || selection.toString().length === 0) {
      setToolbarPosition(null);
      setIsTextSelected(false);
      return;
    }

    const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
    if (!range || !editor.contains(range.commonAncestorContainer)) {
      setToolbarPosition(null);
      setIsTextSelected(false);
      return;
    }

    if (selection && selection.toString().length > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setToolbarPosition({
        top: rect.top,
        left: rect.left + rect.width / 2,
      });
      setIsTextSelected(true);
    } else {
      setToolbarPosition(null);
      setIsTextSelected(false);
    }
  };

  const removeLink = () => {
    if (!activeLinkInfo?.element || !contentEditableRef.current) return;

    const anchor = activeLinkInfo.element;
    const parent = anchor.parentNode;

    if (parent) {
      while (anchor.firstChild) {
        parent.insertBefore(anchor.firstChild, anchor);
      }
      parent.removeChild(anchor);
      processChange();
    }

    setActiveLinkInfo(null);
  };

  const editLink = () => {
    const newUrl = window.prompt("Edit URL:", activeLinkInfo?.url);
    if (!newUrl || !contentEditableRef.current) return;

    const absoluteUrl = /^(?:[a-z+]+:)?\/\//i.test(newUrl)
      ? newUrl
      : `https://${newUrl}`;

    const anchor = contentEditableRef.current.querySelector(
      `a[href="${activeLinkInfo?.element.href}"]`,
    ) as HTMLAnchorElement | null;

    if (!anchor) return;

    anchor.href = absoluteUrl;

    processChange();

    setActiveLinkInfo({
      url: absoluteUrl,
      element: anchor,
      position: activeLinkInfo!.position,
    });
  };

  /* ---------------- Render ---------------- */

  return (
    <>
      {toolbarPosition &&
        typeof document !== "undefined" &&
        createPortal(
          <TextSelectionToolbar position={toolbarPosition} />,
          document.body,
        )}

      {activeLinkInfo &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            data-editor-overlay="true"
            className="fixed z-[130] flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-2 shadow-xl"
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

            <div className="h-4 w-[1px] bg-gray-200" />

            <button
              onClick={editLink}
              className="rounded p-1.5 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-500"
            >
              <Edit2 size={14} />
            </button>

            <button
              onClick={removeLink}
              className="rounded p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
            >
              <Trash2 size={14} />
            </button>
          </div>,
          document.body,
        )}

      <ContainerTag
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ref={contentEditableRef as React.RefObject<any>}
        className={cn(
          "min-w-[10px] cursor-text rounded border border-transparent transition-colors outline-none hover:bg-gray-100/50",
          type === "bullets" && layout === "vertical" && "list-outside pl-4",
          type === "bullets" &&
            layout === "horizontal" &&
            "flex list-none flex-wrap items-center pl-0",
          className,
        )}
        contentEditable
        suppressContentEditableWarning
        tabIndex={0}
        role="textbox"
        style={style}
        onInput={handleInput}
        onBlur={handleBlur}
        onClick={handleClick}
        onSelect={handleSelect}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        {...(ContainerTag === "div" ? { placeholder } : {})}
      />
    </>
  );
};

export default MultiBlockEditor;
