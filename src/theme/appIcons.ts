/**
 * Icon choices shown in Appearance. The selection is saved as a preference. Switching the
 * installed icon needs native alternate-icon config in a development build, which is not wired yet.
 */
export const APP_ICONS = [
  { id: 'classic', label: 'Classic', background: '#1A1917', glyph: '#F7F4EF' },
  { id: 'lavender', label: 'Lavender', background: '#C9BCF7', glyph: '#1A1917' },
  { id: 'peach', label: 'Peach', background: '#FFC6A8', glyph: '#1A1917' },
  { id: 'mint', label: 'Mint', background: '#A8E6CF', glyph: '#1A1917' },
  { id: 'sky', label: 'Sky', background: '#A7D3F5', glyph: '#1A1917' },
] as const;

export type AppIconId = (typeof APP_ICONS)[number]['id'];
