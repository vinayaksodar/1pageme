"use client";

import EditorLayout from "@/components/editor/EditorLayout";
import Dashboard from "@/components/Dashboard";
import { useResumeStore } from "@/store/useResumeStore";
import { useEffect, useState } from "react";

export default function Home() {
  const { activeResumeId, initializeServerSync } = useResumeStore();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    void initializeServerSync();

    const onFocus = () => {
      void initializeServerSync();
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);

    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [mounted, initializeServerSync]);

  if (!mounted) {
    return (
      <main className="h-screen w-screen overflow-hidden bg-slate-50">
        <div className="flex h-full items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
        </div>
      </main>
    );
  }

  return (
    <main className="h-screen w-screen overflow-hidden">
      {activeResumeId ? <EditorLayout /> : <Dashboard />}
    </main>
  );
}
