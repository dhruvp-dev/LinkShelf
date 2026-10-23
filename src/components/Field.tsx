import { Text, TextInput, View, StyleSheet, type TextInputProps } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { recessedBorder } from '@/theme/neumorphism';
import { radii, spacing, typography } from '@/theme/tokens';

type Props = TextInputProps & { label: string; error?: string | null; hint?: string };

/** Labeled text input with an inline validation message. */
export function Field({ label, error, hint, style, ...rest }: Props) {
  const { colors } = useTheme();
  return (
    <View style={styles.wrap}>
      <Text style={[typography.meta, { color: colors.muted }]}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.muted}
        accessibilityLabel={label}
        style={[
          typography.body,
          styles.input,
          { color: colors.text, backgroundColor: colors.surface },
          recessedBorder,
          error ? { borderColor: colors.danger, borderWidth: 1 } : null,
          style,
        ]}
        {...rest}
      />
      {error ? <Text style={[typography.meta, { color: colors.danger }]}>{error}</Text> : hint ? <Text style={[typography.meta, { color: colors.muted }]}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  input: { borderWidth: StyleSheet.hairlineWidth, borderRadius: radii.pill, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, fontSize: 15 },
});
