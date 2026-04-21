import { NextResponse } from "next/server";
import { getAllSlugs } from "../../../lib/blog";
import { addLike, getStats, hashIp } from "../../../lib/db";
import { getClientIp, isValidSlugFormat } from "../../../lib/request";

export const dynamic = "force-dynamic";

interface Ctx {
  params: Promise<{ slug: string }>;
}

export async function POST(_req: Request, { params }: Ctx) {
  const { slug } = await params;
  if (!isValidSlugFormat(slug)) {
    return NextResponse.json({ error: "invalid slug" }, { status: 400 });
  }
  const known = await getAllSlugs();
  if (!known.includes(slug)) {
    return NextResponse.json({ error: "unknown slug" }, { status: 404 });
  }

  const ip = await getClientIp();
  const { likes, alreadyLiked } = addLike(slug, hashIp(ip));
  const { views } = getStats(slug);
  return NextResponse.json({ views, likes, alreadyLiked });
}
