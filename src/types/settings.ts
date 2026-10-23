import type { SortKey, ViewMode } from './link';
import type { AppIconId } from '@/theme/appIcons';

export type ThemePreference = 'system' | 'light' | 'dark';

export type AppSettings = {
  theme: ThemePreference;
  defaultView: ViewMode;
  defaultSort: SortKey;
  appIcon: AppIconId;
};
