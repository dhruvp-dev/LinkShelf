import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { buildLinkQuery, mapLink, type LinkQuery, type LinkRow } from '@/database/queries';
import type { Link, SortKey } from '@/types/link';

export type LinkListOptions = Omit<LinkQuery, 'limit' | 'offset' | 'sort'> & { sort: SortKey };

const PAGE_SIZE = 40;

/**
 * Paginated link list backed by SQL. Reloads whenever the screen gains focus or the
 * options change, so edits made on other screens show up without manual refresh.
 */
export function useLinks(options: LinkListOptions) {
  const db = useSQLiteContext();
  const [items, setItems] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const optionsRef = useRef(options);
  optionsRef.current = options;
  const requestId = useRef(0);
  const key = JSON.stringify(options);

  const fetchPage = useCallback(
    async (offset: number) => {
      const { sql, params } = buildLinkQuery({ ...optionsRef.current, limit: PAGE_SIZE, offset });
      const rows = await db.getAllAsync<LinkRow>(sql, params);
      return rows.map(mapLink);
    },
    [db],
  );

  const reload = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);
    try {
      const page = await fetchPage(0);
      if (id !== requestId.current) return;
      setItems(page);
      setHasMore(page.length === PAGE_SIZE);
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [fetchPage]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    const id = requestId.current;
    const page = await fetchPage(items.length);
    if (id !== requestId.current) return;
    setItems((prev) => [...prev, ...page]);
    setHasMore(page.length === PAGE_SIZE);
  }, [fetchPage, hasMore, items.length, loading]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload, key]),
  );

  return { items, loading, hasMore, reload, loadMore };
}
