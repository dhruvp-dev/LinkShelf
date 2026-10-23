import { TextInput, Pressable, View, StyleSheet } from 'react-native';
import { Icon, type IconName } from '@/components/Icon';
import { useTheme } from '@/theme/useTheme';
import { Surface } from './Card';
import { radii, spacing, typography } from '@/theme/tokens';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  onSubmit?: () => void;
};

export function SearchBar({ value, onChangeText, placeholder = 'Search links', autoFocus, onSubmit }: Props) {
  const { colors } = useTheme();
  return (
    <Surface style={styles.wrap}>
      <Icon name="search" size={18} color={colors.muted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        autoFocus={autoFocus}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        onSubmitEditing={onSubmit}
        clearButtonMode="never"
        style={[typography.body, styles.input, { color: colors.text }]}
        accessibilityLabel="Search"
      />
      {value.length > 0 && (
        <Pressable onPress={() => onChangeText('')} hitSlop={10} accessibilityRole="button" accessibilityLabel="Clear search">
          <Icon name="close-circle" size={18} color={colors.muted} />
        </Pressable>
      )}
    </Surface>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, height: 44, borderRadius: radii.pill },
  input: { flex: 1, height: 44, paddingVertical: 0 },
});
