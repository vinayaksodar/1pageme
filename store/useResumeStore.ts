import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  ResumeData, 
  SectionType, 
  SectionItem, 
  ItemVisibility, 
  SectionConfig, 
  GlobalStyles, 
  TemplateId, 
  TemplateLayout, 
  Section,
  TextNode
} from '@/types/resume';
import { 
  SECTION_SCHEMAS, 
  getInitialVisibility, 
  createInitialResume 
} from '@/lib/resume-config';
import { emptyTextNodes } from '@/lib/utils';

// This is a simplified deep-clone, sufficient for our state
const deepClone = (obj: any) => JSON.parse(JSON.stringify(obj));

export interface ResumeState {
  resumes: ResumeData[];
  activeResumeId: string | null;
  isTextSelected: boolean;
  
  // Actions
  createNewResume: () => void;
  deleteResume: (id: string) => void;
  setActiveResume: (id: string) => void;
  setIsTextSelected: (isSelected: boolean) => void;
  updatePersonalInfo: (field: string, value: string) => void;
  updatePersonalInfoVisibility: (visibility: any) => void;
  updateSectionTitle: (sectionId: string, title: string) => void;
  updateSectionItem: (sectionId: string, itemId: string, field: keyof SectionItem, value: any) => void;
  updateItemVisibility: (sectionId: string, itemId: string, visibility: Partial<ItemVisibility>) => void;
  addSectionItem: (sectionId: string) => void;
  removeSectionItem: (sectionId: string, itemId: string) => void;
  moveSectionItem: (sectionId: string, itemId: string, direction: 'up' | 'down') => void;
  addSection: (type: SectionType) => void;
  removeSection: (sectionId: string) => void;
  reorderSections: (newOrder: SectionConfig[]) => void;
  updateSectionConfig: (sectionId: string, config: Partial<SectionConfig>) => void;
  updateGlobalStyle: (field: keyof GlobalStyles, value: any) => void;
  setTemplate: (templateId: TemplateId) => void;
}

export const useResumeStore = create<ResumeState>()(
  persist(
    (set) => ({
      resumes: [],
      activeResumeId: null,
      isTextSelected: false,

      createNewResume: () => {
        const id = Math.random().toString(36).substr(2, 9);
        const newResume = createInitialResume(id, 'New Resume');
        set((state) => ({
          resumes: [...state.resumes, newResume],
          activeResumeId: id,
        }));
      },

      deleteResume: (id) => set((state) => ({
        resumes: state.resumes.filter(r => r.id !== id),
        activeResumeId: state.activeResumeId === id ? (state.resumes[0]?.id || null) : state.activeResumeId
      })),

      setActiveResume: (id) => set({ activeResumeId: id }),

      setIsTextSelected: (isSelected) => set({ isTextSelected: isSelected }),

      updatePersonalInfo: (field, value) => set((state) => ({
        resumes: state.resumes.map(r => r.id === state.activeResumeId ? {
          ...r, content: { ...r.content, personalInfo: { ...r.content.personalInfo, [field]: value } }
        } : r)
      })),

      updatePersonalInfoVisibility: (visibility) => set((state) => ({
        resumes: state.resumes.map(r => r.id === state.activeResumeId ? {
          ...r, 
          content: { 
            ...r.content, 
            personalInfo: { 
              ...r.content.personalInfo, 
              visibility: { ...r.content.personalInfo.visibility, ...visibility } 
            } 
          }
        } : r)
      })),

      updateSectionTitle: (sectionId, title) => set((state) => ({
        resumes: state.resumes.map(r => r.id === state.activeResumeId ? {
          ...r,
          content: {
            ...r.content,
            sections: r.content.sections.map(s => s.id === sectionId ? { ...s, title } : s)
          }
        } : r)
      })),

      updateSectionItem: (sectionId, itemId, field, value) => set((state) => ({
        resumes: state.resumes.map(r => r.id === state.activeResumeId ? {
          ...r,
          content: {
            ...r.content,
            sections: r.content.sections.map(s => s.id === sectionId ? {
              ...s,
              items: s.items.map(i => i.id === itemId ? { ...i, [field]: value } : i)
            } : s)
          }
        } : r)
      })),

      updateItemVisibility: (sectionId, itemId, visibility) => set((state) => ({
        resumes: state.resumes.map(r => r.id === state.activeResumeId ? {
          ...r,
          content: {
            ...r.content,
            sections: r.content.sections.map(s => s.id === sectionId ? {
              ...s,
              items: s.items.map(i => i.id === itemId ? {
                ...i,
                visibility: { ...i.visibility, ...visibility }
              } : i)
            } : s)
          }
        } : r)
      })),

      addSectionItem: (sectionId) => set((state) => ({
        resumes: state.resumes.map(r => r.id === state.activeResumeId ? {
          ...r,
          content: {
            ...r.content,
            sections: r.content.sections.map(s => s.id === sectionId ? {
              ...s,
              items: [...s.items, {
                id: Math.random().toString(36).substr(2, 9),
                title: 'New Item',
                subtitle: '',
                description: emptyTextNodes(),
                bullets: [],
                location: '',
                datePeriod: '',
                ...SECTION_SCHEMAS[s.type].defaults,
                visibility: getInitialVisibility(s.type)
              }]
            } : s)
          }
        } : r)
      })),

      removeSectionItem: (sectionId, itemId) => set((state) => ({
        resumes: state.resumes.map(r => {
          if (r.id !== state.activeResumeId) return r;
      
          const newSections = r.content.sections.map(section => {
            if (section.id === sectionId) {
              const newItems = section.items.filter(i => i.id !== itemId);
              return { ...section, items: newItems };
            }
            return section;
          });
      
          return {
            ...r,
            content: {
              ...r.content,
              sections: newSections
            }
          };
        })
      })),

      moveSectionItem: (sectionId, itemId, direction) => set((state) => ({
        resumes: state.resumes.map(r => r.id === state.activeResumeId ? {
          ...r,
          content: {
            ...r.content,
            sections: r.content.sections.map(s => {
              if (s.id !== sectionId) return s;
              const index = s.items.findIndex(i => i.id === itemId);
              if (index === -1) return s;
              
              const newItems = [...s.items];
              const targetIndex = direction === 'up' ? index - 1 : index + 1;
              
              if (targetIndex >= 0 && targetIndex < newItems.length) {
                [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
              }
              
              return { ...s, items: newItems };
            })
          }
        } : r)
      })),

      addSection: (type) => set((state) => {
        const newSectionId = Math.random().toString(36).substr(2, 9);
        
        const initialItem: SectionItem = {
          id: Math.random().toString(36).substr(2, 9),
          title: 'New Item',
          subtitle: '',
          description: emptyTextNodes(),
          bullets: [],
          location: '',
          datePeriod: '',
          ...SECTION_SCHEMAS[type].defaults,
          visibility: getInitialVisibility(type)
        };

        const newSection: Section = {
          id: newSectionId,
          type,
          title: type.toUpperCase(),
          items: [initialItem]
        };
        
        return {
          resumes: state.resumes.map(r => r.id === state.activeResumeId ? {
            ...r, 
            content: { ...r.content, sections: [...r.content.sections, newSection] },
            layouts: Object.keys(r.layouts).reduce((acc, tid) => {
              const templateId = tid as TemplateId;
              acc[templateId] = {
                ...r.layouts[templateId],
                sections: [...r.layouts[templateId].sections, {
                  id: newSectionId,
                  isVisible: true,
                  column: 1
                }]
              };
              return acc;
            }, {} as Record<TemplateId, TemplateLayout>)
          } : r)
        };
      }),

      removeSection: (id) => set((state) => ({
        resumes: state.resumes.map(r => r.id === state.activeResumeId ? {
          ...r, 
          content: { ...r.content, sections: r.content.sections.filter(s => s.id !== id) },
          layouts: Object.keys(r.layouts).reduce((acc, tid) => {
            const templateId = tid as TemplateId;
            acc[templateId] = {
              ...r.layouts[templateId],
              sections: r.layouts[templateId].sections.filter(s => s.id !== id)
            };
            return acc;
          }, {} as Record<TemplateId, TemplateLayout>)
        } : r)
      })),

      reorderSections: (newOrder) => set((state) => ({
        resumes: state.resumes.map(r => r.id === state.activeResumeId ? {
          ...r,
          layouts: {
            ...r.layouts,
            [r.activeTemplateId]: {
              ...r.layouts[r.activeTemplateId],
              sections: newOrder
            }
          }
        } : r)
      })),

      updateSectionConfig: (sectionId, config) => set((state) => ({
        resumes: state.resumes.map(r => r.id === state.activeResumeId ? {
          ...r,
          layouts: {
            ...r.layouts,
            [r.activeTemplateId]: {
              ...r.layouts[r.activeTemplateId],
              sections: r.layouts[r.activeTemplateId].sections.map(s => 
                s.id === sectionId ? { ...s, ...config } : s
              )
            }
          }
        } : r)
      })),

      updateGlobalStyle: (field, value) => set((state) => ({
        resumes: state.resumes.map(r => r.id === state.activeResumeId ? {
          ...r,
          layouts: {
            ...r.layouts,
            [r.activeTemplateId]: {
              ...r.layouts[r.activeTemplateId],
              globalStyles: { ...r.layouts[r.activeTemplateId].globalStyles, [field]: value }
            }
          }
        } : r)
      })),

      setTemplate: (templateId) => set((state) => ({
        resumes: state.resumes.map(r => r.id === state.activeResumeId ? {
          ...r,
          activeTemplateId: templateId
        } : r)
      }))
    }),
    { 
      name: 'resume-storage-v5',
    }
  )
);
