import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ArrowRight, Zap, Layers, Cpu, Globe } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "1PageMe | Fast & Professional Resume Builder",
  description:
    "Create a stunning resume in minutes. Intelligent layout formatting and AI-powered imports designed to get you hired.",
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-24 md:pt-48 md:pb-40">
        {/* Background Gradients */}
        <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-blue-50/50 opacity-60 blur-3xl" />

        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center text-center">
            <div className="animate-fade-in mb-6 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-[10px] font-black tracking-[0.2em] text-blue-600 uppercase">
              <Zap size={14} className="animate-pulse" /> The Future of Resumes
            </div>
            <h1 className="mb-8 max-w-4xl text-5xl font-black tracking-tighter text-slate-900 md:text-7xl lg:text-8xl">
              Build your next <span className="text-blue-600">resume</span> in
              minutes.
            </h1>
            <p className="mb-12 max-w-2xl text-lg font-medium text-slate-500 md:text-xl">
              Forget complex formatting. Our intelligent editor handles the
              design so you can focus on your story. Ready to land your dream
              job?
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <Link
                href="/app"
                className="group flex items-center gap-3 rounded-2xl bg-blue-600 px-10 py-5 text-sm font-black tracking-[0.1em] text-white uppercase shadow-2xl shadow-blue-200 transition-all hover:bg-blue-700 hover:shadow-blue-300 active:scale-95"
              >
                Start Building Free{" "}
                <ArrowRight
                  size={18}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
              <Link
                href="/blog"
                className="rounded-2xl border border-slate-200 bg-white px-10 py-5 text-sm font-black tracking-[0.1em] text-slate-600 uppercase transition-all hover:border-blue-600 hover:text-blue-600"
              >
                Read our Blog
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-slate-50 py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-20 text-center">
            <h2 className="mb-4 text-4xl font-black tracking-tight text-slate-900 md:text-5xl">
              Everything you need to{" "}
              <span className="text-blue-600">stand out</span>.
            </h2>
            <p className="mx-auto max-w-2xl text-lg font-medium text-slate-500">
              Designed for modern professionals who value speed, simplicity, and
              high-impact design.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: <Layers className="text-blue-600" size={32} />,
                title: "Precision Layouts",
                description:
                  "Optimized templates that ensure your resume fits perfectly on a single page, every single time.",
              },
              {
                icon: <Cpu className="text-blue-600" size={32} />,
                title: "AI-Powered Import",
                description:
                  "Import your existing details and let our system intelligently structure your professional history.",
              },
              {
                icon: <Globe className="text-blue-600" size={32} />,
                title: "Global Reach",
                description:
                  "Modern fonts and styles that are recognized and loved by recruiters worldwide across all industries.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group flex flex-col rounded-3xl border border-slate-100 bg-white p-10 shadow-sm transition-all hover:shadow-xl hover:shadow-blue-500/5"
              >
                <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50/50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                  {feature.icon}
                </div>
                <h3 className="mb-4 text-2xl font-black tracking-tight text-slate-900">
                  {feature.title}
                </h3>
                <p className="text-base leading-relaxed font-medium text-slate-500">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Preview CTA */}
      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="relative overflow-hidden rounded-[3rem] bg-slate-900 px-8 py-20 text-center text-white md:px-16 md:py-32">
            <div className="absolute top-0 left-0 h-full w-full bg-[radial-gradient(circle_at_30%_20%,#1d4ed8_0%,transparent_50%)] opacity-20" />
            <div className="relative z-10 mx-auto max-w-3xl">
              <h2 className="mb-8 text-4xl font-black tracking-tight md:text-6xl">
                Career advice that actually works.
              </h2>
              <p className="mb-12 text-lg font-medium text-slate-400 md:text-xl">
                Learn how to write high-converting resumes, ace your interviews,
                and navigate the modern job market with our curated insights.
              </p>
              <Link
                href="/blog"
                className="inline-flex items-center gap-3 rounded-2xl bg-white px-10 py-5 text-sm font-black tracking-[0.1em] text-slate-900 uppercase transition-all hover:bg-slate-100 active:scale-95"
              >
                Visit the Blog <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
