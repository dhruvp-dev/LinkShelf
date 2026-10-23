import { useEffect, useState } from 'react';
import { Modal, Pressable, Text, View, StyleSheet } from 'react-native';
import { Icon } from './Icon';
import { useTheme } from '@/theme/useTheme';
import { radii, spacing, typography } from '@/theme/tokens';

export type ConfirmOptions = {
  title: string;
  message: string;
  confirmLabel: string;
  destructive?: boolean;
  onConfirm: () => void | Promise<void>;
};

type Props = {
  options: ConfirmOptions | null;
  onClose: () => void;
};

/**
 * Centred confirmation dialog for actions that remove data. The cancel button is the default
 * choice; the destructive button is red and states the action in full. Keeps the last content
 * while it fades out so the text doesn't blank during the close.
 */
export function ConfirmDialog({ options, onClose }: Props) {
  const { colors } = useTheme();
  const [shown, setShown] = useState<ConfirmOptions | null>(options);

  useEffect(() => {
    if (options) setShown(options);
  }, [options]);

  if (!shown) return null;

  const tint = shown.destructive ? colors.danger : colors.text;
  const confirm = () => {
    onClose();
    shown.onConfirm();
  };

  return (
    <Modal visible={!!options} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Cancel" />
        <View style={[styles.dialog, { backgroundColor: colors.card, borderColor: colors.border }]} accessibilityRole="alert">
          {shown.destructive && (
            <View style={styles.iconWrap}>
              <Icon name="trash-outline" size={22} color={colors.danger} />
            </View>
          )}
          <Text style={[typography.section, { color: colors.text }]}>{shown.title}</Text>
          <Text style={[typography.body, { color: colors.muted }]}>{shown.message}</Text>
          <View style={styles.actions}>
            <Pressable
              onPress={confirm}
              accessibilityRole="button"
              accessibilityLabel={shown.confirmLabel}
              style={({ pressed }) => [styles.button, { backgroundColor: tint, opacity: pressed ? 0.85 : 1 }]}
            >
              <Text style={[typography.section, { color: colors.background, fontSize: 15 }]} numberOfLines={1}>
                {shown.confirmLabel}
              </Text>
            </Pressable>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              style={({ pressed }) => [styles.button, { backgroundColor: colors.surface, opacity: pressed ? 0.7 : 1 }]}
            >
              <Text style={[typography.section, { color: colors.text, fontSize: 15 }]}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  dialog: {
    width: '100%',
    maxWidth: 360,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.xl,
    gap: spacing.sm,
  },
  iconWrap: { alignSelf: 'center' },
  actions: { gap: spacing.sm, marginTop: spacing.lg },
  button: { height: 48, paddingHorizontal: spacing.lg, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' },
});
