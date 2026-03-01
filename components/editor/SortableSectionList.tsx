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
import {
  GripVertical,
  Trash2,
  ArrowUp,
  ArrowDown,
  ArrowRightLeft,
} from "lucide-react";
import { useResumeStore } from "@/store/useResumeStore";
import { Section, SectionConfig } from "@/types/resume";

// Individual Sortable Item
const SortableItem = ({
  section,
  config,
  index,
  total,
}: {
  section: Section;
  config: SectionConfig;
  index: number;
  total: number;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const {
    removeSection,
    updateSectionConfig,
    reorderSections,
    resumes,
    activeResumeId,
  } = useResumeStore();

  const toggleColumn = () => {
    const newColumn = (config.column || 1) === 1 ? 2 : 1;
    updateSectionConfig(section.id, { column: newColumn });
  };

  const activeResume = resumes.find((r) => r.id === activeResumeId);
  const sectionConfigs =
    activeResume?.layouts[activeResume.activeTemplateId].sections || [];
  const isTwoColumn =
    activeResume?.layouts[activeResume.activeTemplateId].templateStyles
      .layout === "two-column";

  const moveSection = (direction: number) => {
    const newConfigs = [...sectionConfigs];
    const [item] = newConfigs.splice(index, 1);
    newConfigs.splice(index + direction, 0, item);
    reorderSections(newConfigs);
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
      className="group mb-2 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 transition-all hover:bg-white hover:shadow-sm"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab text-slate-300 transition-colors hover:text-slate-500"
      >
        <GripVertical size={14} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[10px] font-black tracking-wider text-slate-700 uppercase">
          {section.title || section.type}
        </p>
        {isTwoColumn && (
          <span className="text-[8px] font-bold tracking-tighter text-blue-500 uppercase">
            {config.column === 1 ? "Main Content" : "Sidebar"}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1 transition-opacity">
        <button
          onClick={() => moveSection(-1)}
          disabled={index === 0}
          className="p-1 text-slate-400 transition-colors hover:text-blue-600 disabled:opacity-20"
          title="Move Up"
        >
          <ArrowUp size={12} />
        </button>
        <button
          onClick={() => moveSection(1)}
          disabled={index === total - 1}
          className="p-1 text-slate-400 transition-colors hover:text-blue-600 disabled:opacity-20"
          title="Move Down"
        >
          <ArrowDown size={12} />
        </button>
        {isTwoColumn && (
          <button
            onClick={toggleColumn}
            className="p-1 text-slate-400 transition-colors hover:text-blue-600"
            title="Move column"
          >
            <ArrowRightLeft size={12} />
          </button>
        )}
        <button
          onClick={() => {
            if (
              window.confirm(
                `Are you sure you want to delete the "${section.title || section.type}" section?`,
              )
            ) {
              removeSection(section.id);
            }
          }}
          className="p-1 text-slate-400 transition-colors hover:text-red-500"
          title="Delete Section"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
};
export const SortableSectionList = () => {
  const { resumes, activeResumeId, reorderSections } = useResumeStore();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const activeResume = resumes.find((r) => r.id === activeResumeId);

  const handleDragEnd = (event: DragEndEvent) => {
    if (!activeResume) return;
    const { active, over } = event;
    const sectionConfigs =
      activeResume.layouts[activeResume.activeTemplateId].sections;

    if (over && active.id !== over.id) {
      const oldIndex = sectionConfigs.findIndex((s) => s.id === active.id);
      const newIndex = sectionConfigs.findIndex((s) => s.id === over.id);

      const newConfigs = arrayMove(sectionConfigs, oldIndex, newIndex);
      reorderSections(newConfigs);
    }
  };

  if (!activeResume) return null;

  const sections = activeResume.content.sections;
  const layout = activeResume.layouts[activeResume.activeTemplateId];
  const sectionConfigs = layout.sections;

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
        <div className="space-y-1">
          {sectionConfigs.map((config, idx) => {
            const section = sections.find((s) => s.id === config.id);
            if (!section) return null;
            return (
              <SortableItem
                key={section.id}
                section={section}
                config={config}
                index={idx}
                total={sectionConfigs.length}
              />
            );
          })}
        </div>
      </SortableContext>
    </DndContext>
  );
};
