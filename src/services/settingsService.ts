import type { SQLiteDatabase } from 'expo-sqlite';
import type { AppSettings } from '@/types/settings';

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  defaultView: 'grid',
  defaultSort: 'recent',
  appIcon: 'classic',
};

export async function loadSettings(db: SQLiteDatabase): Promise<AppSettings> {
  const rows = await db.getAllAsync<{ key: string; value: string }>('SELECT key, value FROM settings');
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return {
    theme: (map.theme as AppSettings['theme']) ?? DEFAULT_SETTINGS.theme,
    defaultView: (map.defaultView as AppSettings['defaultView']) ?? DEFAULT_SETTINGS.defaultView,
    defaultSort: (map.defaultSort as AppSettings['defaultSort']) ?? DEFAULT_SETTINGS.defaultSort,
    appIcon: (map.appIcon as AppSettings['appIcon']) ?? DEFAULT_SETTINGS.appIcon,
  };
}

export async function saveSetting<K extends keyof AppSettings>(
  db: SQLiteDatabase,
  key: K,
  value: AppSettings[K],
): Promise<void> {
  await db.runAsync(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    [key, String(value)],
  );
}

/** Recent search terms, most recent first, capped at 8. */
export async function getRecentSearches(db: SQLiteDatabase): Promise<string[]> {
  const row = await db.getFirstAsync<{ value: string }>("SELECT value FROM settings WHERE key = 'recentSearches'");
  try {
    const parsed = row ? JSON.parse(row.value) : [];
    return Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === 'string') : [];
  } catch {
    return [];
  }
}

export async function addRecentSearch(db: SQLiteDatabase, term: string): Promise<void> {
  const clean = term.trim();
  if (!clean) return;
  const current = await getRecentSearches(db);
  const next = [clean, ...current.filter((s) => s.toLowerCase() !== clean.toLowerCase())].slice(0, 8);
  await db.runAsync(
    "INSERT INTO settings (key, value) VALUES ('recentSearches', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
    [JSON.stringify(next)],
  );
}

export async function clearRecentSearches(db: SQLiteDatabase): Promise<void> {
  await db.runAsync("DELETE FROM settings WHERE key = 'recentSearches'");
}
