import { useCallback, useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { getFolder } from '@/services/folderService';
import { useLinks } from '@/hooks/useLinks';
import { useLinkActions } from '@/hooks/useLinkActions';
import { useFolderActions } from '@/hooks/useFolderActions';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useSettings } from '@/hooks/useSettings';
import { useTheme } from '@/theme/useTheme';
import { spacing, typography } from '@/theme/tokens';
import type { Folder } from '@/types/folder';
import type { SortKey, ViewMode } from '@/types/link';
import { LinkCollection } from '@/components/LinkCollection';
import { SearchBar } from '@/components/SearchBar';
import { SortMenu } from '@/components/SortMenu';
import { ViewToggle } from '@/components/ViewToggle';
import { EmptyState } from '@/components/EmptyState';
import { IconButton, PrimaryButton } from '@/components/Buttons';
import { pluralize } from '@/utils/format';

/** Folder screen. `id` is a real folder id, or `all` / `starred` for the virtual collections. */
export default function FolderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const db = useSQLiteContext();
  const { colors } = useTheme();
  const { defaultView, defaultSort } = useSettings();
  const isVirtual = id === 'all' || id === 'starred';

  const [folder, setFolder] = useState<Folder | null>(null);
  const [view, setView] = useState<ViewMode>(defaultView);
  const [sort, setSort] = useState<SortKey>(defaultSort);
  const [text, setText] = useState('');
  const search = useDebouncedValue(text.trim(), 200);

  const title = id === 'all' ? 'All Links' : id === 'starred' ? 'Starred' : folder?.name ?? 'Shelf';
  const { items, loading, loadMore, reload } = useLinks({
    folderId: isVirtual ? undefined : id,
    starred: id === 'starred',
    search,
    sort,
  });

  const refresh = useCallback(async () => {
    if (!isVirtual) setFolder(await getFolder(db, id));
    reload();
  }, [db, id, isVirtual, reload]);

  useFocusEffect(useCallback(() => {
    refresh();
  }, [refresh]));

  const linkActions = useLinkActions(refresh);
  const folderActions = useFolderActions(() => router.back());

  const emptyTitle = search
    ? 'No matches in this shelf'
    : id === 'starred'
      ? 'Nothing starred yet'
      : id === 'all'
        ? 'No links yet'
        : 'This shelf is empty';

  const header = (
    <View style={styles.toolbar}>
      <SearchBar value={text} onChangeText={setText} placeholder={`Search ${title}`} />
      <View style={styles.controls}>
        <View style={{ flex: 1 }}>
          <SortMenu value={sort} onChange={setSort} />
        </View>
        <ViewToggle value={view} onChange={setView} />
      </View>
    </View>
  );

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title,
          headerRight: () =>
            !isVirtual && folder ? (
              <IconButton icon="ellipsis-horizontal" label="Shelf options" onPress={() => folderActions.onMore(folder)} />
            ) : null,
        }}
      />
      {folder && (
        <View style={styles.summary}>
          <Text style={[typography.meta, { color: colors.muted }]}>{pluralize(folder.linkCount, 'link')}</Text>
        </View>
      )}
      <LinkCollection
        items={items}
        view={view}
        loading={loading}
        onRefresh={refresh}
        onEndReached={loadMore}
        onPress={(link) => router.push(`/links/${link.id}`)}
        onToggleStar={linkActions.toggleStar}
        onMore={linkActions.onMore}
        header={header}
        empty={
          loading ? undefined : (
            <EmptyState
              icon={id === 'starred' ? 'star-filled' : 'bookmarks-outline'}
              title={emptyTitle}
              message={search ? undefined : 'Links you save to this shelf will appear here.'}
              action={!search && !isVirtual ? <PrimaryButton label="Save a link" onPress={() => router.push('/links/new')} /> : undefined}
            />
          )
        }
      />
      {linkActions.element}
      {folderActions.element}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  summary: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xs },
  toolbar: { gap: spacing.sm, paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  controls: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
