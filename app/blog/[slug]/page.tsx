import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BLOG_POSTS } from "@/lib/blog";
import { Calendar, User, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  if (!post) return { title: "Post Not Found" };

  return {
    title: `${post.title} | 1PageMe Blog`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="pt-32 pb-24 md:pt-40 md:pb-40">
        <div className="mx-auto max-w-4xl px-6">
          <Link
            href="/blog"
            className="mb-12 inline-flex items-center gap-2 text-sm font-black tracking-widest text-slate-400 uppercase transition hover:text-blue-600"
          >
            <ArrowLeft size={16} /> Back to Blog
          </Link>

          <article>
            <div className="mb-12">
              <div className="mb-6 flex items-center gap-6 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">
                <span className="flex items-center gap-2">
                  <Calendar size={12} className="text-blue-600" /> {post.date}
                </span>
                <span className="flex items-center gap-2">
                  <User size={12} className="text-blue-600" /> {post.author}
                </span>
              </div>
              <h1 className="mb-8 text-4xl font-black tracking-tighter text-slate-900 md:text-6xl lg:text-7xl">
                {post.title}
              </h1>
              <p className="border-l-4 border-blue-600 pl-6 text-xl leading-relaxed font-medium text-slate-500 italic">
                {post.excerpt}
              </p>
            </div>

            <div
              className="prose prose-slate prose-lg prose-headings:font-black prose-headings:tracking-tight prose-headings:text-slate-900 prose-p:font-medium prose-p:leading-loose prose-p:text-slate-600 prose-li:font-medium prose-li:text-slate-600 prose-strong:text-slate-900 prose-strong:font-black max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
}
