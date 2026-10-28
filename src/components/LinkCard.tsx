import { memo } from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { Card } from './Card';
import { Icon } from '@/components/Icon';
import type { Link } from '@/types/link';
import { useTheme } from '@/theme/useTheme';
import { radii, spacing, typography } from '@/theme/tokens';
import { platformFor } from '@/utils/platform';
import { PlatformBadge } from './PlatformBadge';
import { LinkThumbnail } from './LinkThumbnail';
import { StarButton } from './StarButton';

type Props = {
  link: Link;
  onPress: (link: Link) => void;
  onToggleStar: (link: Link) => void;
  onMore: (link: Link) => void;
};

/** Grid card: large preview, platform badge, title, domain, folder tag and actions. */
function LinkCardBase({ link, onPress, onToggleStar, onMore }: Props) {
  const { colors } = useTheme();
  const platform = platformFor(link.domain);
  return (
    <Card onPress={() => onPress(link)} accessibilityLabel={link.title} style={styles.card}>
      <View>
        <LinkThumbnail thumbnailUrl={link.thumbnailUrl} faviconUrl={link.faviconUrl} domain={link.domain} style={styles.image} />
        <View style={[styles.platform, { backgroundColor: colors.card }]}>
          <PlatformBadge domain={link.domain} size={14} />
        </View>
      </View>
      <View style={styles.body}>
        <Text numberOfLines={2} style={[typography.linkTitle, { color: colors.text, minHeight: 40 }]}>
          {link.title}
        </Text>
        <View style={styles.metaRow}>
          <Text numberOfLines={1} style={[typography.meta, { color: colors.muted, flex: 1 }]}>
            {link.domain}
          </Text>
          <StarButton starred={link.isStarred} onToggle={() => onToggleStar(link)} size={16} />
          <Pressable onPress={() => onMore(link)} hitSlop={10} accessibilityRole="button" accessibilityLabel="More options">
            <Icon name="ellipsis-horizontal" size={16} color={colors.muted} />
          </Pressable>
        </View>
        {link.folderName && <FolderTag name={link.folderName} color={link.folderColor} />}
      </View>
    </Card>
  );
}

/** Small pill showing the folder, tinted with the folder's color. */
export function FolderTag({ name, color }: { name: string; color: string | null }) {
  const { colors } = useTheme();
  const tint = color ?? colors.muted;
  return (
    <View style={[styles.tag, { backgroundColor: `${tint}33` }]}>
      <Text numberOfLines={1} style={[typography.meta, { color: colors.text }]}>
        {name}
      </Text>
    </View>
  );
}

export const LinkCard = memo(LinkCardBase);

const styles = StyleSheet.create({
  card: { flex: 1, borderRadius: 12, margin: spacing.xs },
  image: { width: '100%', aspectRatio: 4 / 3, borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  platform: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { padding: spacing.md, gap: spacing.xs },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  tag: { alignSelf: 'flex-start', paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radii.pill, maxWidth: '100%' },
});
