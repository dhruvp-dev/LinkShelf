import type { SQLiteDatabase } from 'expo-sqlite';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { DEFAULT_FOLDERS } from '@/database/defaults';
import { cleanTags, findActiveLinkByUrl, insertLink } from './linkService';
import { newId } from '@/utils/id';
import { domainOf, normalizeUrl } from '@/utils/url';

const FORMAT = 'linkshelf';
const VERSION = 1;

type ExportedFolder = { id: string; name: string; icon: string; color: string };
type ExportedLink = {
  id: string;
  url: string;
  title: string;
  description: string | null;
  siteName: string | null;
  thumbnailUrl: string | null;
  faviconUrl: string | null;
  folderId: string | null;
  tags: string[];
  isStarred: boolean;
  createdAt: number;
  updatedAt: number;
  deletedAt: number | null;
};
export type LinkShelfExport = {
  format: typeof FORMAT;
  version: number;
  exportedAt: string;
  folders: ExportedFolder[];
  links: ExportedLink[];
};

export async function exportLibrary(db: SQLiteDatabase): Promise<void> {
  const folders = await db.getAllAsync<ExportedFolder>('SELECT id, name, icon, color FROM folders');
  const linkRows = await db.getAllAsync<{
    id: string; url: string; title: string; description: string | null; site_name: string | null;
    thumbnail_url: string | null; favicon_url: string | null; folder_id: string | null; is_starred: number;
    created_at: number; updated_at: number; deleted_at: number | null;
  }>('SELECT * FROM links');
  const tagRows = await db.getAllAsync<{ link_id: string; name: string }>(
    'SELECT lt.link_id, t.name FROM link_tags lt JOIN tags t ON t.id = lt.tag_id',
  );
  const tagsByLink = new Map<string, string[]>();
  for (const t of tagRows) {
    tagsByLink.set(t.link_id, [...(tagsByLink.get(t.link_id) ?? []), t.name]);
  }

  const payload: LinkShelfExport = {
    format: FORMAT,
    version: VERSION,
    exportedAt: new Date().toISOString(),
    folders,
    links: linkRows.map((r) => ({
      id: r.id,
      url: r.url,
      title: r.title,
      description: r.description,
      siteName: r.site_name,
      thumbnailUrl: r.thumbnail_url,
      faviconUrl: r.favicon_url,
      folderId: r.folder_id,
      tags: tagsByLink.get(r.id) ?? [],
      isStarred: r.is_starred === 1,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      deletedAt: r.deleted_at,
    })),
  };

  const file = new File(Paths.cache, `linkshelf-export-${Date.now()}.json`);
  file.create({ overwrite: true });
  file.write(JSON.stringify(payload, null, 2));
  await Sharing.shareAsync(file.uri, { mimeType: 'application/json', dialogTitle: 'Export LinkShelf data' });
}

/** Checks the shape of an imported file. Returns a readable error, or null when it is valid. */
export function validateExport(data: unknown): string | null {
  if (!data || typeof data !== 'object') return 'The file is not a LinkShelf export.';
  const d = data as Partial<LinkShelfExport>;
  if (d.format !== FORMAT || typeof d.version !== 'number') return 'The file is not a LinkShelf export.';
  if (d.version > VERSION) return 'This export was made by a newer version of LinkShelf.';
  if (!Array.isArray(d.folders) || !Array.isArray(d.links)) return 'The export is missing folders or links.';
  for (const f of d.folders) {
    if (typeof f?.id !== 'string' || typeof f?.name !== 'string' || !f.name.trim()) return 'A folder entry is malformed.';
  }
  for (const l of d.links) {
    if (typeof l?.id !== 'string' || typeof l?.url !== 'string') return 'A link entry is malformed.';
    if (!normalizeUrl(l.url).ok) return `A link has an invalid URL: ${l.url}`;
  }
  return null;
}

export type ImportResult = { added: number; skipped: number; foldersAdded: number };

/**
 * Imports a LinkShelf export. Existing links with the same URL are skipped, existing
 * folders are matched by name, and everything runs in one transaction so a failure
 * leaves the library untouched.
 */
export async function importLibrary(db: SQLiteDatabase): Promise<ImportResult | null> {
  const picked = await DocumentPicker.getDocumentAsync({ type: 'application/json', copyToCacheDirectory: true });
  if (picked.canceled || !picked.assets[0]) return null;

  const text = await new File(picked.assets[0].uri).text();
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('The file is not valid JSON.');
  }
  const problem = validateExport(data);
  if (problem) throw new Error(problem);
  const exported = data as LinkShelfExport;

  const result: ImportResult = { added: 0, skipped: 0, foldersAdded: 0 };
  await db.withTransactionAsync(async () => {
    const folderIdMap = new Map<string, string | null>();
    for (const f of exported.folders) {
      const byName = await db.getFirstAsync<{ id: string }>(
        'SELECT id FROM folders WHERE name = ? COLLATE NOCASE',
        [f.name.trim()],
      );
      if (byName) {
        folderIdMap.set(f.id, byName.id);
      } else {
        const id = newId();
        const now = Date.now();
        await db.runAsync(
          'INSERT INTO folders (id, name, icon, color, is_default, created_at, updated_at) VALUES (?, ?, ?, ?, 0, ?, ?)',
          [id, f.name.trim(), f.icon || 'folder', f.color || DEFAULT_FOLDERS[0].color, now, now],
        );
        folderIdMap.set(f.id, id);
        result.foldersAdded++;
      }
    }

    for (const l of exported.links) {
      const url = normalizeUrl(l.url);
      if (!url.ok) continue;
      if (await findActiveLinkByUrl(db, url.url)) {
        result.skipped++;
        continue;
      }
      await insertLink(db, {
        url: url.url,
        title: l.title || domainOf(url.url),
        description: l.description ?? null,
        siteName: l.siteName ?? null,
        thumbnailUrl: l.thumbnailUrl ?? null,
        faviconUrl: l.faviconUrl ?? null,
        folderId: l.folderId ? folderIdMap.get(l.folderId) ?? null : null,
        tags: cleanTags(Array.isArray(l.tags) ? l.tags : []),
        isStarred: Boolean(l.isStarred),
      });
      result.added++;
    }
  });
  return result;
}

/** Removes all links, tags, custom folders and settings, then restores the default folders. */
export async function clearAppData(db: SQLiteDatabase): Promise<void> {
  await db.withTransactionAsync(async () => {
    await db.execAsync(`
      DELETE FROM link_tags;
      DELETE FROM links;
      DELETE FROM tags;
      DELETE FROM metadata_cache;
      DELETE FROM folders;
      DELETE FROM settings;
    `);
    const now = Date.now();
    for (const folder of DEFAULT_FOLDERS) {
      await db.runAsync(
        'INSERT INTO folders (id, name, icon, color, is_default, created_at, updated_at) VALUES (?, ?, ?, ?, 1, ?, ?)',
        [folder.id, folder.name, folder.icon, folder.color, now, now],
      );
    }
  });
}
