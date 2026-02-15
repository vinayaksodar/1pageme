"use client";

import React from 'react';
import { useResumeStore } from '@/store/useResumeStore';
import { Section, SectionItem, ResumeData } from '@/types/resume';
import { cn } from '@/lib/utils';
import ContentEditable from '@/components/ui/ContentEditable';
import FloatingToolbar from '../FloatingToolbar';

interface TemplateProps {
  resume: ResumeData;
  focusedItemId: string | null;
  setFocusedItemId: (id: string | null) => void;
  actions: {
    updatePersonalInfo: (field: string, value: string) => void;
    updateSectionTitle: (sectionId: string, title: string) => void;
    updateSectionItem: (sectionId: string, itemId: string, field: keyof SectionItem, value: any) => void;
    addSectionItem: (sectionId: string) => void;
    removeSectionItem: (sectionId: string, itemId: string) => void;
    moveSectionItem: (sectionId: string, itemId: string, direction: 'up' | 'down') => void;
  };
}

export const StandardTemplate = ({ resume, focusedItemId, setFocusedItemId, actions }: TemplateProps) => {
  const { content, activeTemplateId, layouts } = resume;
  const { isTextSelected } = useResumeStore();
  const layout = layouts[activeTemplateId];
  const { accentColor } = layout.globalStyles;

  const renderItem = (section: Section, item: SectionItem, index: number, total: number) => {
    const { visibility } = item;
    return (
      <div 
        key={item.id}
        className={cn(
          "group/item relative p-1 -mx-1 rounded transition-colors",
          focusedItemId === item.id ? "bg-blue-50/30 ring-1 ring-blue-100" : "hover:bg-gray-50/50"
        )}
        onFocus={() => setFocusedItemId(item.id)}
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

        <div className="flex justify-between items-baseline mb-1">
          {visibility.showTitle && (
            <ContentEditable
              value={item.title}
              onChange={(val) => actions.updateSectionItem(section.id, item.id, 'title', val)}
              className="font-bold text-gray-800"
              placeholder="Job Title / Project Name"
            />
          )}
          {visibility.showDatePeriod && (
            <div className="flex items-center gap-1 group/date">
              <ContentEditable
                value={item.datePeriod || ''}
                onChange={(val) => actions.updateSectionItem(section.id, item.id, 'datePeriod', val)}
                className="text-xs text-gray-500 font-medium whitespace-nowrap ml-4"
                placeholder="Date Period"
              />
            </div>
          )}
        </div>

        <div className="mb-1 flex items-center gap-2 flex-wrap">
          {visibility.showSubtitle && (
            <ContentEditable
              value={item.subtitle || ''}
              onChange={(val) => actions.updateSectionItem(section.id, item.id, 'subtitle', val)}
              className="text-sm font-semibold"
              style={{ color: accentColor }}
              placeholder="Company / Institution"
            />
          )}
          {visibility.showLocation && item.location && <span className="text-gray-300 text-xs">|</span>}
          {visibility.showLocation && (
            <ContentEditable
              value={item.location || ''}
              onChange={(val) => actions.updateSectionItem(section.id, item.id, 'location', val)}
              className="text-xs text-gray-400"
              placeholder="Location"
            />
          )}
        </div>

        {visibility.showDescription && (
          <ContentEditable
            value={item.description || ''}
            onChange={(val) => actions.updateSectionItem(section.id, item.id, 'description', val)}
            className="text-sm text-gray-700 leading-relaxed mb-2 whitespace-pre-wrap"
            multiline
            placeholder="Description..."
          />
        )}

        {visibility.showBullets && item.bullets && (
          <ul className="list-disc list-outside ml-4 text-sm text-gray-700 space-y-1">
            {item.bullets.map((bullet, idx) => (
              <li key={idx}>
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
    );
  };

  const renderSection = (config: { id: string, isVisible: boolean }) => {
    const section = content.sections.find(s => s.id === config.id);
    if (!section || !config.isVisible) return null;

    return (
      <div key={section.id} className="group/section relative mb-8">
        <div className="border-b-2 mb-4 pb-1 flex items-center justify-between" style={{ borderColor: accentColor }}>
          <ContentEditable
            tagName="h3"
            value={section.title}
            onChange={(val) => actions.updateSectionTitle(section.id, val)}
            className="text-sm font-bold uppercase tracking-wider inline-block"
            style={{ color: accentColor }}
          />
        </div>
        <div className="space-y-5">
          {section.items.map((item, index) => renderItem(section, item, index, section.items.length))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="mb-10 border-b pb-8 border-gray-100">
        <ContentEditable
          tagName="h1"
          value={content.personalInfo.fullName}
          onChange={(val) => actions.updatePersonalInfo('fullName', val)}
          className="text-5xl font-black uppercase tracking-tighter mb-2"
          style={{ color: accentColor }}
        />
        <ContentEditable
          tagName="h2"
          value={content.personalInfo.jobTitle || ''}
          onChange={(val) => actions.updatePersonalInfo('jobTitle', val)}
          className="text-2xl font-medium text-gray-500"
        />
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-400 mt-6 font-medium">
          <span>📍 <ContentEditable tagName="span" value={content.personalInfo.address} onChange={v => actions.updatePersonalInfo('address', v)} /></span>
          <span>📧 <ContentEditable tagName="span" value={content.personalInfo.email} onChange={v => actions.updatePersonalInfo('email', v)} /></span>
          <span>📞 <ContentEditable tagName="span" value={content.personalInfo.phone} onChange={v => actions.updatePersonalInfo('phone', v)} /></span>
        </div>
      </header>

      {/* Columns Logic */}
      <div className="flex-1">
        {layout.sections.map(renderSection)}
      </div>
    </div>
  );
};
