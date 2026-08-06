import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  formatDate,
  getAllSlugs,
  getPostBySlug,
} from "../../lib/blog";
import { PostStats } from "../PostStats";
import { ReadingProgress } from "../ReadingProgress";

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
    <div className="min-h-screen bg-[#f7f2e9] text-[#292621]">
      <ReadingProgress />
      <main className="mx-auto max-w-3xl px-6 py-12 md:px-10 md:py-16 lg:py-20">
        <Link
          href="/blog"
          className="font-mono text-xs uppercase tracking-[0.18em] text-[#8a7f70] transition-colors hover:text-[#a64b32]"
        >
          ← Blog
        </Link>

        <header className="mt-8 mb-12 border-b border-[#d8cfbf] pb-0 md:mt-10">
          <h1 className="font-mono text-3xl font-bold leading-[1.12] tracking-[-0.04em] text-[#292621] sm:text-4xl">
            {post.title}
          </h1>
          {post.description && (
            <p className="mt-4 font-sans text-base leading-7 text-[#625b50] md:text-lg">
              {post.description}
            </p>
          )}
          <div className="mt-6 flex flex-col gap-4 border-t border-[#e3dbce] py-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-xs uppercase tracking-[0.13em] text-[#8a7f70]">
              <time>{formatDate(post.date)}</time>
              <span className="text-[#c6bbaa]">·</span>
              <span>{post.readingMinutes} min read</span>
              {post.projectUrl && (
                <>
                  <span className="text-[#c6bbaa]">·</span>
                  <a
                    href={post.projectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-medium tracking-[0.08em] text-[#8a5a49] no-underline transition-colors hover:text-[#7f3522]"
                  >
                    <span>{post.projectLabel ?? "View project"}</span>
                    <span
                      aria-hidden="true"
                      className="text-xs opacity-70"
                    >
                      ↗
                    </span>
                  </a>
                </>
              )}
            </div>
            <PostStats slug={post.slug} />
          </div>
        </header>

        <div className="min-w-0">
          <article
            className="prose-blog"
            dangerouslySetInnerHTML={{ __html: post.html }}
          />

          <footer className="mt-16 border-t border-[#d8cfbf] pt-8 font-mono text-sm text-[#8a7f70]">
            <Link
              href="/blog"
              className="transition-colors hover:text-[#a64b32]"
            >
              ← More posts
            </Link>
          </footer>
        </div>
      </main>
    </div>
  );
}
