import { parseHtmlMetadata } from '@/services/metadataService';

const page = `
<html><head>
  <title>Fallback &amp; title</title>
  <meta name="description" content="Plain description">
  <meta property="og:title" content="OG &quot;title&quot;">
  <meta property="og:image" content="/images/cover.jpg">
  <meta property="og:site_name" content="Example Site">
  <link rel="icon" href="/favicon.png">
</head></html>`;

describe('parseHtmlMetadata', () => {
  it('prefers Open Graph values and decodes entities', () => {
    const meta = parseHtmlMetadata(page, 'https://example.com/post/1');
    expect(meta.title).toBe('OG "title"');
    expect(meta.description).toBe('Plain description');
    expect(meta.siteName).toBe('Example Site');
  });

  it('resolves relative image and icon URLs against the page', () => {
    const meta = parseHtmlMetadata(page, 'https://example.com/post/1');
    expect(meta.thumbnailUrl).toBe('https://example.com/images/cover.jpg');
    expect(meta.faviconUrl).toBe('https://example.com/favicon.png');
  });

  it('falls back to the <title> tag and a favicon service', () => {
    const meta = parseHtmlMetadata('<html><title>Plain Page</title></html>', 'https://plain.test/x');
    expect(meta.title).toBe('Plain Page');
    expect(meta.thumbnailUrl).toBeNull();
    expect(meta.faviconUrl).toContain('plain.test');
  });
});
