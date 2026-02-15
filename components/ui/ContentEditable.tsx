"use client";

import React, { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { ExternalLink, Trash2, Edit2 } from 'lucide-react';
import TextSelectionToolbar from './TextSelectionToolbar';
import { useResumeStore } from '@/store/useResumeStore';

interface ContentEditableProps {
  value: string;
  onChange: (value: string) => void;
  tagName?: string;
  className?: string;
  placeholder?: string;
  multiline?: boolean;
  style?: React.CSSProperties;
}

const ContentEditable = ({
  value,
  onChange,
  tagName = 'div',
  className,
  placeholder,
  multiline = false,
  style
}: ContentEditableProps) => {
  const { setIsTextSelected } = useResumeStore();
  const contentEditableRef = useRef<HTMLElement>(null);
  const [toolbarPosition, setToolbarPosition] = useState<{ top: number; left: number } | null>(null);
  const [activeLinkInfo, setActiveLinkInfo] = useState<{ 
    url: string; 
    element: HTMLAnchorElement;
    position: { top: number; left: number } 
  } | null>(null);

  useEffect(() => {
    if (contentEditableRef.current && document.activeElement !== contentEditableRef.current) {
        if (contentEditableRef.current.innerHTML !== value) {
            contentEditableRef.current.innerHTML = value || '';
        }
    }
  }, [value]);

  const handleBlur = (e: React.FocusEvent<HTMLElement>) => {
    const newValue = e.target.innerHTML;
    if (newValue !== value) {
      onChange(newValue);
    }
    setToolbarPosition(null);
    setIsTextSelected(false);
    // Delay hiding link info to allow clicking the remove button
    setTimeout(() => setActiveLinkInfo(null), 200);
  };

  const handleInput = (e: React.FormEvent<HTMLElement>) => {
    const newValue = e.currentTarget.innerHTML;
    onChange(newValue);
  };

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.target as HTMLElement;
    const anchor = target.closest('a');
    
    if (anchor) {
      e.preventDefault();
      const rect = anchor.getBoundingClientRect();
      setActiveLinkInfo({
        url: anchor.href,
        element: anchor,
        position: {
          top: rect.bottom + window.scrollY + 8,
          left: rect.left + rect.width / 2 + window.scrollX
        }
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
        // Move all children of the anchor to be before it in the DOM
        while (anchor.firstChild) {
          parent.insertBefore(anchor.firstChild, anchor);
        }
        // Remove the now-empty anchor
        parent.removeChild(anchor);
        
        // Persist the change
        onChange(contentEditableRef.current.innerHTML);
      }
      setActiveLinkInfo(null);
    }
  };

  const editLink = () => {
    const newUrl = window.prompt('Edit URL:', activeLinkInfo?.url);
    if (newUrl && activeLinkInfo?.element && contentEditableRef.current) {
      // Ensure the URL is absolute
      const absoluteUrl = /^(?:[a-z+]+:)?\/\//i.test(newUrl) ? newUrl : `https://${newUrl}`;
      activeLinkInfo.element.href = absoluteUrl;
      onChange(contentEditableRef.current.innerHTML);
      setActiveLinkInfo({
        ...activeLinkInfo,
        url: absoluteUrl
      });
    }
  };

  const handleSelect = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setToolbarPosition({
        top: rect.top + window.scrollY,
        left: rect.left + rect.width / 2 + window.scrollX
      });
      setIsTextSelected(true);
    } else {
      setToolbarPosition(null);
      setIsTextSelected(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (!multiline && e.key === 'Enter') {
      e.preventDefault();
      e.currentTarget.blur();
    }
  };

  const CustomTag = tagName as any;

  return (
    <>
      {toolbarPosition && <TextSelectionToolbar position={toolbarPosition} />}
      
      {activeLinkInfo && (
        <div 
          className="fixed bg-white border border-gray-200 rounded-lg shadow-xl p-2 z-[130] flex items-center gap-3 animate-in fade-in zoom-in duration-150 no-print"
          style={{ 
            top: activeLinkInfo.position.top, 
            left: activeLinkInfo.position.left,
            transform: 'translateX(-50%)'
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
          "outline-none min-w-[10px] empty:before:content-[attr(placeholder)] empty:before:text-gray-300 hover:bg-blue-50/50 focus:bg-blue-50 transition-colors rounded px-1 -mx-1 border border-transparent focus:border-blue-200 cursor-text",
          className
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
