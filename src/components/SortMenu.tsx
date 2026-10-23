import { Pressable, ScrollView, Text, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import type { SortKey } from '@/types/link';
import { useTheme } from '@/theme/useTheme';
import { radii, spacing, typography } from '@/theme/tokens';
import { springs } from '@/theme/motion';

export const SORT_LABELS: Record<SortKey, string> = {
  recent: 'Recently saved',
  oldest: 'Oldest saved',
  title_asc: 'Title A–Z',
  title_desc: 'Title Z–A',
};

function SortChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const pressed = useSharedValue(0);

  const chipStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - 0.04 * pressed.value }],
  }));

  const handlePress = () => {
    if (!active) {
      Haptics.selectionAsync().catch(() => {});
    }
    onPress();
  };

  return (
    <Pressable
      onPressIn={() => (pressed.value = withSpring(1, springs.interactive))}
      onPressOut={() => (pressed.value = withSpring(0, springs.interactive))}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
    >
      <Animated.View
        style={[
          styles.chip,
          { backgroundColor: active ? colors.text : colors.surface },
          chipStyle,
        ]}
      >
        <Text style={[typography.meta, { color: active ? colors.background : colors.muted }]}>
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

/** Horizontal chip row for picking a sort order. */
export function SortMenu({ value, onChange }: { value: SortKey; onChange: (s: SortKey) => void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.wrap}>
      {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
        <SortChip
          key={key}
          label={SORT_LABELS[key]}
          active={key === value}
          onPress={() => onChange(key)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2, borderRadius: radii.pill },
});
