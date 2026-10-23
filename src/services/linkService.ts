import type { SQLiteDatabase } from 'expo-sqlite';
import { LINK_SELECT, type LinkRow, mapLink } from '@/database/queries';
import type { Link, LinkDraft } from '@/types/link';
import { newId } from '@/utils/id';
import { domainOf } from '@/utils/url';

const MAX_TAGS = 20;

export function cleanTags(raw: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const tag of raw) {
    const name = tag.replace(/,/g, ' ').trim().replace(/\s+/g, ' ');
    if (!name || seen.has(name.toLowerCase())) continue;
    seen.add(name.toLowerCase());
    out.push(name.slice(0, 40));
    if (out.length === MAX_TAGS) break;
  }
  return out;
}

/** Replaces a link's tags. Must run inside a transaction. */
async function setLinkTags(db: SQLiteDatabase, linkId: string, names: string[]) {
  await db.runAsync('DELETE FROM link_tags WHERE link_id = ?', [linkId]);
  for (const name of names) {
    await db.runAsync('INSERT OR IGNORE INTO tags (id, name) VALUES (?, ?)', [newId(), name]);
    const tag = await db.getFirstAsync<{ id: string }>(
      'SELECT id FROM tags WHERE name = ? COLLATE NOCASE',
      [name],
    );
    if (tag) {
      await db.runAsync('INSERT OR IGNORE INTO link_tags (link_id, tag_id) VALUES (?, ?)', [linkId, tag.id]);
    }
  }
}

/** Inserts a link without opening a transaction. Callers that already hold one (e.g. import) use this. */
export async function insertLink(db: SQLiteDatabase, draft: LinkDraft): Promise<string> {
  const id = newId();
  const now = Date.now();
  await db.runAsync(
    `INSERT INTO links (id, url, title, description, domain, site_name, thumbnail_url,
       favicon_url, folder_id, is_starred, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      draft.url,
      draft.title.trim() || domainOf(draft.url),
      draft.description,
      domainOf(draft.url),
      draft.siteName,
      draft.thumbnailUrl,
      draft.faviconUrl,
      draft.folderId,
      draft.isStarred ? 1 : 0,
      now,
      now,
    ],
  );
  await setLinkTags(db, id, cleanTags(draft.tags));
  return id;
}

export async function createLink(db: SQLiteDatabase, draft: LinkDraft): Promise<string> {
  let id = '';
  await db.withTransactionAsync(async () => {
    id = await insertLink(db, draft);
  });
  return id;
}

export async function updateLink(db: SQLiteDatabase, id: string, draft: LinkDraft): Promise<void> {
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `UPDATE links SET url = ?, title = ?, description = ?, domain = ?, site_name = ?,
         thumbnail_url = ?, favicon_url = ?, folder_id = ?, is_starred = ?, updated_at = ?
       WHERE id = ?`,
      [
        draft.url,
        draft.title.trim() || domainOf(draft.url),
        draft.description,
        domainOf(draft.url),
        draft.siteName,
        draft.thumbnailUrl,
        draft.faviconUrl,
        draft.folderId,
        draft.isStarred ? 1 : 0,
        Date.now(),
        id,
      ],
    );
    await setLinkTags(db, id, cleanTags(draft.tags));
  });
}

export async function getLink(db: SQLiteDatabase, id: string): Promise<Link | null> {
  const row = await db.getFirstAsync<LinkRow>(`${LINK_SELECT} WHERE l.id = ?`, [id]);
  return row ? mapLink(row) : null;
}

export async function setStarred(db: SQLiteDatabase, id: string, starred: boolean): Promise<void> {
  await db.runAsync('UPDATE links SET is_starred = ?, updated_at = ? WHERE id = ?', [
    starred ? 1 : 0,
    Date.now(),
    id,
  ]);
}

export async function moveLink(db: SQLiteDatabase, id: string, folderId: string | null): Promise<void> {
  await db.runAsync('UPDATE links SET folder_id = ?, updated_at = ? WHERE id = ?', [folderId, Date.now(), id]);
}

/** Soft delete: the link stays in Trash and keeps its folder so restore can put it back. */
export async function trashLink(db: SQLiteDatabase, id: string): Promise<void> {
  await db.runAsync('UPDATE links SET deleted_at = ? WHERE id = ?', [Date.now(), id]);
}

/** Restores to the previous folder if it still exists; otherwise the folder FK has already cleared it to All Links. */
export async function restoreLink(db: SQLiteDatabase, id: string): Promise<void> {
  await db.runAsync('UPDATE links SET deleted_at = NULL, updated_at = ? WHERE id = ?', [Date.now(), id]);
}

export async function purgeLink(db: SQLiteDatabase, id: string): Promise<void> {
  await db.runAsync('DELETE FROM links WHERE id = ?', [id]);
}

export async function emptyTrash(db: SQLiteDatabase): Promise<void> {
  await db.runAsync('DELETE FROM links WHERE deleted_at IS NOT NULL');
}

export async function countLinks(db: SQLiteDatabase): Promise<{ all: number; starred: number }> {
  const row = await db.getFirstAsync<{ all_count: number; starred_count: number }>(
    `SELECT COUNT(*) AS all_count,
            COALESCE(SUM(is_starred), 0) AS starred_count
     FROM links WHERE deleted_at IS NULL`,
  );
  return { all: row?.all_count ?? 0, starred: row?.starred_count ?? 0 };
}

export async function findActiveLinkByUrl(db: SQLiteDatabase, url: string): Promise<string | null> {
  const row = await db.getFirstAsync<{ id: string }>(
    'SELECT id FROM links WHERE url = ? AND deleted_at IS NULL LIMIT 1',
    [url],
  );
  return row?.id ?? null;
}
