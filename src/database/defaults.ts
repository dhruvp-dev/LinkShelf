import type { FolderDraft } from '@/types/folder';

export const DEFAULT_FOLDERS: (FolderDraft & { id: string })[] = [
  { id: 'default-design', name: 'Design', icon: 'color-palette', color: '#B8A9F5' },
  { id: 'default-development', name: 'Development', icon: 'code-slash', color: '#A7D3F5' },
  { id: 'default-travel', name: 'Travel', icon: 'airplane', color: '#A8E6CF' },
  { id: 'default-inspiration', name: 'Inspiration', icon: 'bulb', color: '#FFC6A8' },
  { id: 'default-movies', name: 'Movies & Shows', icon: 'film', color: '#F5B5C8' },
  { id: 'default-read-later', name: 'Read Later', icon: 'book', color: '#F7E08A' },
];

export const FOLDER_ICONS = [
  'folder', 'star', 'color-palette', 'code-slash', 'airplane', 'bulb',
  'film', 'bookmark', 'book', 'heart', 'musical-notes', 'cafe',
] as const;

export const FOLDER_COLORS = [
  '#B8A9F5', '#FFC6A8', '#A8E6CF', '#A7D3F5', '#F5B5C8', '#F7E08A', '#C9C5BD', '#8FD3C9',
];
