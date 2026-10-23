import { fs } from './responsive';
/** B2B SaaS palette: slate neutrals with a single indigo accent. */
export const colors = {
  light: {
    background: '#f4f4f5',
    card: '#ffffff',
    surface: '#fafafa',
    text: '#09090b',
    muted: '#52525b',
    border: '#ececee',
    danger: '#b91c1c',
    accent: '#09090b',
    accentText: '#ffffff',
    fab: '#09090b',
    fabIcon: '#ffffff',
  },
  dark: {
    background: '#09090b',
    card: '#18181b',
    surface: '#27272a',
    text: '#fafafa',
    muted: '#a1a1aa',
    border: 'rgba(255,255,255,0.1)',
    danger: '#f87171',
    accent: '#fafafa',
    accentText: '#09090b',
    fab: '#fafafa',
    fabIcon: '#09090b',
  },
} as const;

export type ThemeColors = { [K in keyof typeof colors.light]: string };

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const radii = { sm: 12, md: 14, lg: 36, pill: 10000 } as const;

const FONT = {
  light: 'PublicSans_300Light',
  regular: 'PublicSans_400Regular',
  medium: 'PublicSans_500Medium',
  semibold: 'PublicSans_600SemiBold',
  bold: 'PublicSans_700Bold',
};

export const typography = {
  display: { fontSize: fs(30), fontFamily: FONT.semibold, lineHeight: fs(36), letterSpacing: -0.4 },
  title: { fontSize: fs(24), fontFamily: FONT.semibold, lineHeight: fs(30), letterSpacing: -0.2 },
  section: { fontSize: fs(17), fontFamily: FONT.semibold, lineHeight: fs(23), letterSpacing: -0.1 },
  linkTitle: { fontSize: fs(15), fontFamily: FONT.semibold, lineHeight: fs(20), letterSpacing: 0 },
  body: { fontSize: fs(14), fontFamily: FONT.regular, lineHeight: fs(21), letterSpacing: 0 },
  meta: { fontSize: fs(12), fontFamily: FONT.regular, lineHeight: fs(16), letterSpacing: 0 },
  eyebrow: { fontSize: 11, fontFamily: FONT.semibold, lineHeight: 14, letterSpacing: 0.6, textTransform: 'uppercase' as const },
};
