import { Pressable, Text, View, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Icon, type IconName } from '@/components/Icon';
import type { Link } from '@/types/link';
import { useTheme } from '@/theme/useTheme';
import { radii, spacing, typography } from '@/theme/tokens';
import { platformFor } from '@/utils/platform';
import { PlatformBadge } from './PlatformBadge';
import { LinkThumbnail } from './LinkThumbnail';
import { StarButton } from './StarButton';
import { springs } from '@/theme/motion';

type Props = {
  link: Link;
  onPress: (link: Link) => void;
  onToggleStar: (link: Link) => void;
  onMore: (link: Link) => void;
};

/** Compact row for the list view and search results. Direct manipulation press feedback. */
function LinkRowBase({ link, onPress, onToggleStar, onMore }: Props) {
  const { colors } = useTheme();
  const platform = platformFor(link.domain);
  const pressed = useSharedValue(0);

  const rowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - 0.015 * pressed.value }],
  }));

  return (
    <Pressable
      onPressIn={() => (pressed.value = withSpring(1, springs.interactive))}
      onPressOut={() => (pressed.value = withSpring(0, springs.interactive))}
      onPress={() => onPress(link)}
      accessibilityRole="button"
      accessibilityLabel={link.title}
    >
      <Animated.View style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }, rowStyle]}>
        <LinkThumbnail thumbnailUrl={link.thumbnailUrl} faviconUrl={link.faviconUrl} domain={link.domain} style={styles.thumb} iconSize={22} />
        <View style={styles.body}>
          <Text numberOfLines={1} style={[typography.linkTitle, { color: colors.text }]}>
            {link.title}
          </Text>
          <View style={styles.metaRow}>
            <PlatformBadge domain={link.domain} size={12} />
            <Text numberOfLines={1} style={[typography.meta, { color: colors.muted, flexShrink: 1 }]}>
              {link.domain}
              {link.folderName ? `  ·  ${link.folderName}` : ''}
            </Text>
          </View>
        </View>
        <StarButton starred={link.isStarred} onToggle={() => onToggleStar(link)} size={18} />
        <Pressable onPress={() => onMore(link)} hitSlop={10} accessibilityRole="button" accessibilityLabel="More options" style={styles.more}>
          <Icon name="ellipsis-horizontal" size={18} color={colors.muted} />
        </Pressable>
      </Animated.View>
    </Pressable>
  );
}

export const LinkRow = LinkRowBase;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.sm,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  thumb: { width: 60, height: 60, borderRadius: 6 },
  body: { flex: 1, gap: 3 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  more: { paddingHorizontal: spacing.xs },
});
