import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
}

export interface Post extends PostMeta {
  html: string;
}

async function listFiles(): Promise<string[]> {
  let entries: string[];
  try {
    entries = await fs.readdir(BLOG_DIR);
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return [];
    }
    throw error;
  }
  return entries.filter((f) => f.endsWith(".md"));
}

function parseFrontmatter(slug: string, raw: string) {
  const { data, content } = matter(raw);
  const title = String(data.title ?? slug);
  const description = String(data.description ?? "");
  const date = String(data.date ?? "");
  return { slug, title, description, date, content };
}

async function renderMarkdown(content: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, {
      behavior: "wrap",
      properties: { className: ["heading-anchor"] },
    })
    .use(rehypePrettyCode, {
      theme: "github-light-default",
      keepBackground: false,
    })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(content);
  return String(file);
}

export async function getAllPosts(): Promise<PostMeta[]> {
  const files = await listFiles();
  const posts = await Promise.all(
    files.map(async (filename) => {
      const slug = filename.replace(/\.md$/, "");
      const raw = await fs.readFile(path.join(BLOG_DIR, filename), "utf-8");
      const { title, description, date } = parseFrontmatter(slug, raw);
      return { slug, title, description, date };
    })
  );
  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const raw = await fs.readFile(path.join(BLOG_DIR, `${slug}.md`), "utf-8");
    const parsed = parseFrontmatter(slug, raw);
    const html = await renderMarkdown(parsed.content);
    return {
      slug: parsed.slug,
      title: parsed.title,
      description: parsed.description,
      date: parsed.date,
      html,
    };
  } catch {
    return null;
  }
}

export async function getAllSlugs(): Promise<string[]> {
  const files = await listFiles();
  return files.map((f) => f.replace(/\.md$/, ""));
}

export function formatDate(date: string): string {
  if (!date) return "";
  const parts = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const d = parts
    ? new Date(Number(parts[1]), Number(parts[2]) - 1, Number(parts[3]))
    : new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
