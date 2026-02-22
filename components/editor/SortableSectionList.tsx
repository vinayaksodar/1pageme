"use client";

import React from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Eye, EyeOff, Trash2, Columns } from "lucide-react";
import { useResumeStore } from "@/store/useResumeStore";
import { cn, structuredTextToString } from "@/lib/utils";

// Individual Sortable Item
const SortableItem = ({ section, config }: { section: any; config: any }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const { removeSection, updateSectionConfig } = useResumeStore();

  const toggleColumn = () => {
    const newColumn = (config.column || 1) === 1 ? 2 : 1;
    updateSectionConfig(section.id, { column: newColumn });
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : "auto",
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 bg-white p-3 rounded-xl border-2 border-gray-50 shadow-sm mb-2 group transition-all hover:border-blue-100"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab text-gray-300 hover:text-gray-600 transition-colors"
      >
        <GripVertical size={16} />
      </div>

      <div className="flex-1 flex flex-col">
        <span className="font-bold text-xs text-gray-800 capitalize">
          {structuredTextToString(section.title) || section.type}
        </span>
        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
          Column {config.column || 1}
        </span>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={toggleColumn}
          className={cn(
            "p-1.5 rounded-lg transition-colors",
            config.column === 2
              ? "bg-blue-50 text-blue-600"
              : "text-gray-400 hover:bg-gray-50 hover:text-gray-600",
          )}
          title="Switch Column"
        >
          <Columns size={14} />
        </button>
        <button
          onClick={() => removeSection(section.id)}
          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          title="Remove Section"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

export const SortableSectionList = () => {
  const { resumes, activeResumeId, reorderSections } = useResumeStore();

  const activeResume = resumes.find((r) => r.id === activeResumeId);
  if (!activeResume) return null;
  const sections = activeResume.content.sections;
  const layout = activeResume.layouts[activeResume.activeTemplateId];
  const sectionConfigs = layout.sections;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sectionConfigs.findIndex((s: any) => s.id === active.id);
      const newIndex = sectionConfigs.findIndex((s: any) => s.id === over.id);

      const newConfigs = arrayMove(sectionConfigs, oldIndex, newIndex);
      reorderSections(newConfigs);
    }
  };

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
            const section = sections.find((s) => s.id === config.id);
            if (!section) return null;
            return (
              <SortableItem
                key={section.id}
                section={section}
                config={config}
              />
            );
          })}
        </div>
      </SortableContext>
    </DndContext>
  );
};
