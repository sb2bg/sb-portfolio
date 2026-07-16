import { NextResponse } from "next/server";
import { getAllSlugs } from "../../../lib/blog";
import {
  consumeRateLimit,
  getStats,
  hashIp,
  incrementViews,
} from "../../../lib/db";
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

  const ipHash = hashIp(await getClientIp());
  const rateLimit = consumeRateLimit(`views:${ipHash}`, 30, 60);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "rate limit exceeded" },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfter) },
      },
    );
  }

  const views = incrementViews(slug);
  const { likes } = getStats(slug);
  return NextResponse.json({ views, likes });
}
