import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  formatDate,
  getAllSlugs,
  getPostBySlug,
} from "../../lib/blog";
import { PostStats } from "../PostStats";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  return {
    title: `${post.title} — Sullivan Bognar`,
    description: post.description,
  };
}

export default async function BlogPost({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  return (
    <div className="min-h-screen bg-[#f5f0e8] text-[#3d3a35] font-mono">
      <main className="max-w-2xl mx-auto px-6 py-16">
        <Link
          href="/blog"
          className="text-xs uppercase tracking-widest text-[#8a847a] hover:text-[#3d3a35] transition-colors"
        >
          ← Blog
        </Link>

        <header className="mt-6 mb-10 pb-8 border-b border-[#d9d3c7]">
          <h1 className="text-3xl md:text-4xl font-bold text-[#2c2a26] leading-tight mb-3">
            {post.title}
          </h1>
          {post.description && (
            <p className="text-[#5c584e] italic leading-relaxed mb-4">
              {post.description}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-4">
            <time className="text-xs uppercase tracking-widest text-[#8a847a]">
              {formatDate(post.date)}
            </time>
            <span className="text-[#c8c1b3] text-xs">·</span>
            <PostStats slug={post.slug} />
          </div>
        </header>

        <article
          className="prose-blog"
          dangerouslySetInnerHTML={{ __html: post.html }}
        />

        <footer className="mt-16 pt-8 border-t border-[#d9d3c7] text-sm text-[#8a847a]">
          <Link href="/blog" className="hover:text-[#3d3a35] transition-colors">
            ← More posts
          </Link>
        </footer>
      </main>
    </div>
  );
}
