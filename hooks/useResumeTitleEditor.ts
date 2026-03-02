import { useEffect, useRef, useState } from "react";
import { useResumeStore } from "@/store/useResumeStore";

export function useResumeTitleEditor() {
  const renameResume = useResumeStore((state) => state.renameResume);
  const inputRef = useRef<HTMLInputElement>(null);
  const [editingResumeId, setEditingResumeId] = useState<string | null>(null);
  const [tempTitle, setTempTitle] = useState("");

  const startEditing = (resumeId: string, currentTitle: string) => {
    setEditingResumeId(resumeId);
    setTempTitle(currentTitle);
  };

  const stopEditing = () => setEditingResumeId(null);

  const saveTitle = () => {
    if (editingResumeId && tempTitle.trim()) {
      renameResume(editingResumeId, tempTitle.trim());
    }

    setEditingResumeId(null);
  };

  useEffect(() => {
    if (editingResumeId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingResumeId]);

  return {
    inputRef,
    editingResumeId,
    tempTitle,
    setTempTitle,
    startEditing,
    saveTitle,
    stopEditing,
  };
}
