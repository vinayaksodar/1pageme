import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BLOG_POSTS } from "@/lib/blog";
import { Calendar, User, ArrowRight } from "lucide-react";

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="pt-32 pb-24 md:pt-40 md:pb-40">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <h1 className="mb-6 text-5xl font-black tracking-tighter text-slate-900 md:text-7xl">
              The <span className="text-blue-600">Career</span> Blog.
            </h1>
            <p className="mx-auto max-w-2xl text-lg font-medium text-slate-500">
              Expert insights on resume writing, career growth, and landing your
              dream job in the modern market.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
            {BLOG_POSTS.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex flex-col overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white shadow-sm transition-all hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-500/5"
              >
                <div className="flex flex-1 flex-col p-10 md:p-12">
                  <div className="mb-6 flex items-center gap-6 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">
                    <span className="flex items-center gap-2">
                      <Calendar size={12} className="text-blue-600" />{" "}
                      {post.date}
                    </span>
                    <span className="flex items-center gap-2">
                      <User size={12} className="text-blue-600" /> {post.author}
                    </span>
                  </div>
                  <h2 className="mb-6 text-3xl font-black tracking-tight text-slate-900 transition-colors group-hover:text-blue-600 md:text-4xl">
                    {post.title}
                  </h2>
                  <p className="mb-10 text-lg leading-relaxed font-medium text-slate-500">
                    {post.excerpt}
                  </p>
                  <div className="mt-auto flex items-center gap-3 text-sm font-black tracking-widest text-blue-600 uppercase">
                    Read Post{" "}
                    <ArrowRight
                      size={18}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
