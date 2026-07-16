"use client";

import { useEffect, useState } from "react";

interface Props {
  slug: string;
}

interface Stats {
  views: number;
  likes: number;
}

const likedKey = (slug: string) => `liked:${slug}`;
const viewedKey = (slug: string) => `viewed:${slug}`;

export function PostStats({ slug }: Props) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [liked, setLiked] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setLiked(localStorage.getItem(likedKey(slug)) === "1");

    let cancelled = false;

    async function load() {
      const alreadyViewed = sessionStorage.getItem(viewedKey(slug)) === "1";
      try {
        const res = alreadyViewed
          ? await fetch(`/api/stats/${slug}`, { cache: "no-store" })
          : await fetch(`/api/views/${slug}`, {
              method: "POST",
              cache: "no-store",
            });
        if (!res.ok) return;
        const data = (await res.json()) as Stats;
        if (!cancelled) {
          setStats(data);
          if (!alreadyViewed) sessionStorage.setItem(viewedKey(slug), "1");
        }
      } catch {
        /* ignore */
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  async function onLike() {
    if (liked || pending) return;
    setPending(true);

    const prev = stats;
    setStats((s) => (s ? { ...s, likes: s.likes + 1 } : s));
    setLiked(true);

    try {
      const res = await fetch(`/api/likes/${slug}`, {
        method: "POST",
        cache: "no-store",
      });
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as Stats & { alreadyLiked: boolean };
      setStats({ views: data.views, likes: data.likes });
      localStorage.setItem(likedKey(slug), "1");
    } catch {
      setStats(prev);
      setLiked(false);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex items-center gap-3 font-mono text-[0.7rem] text-[#968c7d]">
      <span aria-live="polite">
        {stats ? stats.views.toLocaleString() : "—"} view
        {stats?.views === 1 ? "" : "s"}
      </span>
      <span className="text-[#c6bbaa]">·</span>
      <button
        type="button"
        onClick={onLike}
        disabled={liked || pending || !stats}
        aria-pressed={liked}
        aria-label={liked ? "Unlike post" : "Like post"}
        className={`inline-flex items-center gap-1.5 rounded px-2 py-1 transition-colors ${
          liked
            ? "text-[#a64b32] cursor-default"
            : "hover:text-[#a64b32] hover:bg-[#eee6d8] cursor-pointer"
        } disabled:cursor-default`}
      >
        <Heart filled={liked} />
        <span>{stats ? stats.likes.toLocaleString() : "—"}</span>
      </button>
    </div>
  );
}

function Heart({ filled }: { filled: boolean }) {
  return (
    <svg
      aria-hidden="true"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
