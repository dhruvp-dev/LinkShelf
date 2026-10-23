export type Folder = {
  id: string;
  name: string;
  icon: string;
  color: string;
  isDefault: boolean;
  linkCount: number;
  createdAt: number;
  updatedAt: number;
};

export type FolderDraft = { name: string; icon: string; color: string };
