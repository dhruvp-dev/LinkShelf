import { Chrome, Globe, Instagram, PlayCircle } from 'reicon-react-native';
import { useTheme } from '@/theme/useTheme';

export type Brand = 'youtube' | 'instagram' | 'google' | 'web';

/** Brand marks from Reicon for recognized platforms. Unknown sites get a globe. */
export function BrandIcon({ brand, size = 16 }: { brand: Brand; size?: number }) {
  const { colors } = useTheme();
  if (brand === 'youtube') return <PlayCircle size={size} color="#FF0000" weight="Filled" />;
  if (brand === 'instagram') return <Instagram size={size} color="#E1306C" weight="Filled" />;
  if (brand === 'google') return <Chrome size={size} color="#4285F4" weight="Filled" />;
  return <Globe size={size} color={colors.muted} weight="Filled" />;
}
