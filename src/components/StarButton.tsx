import { Pressable, View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming, Easing } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Icon } from './Icon';
import { useTheme } from '@/theme/useTheme';

export const STAR_YELLOW = '#facc15';

type Props = {
  starred: boolean;
  onToggle: () => void;
  size?: number;
  style?: StyleProp<ViewStyle>;
};

const SPARKS = [
  { x: -1, y: -1 },
  { x: 0, y: -1.3 },
  { x: 1, y: -1 },
  { x: 1.3, y: 0 },
  { x: 1, y: 1 },
  { x: -1, y: 1 },
];

/** A single sparkle that flies out from the star and fades. */
function Spark({ dx, dy, progress, size }: { dx: number; dy: number; progress: { value: number }; size: number }) {
  const style = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
    transform: [
      { translateX: dx * size * 0.9 * progress.value },
      { translateY: dy * size * 0.9 * progress.value },
      { scale: 0.4 + 0.6 * progress.value },
    ],
  }));
  return (
    <Animated.View style={[styles.spark, style]} pointerEvents="none">
      <Icon name="star-filled" size={Math.round(size * 0.45)} color={STAR_YELLOW} />
    </Animated.View>
  );
}

/**
 * Star toggle. Starred shows a yellow filled star; unstarred shows an outline star. Each tap pops
 * the star and throws a few sparkles outward, then fades them out.
 */
export function StarButton({ starred, onToggle, size = 20, style }: Props) {
  const { colors } = useTheme();
  const pop = useSharedValue(1);
  const burst = useSharedValue(1);
  const popStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));

  const press = () => {
    pop.value = withSequence(withSpring(1.35, { damping: 6 }), withSpring(1));
    burst.value = 0;
    burst.value = withTiming(1, { duration: 480, easing: Easing.out(Easing.cubic) });
    Haptics.selectionAsync().catch(() => {});
    onToggle();
  };

  return (
    <Pressable
      onPress={press}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel={starred ? 'Remove from starred' : 'Add to starred'}
      accessibilityState={{ checked: starred }}
      style={style}
    >
      <View style={styles.wrap}>
        {SPARKS.map((s, i) => (
          <Spark key={i} dx={s.x} dy={s.y} progress={burst} size={size} />
        ))}
        <Animated.View style={popStyle}>
          <Icon
            name={starred ? 'star-filled' : 'star-outline'}
            size={size}
            color={starred ? STAR_YELLOW : colors.muted}
          />
        </Animated.View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  spark: { position: 'absolute' },
});
