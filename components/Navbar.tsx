"use client";

import Link from "next/link";
import { Logo } from "./ui/Logo";
import { useResumeStore } from "@/store/useResumeStore";

export const Navbar = () => {
  const { currentUser } = useResumeStore();

  return (
    <nav className="fixed top-0 right-0 left-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="transition-opacity hover:opacity-90">
          <Logo />
        </Link>
        <div className="flex items-center gap-8">
          <Link
            href="/blog"
            className="text-sm font-semibold text-slate-600 transition hover:text-blue-600"
          >
            Blog
          </Link>
          <Link
            href={currentUser ? "/app" : "/app"}
            className="rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-black tracking-widest text-white uppercase shadow-lg shadow-blue-100 transition hover:bg-blue-700 active:scale-95"
          >
            {currentUser ? "Go to Dashboard" : "Get Started"}
          </Link>
        </div>
      </div>
    </nav>
  );
};
