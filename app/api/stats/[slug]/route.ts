import { NextResponse } from "next/server";
import { getAllSlugs } from "../../../lib/blog";
import { getStats } from "../../../lib/db";
import { isValidSlugFormat } from "../../../lib/request";

export const dynamic = "force-dynamic";

interface Ctx {
  params: Promise<{ slug: string }>;
}

export async function GET(_req: Request, { params }: Ctx) {
  const { slug } = await params;
  if (!isValidSlugFormat(slug)) {
    return NextResponse.json({ error: "invalid slug" }, { status: 400 });
  }
  const known = await getAllSlugs();
  if (!known.includes(slug)) {
    return NextResponse.json({ error: "unknown slug" }, { status: 404 });
  }
  return NextResponse.json(getStats(slug));
}
