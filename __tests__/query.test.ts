import { buildLinkQuery } from '@/database/queries';
import { validateExport } from '@/services/importExportService';
import { cleanTags } from '@/services/linkService';

describe('buildLinkQuery', () => {
  it('excludes trashed links for normal collections', () => {
    const { sql } = buildLinkQuery({ sort: 'recent', limit: 10, offset: 0 });
    expect(sql).toContain('l.deleted_at IS NULL');
  });

  it('uses deleted_at for Trash', () => {
    const { sql } = buildLinkQuery({ sort: 'recent', trashed: true, limit: 10, offset: 0 });
    expect(sql).toContain('l.deleted_at IS NOT NULL');
  });

  it('binds search terms and escapes LIKE wildcards', () => {
    const { params } = buildLinkQuery({ sort: 'title_asc', search: '50%_off', limit: 5, offset: 10 });
    expect(params[0]).toBe('%50\\%\\_off%');
    expect(params.slice(-2)).toEqual([5, 10]);
  });
});

describe('cleanTags', () => {
  it('trims, removes duplicates case-insensitively and strips commas', () => {
    expect(cleanTags(['  Design ', 'design', 'a,b', ''])).toEqual(['Design', 'a b']);
  });
});

describe('validateExport', () => {
  const good = { format: 'linkshelf', version: 1, folders: [], links: [{ id: '1', url: 'https://example.com' }] };

  it('accepts a valid export', () => {
    expect(validateExport(good)).toBeNull();
  });

  it('rejects files from other apps', () => {
    expect(validateExport({ hello: 'world' })).toMatch(/not a LinkShelf export/);
  });

  it('rejects links with invalid URLs', () => {
    expect(validateExport({ ...good, links: [{ id: '1', url: 'javascript:void(0)' }] })).toMatch(/invalid URL/);
  });
});
