import { domainOf, extractUrl, normalizeUrl } from '@/utils/url';

describe('normalizeUrl', () => {
  it('accepts http and https links unchanged', () => {
    expect(normalizeUrl('https://example.com/a?b=1')).toEqual({ ok: true, url: 'https://example.com/a?b=1' });
    expect(normalizeUrl('http://example.org')).toEqual({ ok: true, url: 'http://example.org/' });
  });

  it('adds https to bare domains', () => {
    expect(normalizeUrl('  example.com/page ')).toEqual({ ok: true, url: 'https://example.com/page' });
  });

  it('rejects empty input and non-web schemes', () => {
    expect(normalizeUrl('   ').ok).toBe(false);
    expect(normalizeUrl('ftp://example.com').ok).toBe(false);
    expect(normalizeUrl('javascript:alert(1)').ok).toBe(false);
  });

  it('rejects text that is not a link', () => {
    expect(normalizeUrl('hello world').ok).toBe(false);
  });
});

describe('domainOf', () => {
  it('strips www.', () => {
    expect(domainOf('https://www.youtube.com/watch?v=1')).toBe('youtube.com');
  });
});

describe('extractUrl', () => {
  it('finds the first link in shared text', () => {
    expect(extractUrl('Check this out https://instagram.com/p/abc great')).toBe('https://instagram.com/p/abc');
  });

  it('returns null when there is no link', () => {
    expect(extractUrl('no links here')).toBeNull();
    expect(extractUrl(null)).toBeNull();
  });
});
