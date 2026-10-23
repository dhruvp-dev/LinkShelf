import { type ReactNode } from 'react';
import { Pressable, StyleSheet, type AccessibilityState, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useTheme } from '@/theme/useTheme';
import { recessedBorder } from '@/theme/neumorphism';
import { springs } from '@/theme/motion';

type Props = {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityRole?: 'button' | 'link' | 'none';
  accessibilityState?: AccessibilityState;
  hitSlop?: number;
};

/**
 * Surface card with a hairline ring and layered light depth.
 * Tactile 0.98 scale press response using interactive spring physics.
 */
export function Card({ children, style, onPress, onLongPress, disabled, accessibilityLabel, accessibilityRole = 'button', accessibilityState, hitSlop }: Props) {
  const { colors } = useTheme();
  const pressed = useSharedValue(0);
  const animated = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - 0.02 * pressed.value }],
    opacity: 1 - 0.04 * pressed.value,
  }));
  const body = (
    <Animated.View style={[{ backgroundColor: colors.card, borderColor: colors.border, borderWidth: StyleSheet.hairlineWidth }, animated, style]}>
      {children}
    </Animated.View>
  );
  if (!onPress && !onLongPress) return body;
  return (
    <Pressable
      onPressIn={() => (pressed.value = withSpring(1, springs.interactive))}
      onPressOut={() => (pressed.value = withSpring(0, springs.interactive))}
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={disabled}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={accessibilityState ?? { disabled: !!disabled }}
      hitSlop={hitSlop}
    >
      {body}
    </Pressable>
  );
}

/** Input well: slate-100 fill with a border, used by search and form fields. */
export function Surface({ children, style }: { children?: ReactNode; style?: StyleProp<ViewStyle> }) {
  const { colors } = useTheme();
  return <Animated.View style={[{ backgroundColor: colors.surface }, recessedBorder, style]}>{children}</Animated.View>;
}
