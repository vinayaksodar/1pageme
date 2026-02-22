"use client";

import EditorLayout from "@/components/editor/EditorLayout";
import Dashboard from "@/components/Dashboard";
import { useResumeStore } from "@/store/useResumeStore";
import { useEffect, useState } from "react";

export default function Home() {
  const { activeResumeId } = useResumeStore();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <main className="h-screen w-screen overflow-hidden">
      {activeResumeId ? <EditorLayout /> : <Dashboard />}
    </main>
  );
}
