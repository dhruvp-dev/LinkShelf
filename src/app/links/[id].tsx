import { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, View, StyleSheet } from 'react-native';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Icon, type IconName } from '@/components/Icon';
import { useSQLiteContext } from 'expo-sqlite';
import { getLink } from '@/services/linkService';
import { useLinkActions } from '@/hooks/useLinkActions';
import type { Link } from '@/types/link';
import { useTheme } from '@/theme/useTheme';
import { radii, spacing, typography } from '@/theme/tokens';
import { formatDate } from '@/utils/format';
import { platformFor } from '@/utils/platform';
import { PlatformBadge } from '@/components/PlatformBadge';
import { LinkThumbnail } from '@/components/LinkThumbnail';
import { FolderTag } from '@/components/LinkCard';
import { EmptyState } from '@/components/EmptyState';
import { IconButton, PrimaryButton } from '@/components/Buttons';
import { StarButton } from '@/components/StarButton';

/** Equal-width action tile used for Open and Edit, matching the Star tile. */
function ActionTile({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.tile, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.7 : 1 }]}
    >
      <Icon name={icon} size={20} color={colors.text} />
      <Text style={[typography.meta, { color: colors.text }]}>{label}</Text>
    </Pressable>
  );
}

export default function LinkDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const db = useSQLiteContext();
  const { colors } = useTheme();
  const [link, setLink] = useState<Link | null>(null);
  const [loaded, setLoaded] = useState(false);

  const reload = useCallback(async () => {
    setLink(await getLink(db, id));
    setLoaded(true);
  }, [db, id]);

  useFocusEffect(useCallback(() => {
    reload();
  }, [reload]));

  const actions = useLinkActions(reload);

  if (!loaded) return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  if (!link || link.deletedAt) {
    return (
      <EmptyState
        icon="link-outline"
        title="This link is gone"
        message="It may have been moved to Trash or deleted."
        action={<PrimaryButton label="Back to Home" onPress={() => router.replace('/')} />}
      />
    );
  }

  const platform = platformFor(link.domain);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen
        options={{
          title: '',
          headerRight: () => <IconButton icon="ellipsis-horizontal" label="More options" onPress={() => actions.onMore(link)} />,
        }}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <LinkThumbnail thumbnailUrl={link.thumbnailUrl} faviconUrl={link.faviconUrl} domain={link.domain} style={styles.hero} />

        <View style={styles.tags}>
          {link.folderName ? <FolderTag name={link.folderName} color={link.folderColor} /> : <FolderTag name="All Links" color={null} />}
        </View>

        <Text style={[typography.display, { color: colors.text }]}>{link.title}</Text>

        <View style={styles.domainRow}>
          <PlatformBadge domain={link.domain} size={16} />
          <Text style={[typography.body, { color: colors.muted }]}>{link.domain}</Text>
          <Text style={[typography.body, { color: colors.muted }]}>·  Saved {formatDate(link.createdAt)}</Text>
        </View>

        {link.description ? <Text style={[typography.body, { color: colors.text }]}>{link.description}</Text> : null}

        <View style={styles.actions}>
          <ActionTile icon="open-outline" label="Open" onPress={() => actions.openLink(link)} />
          <ActionTile icon="create-outline" label="Edit" onPress={() => router.push(`/links/edit/${link.id}`)} />
          <View style={[styles.tile, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <StarButton starred={link.isStarred} onToggle={() => actions.toggleStar(link)} size={20} />
            <Text style={[typography.meta, { color: colors.text }]}>{link.isStarred ? 'Starred' : 'Star'}</Text>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[typography.eyebrow, { color: colors.muted }]}>Original URL</Text>
          <Text selectable style={[typography.body, { color: colors.text }]}>{link.url}</Text>
        </View>
      </ScrollView>
      {actions.element}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  hero: { width: '100%', aspectRatio: 4 / 3, borderRadius: radii.lg },
  tags: { flexDirection: 'row' },
  domainRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexWrap: 'wrap' },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  tile: { flex: 1, height: 64, borderRadius: radii.md, borderWidth: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.xs },
  card: { borderRadius: radii.md, borderWidth: StyleSheet.hairlineWidth, padding: spacing.md, gap: spacing.xs, marginTop: spacing.sm },
});
