import Link from "next/link";
import type { Metadata } from "next";
import { formatDate, getAllPosts } from "../lib/blog";

export const metadata: Metadata = {
  title: "Blog — Sullivan Bognar",
  description: "Writing on systems, security, and programming languages.",
};

export default async function BlogIndex() {
  const posts = await getAllPosts();

  return (
    <div className="min-h-screen bg-[#f5f0e8] text-[#3d3a35] font-mono">
      <main className="max-w-2xl mx-auto px-6 py-16">
        <header className="mb-12">
          <Link
            href="/"
            className="text-xs uppercase tracking-widest text-[#8a847a] hover:text-[#3d3a35] transition-colors"
          >
            ← Sullivan Bognar
          </Link>
          <h1 className="text-4xl font-bold text-[#2c2a26] mt-4 mb-2">Blog</h1>
          <p className="text-[#5c584e]">
            Writing on systems, security, and programming languages.
          </p>
        </header>

        {posts.length === 0 ? (
          <p className="text-[#7a756a]">No posts yet.</p>
        ) : (
          <ul className="space-y-8">
            {posts.map((post) => (
              <li key={post.slug}>
                <Link href={`/blog/${post.slug}`} className="group block">
                  <div className="flex items-baseline justify-between gap-4 mb-1">
                    <h2 className="font-semibold text-[#2c2a26] group-hover:text-[#6b5b4d] underline underline-offset-4 decoration-transparent group-hover:decoration-[#6b5b4d] transition-colors">
                      {post.title}
                    </h2>
                    <time className="text-xs text-[#8a847a] shrink-0">
                      {formatDate(post.date)}
                    </time>
                  </div>
                  <p className="text-sm text-[#6b655a] leading-relaxed">
                    {post.description}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
