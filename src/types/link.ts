export type SortKey = 'recent' | 'oldest' | 'title_asc' | 'title_desc';
export type ViewMode = 'grid' | 'list';

export type Link = {
  id: string;
  url: string;
  title: string;
  description: string | null;
  domain: string;
  siteName: string | null;
  thumbnailUrl: string | null;
  faviconUrl: string | null;
  folderId: string | null;
  folderName: string | null;
  folderColor: string | null;
  tags: string[];
  isStarred: boolean;
  createdAt: number;
  updatedAt: number;
  deletedAt: number | null;
};

/** Fields the user can set when saving or editing a link. */
export type LinkDraft = {
  url: string;
  title: string;
  description: string | null;
  siteName: string | null;
  thumbnailUrl: string | null;
  faviconUrl: string | null;
  folderId: string | null;
  tags: string[];
  isStarred: boolean;
};
