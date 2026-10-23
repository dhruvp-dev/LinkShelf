import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { listFolders } from '@/services/folderService';
import { countLinks } from '@/services/linkService';
import type { Folder } from '@/types/folder';

/** All folders plus the counts for the virtual All Links and Starred collections. */
export function useFolders() {
  const db = useSQLiteContext();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [counts, setCounts] = useState({ all: 0, starred: 0 });

  const reload = useCallback(async () => {
    const [list, linkCounts] = await Promise.all([listFolders(db), countLinks(db)]);
    setFolders(list);
    setCounts(linkCounts);
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  return { folders, counts, reload };
}
