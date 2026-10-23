export type UrlResult = { ok: true; url: string } | { ok: false; error: string };

const SCHEME_RE = /^[a-z][a-z0-9+.-]*:/i;

/**
 * Accepts http(s) URLs. Bare domains like "example.com/page" get https:// added.
 * Anything else is rejected with a message the UI can show directly.
 */
export function normalizeUrl(input: string): UrlResult {
  const trimmed = input.trim();
  if (!trimmed) return { ok: false, error: 'Enter a link to save.' };

  const candidate = SCHEME_RE.test(trimmed) ? trimmed : `https://${trimmed}`;
  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    return { ok: false, error: "That doesn't look like a valid link." };
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { ok: false, error: 'Only http and https links can be saved.' };
  }
  if (!parsed.hostname.includes('.') && parsed.hostname !== 'localhost') {
    return { ok: false, error: "That doesn't look like a valid link." };
  }
  return { ok: true, url: parsed.toString() };
}

export function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/** Pulls the first http(s) URL out of free text (e.g. a shared sentence). */
export function extractUrl(text: string | null | undefined): string | null {
  if (!text) return null;
  const match = text.match(/https?:\/\/[^\s]+/i);
  if (!match) return null;
  const result = normalizeUrl(match[0]);
  return result.ok ? result.url : null;
}

export function isYouTube(url: string): boolean {
  const host = domainOf(url);
  return host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtu.be';
}
