import { useEffect, useState } from 'react';
import { Modal, Pressable, Text, View, StyleSheet } from 'react-native';
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Icon, type IconName } from '@/components/Icon';
import { useTheme } from '@/theme/useTheme';
import { radii, spacing, typography } from '@/theme/tokens';

export type SheetAction = {
  label: string;
  icon: IconName;
  onPress: () => void;
  destructive?: boolean;
};

type Props = {
  visible: boolean;
  title?: string;
  actions: SheetAction[];
  onClose: () => void;
};

const OPEN_MS = 220;
const CLOSE_MS = 180;
const SHEET_TRAVEL = 320;

/**
 * "More options" bottom sheet. The backdrop fades and the sheet slides up with Reanimated, and
 * closing plays the same motion in reverse before the modal unmounts. No native slide animation,
 * so there is no jump on open or close.
 */
export function OptionsSheet({ visible, title, actions, onClose }: Props) {
  const { colors } = useTheme();
  const [mounted, setMounted] = useState(false);
  const progress = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      progress.value = withTiming(1, { duration: OPEN_MS, easing: Easing.out(Easing.cubic) });
    } else if (mounted) {
      progress.value = withTiming(
        0,
        { duration: CLOSE_MS, easing: Easing.in(Easing.cubic) },
        (finished) => {
          if (finished) runOnJS(setMounted)(false);
        },
      );
    }
    // `mounted` is read only to decide whether a close needs to animate out.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: progress.value }));
  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: (1 - progress.value) * SHEET_TRAVEL }] }));

  const run = (action: SheetAction) => {
    onClose();
    action.onPress();
  };

  return (
    <Modal visible={mounted} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close menu" />
      </Animated.View>
      <Animated.View style={[styles.sheet, { backgroundColor: colors.card, borderColor: colors.border }, sheetStyle]}>
        <View style={[styles.handle, { backgroundColor: colors.border }]} />
        {title ? (
          <Text numberOfLines={1} style={[typography.meta, styles.title, { color: colors.muted }]}>
            {title}
          </Text>
        ) : null}
        {actions.map((action) => (
          <Pressable
            key={action.label}
            onPress={() => run(action)}
            accessibilityRole="button"
            style={({ pressed }) => [styles.row, { opacity: pressed ? 0.6 : 1 }]}
          >
            <Icon name={action.icon} size={20} color={action.destructive ? colors.danger : colors.text} />
            <Text style={[typography.section, { fontSize: 16, color: action.destructive ? colors.danger : colors.text }]}>
              {action.label}
            </Text>
          </Pressable>
        ))}
        <Pressable onPress={onClose} accessibilityRole="button" style={[styles.cancel, { backgroundColor: colors.surface }]}>
          <Text style={[typography.section, { fontSize: 16, color: colors.text }]}>Cancel</Text>
        </Pressable>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { backgroundColor: 'rgba(0,0,0,0.35)' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    paddingTop: spacing.sm,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: spacing.xs,
  },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, marginBottom: spacing.sm },
  title: { textAlign: 'center', marginBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md },
  cancel: { marginTop: spacing.sm, paddingVertical: spacing.md, borderRadius: radii.md, alignItems: 'center' },
});
