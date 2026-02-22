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
  const contentEditableRef = useRef<HTMLElement>(null);
  const lastValue = useRef(value);

  useEffect(() => {
    if (autoFocus && contentEditableRef.current) {
      contentEditableRef.current.focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    if (contentEditableRef.current && document.activeElement !== contentEditableRef.current) {
      const currentHtml = contentEditableRef.current.innerHTML;
      if (currentHtml !== value) {
        contentEditableRef.current.innerHTML = value;
      }
    }
    lastValue.current = value;
  }, [value]);

  const processChange = (html: string) => {
    const newTextNodes = htmlToTextNodes(html);
    const newString = textNodesToString(newTextNodes);
    if (newString !== lastValue.current) {
      onChange(newString);
      lastValue.current = newString;
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLElement>) => {
    processChange(e.target.innerHTML);
  };

  const handleInput = (e: React.FormEvent<HTMLElement>) => {
    processChange(e.currentTarget.innerHTML);
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
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      tabIndex={0}
      role="textbox"
      style={style}
      dangerouslySetInnerHTML={{ __html: value }}
    />
  );
};

export default PlainTextEditor;
