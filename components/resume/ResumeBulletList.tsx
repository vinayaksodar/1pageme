"use client";

import React, { useState, useEffect } from "react";
import ContentEditable from "@/components/ui/ContentEditable";
import { StructuredText } from "@/types/resume";
import { emptyStructuredText, structuredTextToString } from "@/lib/utils";

interface ResumeBulletListProps {
  items: StructuredText[];
  onUpdate: (items: StructuredText[]) => void;
  className?: string;
  itemClassName?: string;
  contentEditableClassName?: string;
  renderBullet?: (index: number) => React.ReactNode;
}

export const ResumeBulletList = ({
  items = [],
  onUpdate,
  className,
  itemClassName,
  contentEditableClassName,
  renderBullet,
}: ResumeBulletListProps) => {
  const [focusIndex, setFocusIndex] = useState<number | null>(null);

  useEffect(() => {
    if (focusIndex !== null) {
      // This is a bit of a hack to focus the new item.
      // A more robust solution might involve passing a ref to ContentEditable.
      setTimeout(() => {
        const item = document.querySelector(`[data-bullet-index="${focusIndex}"]`);
        if (item) {
          (item as HTMLElement).focus();
        }
      }, 50);
    }
  }, [focusIndex]);

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLElement>,
    index: number,
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const newItems = [...items];
      newItems.splice(index + 1, 0, emptyStructuredText());
      onUpdate(newItems);
      setFocusIndex(index + 1);
    }

    if (e.key === "Backspace") {
      const currentText = structuredTextToString(items[index]);
      if (currentText === "" && index > 0) {
        e.preventDefault();
        const newItems = [...items];
        const textToPrepend = structuredTextToString(items[index-1]);
        newItems.splice(index, 1);
        onUpdate(newItems);
        setFocusIndex(index - 1);
      }
    }
  };

  const handleChange = (val: StructuredText, index: number) => {
    const newItems = [...items];
    newItems[index] = val;
    onUpdate(newItems);
  };

  return (
    <ul className={className}>
      {items.map((bullet, idx) => (
        <li key={idx} className={itemClassName}>
          {renderBullet && renderBullet(idx)}
          <ContentEditable
            value={bullet}
            onChange={(val) => handleChange(val, idx)}
            className={contentEditableClassName}
            autoFocus={focusIndex === idx}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            // The data-attribute is used for focusing
            // This is not a standard prop, so it will be passed to the underlying div
            // @ts-ignore
            data-bullet-index={idx}
          />
        </li>
      ))}
    </ul>
  );
};
