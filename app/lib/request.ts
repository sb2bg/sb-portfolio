import "server-only";
import { headers } from "next/headers";

export async function getClientIp(): Promise<string> {
  const h = await headers();
  const cf = h.get("cf-connecting-ip");
  if (cf) return cf;
  const xff = h.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  const real = h.get("x-real-ip");
  if (real) return real;
  return "unknown";
}

const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;

export function isValidSlugFormat(slug: string): boolean {
  return SLUG_RE.test(slug) && slug.length <= 200;
}
