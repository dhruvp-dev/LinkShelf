export const SCHEMA_VERSION = 1;

/** Ordered migrations. Index N migrates the database from version N-1 to N. */
export const MIGRATIONS: Record<number, string> = {
  1: `
    CREATE TABLE folders (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      icon TEXT NOT NULL,
      color TEXT NOT NULL,
      is_default INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE UNIQUE INDEX idx_folders_name ON folders(name COLLATE NOCASE);

    CREATE TABLE links (
      id TEXT PRIMARY KEY NOT NULL,
      url TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      domain TEXT NOT NULL,
      site_name TEXT,
      thumbnail_url TEXT,
      favicon_url TEXT,
      folder_id TEXT REFERENCES folders(id) ON DELETE SET NULL,
      is_starred INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      deleted_at INTEGER
    );
    CREATE INDEX idx_links_folder ON links(folder_id);
    CREATE INDEX idx_links_deleted_created ON links(deleted_at, created_at);
    CREATE INDEX idx_links_starred ON links(is_starred, deleted_at);
    CREATE INDEX idx_links_url ON links(url);

    CREATE TABLE tags (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL UNIQUE COLLATE NOCASE
    );

    CREATE TABLE link_tags (
      link_id TEXT NOT NULL REFERENCES links(id) ON DELETE CASCADE,
      tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
      PRIMARY KEY (link_id, tag_id)
    );
    CREATE INDEX idx_link_tags_tag ON link_tags(tag_id);

    CREATE TABLE metadata_cache (
      url TEXT PRIMARY KEY NOT NULL,
      json TEXT NOT NULL,
      fetched_at INTEGER NOT NULL
    );

    CREATE TABLE settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
  `,
};
