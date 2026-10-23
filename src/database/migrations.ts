import type { SQLiteDatabase } from 'expo-sqlite';
import { DEFAULT_FOLDERS } from './defaults';
import { MIGRATIONS, SCHEMA_VERSION } from './schema';

/** Applies pending migrations, each in its own transaction, then seeds default folders on first run. */
export async function migrateDatabase(db: SQLiteDatabase): Promise<void> {
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');

  const current = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const from = current?.user_version ?? 0;
  if (from >= SCHEMA_VERSION) return;

  await db.withTransactionAsync(async () => {
    for (let version = from + 1; version <= SCHEMA_VERSION; version++) {
      await db.execAsync(MIGRATIONS[version]);
    }
    const now = Date.now();
    for (const folder of DEFAULT_FOLDERS) {
      await db.runAsync(
        `INSERT OR IGNORE INTO folders (id, name, icon, color, is_default, created_at, updated_at)
         VALUES (?, ?, ?, ?, 1, ?, ?)`,
        [folder.id, folder.name, folder.icon, folder.color, now, now],
      );
    }
    await db.execAsync(`PRAGMA user_version = ${SCHEMA_VERSION}`);
  });
}
