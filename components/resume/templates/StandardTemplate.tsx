"use client";

import React from 'react';
import { useResumeStore } from '@/store/useResumeStore';
import { Section, SectionItem, ResumeData } from '@/types/resume';
import { cn } from '@/lib/utils';
import ContentEditable from '@/components/ui/ContentEditable';
import FloatingToolbar from '../FloatingToolbar';
import { PageLayout } from '@/hooks/useResumePagination';
import { Camera } from 'lucide-react';

import { ResumeBulletList } from '@/components/resume/ResumeBulletList';

interface TemplateProps {
  resume: ResumeData;
  focusedItemId: string | null;
  setFocusedItemId: (id: string | null) => void;
  pageLayout?: PageLayout; // Optional: If provided, renders only content for this page
  actions: {
    updatePersonalInfo: (field: string, value: string) => void;
    updatePersonalInfoVisibility: (visibility: any) => void;
    updateSectionTitle: (sectionId: string, title: string) => void;
    updateSectionItem: (sectionId: string, itemId: string, field: keyof SectionItem, value: any) => void;
    addSectionItem: (sectionId: string) => void;
    removeSectionItem: (sectionId: string, itemId: string) => void;
    moveSectionItem: (sectionId: string, itemId: string, direction: 'up' | 'down') => void;
  };
}

const EditableImage = ({ src, onChange, className }: { src?: string, onChange: (val: string) => void, className?: string }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div 
      className={cn("group relative cursor-pointer overflow-hidden bg-gray-100 print:bg-transparent", className)}
      onClick={() => fileInputRef.current?.click()}
    >
      {src ? (
        <img src={src} alt="Profile" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-400">
           <Camera size={24} />
        </div>
      )}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white no-print">
         <Camera size={20} />
      </div>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />
    </div>
  );
};

export const StandardTemplate = ({ resume, focusedItemId, setFocusedItemId, pageLayout, actions }: TemplateProps) => {
  const { content, activeTemplateId, layouts } = resume;
  const { isTextSelected } = useResumeStore();
  const layout = layouts[activeTemplateId];
  const { accentColor } = layout.globalStyles;

  // Defensive check for visibility (for existing resumes)
  const visibility = content.personalInfo.visibility || {
    showJobTitle: true,
    showEmail: true,
    showPhone: true,
    showAddress: true,
    showPhoto: true,
  };

  const renderItem = (section: Section, item: SectionItem, index: number, total: number) => {
    // If pageLayout is provided, check if this item belongs to the page
    if (pageLayout && !pageLayout.items.has(item.id)) return null;

    const { visibility } = item;
    
    // Check if we need to show a "Continued" header for this specific item
    // Logic: If this is the FIRST item of the section on this page, AND the section is marked as 'continued', show header.
    // However, the item loop iterates all items.
    // We need to know if this is the *first rendered item* for this section on this page.
    // Helper: Is this the first item in the intersection of (section.items, pageLayout.items)?
    
    const isFirstOnPage = pageLayout 
       ? section.items.find(i => pageLayout.items.has(i.id))?.id === item.id
       : index === 0;

    const showContinuedHeader = pageLayout?.continued.has(section.id) && isFirstOnPage;

    return (
      <React.Fragment key={item.id}>
        {showContinuedHeader && (
          <div 
            className="mb-4 pb-1 flex items-center justify-between border-b-2" 
            style={{ 
              borderColor: accentColor,
            }}
          >
            <span 
              className="text-sm font-bold uppercase tracking-wider inline-block" 
              style={{ color: accentColor }}
            >
              {section.title} <span className="text-[10px] opacity-70 ml-2">(Continued)</span>
            </span>
          </div>
        )}
        <div 
          data-resume-item={item.id}
          data-resume-section-id={section.id}
          data-resume-item-index={index}
          className={cn(
            "group/item relative p-1 -mx-1 rounded transition-colors break-inside-avoid",
            focusedItemId === item.id ? "z-30 print:!shadow-none print:!bg-transparent" : "hover:bg-gray-50/50 z-20"
          )}
          style={focusedItemId === item.id ? { 
            boxShadow: `0 0 0 2px ${accentColor}`,
            backgroundColor: `${accentColor}10` // 10 is ~6% opacity
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
          <ResumeBulletList
            items={item.bullets}
            onUpdate={(newBullets) => actions.updateSectionItem(section.id, item.id, 'bullets', newBullets)}
            className="list-disc list-outside ml-4 text-sm text-gray-700 space-y-1"
          />
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
        
        // Note: If !hasHeader, we should NOT render the main header.
        // But the main header is rendered inside this component below.
        // We need to conditionally render the header *inside* the return.
    }

    const showMainHeader = pageLayout ? pageLayout.headers.has(section.id) : true;

    return (
      <div key={section.id} className="group/section relative mb-8">
        {showMainHeader && (
          <div 
            className="border-b-2 mb-4 pb-1 flex items-center justify-between" 
            style={{ borderColor: accentColor }}
            data-resume-section-header={section.id}
          >
            <ContentEditable
              tagName="h3"
              value={section.title}
              onChange={(val) => actions.updateSectionTitle(section.id, val)}
              className="text-sm font-bold uppercase tracking-wider inline-block"
              style={{ color: accentColor }}
            />
          </div>
        )}
        <div className="space-y-5">
          {section.items.map((item, index) => renderItem(section, item, index, section.items.length))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header - Only render on Page 0 or if measuring (no pageLayout) */}
      {(!pageLayout || pageLayout.pageIndex === 0) && (
        <div 
          className={cn(
            "group/header relative mb-10 border-b pb-8 border-gray-100 flex justify-between items-start gap-6 px-1 -mx-1 rounded transition-colors",
            focusedItemId === 'header' ? "z-30 print:!shadow-none print:!bg-transparent" : "hover:bg-gray-50/50 z-20"
          )}
          style={focusedItemId === 'header' ? { 
            boxShadow: `0 0 0 2px ${accentColor}`,
            backgroundColor: `${accentColor}10`
          } : {}}
          onFocus={() => setFocusedItemId('header')}
          onClick={() => setFocusedItemId('header')}
        >
          {focusedItemId === 'header' && !isTextSelected && (
            <FloatingToolbar 
              sectionId="header"
              itemId="header"
              sectionType="header"
              settings={visibility}
              onAdd={() => {}}
              onDelete={() => {}}
            />
          )}
          <header className="flex-1 mt-0">
            <ContentEditable
              tagName="h1"
              value={content.personalInfo.fullName}
              onChange={(val) => actions.updatePersonalInfo('fullName', val)}
              className="text-5xl font-black uppercase tracking-tighter mb-2"
              style={{ color: accentColor }}
            />
            {visibility.showJobTitle && (
              <ContentEditable
                tagName="h2"
                value={content.personalInfo.jobTitle || ''}
                onChange={(val) => actions.updatePersonalInfo('jobTitle', val)}
                className="text-2xl font-medium text-gray-500"
              />
            )}
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-400 mt-6 font-medium">
              {visibility.showAddress && (
                <span>📍 <ContentEditable tagName="span" value={content.personalInfo.address} onChange={v => actions.updatePersonalInfo('address', v)} /></span>
              )}
              {visibility.showEmail && (
                <span>📧 <ContentEditable tagName="span" value={content.personalInfo.email} onChange={v => actions.updatePersonalInfo('email', v)} /></span>
              )}
              {visibility.showPhone && (
                <span>📞 <ContentEditable tagName="span" value={content.personalInfo.phone} onChange={v => actions.updatePersonalInfo('phone', v)} /></span>
              )}
            </div>
          </header>
          {visibility.showPhoto && (
            <EditableImage 
              src={content.personalInfo.profileImage}
              onChange={(val) => actions.updatePersonalInfo('profileImage', val)}
              className={cn(
                "w-32 h-32 border-4 border-gray-50 shadow-sm",
                content.personalInfo.profileImageShape === 'squircle' ? "rounded-3xl" : "rounded-full"
              )}
            />
          )}
        </div>
      )}

      {/* Columns Logic */}
      <div className="flex-1">
        {layout.sections.map(renderSection)}
      </div>
    </div>
  );
};
