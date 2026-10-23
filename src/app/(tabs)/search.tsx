import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, ScrollView, Text, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Icon, type IconName } from '@/components/Icon';
import { useSQLiteContext } from 'expo-sqlite';
import { useSettings } from '@/hooks/useSettings';
import { useLinks } from '@/hooks/useLinks';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useLinkActions } from '@/hooks/useLinkActions';
import { addRecentSearch, clearRecentSearches, getRecentSearches } from '@/services/settingsService';
import { useTheme } from '@/theme/useTheme';
import { radii, spacing, typography } from '@/theme/tokens';
import type { SortKey } from '@/types/link';
import type { SearchScope } from '@/database/queries';
import { SearchBar } from '@/components/SearchBar';
import { SortMenu } from '@/components/SortMenu';
import { LinkRow } from '@/components/LinkRow';
import { EmptyState } from '@/components/EmptyState';
import { useFocusEffect } from 'expo-router';

type Filter = 'all' | 'links' | 'folders' | 'starred' | 'tags';
const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'links', label: 'Links' },
  { key: 'folders', label: 'Shelves' },
  { key: 'starred', label: 'Starred' },
  { key: 'tags', label: 'Hashtags' },
];

/** Maps a UI filter to the SQL scope. "Folders" matches folder names; "Tags" matches tag names only. */
function scopeFor(filter: Filter): { searchScope: SearchScope; starred: boolean } {
  if (filter === 'folders') return { searchScope: 'folders', starred: false };
  if (filter === 'tags') return { searchScope: 'tags', starred: false };
  if (filter === 'starred') return { searchScope: 'all', starred: true };
  return { searchScope: 'all', starred: false };
}

export default function SearchScreen() {
  const router = useRouter();
  const db = useSQLiteContext();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { defaultSort } = useSettings();
  const [text, setText] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [sort, setSort] = useState<SortKey>(defaultSort);
  const [recent, setRecent] = useState<string[]>([]);
  const debounced = useDebouncedValue(text.trim(), 200);
  const scope = scopeFor(filter);

  const { items, loading, loadMore, reload } = useLinks({ search: debounced, sort, ...scope });
  const actions = useLinkActions(reload);

  const refreshRecent = useCallback(async () => setRecent(await getRecentSearches(db)), [db]);
  useFocusEffect(useCallback(() => {
    refreshRecent();
  }, [refreshRecent]));
  useEffect(() => setSort(defaultSort), [defaultSort]);

  const commit = async () => {
    await addRecentSearch(db, text);
    refreshRecent();
  };

  const hasQuery = debounced.length > 0;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.searchRow}>
        <View style={{ flex: 1 }}>
          <SearchBar value={text} onChangeText={setText} onSubmit={commit} placeholder="Titles, domains, shelves, tags" />
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters} style={styles.filterScroll}>
        {FILTERS.map((f) => {
          const active = f.key === filter;
          return (
            <Pressable
              key={f.key}
              onPress={() => setFilter(f.key)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={[styles.chip, { backgroundColor: active ? colors.text : colors.surface }]}
            >
              <Text style={[typography.meta, { color: active ? colors.background : colors.muted }]}>{f.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {hasQuery ? (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={<SortMenu value={sort} onChange={setSort} />}
          renderItem={({ item }) => (
            <LinkRow
              link={item}
              onPress={(link) => {
                commit();
                router.push(`/links/${link.id}`);
              }}
              onToggleStar={actions.toggleStar}
              onMore={actions.onMore}
            />
          )}
          onEndReached={loadMore}
          contentContainerStyle={{ paddingTop: spacing.sm, paddingBottom: 140, flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            loading ? undefined : (
              <EmptyState icon="search-outline" title="No matches" message={`Nothing in your shelf matches "${debounced}".`} />
            )
          }
        />
      ) : (
        <ScrollView contentContainerStyle={styles.recentWrap} keyboardShouldPersistTaps="handled">
          <View style={styles.recentHeader}>
            <Text style={[typography.section, { color: colors.text }]}>Recent searches</Text>
            {recent.length > 0 && (
              <Pressable
                onPress={async () => {
                  await clearRecentSearches(db);
                  refreshRecent();
                }}
                accessibilityRole="button"
              >
                <Text style={[typography.meta, { color: colors.muted }]}>Clear</Text>
              </Pressable>
            )}
          </View>
          {recent.length === 0 ? (
            <Text style={[typography.body, { color: colors.muted }]}>Your recent searches will appear here.</Text>
          ) : (
            recent.map((term) => (
              <Pressable
                key={term}
                onPress={() => setText(term)}
                accessibilityRole="button"
                style={[styles.recentRow, { borderColor: colors.border }]}
              >
                <Icon name="time-outline" size={18} color={colors.muted} />
                <Text style={[typography.body, { color: colors.text, flex: 1, fontSize: 15 }]}>{term}</Text>
                <Icon name="arrow-up-outline" size={16} color={colors.muted} />
              </Pressable>
            ))
          )}
        </ScrollView>
      )}
      {actions.element}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  searchRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  filterScroll: { flexGrow: 0 },
  filters: { paddingHorizontal: spacing.lg, gap: spacing.sm, paddingBottom: spacing.sm, alignItems: 'center' },
  chip: { height: 34, paddingHorizontal: spacing.md, alignItems: 'center', justifyContent: 'center', borderRadius: radii.pill },
  recentWrap: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: 140, gap: spacing.xs },
  recentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  recentRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth },
});
