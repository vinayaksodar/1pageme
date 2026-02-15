"use client";

import React, { useState } from 'react';
import { Plus, Trash2, Settings, ChevronDown, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useResumeStore } from '@/store/useResumeStore';
import { ItemVisibility, SectionType } from '@/types/resume';
import { SECTION_SCHEMAS } from '@/lib/resume-config';
import { MonthYearPicker } from '@/components/ui/MonthYearPicker';

interface FloatingToolbarProps {
  sectionId: string;
  itemId: string;
  sectionType: SectionType;
  settings: ItemVisibility;
  onAdd: () => void;
  onDelete: () => void;
  isFirst?: boolean;
  isLast?: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  itemDatePeriod?: string;
  onDateChange?: (newVal: string) => void;
}

const FloatingToolbar = ({ 
  sectionId, 
  itemId, 
  sectionType, 
  settings, 
  onAdd, 
  onDelete,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  itemDatePeriod,
  onDateChange
}: FloatingToolbarProps) => {
  const { updateItemVisibility } = useResumeStore();
  const [showSettings, setShowSettings] = useState(false);

  const allOptions = [
    { id: 'showTitle', label: 'Title' },
    { id: 'showSubtitle', label: 'Company/School' },
    { id: 'showDescription', label: 'Description' },
    { id: 'showBullets', label: 'Bullets' },
    { id: 'showLocation', label: 'Location' },
    { id: 'showDatePeriod', label: 'Date Period' },
    { id: 'showLink', label: 'Link' },
    { id: 'showLogo', label: 'Company Logo' },
  ];

  const schema = SECTION_SCHEMAS[sectionType];
  const options = allOptions.filter(opt => schema.fields.includes(opt.id as keyof ItemVisibility));
  const hasDatePeriod = schema.fields.includes('showDatePeriod');

  return (
    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white text-gray-900 border border-gray-200 rounded-lg shadow-xl flex items-center p-1 z-[110] no-print animate-in fade-in zoom-in duration-200">
      <button 
        onClick={onAdd}
        className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-50 rounded-md text-[10px] font-black tracking-widest border-r border-gray-100 transition-colors"
      >
        <Plus size={14} className="text-green-500" /> ENTRY
      </button>

      <button 
        onClick={onDelete}
        className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors rounded-md border-r border-gray-100"
      >
        <Trash2 size={14} />
      </button>

      {!isFirst && (
        <button 
          onClick={onMoveUp}
          className="p-2 hover:bg-gray-50 text-gray-400 hover:text-gray-900 transition-colors rounded-md border-r border-gray-100"
          title="Move Up"
        >
          <ArrowUp size={14} />
        </button>
      )}

      {!isLast && (
        <button 
          onClick={onMoveDown}
          className="p-2 hover:bg-gray-50 text-gray-400 hover:text-gray-900 transition-colors rounded-md border-r border-gray-100"
          title="Move Down"
        >
          <ArrowDown size={14} />
        </button>
      )}

      {hasDatePeriod && onDateChange && (
        <div className="border-r border-gray-100 px-1 flex items-center">
          <MonthYearPicker 
            initialDate={itemDatePeriod} 
            onSelect={onDateChange} 
          />
        </div>
      )}

      <div className="relative">
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className={cn(
            "p-2 hover:bg-gray-50 rounded-md transition-colors flex items-center gap-1",
            showSettings ? "bg-gray-100 text-gray-900" : "text-gray-400 hover:text-gray-900"
          )}
        >
          <Settings size={14} />
          <ChevronDown size={10} />
        </button>

        {showSettings && (
          <div className="absolute top-full mt-2 left-0 bg-white text-gray-900 rounded-xl shadow-2xl border border-gray-200 p-4 w-56 space-y-3 z-[120]">
             <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Display Options</div>
             
             {options.map((opt) => (
               <label key={opt.id} className="flex items-center justify-between cursor-pointer group">
                  <span className="text-xs font-bold text-gray-600 group-hover:text-gray-900 transition-colors">{opt.label}</span>
                  <div className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={(settings as any)[opt.id]}
                      onChange={(e) => updateItemVisibility(sectionId, itemId, { [opt.id]: e.target.checked })}
                    />
                    <div className="w-8 h-4 bg-gray-100 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-200 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600"></div>
                  </div>
               </label>
             ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FloatingToolbar;
