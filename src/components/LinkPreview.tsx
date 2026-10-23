import { ActivityIndicator, Text, View, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/theme/useTheme';
import { radii, spacing, typography } from '@/theme/tokens';
import type { PreviewState } from '@/hooks/useLinkPreview';
import { LinkThumbnail } from './LinkThumbnail';

type Props = { domain: string | null; preview: PreviewState; title: string };

/** Shows the detected link. Transitions gracefully when preview is fetched. */
export function LinkPreview({ domain, preview, title }: Props) {
  const { colors } = useTheme();
  if (!domain) return null;

  const caption =
    preview.status === 'loading'
      ? 'Fetching preview…'
      : preview.status === 'failed'
        ? 'No preview available. Add a title below.'
        : domain;

  return (
    <Animated.View
      entering={FadeInDown.duration(200)}
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <LinkThumbnail
        thumbnailUrl={preview.metadata?.thumbnailUrl ?? null}
        faviconUrl={preview.metadata?.faviconUrl ?? null}
        domain={domain}
        style={styles.image}
      />
      <View style={styles.body}>
        <Text numberOfLines={2} style={[typography.linkTitle, { color: colors.text }]}>
          {title || preview.metadata?.title || domain}
        </Text>
        <View style={styles.captionRow}>
          {preview.status === 'loading' && <ActivityIndicator size="small" color={colors.muted} />}
          <Text numberOfLines={1} style={[typography.meta, { color: colors.muted, flex: 1 }]}>
            {caption}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radii.md, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  image: { width: '100%', aspectRatio: 16 / 9 },
  body: { padding: spacing.md, gap: spacing.xs },
  captionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
