import type { StyleProp, ViewStyle } from 'react-native';
import {
  Add,
  Airplane,
  ArrowRightUp,
  Book,
  Bookmark,
  Bulb,
  Check,
  ChevronRight,
  Clipboard,
  Clock,
  CloseCircle,
  Code,
  Coffee,
  Compass,
  Copy,
  Database,
  Download,
  Edit,
  Film,
  Folder,
  FolderOpen,
  Globe,
  Grid,
  Heart,
  Home,
  InfoCircle,
  Instagram,
  Layers,
  Link,
  List3,
  Mobile,
  Moon,
  More,
  Music,
  Palette,
  PlayCircle,
  Refresh,
  Search,
  Setting,
  Sort,
  Star,
  Sun,
  Trash,
  Undo,
  Upload,
  User,
  X,
  type IconComponent,
  type IconWeight,
} from 'reicon-react-native';

export type { IconWeight };

export type IconProps = {
  size?: number;
  color?: string;
  strokeWidth?: number | string;
  weight?: IconWeight;
  filled?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * Reicon icon glyph registry. Callers keep standard app icon names; this table maps them
 * directly to reicon-react-native vector components.
 */
const ICONS = {
  add: Add,
  albums: Grid,
  'albums-outline': Grid,
  'arrow-undo-outline': Undo,
  'arrow-up-outline': ArrowRightUp,
  bookmark: Bookmark,
  'bookmarks-outline': Layers,
  checkmark: Check,
  'chevron-forward': ChevronRight,
  'clipboard-outline': Clipboard,
  close: X,
  'close-circle': CloseCircle,
  'close-outline': X,
  'color-palette-outline': Palette,
  compass: Compass,
  'copy-outline': Copy,
  'create-outline': Edit,
  'download-outline': Download,
  'ellipsis-horizontal': More,
  'folder-outline': Folder,
  folder: Folder,
  'folder-open': FolderOpen,
  'folder-open-outline': FolderOpen,
  folders: Layers,
  globe: Globe,
  'globe-outline': Globe,
  grid: Grid,
  home: Home,
  'link-outline': Link,
  list: List3,
  layers: Layers,
  'logo-instagram': Instagram,
  'logo-youtube': PlayCircle,
  'moon-outline': Moon,
  'open-outline': ArrowRightUp,
  person: User,
  'phone-portrait-outline': Mobile,
  search: Search,
  'search-outline': Search,
  settings: Setting,
  'settings-outline': Setting,
  star: Star,
  'star-outline': Star,
  'star-filled': Star,
  'push-outline': Upload,
  'sunny-outline': Sun,
  'time-outline': Clock,
  'trash-outline': Trash,
  save: Bookmark,
  bulb: Bulb,
  'musical-notes': Music,
  heart: Heart,
  film: Film,
  cafe: Coffee,
  airplane: Airplane,
  'code-slash': Code,
  book: Book,
  'color-palette': Palette,
  info: InfoCircle,
  download: Download,
  'sun-moon': Sun,
  'layout-list': List3,
  'arrows-sort': Sort,
  database: Database,
  refresh: Refresh,
} as const;

export type IconName = keyof typeof ICONS;

export function Icon({
  name,
  size = 20,
  color = '#000',
  strokeWidth,
  weight,
  filled,
  style,
}: IconProps & { name: IconName }) {
  const Glyph = (ICONS[name] ?? Star) as IconComponent;

  // Determine icon weight:
  // 1. Explicit weight prop ('Filled' | 'Outline')
  // 2. Explicit filled boolean prop
  // 3. 'star-outline' explicitly resolves to 'Outline' for unstarred state
  // 4. Default to 'Filled' for rich, modern tactile appearance
  let resolvedWeight: IconWeight = 'Filled';
  if (weight) {
    resolvedWeight = weight;
  } else if (typeof filled === 'boolean') {
    resolvedWeight = filled ? 'Filled' : 'Outline';
  } else if (name === 'star-outline') {
    resolvedWeight = 'Outline';
  } else {
    resolvedWeight = 'Filled';
  }

  return (
    <Glyph
      size={size}
      color={color}
      weight={resolvedWeight}
      strokeWidth={strokeWidth}
      style={style}
    />
  );
}
