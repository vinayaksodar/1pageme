"use client";

import React from 'react';
import { useResumeStore } from '@/store/useResumeStore';
import { Section, SectionItem, ResumeData } from '@/types/resume';
import { cn } from '@/lib/utils';
import ContentEditable from '@/components/ui/ContentEditable';
import FloatingToolbar from '../FloatingToolbar';
import { PageLayout } from '@/hooks/useResumePagination';

interface TemplateProps {
  resume: ResumeData;
  focusedItemId: string | null;
  setFocusedItemId: (id: string | null) => void;
  pageLayout?: PageLayout;
  actions: {
    updatePersonalInfo: (field: string, value: string) => void;
    updateSectionTitle: (sectionId: string, title: string) => void;
    updateSectionItem: (sectionId: string, itemId: string, field: keyof SectionItem, value: any) => void;
    addSectionItem: (sectionId: string) => void;
    removeSectionItem: (sectionId: string, itemId: string) => void;
    moveSectionItem: (sectionId: string, itemId: string, direction: 'up' | 'down') => void;
  };
}

export const ModernTemplate = ({ resume, focusedItemId, setFocusedItemId, pageLayout, actions }: TemplateProps) => {
  const { content, activeTemplateId, layouts } = resume;
  const { isTextSelected } = useResumeStore();
  const layout = layouts[activeTemplateId];
  const { accentColor } = layout.globalStyles;

  const renderItem = (section: Section, item: SectionItem, index: number, total: number) => {
    // Filter Logic
    if (pageLayout && !pageLayout.items.has(item.id)) return null;

    const { visibility } = item;
    
    // Continued Header Logic
    const isFirstOnPage = pageLayout 
       ? section.items.find(i => pageLayout.items.has(i.id))?.id === item.id
       : index === 0;

    const showContinuedHeader = pageLayout?.continued.has(section.id) && isFirstOnPage;

    return (
      <React.Fragment key={item.id}>
        {showContinuedHeader && (
          <h3 
            className="text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-4"
          >
             <span style={{ color: accentColor }}>{section.title} <span className="opacity-50 text-[10px] ml-1">(CONT.)</span></span>
             <div className="h-[1px] flex-1 bg-gray-100" />
          </h3>
        )}
        <div 
          data-resume-item={item.id}
          data-resume-section-id={section.id}
          data-resume-item-index={index}
          className={cn(
            "group/item relative p-1 -mx-1 rounded transition-colors break-inside-avoid",
            focusedItemId === item.id ? "z-30" : "hover:bg-gray-50/50 z-20"
          )}
          style={focusedItemId === item.id ? { 
            boxShadow: `0 0 0 2px ${accentColor}`,
            backgroundColor: `${accentColor}10`
          } : {}}
          onFocus={() => setFocusedItemId(item.id)}
          onClick={() => setFocusedItemId(item.id)}
        >
        {focusedItemId === item.id && !isTextSelected && (
                    <FloatingToolbar 
                      sectionId={section.id}
                      itemId={item.id}
                      sectionType={section.type}
                      settings={item.visibility}
                      onAdd={() => actions.addSectionItem(section.id)}
            onDelete={() => actions.removeSectionItem(section.id, item.id)}
            isFirst={index === 0}
            isLast={index === total - 1}
            onMoveUp={() => actions.moveSectionItem(section.id, item.id, 'up')}
            onMoveDown={() => actions.moveSectionItem(section.id, item.id, 'down')}
            itemDatePeriod={item.datePeriod || ''}
            onDateChange={(val) => actions.updateSectionItem(section.id, item.id, 'datePeriod', val)}
          />
        )}

        <div className="mb-1">
          {visibility.showTitle && (
            <ContentEditable
              value={item.title}
              onChange={(val) => actions.updateSectionItem(section.id, item.id, 'title', val)}
              className="font-bold text-gray-900 text-base"
              placeholder="Title"
            />
          )}
          <div className="flex items-center justify-between mt-0.5">
            {visibility.showSubtitle && (
              <ContentEditable
                value={item.subtitle || ''}
                onChange={(val) => actions.updateSectionItem(section.id, item.id, 'subtitle', val)}
                className="text-sm font-bold uppercase tracking-tight"
                style={{ color: accentColor }}
                placeholder="Company"
              />
            )}
            {visibility.showDatePeriod && (
              <div className="flex items-center gap-1 group/date">
                <ContentEditable
                  value={item.datePeriod || ''}
                  onChange={(val) => actions.updateSectionItem(section.id, item.id, 'datePeriod', val)}
                  className="text-[10px] font-black uppercase text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded"
                  placeholder="Date"
                />
              </div>
            )}
          </div>
        </div>

        {visibility.showDescription && (
          <ContentEditable
            value={item.description || ''}
            onChange={(val) => actions.updateSectionItem(section.id, item.id, 'description', val)}
            className="text-xs text-gray-600 leading-snug mb-2 italic"
            multiline
          />
        )}

        {visibility.showBullets && item.bullets && (
          <ul className="list-none space-y-1.5">
            {item.bullets.map((bullet, idx) => (
              <li key={idx} className="text-xs text-gray-700 flex gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: accentColor }} />
                <ContentEditable
                  value={bullet}
                  onChange={(val) => {
                    const newBullets = [...(item.bullets || [])];
                    newBullets[idx] = val;
                    actions.updateSectionItem(section.id, item.id, 'bullets', newBullets);
                  }}
                  multiline
                />
              </li>
            ))}
          </ul>
        )}
      </div>
      </React.Fragment>
    );
  };

  const renderSection = (config: { id: string, isVisible: boolean }) => {
    const section = content.sections.find(s => s.id === config.id);
    if (!section || !config.isVisible) return null;

    // Filter Logic
    if (pageLayout) {
        const hasItems = section.items.some(i => pageLayout.items.has(i.id));
        const hasHeader = pageLayout.headers.has(section.id);
        const isContinued = pageLayout.continued.has(section.id);
        
        if (!hasItems && !hasHeader && !isContinued) return null;
    }
    
    const showMainHeader = pageLayout ? pageLayout.headers.has(section.id) : true;

    return (
      <div key={section.id} className="group/section relative mb-10">
        {showMainHeader && (
          <h3 
            className="text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-4"
            data-resume-section-header={section.id}
          >
             <ContentEditable
               tagName="span"
               value={section.title}
               onChange={(val) => actions.updateSectionTitle(section.id, val)}
               style={{ color: accentColor }}
             />
             <div className="h-[1px] flex-1 bg-gray-100" />
          </h3>
        )}
        <div className="space-y-6">
          {section.items.map((item, index) => renderItem(section, item, index, section.items.length))}
        </div>
      </div>
    );
  };

  // Modern uses 2 columns based on layout config
  const mainSections = layout.sections.filter(s => s.column === 1 || !s.column);
  const sideSections = layout.sections.filter(s => s.column === 2);

  return (
    <div className="flex flex-col h-full">
      {(!pageLayout || pageLayout.pageIndex === 0) && (
        <header className="flex justify-between items-start mb-16">
          <div className="max-w-[60%]">
            <ContentEditable
              tagName="h1"
              value={content.personalInfo.fullName}
              onChange={(val) => actions.updatePersonalInfo('fullName', val)}
              className="text-6xl font-black uppercase leading-[0.9] tracking-tighter mb-4"
            />
            <ContentEditable
              tagName="h2"
              value={content.personalInfo.jobTitle || ''}
              onChange={(val) => actions.updatePersonalInfo('jobTitle', val)}
              className="text-lg font-bold uppercase tracking-widest"
              style={{ color: accentColor }}
            />
          </div>
          <div className="text-right text-[10px] font-bold uppercase tracking-widest space-y-2 text-gray-400">
             <ContentEditable 
               value={content.personalInfo.address} 
               onChange={v => actions.updatePersonalInfo('address', v)} 
               placeholder="Address"
             />
             <ContentEditable 
               value={content.personalInfo.email} 
               onChange={v => actions.updatePersonalInfo('email', v)} 
               placeholder="Email"
             />
             <ContentEditable 
               value={content.personalInfo.phone} 
               onChange={v => actions.updatePersonalInfo('phone', v)} 
               placeholder="Phone"
             />
          </div>
        </header>
      )}

      <div className="grid grid-cols-12 gap-16 flex-1">
         <div className="col-span-8">
            {mainSections.map(renderSection)}
         </div>
         <div className="col-span-4">
            {sideSections.map(renderSection)}
         </div>
      </div>
    </div>
  );
};
