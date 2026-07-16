import "server-only";
import { isIP } from "node:net";
import { headers } from "next/headers";

export async function getClientIp(): Promise<string> {
  const trustedHeader = process.env.TRUSTED_PROXY_HEADER?.trim().toLowerCase();
  if (!trustedHeader) return "unknown";

  const supportedHeaders = new Set([
    "cf-connecting-ip",
    "x-forwarded-for",
    "x-real-ip",
  ]);
  if (!supportedHeaders.has(trustedHeader)) {
    throw new Error(`Unsupported TRUSTED_PROXY_HEADER: ${trustedHeader}`);
  }

  const h = await headers();
  const raw = h.get(trustedHeader);
  if (!raw) return "unknown";

  const ip =
    trustedHeader === "x-forwarded-for" ? raw.split(",")[0]!.trim() : raw.trim();
  return isIP(ip) ? ip : "unknown";
}

const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;

export function isValidSlugFormat(slug: string): boolean {
  return SLUG_RE.test(slug) && slug.length <= 200;
}
