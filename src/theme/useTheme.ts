import { useSettings } from '@/hooks/useSettings';
import { colors, type ThemeColors } from './tokens';

export function useTheme(): { colors: ThemeColors; scheme: 'light' | 'dark' } {
  const { resolvedScheme } = useSettings();
  return { colors: colors[resolvedScheme], scheme: resolvedScheme };
}
