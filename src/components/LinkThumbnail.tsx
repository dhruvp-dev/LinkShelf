import { radii } from '@/theme/tokens';
import { View, Text, StyleSheet, type StyleProp, type ImageStyle } from 'react-native';
import { Image } from 'expo-image';
import { Icon, type IconName } from '@/components/Icon';
import { useTheme } from '@/theme/useTheme';
import { accentFor } from '@/theme/accents';

type Props = {
  thumbnailUrl: string | null;
  faviconUrl: string | null;
  domain: string;
  style?: StyleProp<ImageStyle>;
  iconSize?: number;
};

/** Preview image with a generic colored placeholder when there is no image or it fails to load. */
export function LinkThumbnail({ thumbnailUrl, faviconUrl, domain, style, iconSize = 28 }: Props) {
  const { colors } = useTheme();
  const placeholderColor = accentFor(domain);

  if (!thumbnailUrl) {
    return (
      <View style={[styles.fallback, { backgroundColor: placeholderColor }, style]}>
        {faviconUrl ? (
          <Image source={{ uri: faviconUrl }} style={{ width: iconSize, height: iconSize, borderRadius: radii.md }} />
        ) : (
          <Text style={styles.letter}>{domain.charAt(0).toUpperCase()}</Text>
        )}
      </View>
    );
  }

  return (
    <Image
      source={{ uri: thumbnailUrl }}
      style={[{ backgroundColor: colors.surface }, style]}
      contentFit="cover"
      transition={150}
      cachePolicy="memory-disk"
      recyclingKey={thumbnailUrl}
    />
  );
}

const styles = StyleSheet.create({
  fallback: { alignItems: 'center', justifyContent: 'center' },
  letter: { fontSize: 28, fontFamily: 'PublicSans_700Bold', color: '#1A1917' },
});
