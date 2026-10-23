import type { SQLiteDatabase } from 'expo-sqlite';
import type { Folder, FolderDraft } from '@/types/folder';
import { newId } from '@/utils/id';

type FolderRow = {
  id: string;
  name: string;
  icon: string;
  color: string;
  is_default: number;
  created_at: number;
  updated_at: number;
  link_count: number;
};

const FOLDER_SELECT = `
  SELECT f.id, f.name, f.icon, f.color, f.is_default, f.created_at, f.updated_at,
         (SELECT COUNT(*) FROM links l WHERE l.folder_id = f.id AND l.deleted_at IS NULL) AS link_count
  FROM folders f`;

const mapFolder = (r: FolderRow): Folder => ({
  id: r.id,
  name: r.name,
  icon: r.icon,
  color: r.color,
  isDefault: r.is_default === 1,
  linkCount: r.link_count,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

export async function listFolders(db: SQLiteDatabase): Promise<Folder[]> {
  const rows = await db.getAllAsync<FolderRow>(`${FOLDER_SELECT} ORDER BY f.name COLLATE NOCASE`);
  return rows.map(mapFolder);
}

export async function getFolder(db: SQLiteDatabase, id: string): Promise<Folder | null> {
  const row = await db.getFirstAsync<FolderRow>(`${FOLDER_SELECT} WHERE f.id = ?`, [id]);
  return row ? mapFolder(row) : null;
}

/** Throws a user-readable error when the name is already taken. */
async function assertUniqueName(db: SQLiteDatabase, name: string, exceptId?: string) {
  const row = await db.getFirstAsync<{ id: string }>(
    'SELECT id FROM folders WHERE name = ? COLLATE NOCASE AND id != ?',
    [name, exceptId ?? ''],
  );
  if (row) throw new Error('A shelf with that name already exists.');
}

export async function createFolder(db: SQLiteDatabase, draft: FolderDraft): Promise<string> {
  const name = draft.name.trim();
  if (!name) throw new Error('Shelf name is required.');
  await assertUniqueName(db, name);
  const id = newId();
  const now = Date.now();
  await db.runAsync(
    'INSERT INTO folders (id, name, icon, color, is_default, created_at, updated_at) VALUES (?, ?, ?, ?, 0, ?, ?)',
    [id, name, draft.icon, draft.color, now, now],
  );
  return id;
}

export async function updateFolder(db: SQLiteDatabase, id: string, draft: FolderDraft): Promise<void> {
  const name = draft.name.trim();
  if (!name) throw new Error('Shelf name is required.');
  await assertUniqueName(db, name, id);
  await db.runAsync('UPDATE folders SET name = ?, icon = ?, color = ?, updated_at = ? WHERE id = ?', [
    name,
    draft.icon,
    draft.color,
    Date.now(),
    id,
  ]);
}

/**
 * Deletes a folder without losing content. Links (including those in Trash) move to
 * `moveTo`, or to All Links when `moveTo` is null.
 */
export async function deleteFolder(db: SQLiteDatabase, id: string, moveTo: string | null): Promise<void> {
  await db.withTransactionAsync(async () => {
    await db.runAsync('UPDATE links SET folder_id = ? WHERE folder_id = ?', [moveTo, id]);
    await db.runAsync('DELETE FROM folders WHERE id = ?', [id]);
  });
}
