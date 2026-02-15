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
  sectionType: SectionType | 'header';
  settings: any;
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
  const { updateItemVisibility, resumes, activeResumeId, updatePersonalInfo, updatePersonalInfoVisibility } = useResumeStore();
  const [showSettings, setShowSettings] = useState(false);

  const activeResume = resumes.find(r => r.id === activeResumeId);
  const profileImageShape = activeResume?.content.personalInfo.profileImageShape || 'circle';

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

  const PERSONAL_INFO_OPTIONS = [
    { id: 'showJobTitle', label: 'Job Title' },
    { id: 'showEmail', label: 'Email' },
    { id: 'showPhone', label: 'Phone' },
    { id: 'showAddress', label: 'Address' },
    { id: 'showPhoto', label: 'Profile Photo' },
  ];

  const isHeader = sectionType === 'header';
  const schema = !isHeader ? SECTION_SCHEMAS[sectionType as SectionType] : null;
  const options = isHeader ? PERSONAL_INFO_OPTIONS : allOptions.filter(opt => schema?.fields.includes(opt.id as keyof ItemVisibility));
  const hasDatePeriod = !isHeader && schema?.fields.includes('showDatePeriod');

  return (
    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white text-gray-900 border border-gray-200 rounded-lg shadow-xl flex items-center p-1 z-[110] no-print animate-in fade-in zoom-in duration-200">
      {!isHeader && (
        <button 
          onClick={onAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-50 rounded-md text-[10px] font-black tracking-widest border-r border-gray-100 transition-colors"
        >
          <Plus size={14} className="text-green-500" /> ENTRY
        </button>
      )}

      {!isHeader && (
        <button 
          onClick={onDelete}
          className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors rounded-md border-r border-gray-100"
        >
          <Trash2 size={14} />
        </button>
      )}

      {!isHeader && !isFirst && (
        <button 
          onClick={onMoveUp}
          className="p-2 hover:bg-gray-50 text-gray-400 hover:text-gray-900 transition-colors rounded-md border-r border-gray-100"
          title="Move Up"
        >
          <ArrowUp size={14} />
        </button>
      )}

      {!isHeader && !isLast && (
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
             {isHeader && (
               <div className="pb-3 border-b border-gray-100 mb-2">
                 <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Photo Shape</div>
                 <div className="flex bg-gray-50 p-1 rounded-lg">
                    <button 
                      onClick={() => updatePersonalInfo('profileImageShape', 'circle')}
                      className={cn(
                        "flex-1 py-1 text-[10px] font-bold rounded-md transition-all",
                        profileImageShape === 'circle' ? "bg-white shadow-sm text-blue-600" : "text-gray-400 hover:text-gray-600"
                      )}
                    >
                      CIRCLE
                    </button>
                    <button 
                      onClick={() => updatePersonalInfo('profileImageShape', 'squircle')}
                      className={cn(
                        "flex-1 py-1 text-[10px] font-bold rounded-md transition-all",
                        profileImageShape === 'squircle' ? "bg-white shadow-sm text-blue-600" : "text-gray-400 hover:text-gray-600"
                      )}
                    >
                      SQUIRCLE
                    </button>
                 </div>
               </div>
             )}
             
             <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Display Options</div>
             
             {options.map((opt) => (
               <label key={opt.id} className="flex items-center justify-between cursor-pointer group">
                  <span className="text-xs font-bold text-gray-600 group-hover:text-gray-900 transition-colors">{opt.label}</span>
                  <div className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={(settings as any)[opt.id]}
                      onChange={(e) => {
                        if (isHeader) {
                          updatePersonalInfoVisibility({ [opt.id]: e.target.checked });
                        } else {
                          updateItemVisibility(sectionId, itemId, { [opt.id]: e.target.checked });
                        }
                      }}
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
