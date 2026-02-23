"use client";

import React, { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { htmlToTextNodes, textNodesToString } from "@/lib/utils";

interface PlainTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  tagName?: string;
  className?: string;
  placeholder?: string;
  multiline?: boolean;
  style?: React.CSSProperties;
  onKeyDown?: (e: React.KeyboardEvent<HTMLElement>) => void;
  autoFocus?: boolean;
}

const PlainTextEditor = ({
  value,
  onChange,
  tagName = "div",
  className,
  placeholder,
  multiline = false,
  style,
  onKeyDown,
  autoFocus,
}: PlainTextEditorProps) => {
  const ref = useRef<HTMLElement>(null);
  const lastValue = useRef(value);
  const isComposing = useRef(false);

  /* ------------------------------------------------ */
  /* Autofocus                                       */
  /* ------------------------------------------------ */
  useEffect(() => {
    if (autoFocus && ref.current) {
      ref.current.focus();
    }
  }, [autoFocus]);

  /* ------------------------------------------------ */
  /* Initialize DOM once on mount                    */
  /* ------------------------------------------------ */
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const initialValue = lastValue.current;

    if (el.innerHTML !== initialValue) {
      el.innerHTML = initialValue;
    }
  }, []);

  /* ------------------------------------------------ */
  /* Sync external value → DOM (only when NOT editing) */
  /* ------------------------------------------------ */
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const isFocused = document.activeElement === el;

    // Never touch DOM while user is editing
    if (!isFocused && value !== lastValue.current) {
      if (el.innerHTML !== value) {
        el.innerHTML = value;
      }
      lastValue.current = value;
    }
  }, [value]);

  /* ------------------------------------------------ */
  /* Process DOM → external state                    */
  /* ------------------------------------------------ */
  const commitChange = (val: string) => {
    onChange(val);
  };

  const scheduleCommit = (val: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      commitChange(val);
    }, 250); // 250ms is a good balance
  };

  const processChange = () => {
    const el = ref.current;
    if (!el) return;

    const html = el.innerHTML;

    const newTextNodes = htmlToTextNodes(html);
    const newString = textNodesToString(newTextNodes);

    if (newString !== lastValue.current) {
      lastValue.current = newString;
      scheduleCommit(newString); // 🔥 debounce here
    }
  };

  /* ------------------------------------------------ */
  /* Events                                          */
  /* ------------------------------------------------ */
  const handleInput = () => {
    if (isComposing.current) return; // IME guard
    processChange();
  };

  const handleBlur = () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }

    commitChange(lastValue.current); // immediate final commit
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

  const handleCompositionStart = () => {
    isComposing.current = true;
  };

  const handleCompositionEnd = () => {
    isComposing.current = false;
    processChange();
  };

  /* ------------------------------------------------ */
  /* Render                                          */
  /* ------------------------------------------------ */
  const CustomTag = tagName as React.ElementType;

  return (
    <CustomTag
      ref={ref}
      className={cn(
        "-mx-1 min-w-[10px] cursor-text rounded border border-transparent px-1 transition-colors outline-none empty:before:text-gray-300 empty:before:content-[attr(placeholder)] hover:bg-gray-100/50",
        className,
      )}
      contentEditable
      suppressContentEditableWarning
      placeholder={placeholder}
      role="textbox"
      tabIndex={0}
      style={style}
      onInput={handleInput}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onCompositionStart={handleCompositionStart}
      onCompositionEnd={handleCompositionEnd}
    />
  );
};

export default PlainTextEditor;
