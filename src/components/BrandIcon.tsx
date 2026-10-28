import IconBrandGoogle from '@tabler/icons-react-native/IconBrandGoogle';
import IconBrandInstagram from '@tabler/icons-react-native/IconBrandInstagram';
import IconBrandYoutube from '@tabler/icons-react-native/IconBrandYoutube';
import IconWorld from '@tabler/icons-react-native/IconWorld';
import { useTheme } from '@/theme/useTheme';

export type Brand = 'youtube' | 'instagram' | 'google' | 'web';

/** Official brand marks from Tabler for the platforms LinkShelf recognises. Unknown sites get a globe. */
export function BrandIcon({ brand, size = 16 }: { brand: Brand; size?: number }) {
  const { colors } = useTheme();
  if (brand === 'youtube') return <IconBrandYoutube size={size} color="#FF0000" strokeWidth={1.8} />;
  if (brand === 'instagram') return <IconBrandInstagram size={size} color="#E1306C" strokeWidth={1.8} />;
  if (brand === 'google') return <IconBrandGoogle size={size} color="#4285F4" strokeWidth={1.8} />;
  return <IconWorld size={size} color={colors.muted} strokeWidth={1.8} />;
}
