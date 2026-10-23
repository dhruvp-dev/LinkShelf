import { memo, useCallback } from 'react';
import { FlatList, StyleSheet, RefreshControl, type ListRenderItem } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import type { Link, ViewMode } from '@/types/link';
import { spacing } from '@/theme/tokens';
import { LinkCard } from './LinkCard';
import { LinkRow } from './LinkRow';

type Props = {
  items: Link[];
  view: ViewMode;
  loading?: boolean;
  onRefresh?: () => void;
  onEndReached?: () => void;
  onPress: (link: Link) => void;
  onToggleStar: (link: Link) => void;
  onMore: (link: Link) => void;
  header?: React.ReactElement;
  empty?: React.ReactElement;
};

/**
 * Virtualized list/grid for links. `key={view}` forces FlatList to remount when the
 * column count changes, since numColumns cannot change in place.
 */
function LinkCollectionBase({ items, view, loading, onRefresh, onEndReached, onPress, onToggleStar, onMore, header, empty }: Props) {
  const isGrid = view === 'grid';

  const renderItem: ListRenderItem<Link> = useCallback(
    ({ item }) =>
      isGrid ? (
        <Animated.View layout={LinearTransition} style={styles.gridCell}>
          <LinkCard link={item} onPress={onPress} onToggleStar={onToggleStar} onMore={onMore} />
        </Animated.View>
      ) : (
        <Animated.View layout={LinearTransition}>
          <LinkRow link={item} onPress={onPress} onToggleStar={onToggleStar} onMore={onMore} />
        </Animated.View>
      ),
    [isGrid, onPress, onToggleStar, onMore],
  );

  return (
    <FlatList
      key={view}
      data={items}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      numColumns={isGrid ? 2 : 1}
      columnWrapperStyle={isGrid ? styles.columns : undefined}
      contentContainerStyle={styles.content}
      ListHeaderComponent={header}
      ListEmptyComponent={loading ? undefined : empty}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      initialNumToRender={12}
      maxToRenderPerBatch={12}
      windowSize={7}
      removeClippedSubviews
      keyboardShouldPersistTaps="handled"
      refreshControl={onRefresh ? <RefreshControl refreshing={!!loading} onRefresh={onRefresh} /> : undefined}
    />
  );
}

export const LinkCollection = memo(LinkCollectionBase);

const styles = StyleSheet.create({
  content: { paddingBottom: 140, flexGrow: 1 },
  columns: { paddingHorizontal: spacing.lg - spacing.xs },
  gridCell: { flex: 1 },
});

