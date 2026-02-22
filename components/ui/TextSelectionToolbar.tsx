"use client";

import React from 'react';
import { Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, AlignJustify, Link } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TextSelectionToolbarProps {
  position: { top: number; left: number };
}

const TextSelectionToolbar = ({ position }: TextSelectionToolbarProps) => {
  const applyFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
  };

  const handleLink = () => {
    const url = window.prompt('Enter the URL:');
    if (url) {
      // Ensure the URL is absolute by checking for a protocol
      const absoluteUrl = /^(?:[a-z+]+:)?\/\//i.test(url) ? url : `https://${url}`;
      applyFormat('createLink', absoluteUrl);
    }
  };

  return (
    <div 
      className="fixed bg-white text-gray-900 border border-gray-200 rounded-lg shadow-2xl flex items-center p-1 z-[100] no-print animate-in fade-in zoom-in duration-150"
      style={{ 
        top: position.top - 50, 
        left: position.left,
        transform: 'translateX(-50%)'
      }}
      onMouseDown={(e) => e.preventDefault()} // Prevent losing selection
    >
      <div className="flex items-center px-1">
        <button 
          onClick={() => applyFormat('bold')}
          className="p-2 hover:bg-gray-50 rounded-md transition-colors text-gray-500 hover:text-gray-900"
          title="Bold"
        >
          <Bold size={14} />
        </button>
        <button 
          onClick={() => applyFormat('underline')}
          className="p-2 hover:bg-gray-50 rounded-md transition-colors text-gray-500 hover:text-gray-900"
          title="Underline"
        >
          <Underline size={14} />
        </button>
        <button 
          onClick={() => applyFormat('italic')}
          className="p-2 hover:bg-gray-50 rounded-md transition-colors text-gray-500 hover:text-gray-900"
          title="Italic"
        >
          <Italic size={14} />
        </button>
        <button 
          onClick={() => applyFormat('strikeThrough')}
          className="p-2 hover:bg-gray-50 rounded-md transition-colors text-gray-500 hover:text-gray-900"
          title="Strikethrough"
        >
          <Strikethrough size={14} />
        </button>
        <button 
          onClick={handleLink}
          className="p-2 hover:bg-gray-50 rounded-md transition-colors text-gray-500 hover:text-gray-900"
          title="Add Link"
        >
          <Link size={14} />
        </button>
      </div>
    </div>
  );
};

export default TextSelectionToolbar;
