/** Soft pastel accents from the design brief: lavender, peach, mint, sky. */
export const ACCENTS = ['#C9BCF7', '#FFC6A8', '#A8E6CF', '#A7D3F5'];

/** A domain always maps to the same accent, so placeholders stay stable between renders. */
export function accentFor(key: string): string {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) | 0;
  return ACCENTS[Math.abs(hash) % ACCENTS.length];
}
