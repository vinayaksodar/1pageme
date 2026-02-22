'use client'

import React from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2, Columns } from 'lucide-react'
import { useResumeStore } from '@/store/useResumeStore'
import { cn } from '@/lib/utils'
import { Section, SectionConfig } from '@/types/resume'

// Individual Sortable Item
const SortableItem = ({
  section,
  config,
}: {
  section: Section
  config: SectionConfig
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id })

  const { removeSection, updateSectionConfig } = useResumeStore()

  const toggleColumn = () => {
    const newColumn = (config.column || 1) === 1 ? 2 : 1
    updateSectionConfig(section.id, { column: newColumn })
  }

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 'auto',
    opacity: isDragging ? 0.8 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group mb-2 flex items-center gap-3 rounded-xl border-2 border-gray-50 bg-white p-3 shadow-sm transition-all hover:border-blue-100"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab text-gray-300 transition-colors hover:text-gray-600"
      >
        <GripVertical size={16} />
      </div>

      <div className="flex flex-1 flex-col">
        <span className="text-xs font-bold text-gray-800 capitalize">
          {section.title || section.type}
        </span>
        <span className="text-[10px] font-bold tracking-tight text-gray-400 uppercase">
          Column {config.column || 1}
        </span>
      </div>

      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={toggleColumn}
          className={cn(
            'rounded-lg p-1.5 transition-colors',
            config.column === 2
              ? 'bg-blue-50 text-blue-600'
              : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600',
          )}
          title="Switch Column"
        >
          <Columns size={14} />
        </button>
        <button
          onClick={() => removeSection(section.id)}
          className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
          title="Remove Section"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}
export const SortableSectionList = () => {
  const { resumes, activeResumeId, reorderSections } = useResumeStore()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const activeResume = resumes.find((r) => r.id === activeResumeId)

  const handleDragEnd = (event: DragEndEvent) => {
    if (!activeResume) return
    const { active, over } = event
    const sectionConfigs =
      activeResume.layouts[activeResume.activeTemplateId].sections

    if (over && active.id !== over.id) {
      const oldIndex = sectionConfigs.findIndex((s) => s.id === active.id)
      const newIndex = sectionConfigs.findIndex((s) => s.id === over.id)

      const newConfigs = arrayMove(sectionConfigs, oldIndex, newIndex)
      reorderSections(newConfigs)
    }
  }

  if (!activeResume) return null

  const sections = activeResume.content.sections
  const layout = activeResume.layouts[activeResume.activeTemplateId]
  const sectionConfigs = layout.sections

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={sectionConfigs.map((s) => s.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="p-1">
          {sectionConfigs.map((config) => {
            const section = sections.find((s) => s.id === config.id)
            if (!section) return null
            return (
              <SortableItem
                key={section.id}
                section={section}
                config={config}
              />
            )
          })}
        </div>
      </SortableContext>
    </DndContext>
  )
}
