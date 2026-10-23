import type { ThemeColors } from '@/theme/tokens';

export const TAB_HEIGHT = 60;

/** Tab bar look, shared by the tab layout and by screens that hide the bar temporarily. */
export function tabBarStyle(colors: ThemeColors) {
  return {
    height: TAB_HEIGHT,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
    elevation: 0,
  };
}
