import { useEffect } from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Icon, type IconName } from '@/components/Icon';
import * as Haptics from 'expo-haptics';
import type { ViewMode } from '@/types/link';
import { useTheme } from '@/theme/useTheme';
import { radii, spacing } from '@/theme/tokens';
import { subtleShadow } from '@/theme/neumorphism';
import { springs } from '@/theme/motion';

const ITEM_WIDTH = 34;

export function ViewToggle({ value, onChange }: { value: ViewMode; onChange: (v: ViewMode) => void }) {
  const { colors } = useTheme();
  const translateX = useSharedValue(value === 'grid' ? 0 : ITEM_WIDTH);

  useEffect(() => {
    translateX.value = withSpring(value === 'grid' ? 0 : ITEM_WIDTH, springs.pill);
  }, [value, translateX]);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const handleSelect = (mode: ViewMode) => {
    if (mode !== value) {
      Haptics.selectionAsync().catch(() => {});
      onChange(mode);
    }
  };

  return (
    <View style={[styles.wrap, { backgroundColor: colors.surface }]}>
      <Animated.View
        style={[
          styles.pill,
          subtleShadow,
          { backgroundColor: colors.card },
          pillStyle,
        ]}
      />
      <Pressable
        onPress={() => handleSelect('grid')}
        accessibilityRole="button"
        accessibilityLabel="Grid view"
        accessibilityState={{ selected: value === 'grid' }}
        style={styles.item}
      >
        <Icon name="grid" size={15} color={value === 'grid' ? colors.text : colors.muted} />
      </Pressable>
      <Pressable
        onPress={() => handleSelect('list')}
        accessibilityRole="button"
        accessibilityLabel="List view"
        accessibilityState={{ selected: value === 'list' }}
        style={styles.item}
      >
        <Icon name="list" size={15} color={value === 'list' ? colors.text : colors.muted} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    borderRadius: radii.pill,
    padding: 3,
    position: 'relative',
    alignItems: 'center',
  },
  pill: {
    position: 'absolute',
    top: 3,
    left: 3,
    width: ITEM_WIDTH,
    height: 28,
    borderRadius: radii.pill,
  },
  item: {
    width: ITEM_WIDTH,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    zIndex: 1,
  },
});
