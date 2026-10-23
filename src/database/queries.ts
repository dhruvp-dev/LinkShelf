import type { SQLiteBindValue } from 'expo-sqlite';
import type { Link, SortKey } from '@/types/link';

export const SORT_SQL: Record<SortKey, string> = {
  recent: 'l.created_at DESC',
  oldest: 'l.created_at ASC',
  title_asc: 'l.title COLLATE NOCASE ASC',
  title_desc: 'l.title COLLATE NOCASE DESC',
};

export const LINK_SELECT = `
  SELECT l.id, l.url, l.title, l.description, l.domain, l.site_name, l.thumbnail_url,
         l.favicon_url, l.folder_id, l.is_starred, l.created_at, l.updated_at, l.deleted_at,
         f.name AS folder_name, f.color AS folder_color,
         (SELECT group_concat(t.name, ',') FROM link_tags lt JOIN tags t ON t.id = lt.tag_id
          WHERE lt.link_id = l.id) AS tag_list
  FROM links l
  LEFT JOIN folders f ON f.id = l.folder_id`;

export type LinkRow = {
  id: string;
  url: string;
  title: string;
  description: string | null;
  domain: string;
  site_name: string | null;
  thumbnail_url: string | null;
  favicon_url: string | null;
  folder_id: string | null;
  is_starred: number;
  created_at: number;
  updated_at: number;
  deleted_at: number | null;
  folder_name: string | null;
  folder_color: string | null;
  tag_list: string | null;
};

export function mapLink(row: LinkRow): Link {
  return {
    id: row.id,
    url: row.url,
    title: row.title,
    description: row.description,
    domain: row.domain,
    siteName: row.site_name,
    thumbnailUrl: row.thumbnail_url,
    faviconUrl: row.favicon_url,
    folderId: row.folder_id,
    folderName: row.folder_name,
    folderColor: row.folder_color,
    tags: row.tag_list ? row.tag_list.split(',') : [],
    isStarred: row.is_starred === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}

export type SearchScope = 'all' | 'tags' | 'folders';

export type LinkQuery = {
  trashed?: boolean;
  /** Restrict to one folder. Omit for All Links. */
  folderId?: string;
  starred?: boolean;
  search?: string;
  searchScope?: SearchScope;
  sort: SortKey;
  limit: number;
  offset: number;
};

const escapeLike = (value: string) => value.replace(/[\\%_]/g, (c) => `\\${c}`);

export function buildLinkQuery(q: LinkQuery): { sql: string; params: SQLiteBindValue[] } {
  const where: string[] = [q.trashed ? 'l.deleted_at IS NOT NULL' : 'l.deleted_at IS NULL'];
  const params: SQLiteBindValue[] = [];

  if (q.folderId) {
    where.push('l.folder_id = ?');
    params.push(q.folderId);
  }
  if (q.starred) {
    where.push('l.is_starred = 1');
  }

  const term = q.search?.trim();
  if (term) {
    const like = `%${escapeLike(term)}%`;
    const scope = q.searchScope ?? 'all';
    if (scope === 'folders') {
      where.push(`f.name LIKE ? ESCAPE '\\'`);
      params.push(like);
    } else if (scope === 'tags') {
      where.push(`EXISTS (SELECT 1 FROM link_tags lt JOIN tags t ON t.id = lt.tag_id
                   WHERE lt.link_id = l.id AND t.name LIKE ? ESCAPE '\\')`);
      params.push(like);
    } else {
      where.push(`(l.title LIKE ? ESCAPE '\\' OR l.domain LIKE ? ESCAPE '\\' OR l.url LIKE ? ESCAPE '\\'
                   OR f.name LIKE ? ESCAPE '\\'
                   OR EXISTS (SELECT 1 FROM link_tags lt JOIN tags t ON t.id = lt.tag_id
                              WHERE lt.link_id = l.id AND t.name LIKE ? ESCAPE '\\'))`);
      params.push(like, like, like, like, like);
    }
  }

  const sql = `${LINK_SELECT}
    WHERE ${where.join(' AND ')}
    ORDER BY ${SORT_SQL[q.sort]}, l.id
    LIMIT ? OFFSET ?`;
  params.push(q.limit, q.offset);
  return { sql, params };
}
