import Link from "next/link";
import { Logo } from "./ui/Logo";

export const Footer = () => {
  return (
    <footer className="border-t border-slate-100 bg-white py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row md:gap-0">
          <div className="flex flex-col items-center gap-4 md:items-start">
            <Logo />
            <p className="max-w-[240px] text-center text-sm font-medium text-slate-400 md:text-left">
              The fastest way to build a professional, recruiter-approved
              resume.
            </p>
          </div>
          <div className="flex gap-12 text-sm font-semibold text-slate-600">
            <Link href="/" className="transition hover:text-blue-600">
              Home
            </Link>
            <Link href="/blog" className="transition hover:text-blue-600">
              Blog
            </Link>
            <Link href="/app" className="transition hover:text-blue-600">
              App
            </Link>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-6 border-t border-slate-50 pt-8 text-xs font-bold tracking-widest text-slate-300 uppercase md:flex-row md:gap-0">
          <p>© 2026 1PAGEME. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-8">
            <a href="#" className="transition hover:text-blue-600">
              Twitter
            </a>
            <a href="#" className="transition hover:text-blue-600">
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
