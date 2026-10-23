import { Pressable, Text, View, StyleSheet } from 'react-native';
import { Icon, type IconName } from '@/components/Icon';
import { useTheme } from '@/theme/useTheme';
import { radii, spacing, typography } from '@/theme/tokens';
import { pluralize } from '@/utils/format';
import { FolderIcon } from './FolderIcon';
import { Card } from './Card';

type Props = {
  name: string;
  icon: string;
  color: string;
  count: number;
  onPress: () => void;
  onMore: () => void;
};

/** Vertical folder row: raised miniature folder, name, saved-link count and a menu button. */
export function FolderRow({ name, color, count, onPress, onMore }: Props) {
  const { colors } = useTheme();
  return (
    <Card onPress={onPress} accessibilityLabel={name} style={styles.row}>
      <FolderIcon color={color} size={44} />
      <View style={styles.text}>
        <Text numberOfLines={1} style={[typography.linkTitle, { color: colors.text, fontSize: 16 }]}>
          {name}
        </Text>
        <Text style={[typography.meta, { color: colors.muted }]}>{pluralize(count, 'saved link')}</Text>
      </View>
      <Pressable onPress={onMore} hitSlop={12} accessibilityRole="button" accessibilityLabel={`${name} options`}>
        <Icon name="ellipsis-horizontal" size={18} color={colors.muted} />
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: radii.md },
  text: { flex: 1, gap: 2 },
});
