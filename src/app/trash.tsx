import { useCallback } from 'react';
import { useState } from 'react';
import { FlatList, Text, View, StyleSheet } from 'react-native';
import { Stack, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { emptyTrash, purgeLink, restoreLink } from '@/services/linkService';
import { useLinks } from '@/hooks/useLinks';
import { useToast } from '@/components/Toast';
import { useTheme } from '@/theme/useTheme';
import { radii, spacing, typography } from '@/theme/tokens';
import type { Link } from '@/types/link';
import { EmptyState } from '@/components/EmptyState';
import { SecondaryButton } from '@/components/Buttons';
import { ConfirmDialog, type ConfirmOptions } from '@/components/ConfirmDialog';
import { LinkThumbnail } from '@/components/LinkThumbnail';
import { pluralize } from '@/utils/format';

export default function TrashScreen() {
  const db = useSQLiteContext();
  const toast = useToast();
  const { colors } = useTheme();
  const { items, loading, reload, loadMore } = useLinks({ trashed: true, sort: 'recent' });

  useFocusEffect(useCallback(() => {
    reload();
  }, [reload]));

  const restore = async (link: Link) => {
    await restoreLink(db, link.id);
    // The folder foreign key clears folder_id when a folder is deleted, so a restored link
    // lands in All Links without extra handling here.
    toast.show(link.folderName ? `Restored to ${link.folderName}` : 'Restored to All Links');
    reload();
  };

  const [confirm, setConfirm] = useState<ConfirmOptions | null>(null);

  const deleteForever = (link: Link) =>
    setConfirm({
      title: 'Delete permanently?',
      message: `"${link.title}" will be removed for good. This cannot be undone.`,
      confirmLabel: 'Delete forever',
      destructive: true,
      onConfirm: async () => {
        await purgeLink(db, link.id);
        toast.show('Deleted permanently');
        reload();
      },
    });

  const confirmEmpty = () =>
    setConfirm({
      title: 'Empty Trash?',
      message: 'Every link in Trash will be deleted permanently. This cannot be undone.',
      confirmLabel: 'Empty Trash',
      destructive: true,
      onConfirm: async () => {
        await emptyTrash(db);
        toast.show('Trash emptied');
        reload();
      },
    });

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: 'Trash',
          headerRight: () =>
            items.length > 0 ? <SecondaryButton label="Empty" icon="trash-outline" destructive onPress={confirmEmpty} /> : null,
        }}
      />
      <FlatList
        data={items}
        keyExtractor={(l) => l.id}
        contentContainerStyle={styles.list}
        onEndReached={loadMore}
        ListHeaderComponent={
          items.length > 0 ? (
            <Text style={[typography.meta, { color: colors.muted, marginBottom: spacing.md }]}>
              {pluralize(items.length, 'link')} in Trash. Restored links return to their folder, or to All Links if it was deleted.
            </Text>
          ) : undefined
        }
        renderItem={({ item }) => (
          <View style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <LinkThumbnail thumbnailUrl={item.thumbnailUrl} faviconUrl={item.faviconUrl} domain={item.domain} style={styles.thumb} iconSize={20} />
            <View style={{ flex: 1, gap: 2 }}>
              <Text numberOfLines={1} style={[typography.linkTitle, { color: colors.text }]}>{item.title}</Text>
              <Text numberOfLines={1} style={[typography.meta, { color: colors.muted }]}>{item.domain}</Text>
              <View style={styles.actions}>
                <SecondaryButton icon="arrow-undo-outline" label="Restore" onPress={() => restore(item)} />
                <SecondaryButton icon="close-outline" label="Delete" destructive onPress={() => deleteForever(item)} />
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          loading ? undefined : (
            <EmptyState icon="trash-outline" title="Trash is empty" message="Links you move to Trash will wait here until you restore or delete them." />
          )
        }
      />
      <ConfirmDialog options={confirm} onClose={() => setConfirm(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  list: { padding: spacing.lg, paddingBottom: spacing.xxl, flexGrow: 1 },
  row: { flexDirection: 'row', gap: spacing.md, padding: spacing.sm, borderRadius: radii.md, borderWidth: StyleSheet.hairlineWidth, marginBottom: spacing.sm },
  thumb: { width: 64, height: 64, borderRadius: radii.sm },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm, flexWrap: 'wrap' },
});
