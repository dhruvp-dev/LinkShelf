import type { ComponentType } from 'react';
import IconArrowBackUp from '@tabler/icons-react-native/IconArrowBackUp';
import IconBook from '@tabler/icons-react-native/IconBook';
import IconBookmark from '@tabler/icons-react-native/IconBookmark';
import IconBrandInstagram from '@tabler/icons-react-native/IconBrandInstagram';
import IconBrandYoutube from '@tabler/icons-react-native/IconBrandYoutube';
import IconBulb from '@tabler/icons-react-native/IconBulb';
import IconCheck from '@tabler/icons-react-native/IconCheck';
import IconChevronRight from '@tabler/icons-react-native/IconChevronRight';
import IconCircleX from '@tabler/icons-react-native/IconCircleX';
import IconClipboard from '@tabler/icons-react-native/IconClipboard';
import IconClock from '@tabler/icons-react-native/IconClock';
import IconCode from '@tabler/icons-react-native/IconCode';
import IconCoffee from '@tabler/icons-react-native/IconCoffee';
import IconCompass from '@tabler/icons-react-native/IconCompass';
import IconCopy from '@tabler/icons-react-native/IconCopy';
import IconDeviceMobile from '@tabler/icons-react-native/IconDeviceMobile';
import IconDots from '@tabler/icons-react-native/IconDots';
import IconDownload from '@tabler/icons-react-native/IconDownload';
import IconExternalLink from '@tabler/icons-react-native/IconExternalLink';
import IconFolder from '@tabler/icons-react-native/IconFolder';
import IconFolderOpen from '@tabler/icons-react-native/IconFolderOpen';
import IconHeart from '@tabler/icons-react-native/IconHeart';
import IconHome from '@tabler/icons-react-native/IconHome';
import IconInfoCircle from '@tabler/icons-react-native/IconInfoCircle';
import IconLayoutGrid from '@tabler/icons-react-native/IconLayoutGrid';
import IconLink from '@tabler/icons-react-native/IconLink';
import IconList from '@tabler/icons-react-native/IconList';
import IconMoon from '@tabler/icons-react-native/IconMoon';
import IconMovie from '@tabler/icons-react-native/IconMovie';
import IconMusic from '@tabler/icons-react-native/IconMusic';
import IconPalette from '@tabler/icons-react-native/IconPalette';
import IconPencil from '@tabler/icons-react-native/IconPencil';
import IconPlane from '@tabler/icons-react-native/IconPlane';
import IconPlus from '@tabler/icons-react-native/IconPlus';
import IconSearch from '@tabler/icons-react-native/IconSearch';
import IconSettings from '@tabler/icons-react-native/IconSettings';
import IconStack2 from '@tabler/icons-react-native/IconStack2';
import IconStar from '@tabler/icons-react-native/IconStar';
import IconStarFilled from '@tabler/icons-react-native/IconStarFilled';
import IconSun from '@tabler/icons-react-native/IconSun';
import IconTrash from '@tabler/icons-react-native/IconTrash';
import IconUpload from '@tabler/icons-react-native/IconUpload';
import IconUser from '@tabler/icons-react-native/IconUser';
import IconWorld from '@tabler/icons-react-native/IconWorld';
import IconX from '@tabler/icons-react-native/IconX';
import IconSunMoon from '@tabler/icons-react-native/IconSunMoon';
import IconLayoutList from '@tabler/icons-react-native/IconLayoutList';
import IconArrowsSort from '@tabler/icons-react-native/IconArrowsSort';
import IconDatabase from '@tabler/icons-react-native/IconDatabase';
import IconRefresh from '@tabler/icons-react-native/IconRefresh';
import IconHomeFilled from '@tabler/icons-react-native/IconHomeFilled';
import IconSearchFilled from '@tabler/icons-react-native/IconSearchFilled';
import IconStackFilled from '@tabler/icons-react-native/IconStackFilled';
import IconSettingsFilled from '@tabler/icons-react-native/IconSettingsFilled';
import IconLayoutGridFilled from '@tabler/icons-react-native/IconLayoutGridFilled';
import IconUserFilled from '@tabler/icons-react-native/IconUserFilled';
import IconPlusFilled from '@tabler/icons-react-native/IconPlusFilled';
import IconBookmarkFilled from '@tabler/icons-react-native/IconBookmarkFilled';
import IconFolderFilled from '@tabler/icons-react-native/IconFolderFilled';

type IconProps = { size?: number; color?: string; strokeWidth?: number };

/** Filled variants used for the active tab and selected states. Names without an entry stay outlined. */
const FILLED: Partial<Record<string, ComponentType<IconProps>>> = {
  home: IconHomeFilled,
  search: IconSearchFilled,
  folders: IconStackFilled,
  folder: IconFolderFilled,
  settings: IconSettingsFilled,
  star: IconStarFilled,
  'star-filled': IconStarFilled,
  grid: IconLayoutGridFilled,
  person: IconUserFilled,
  add: IconPlusFilled,
  bookmark: IconBookmarkFilled,
};

/**
 * Tabler icons for every glyph in the app. Callers keep the same names; this table is the only
 * place that decides which Tabler icon each one uses.
 */
const ICONS = {
  add: IconPlus,
  albums: IconLayoutGrid,
  'albums-outline': IconLayoutGrid,
  'arrow-undo-outline': IconArrowBackUp,
  'arrow-up-outline': IconExternalLink,
  bookmark: IconBookmark,
  'bookmarks-outline': IconStack2,
  checkmark: IconCheck,
  'chevron-forward': IconChevronRight,
  'clipboard-outline': IconClipboard,
  close: IconX,
  'close-circle': IconCircleX,
  'close-outline': IconX,
  'color-palette-outline': IconPalette,
  compass: IconCompass,
  'copy-outline': IconCopy,
  'create-outline': IconPencil,
  'download-outline': IconDownload,
  'ellipsis-horizontal': IconDots,
  'folder-outline': IconFolder,
  folder: IconFolder,
  'folder-open': IconFolderOpen,
  'folder-open-outline': IconFolderOpen,
  folders: IconStack2,
  globe: IconWorld,
  'globe-outline': IconWorld,
  grid: IconLayoutGrid,
  home: IconHome,
  'link-outline': IconLink,
  list: IconList,
  layers: IconStack2,
  'logo-instagram': IconBrandInstagram,
  'logo-youtube': IconBrandYoutube,
  'moon-outline': IconMoon,
  'open-outline': IconExternalLink,
  person: IconUser,
  'phone-portrait-outline': IconDeviceMobile,
  search: IconSearch,
  'search-outline': IconSearch,
  settings: IconSettings,
  'settings-outline': IconSettings,
  star: IconStar,
  'star-outline': IconStar,
  'star-filled': IconStarFilled,
  'push-outline': IconUpload,
  'sunny-outline': IconSun,
  'time-outline': IconClock,
  'trash-outline': IconTrash,
  save: IconBookmark,
  bulb: IconBulb,
  'musical-notes': IconMusic,
  heart: IconHeart,
  film: IconMovie,
  cafe: IconCoffee,
  airplane: IconPlane,
  'code-slash': IconCode,
  book: IconBook,
  'color-palette': IconPalette,
  info: IconInfoCircle,
  download: IconDownload,
  'sun-moon': IconSunMoon,
  'layout-list': IconLayoutList,
  'arrows-sort': IconArrowsSort,
  database: IconDatabase,
  refresh: IconRefresh,
} as const;

export type IconName = keyof typeof ICONS;

export function Icon({ name, size = 20, color = '#000', strokeWidth = 1.8, filled = false }: IconProps & { name: IconName; filled?: boolean }) {
  const Glyph = (filled && FILLED[name]) || (ICONS[name] as ComponentType<IconProps>);
  return <Glyph size={size} color={color} strokeWidth={strokeWidth} />;
}
