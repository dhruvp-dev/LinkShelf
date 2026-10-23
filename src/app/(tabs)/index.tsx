import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Icon, type IconName } from '@/components/Icon';
import { useSettings } from '@/hooks/useSettings';
import { useLinks } from '@/hooks/useLinks';
import { useFolders } from '@/hooks/useFolders';
import { useLinkActions } from '@/hooks/useLinkActions';
import { useTheme } from '@/theme/useTheme';
import { radii, spacing, typography } from '@/theme/tokens';
import type { SortKey, ViewMode } from '@/types/link';
import { LinkCollection } from '@/components/LinkCollection';
import { FolderCard } from '@/components/FolderCard';
import { ViewToggle } from '@/components/ViewToggle';
import { SortMenu } from '@/components/SortMenu';
import { EmptyState } from '@/components/EmptyState';
import { IconButton, PrimaryButton } from '@/components/Buttons';

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { defaultView, defaultSort } = useSettings();
  const [view, setView] = useState<ViewMode>(defaultView);
  const [sort, setSort] = useState<SortKey>(defaultSort);

  // Keep the local controls in step with Settings when the default changes.
  useEffect(() => setView(defaultView), [defaultView]);
  useEffect(() => setSort(defaultSort), [defaultSort]);

  const { items, loading, loadMore, reload } = useLinks({ sort });
  const { folders, counts, reload: reloadFolders } = useFolders();
  const refreshAll = useCallback(() => {
    reload();
    reloadFolders();
  }, [reload, reloadFolders]);
  const actions = useLinkActions(refreshAll);

  const header = (
    <View>
      <View style={styles.topBar}>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={[typography.section, { color: colors.text }]}>Your shelf</Text>
          <Text style={[typography.body, { color: colors.muted }]}>Here's your shelf of saved links.</Text>
        </View>
        <IconButton icon="search" label="Search" onPress={() => router.push('/search')} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.shortcuts}>
        <FolderCard compact name="All Links" icon="albums" color={colors.surface} count={counts.all} onPress={() => router.push('/folders/all')} />
        <FolderCard compact name="Starred" icon="star" color="#F7E08A" count={counts.starred} onPress={() => router.push('/folders/starred')} />
        {folders.map((f) => (
          <FolderCard
            key={f.id}
            compact
            name={f.name}
            icon={f.icon}
            color={f.color}
            count={f.linkCount}
            onPress={() => router.push(`/folders/${f.id}`)}
          />
        ))}
      </ScrollView>

      {counts.all > 0 && (
        <View style={styles.sectionHeader}>
          <Text style={[typography.section, { color: colors.text }]}>Recent links</Text>
          <ViewToggle value={view} onChange={setView} />
        </View>
      )}
      {counts.all > 0 && (
        <View style={styles.sortRow}>
          <SortMenu value={sort} onChange={setSort} />
        </View>
      )}
    </View>
  );

  const empty = (
    <EmptyState
      icon="bookmarks-outline"
      title="Your shelf is looking a little empty."
      message="Save your first link and keep everything you love in one place."
      action={<PrimaryButton label="Save a link" onPress={() => router.push('/links/new')} />}
    />
  );

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <LinkCollection
        items={items}
        view={view}
        loading={loading}
        onRefresh={refreshAll}
        onEndReached={loadMore}
        onPress={(link) => router.push(`/links/${link.id}`)}
        onToggleStar={actions.toggleStar}
        onMore={actions.onMore}
        header={header}
        empty={counts.all === 0 && !loading ? empty : undefined}
      />
      {actions.element}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.lg },
  shortcuts: { paddingHorizontal: spacing.lg, gap: spacing.sm, paddingBottom: spacing.lg },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  sortRow: { paddingBottom: spacing.sm },
});
