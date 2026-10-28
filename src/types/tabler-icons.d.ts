// Each icon is imported from its own module so Metro bundles only the glyphs we use,
// not the package barrel (6k+ icons). Every per-icon module default-exports the component.
declare module '@tabler/icons-react-native/*' {
  import type { Icon } from '@tabler/icons-react-native/dist/icons/types';
  const component: Icon;
  export default component;
}
