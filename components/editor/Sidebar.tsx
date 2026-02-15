"use client";

import React from 'react';
import { useResumeStore } from '@/store/useResumeStore';
import { LayoutTemplate, Palette, MoveVertical, Columns } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SortableSectionList } from './SortableSectionList';

const Sidebar = () => {
  const { resumes, activeResumeId, updateGlobalStyle, addSection, setTemplate, reorderSections } = useResumeStore();
  const [activeTab, setActiveTab] = React.useState<'design' | 'rearrange' | 'templates'>('design');

  const activeResume = resumes.find(r => r.id === activeResumeId);
  if (!activeResume) return null;
  const { content, layouts, activeTemplateId } = activeResume;
  const layout = layouts[activeTemplateId];

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('design')}
          className={cn(
            "flex-1 py-3 text-[10px] font-black tracking-widest flex flex-col justify-center items-center gap-1 transition-colors",
            activeTab === 'design' ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-400 hover:text-gray-600"
          )}
        >
          <Palette size={16} /> DESIGN
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={cn(
            "flex-1 py-3 text-[10px] font-black tracking-widest flex flex-col justify-center items-center gap-1 transition-colors",
            activeTab === 'templates' ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-400 hover:text-gray-600"
          )}
        >
          <LayoutTemplate size={16} /> TEMPLATES
        </button>
        <button
          onClick={() => setActiveTab('rearrange')}
          className={cn(
            "flex-1 py-3 text-[10px] font-black tracking-widest flex flex-col justify-center items-center gap-1 transition-colors",
            activeTab === 'rearrange' ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-400 hover:text-gray-600"
          )}
        >
          <MoveVertical size={16} /> REARRANGE
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {activeTab === 'design' && (
          <>
            {/* Margins */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Margins</label>
              <div className="flex bg-gray-50 border border-gray-100 rounded-xl p-1">
                {['compact', 'standard', 'spacious'].map((m) => (
                  <button
                    key={m}
                    onClick={() => updateGlobalStyle('margins', m)}
                    className={cn(
                      "flex-1 py-2 text-[10px] font-bold uppercase tracking-tighter rounded-lg transition-all",
                      layout.globalStyles.margins === m ? "bg-white shadow-sm text-gray-900" : "text-gray-400 hover:text-gray-600"
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Accent Color</label>
              <div className="flex flex-wrap gap-2.5">
                {['#38bdf8', '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#10b981', '#111827'].map((color) => (
                  <button
                    key={color}
                    onClick={() => updateGlobalStyle('accentColor', color)}
                    className={cn(
                      "w-7 h-7 rounded-full border-2 transition-all",
                      layout.globalStyles.accentColor === color ? "border-gray-900 scale-110" : "border-transparent hover:scale-105 hover:shadow-md"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            
             {/* Font Family */}
             <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Font Family</label>
               <div className="grid grid-cols-1 gap-2">
                {['Rubik', 'Inter', 'Serif'].map((font) => (
                  <button
                    key={font}
                    onClick={() => updateGlobalStyle('fontFamily', font)}
                    className={cn(
                      "flex items-center px-4 py-2.5 text-xs font-bold border-2 rounded-xl transition-all",
                      layout.globalStyles.fontFamily === font ? "border-blue-600 bg-blue-50 text-blue-600" : "border-gray-50 hover:border-gray-100 bg-gray-50/50"
                    )}
                  >
                   <span style={{ fontFamily: font === 'Serif' ? 'serif' : font }}>{font}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Line Height */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Line Height: {layout.globalStyles.lineHeight}</label>
              <input 
                type="range" 
                min="1" 
                max="2" 
                step="0.1" 
                value={layout.globalStyles.lineHeight}
                onChange={(e) => updateGlobalStyle('lineHeight', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          </>
        )}
        
        {activeTab === 'templates' && (
           <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Layout Layers</label>
              <div className="grid grid-cols-1 gap-3">
                 {[
                   { id: 'standard', name: 'Standard Professional', desc: 'Classic single column layout' },
                   { id: 'modern', name: 'Modern Side-by-Side', desc: 'Sleek 2-column layout' },
                 ].map((t) => (
                   <button
                     key={t.id}
                     onClick={() => setTemplate(t.id as any)}
                     className={cn(
                       "flex flex-col items-start p-4 border-2 rounded-2xl transition-all text-left",
                       activeTemplateId === t.id 
                         ? "border-blue-600 bg-blue-50" 
                         : "border-gray-50 bg-gray-50/50 hover:border-gray-100"
                     )}
                   >
                     <span className={cn("text-xs font-black uppercase mb-1", activeTemplateId === t.id ? "text-blue-600" : "text-gray-900")}>{t.name}</span>
                     <span className="text-[10px] text-gray-500">{t.desc}</span>
                   </button>
                 ))}
              </div>
           </div>
        )}

        {activeTab === 'rearrange' && (
             <div className="space-y-6">
                <div>
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 block">Rearrange Sections</label>
                   <SortableSectionList />
                </div>
                
                <div className="mt-8 pt-8 border-t border-gray-100">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 block">Add New Section</label>
                    <div className="grid grid-cols-2 gap-2">
                        {['experience', 'education', 'projects', 'skills', 'custom'].map((type) => (
                             <button
                                key={type}
                                onClick={() => addSection(type as any)}
                                className="px-3 py-2.5 text-[10px] font-black uppercase tracking-tighter border-2 border-gray-50 rounded-xl hover:border-blue-500 hover:text-blue-600 bg-white text-left transition-all"
                             >
                                + {type}
                             </button>
                        ))}
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
