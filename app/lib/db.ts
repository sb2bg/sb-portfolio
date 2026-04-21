import "server-only";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import Database from "better-sqlite3";

const DB_PATH =
  process.env.DB_PATH ?? path.join(process.cwd(), "data", "blog.db");
const IP_HASH_SALT = process.env.IP_HASH_SALT ?? "";

let _db: Database.Database | null = null;

function openDb(): Database.Database {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("synchronous = NORMAL");
  db.pragma("foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS post_stats (
      slug   TEXT PRIMARY KEY,
      views  INTEGER NOT NULL DEFAULT 0,
      likes  INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS likes_ip (
      slug     TEXT NOT NULL,
      ip_hash  TEXT NOT NULL,
      created  INTEGER NOT NULL DEFAULT (strftime('%s','now')),
      PRIMARY KEY (slug, ip_hash)
    );
  `);

  return db;
}

export function db(): Database.Database {
  if (!_db) _db = openDb();
  return _db;
}

export function hashIp(ip: string): string {
  return crypto.createHash("sha256").update(IP_HASH_SALT + ip).digest("hex");
}

export interface Stats {
  views: number;
  likes: number;
}

export function getStats(slug: string): Stats {
  const row = db()
    .prepare("SELECT views, likes FROM post_stats WHERE slug = ?")
    .get(slug) as Stats | undefined;
  return row ?? { views: 0, likes: 0 };
}

export function incrementViews(slug: string): number {
  const stmt = db().prepare(`
    INSERT INTO post_stats (slug, views, likes) VALUES (?, 1, 0)
    ON CONFLICT(slug) DO UPDATE SET views = views + 1
    RETURNING views
  `);
  const row = stmt.get(slug) as { views: number };
  return row.views;
}

export interface LikeResult {
  likes: number;
  alreadyLiked: boolean;
}

export function addLike(slug: string, ipHash: string): LikeResult {
  return db().transaction((): LikeResult => {
    const insert = db()
      .prepare(
        "INSERT OR IGNORE INTO likes_ip (slug, ip_hash) VALUES (?, ?)"
      )
      .run(slug, ipHash);

    if (insert.changes === 0) {
      const current = getStats(slug);
      return { likes: current.likes, alreadyLiked: true };
    }

    const stmt = db().prepare(`
      INSERT INTO post_stats (slug, views, likes) VALUES (?, 0, 1)
      ON CONFLICT(slug) DO UPDATE SET likes = likes + 1
      RETURNING likes
    `);
    const row = stmt.get(slug) as { likes: number };
    return { likes: row.likes, alreadyLiked: false };
  })();
}
