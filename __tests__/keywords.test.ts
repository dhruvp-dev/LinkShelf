import { extractKeywords, suggestFolder } from '@/utils/keywords';
import type { Folder } from '@/types/folder';

const mockFolders: Folder[] = [
  { id: 'f-design', name: 'Design', icon: 'color-palette', color: '#B8A9F5', isDefault: true, linkCount: 0, createdAt: 0, updatedAt: 0 },
  { id: 'f-dev', name: 'Development', icon: 'code-slash', color: '#A7D3F5', isDefault: true, linkCount: 0, createdAt: 0, updatedAt: 0 },
  { id: 'f-travel', name: 'Travel', icon: 'airplane', color: '#A8E6CF', isDefault: true, linkCount: 0, createdAt: 0, updatedAt: 0 },
  { id: 'f-inspo', name: 'Inspiration', icon: 'bulb', color: '#FFC6A8', isDefault: true, linkCount: 0, createdAt: 0, updatedAt: 0 },
  { id: 'f-movies', name: 'Movies & Shows', icon: 'film', color: '#F5B5C8', isDefault: true, linkCount: 0, createdAt: 0, updatedAt: 0 },
  { id: 'f-reading', name: 'Read Later', icon: 'book', color: '#F7E08A', isDefault: true, linkCount: 0, createdAt: 0, updatedAt: 0 },
];

describe('extractKeywords', () => {
  it('extracts relevant keywords from url, title, and domain', () => {
    const keywords = extractKeywords({
      url: 'https://github.com/facebook/react',
      title: 'GitHub - facebook/react: The library for web and native user interfaces',
      domain: 'github.com',
    });

    expect(keywords).toContain('react');
    expect(keywords).toContain('github');
    expect(keywords).toContain('facebook');
    expect(keywords).not.toContain('the');
    expect(keywords).not.toContain('for');
  });

  it('includes metadata keywords with high priority', () => {
    const keywords = extractKeywords({
      url: 'https://example.com/post',
      title: 'Tech trends',
      metadataKeywords: ['typescript', 'expo', 'mobile'],
    });

    expect(keywords).toContain('typescript');
    expect(keywords).toContain('expo');
    expect(keywords).toContain('mobile');
  });

  it('filters out stop words and short noise', () => {
    const keywords = extractKeywords({
      title: 'How to make a great and very simple web page about cats',
    });

    expect(keywords).toContain('cats');
    expect(keywords).toContain('simple');
    expect(keywords).not.toContain('how');
    expect(keywords).not.toContain('and');
    expect(keywords).not.toContain('about');
  });
});

describe('suggestFolder', () => {
  it('suggests Development for github and coding links', () => {
    const folder = suggestFolder(mockFolders, {
      url: 'https://github.com/facebook/react',
      title: 'facebook/react: A declarative, efficient UI library for JavaScript',
      domain: 'github.com',
    });

    expect(folder?.id).toBe('f-dev');
  });

  it('suggests Design for Figma and UI links', () => {
    const folder = suggestFolder(mockFolders, {
      url: 'https://figma.com/@designer/design-system',
      title: 'Minimal Design System UI Kit',
      domain: 'figma.com',
    });

    expect(folder?.id).toBe('f-design');
  });

  it('suggests Movies & Shows for video and YouTube links', () => {
    const folder = suggestFolder(mockFolders, {
      url: 'https://youtube.com/watch?v=12345',
      title: 'Official Movie Trailer HD',
      domain: 'youtube.com',
    });

    expect(folder?.id).toBe('f-movies');
  });

  it('suggests Travel for flight and hotel links', () => {
    const folder = suggestFolder(mockFolders, {
      url: 'https://airbnb.com/rooms/1234',
      title: 'Beautiful Mountain Cabin Vacation Rental',
      domain: 'airbnb.com',
    });

    expect(folder?.id).toBe('f-travel');
  });

  it('suggests Read Later for essays and articles', () => {
    const folder = suggestFolder(mockFolders, {
      url: 'https://medium.com/@author/deep-dive-into-systems',
      title: 'A Deep-Dive Essay on Distributed Systems',
      domain: 'medium.com',
    });

    expect(folder?.id).toBe('f-reading');
  });

  it('suggests custom folders when folder name matches keywords', () => {
    const customFolders: Folder[] = [
      ...mockFolders,
      { id: 'f-cooking', name: 'Cooking Recipes', icon: 'cafe', color: '#8FD3C9', isDefault: false, linkCount: 0, createdAt: 0, updatedAt: 0 },
    ];

    const folder = suggestFolder(customFolders, {
      url: 'https://seriouseats.com/authentic-ramen-recipe',
      title: 'The Best Homemade Ramen Recipe - Delicious Cooking',
      domain: 'seriouseats.com',
    });

    expect(folder?.id).toBe('f-cooking');
  });

  it('returns null when there are no relevant matches', () => {
    const folder = suggestFolder(mockFolders, {
      url: 'https://example.com/xyz',
      title: 'Random Untitled Data 4829',
    });

    expect(folder).toBeNull();
  });
});
