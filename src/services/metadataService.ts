import type { SQLiteDatabase } from 'expo-sqlite';
import { domainOf, isYouTube } from '@/utils/url';

export type LinkMetadata = {
  title: string | null;
  description: string | null;
  siteName: string | null;
  thumbnailUrl: string | null;
  faviconUrl: string | null;
};

const TIMEOUT_MS = 8000;
const MAX_BYTES = 512 * 1024;
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const USER_AGENT =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148';

function decodeEntities(value: string): string {
  const named: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", '#39': "'" };
  return value
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z#0-9]+);/gi, (match, code: string) => {
      if (code[0] === '#') {
        const n = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
        return Number.isFinite(n) ? String.fromCodePoint(n) : match;
      }
      return named[code.toLowerCase()] ?? match;
    })
    .trim();
}

function resolveUrl(value: string | undefined, base: string): string | null {
  if (!value) return null;
  try {
    return new URL(value.trim(), base).toString();
  } catch {
    return null;
  }
}

function attr(tag: string, name: string): string | undefined {
  const m = tag.match(new RegExp(`\\b${name}\\s*=\\s*["']([^"']*)["']`, 'i'));
  return m ? decodeEntities(m[1]) : undefined;
}

/** Parses Open Graph, Twitter Card and standard HTML metadata out of an HTML document. */
export function parseHtmlMetadata(html: string, pageUrl: string): LinkMetadata {
  const metaTags = html.match(/<meta\b[^>]*>/gi) ?? [];
  const meta = new Map<string, string>();
  for (const tag of metaTags) {
    const key = (attr(tag, 'property') ?? attr(tag, 'name') ?? '').toLowerCase();
    const content = attr(tag, 'content');
    if (key && content && !meta.has(key)) meta.set(key, content);
  }
  const pick = (...keys: string[]) => keys.map((k) => meta.get(k)).find((v) => v && v.length > 0) ?? null;

  const titleTag = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const iconTag = (html.match(/<link\b[^>]*rel\s*=\s*["'][^"']*icon[^"']*["'][^>]*>/gi) ?? [])[0];

  const hostname = domainOf(pageUrl);
  return {
    title: pick('og:title', 'twitter:title') ?? (titleTag ? decodeEntities(titleTag[1]) : null),
    description: pick('og:description', 'twitter:description', 'description'),
    siteName: pick('og:site_name', 'application-name') ?? hostname,
    thumbnailUrl: resolveUrl(pick('og:image', 'og:image:url', 'twitter:image', 'twitter:image:src') ?? undefined, pageUrl),
    faviconUrl:
      resolveUrl(iconTag ? attr(iconTag, 'href') : undefined, pageUrl) ??
      `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`,
  };
}

async function fetchWithTimeout(url: string, init: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal, headers: { 'User-Agent': USER_AGENT, ...init.headers } });
  } finally {
    clearTimeout(timer);
  }
}

async function fetchYouTube(url: string): Promise<LinkMetadata | null> {
  const res = await fetchWithTimeout(
    `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`,
  );
  if (!res.ok) return null;
  const data = (await res.json()) as { title?: string; author_name?: string; thumbnail_url?: string };
  return {
    title: data.title ?? null,
    description: data.author_name ? `By ${data.author_name}` : null,
    siteName: 'YouTube',
    thumbnailUrl: data.thumbnail_url ?? null,
    faviconUrl: 'https://www.google.com/s2/favicons?domain=youtube.com&sz=128',
  };
}

async function fetchHtml(url: string): Promise<LinkMetadata | null> {
  const res = await fetchWithTimeout(url, { headers: { Accept: 'text/html,application/xhtml+xml' } });
  if (!res.ok) return null;
  const text = await res.text();
  return parseHtmlMetadata(text.slice(0, MAX_BYTES), res.url || url);
}

/**
 * Fetches metadata for a URL. Returns null on any failure so callers can fall back to the
 * domain; successful results are cached in SQLite for a week. Never throws.
 */
export async function fetchMetadata(db: SQLiteDatabase, url: string): Promise<LinkMetadata | null> {
  try {
    const cached = await db.getFirstAsync<{ json: string; fetched_at: number }>(
      'SELECT json, fetched_at FROM metadata_cache WHERE url = ?',
      [url],
    );
    if (cached && Date.now() - cached.fetched_at < CACHE_TTL_MS) {
      return JSON.parse(cached.json) as LinkMetadata;
    }

    const metadata = isYouTube(url) ? await fetchYouTube(url) : await fetchHtml(url);
    if (!metadata) return null;

    await db.runAsync(
      'INSERT OR REPLACE INTO metadata_cache (url, json, fetched_at) VALUES (?, ?, ?)',
      [url, JSON.stringify(metadata), Date.now()],
    );
    return metadata;
  } catch {
    return null;
  }
}
