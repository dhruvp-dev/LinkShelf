import { Pressable, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { radii, spacing, typography } from '@/theme/tokens';
import { Icon, type IconName } from './Icon';
import { Card } from './Card';

/** Round ghost icon button for headers and toolbars. */
export function IconButton({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable onPress={onPress} hitSlop={8} accessibilityRole="button" accessibilityLabel={label} style={styles.iconBtn}>
      <Icon name={icon} size={20} color={colors.muted} />
    </Pressable>
  );
}

/** Primary CTA: solid accent, 48px tall, semibold label, clear pressed and disabled states. */
export function PrimaryButton({ label, onPress, disabled, icon }: { label: string; onPress: () => void; disabled?: boolean; icon?: IconName }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [
        styles.primary,
        { backgroundColor: colors.fab, opacity: disabled ? 0.45 : 1, transform: [{ scale: pressed && !disabled ? 0.98 : 1 }] },
      ]}
    >
      {icon && <Icon name={icon} size={18} color={colors.fabIcon} />}
      <Text style={[typography.section, { color: colors.fabIcon, fontSize: 16, lineHeight: 20 }]}>{label}</Text>
    </Pressable>
  );
}

/** Secondary action: white button with a border. */
export function SecondaryButton({ label, onPress, destructive }: { label: string; onPress: () => void; icon?: IconName; destructive?: boolean }) {
  const { colors } = useTheme();
  const tint = destructive ? colors.danger : colors.text;
  return (
    <Card onPress={onPress} accessibilityLabel={label} style={styles.secondary}>
      <Text style={[typography.meta, { color: tint, fontSize: 13, fontFamily: 'PublicSans_600SemiBold' }]}>{label}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  iconBtn: { width: 40, height: 40, borderRadius: radii.pill, alignItems: 'center', justifyContent: 'center' },
  primary: { height: 44, paddingHorizontal: spacing.xl, borderRadius: radii.pill, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: spacing.sm },
  secondary: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm + 2, borderRadius: radii.pill },
});
