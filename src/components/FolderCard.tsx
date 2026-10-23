import { Pressable, Text, View, StyleSheet } from 'react-native';
import { Icon } from '@/components/Icon';
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
  onLongPress?: () => void;
  onMore?: () => void;
  compact?: boolean;
};

/** Card folder tile for Home shortcuts and the folder grid. Pressing sinks it into the background. */
export function FolderCard({ name, color, count, onPress, onLongPress, onMore, compact }: Props) {
  const { colors } = useTheme();
  if (compact) {
    return (
      <Card onPress={onPress} accessibilityLabel={name} style={styles.compact}>
        <FolderIcon color={color} size={30} />
        <View style={{ gap: 1 }}>
          <Text numberOfLines={1} style={[typography.linkTitle, { color: colors.text, fontSize: 14 }]}>
            {name}
          </Text>
          <Text style={[typography.meta, { color: colors.muted }]}>{count}</Text>
        </View>
      </Card>
    );
  }
  return (
    <View style={{ flex: 1 }}>
      <Card onPress={onPress} onLongPress={onLongPress} accessibilityLabel={name} style={styles.card}>
        <FolderIcon color={color} size={44} />
        <View style={styles.textWrap}>
          <Text numberOfLines={1} style={[typography.linkTitle, { color: colors.text }]}>
            {name}
          </Text>
          <Text style={[typography.meta, { color: colors.muted }]}>{pluralize(count, 'link')}</Text>
        </View>
        {onMore && (
          <Pressable onPress={onMore} hitSlop={10} accessibilityRole="button" accessibilityLabel="Shelf options">
            <Icon name="ellipsis-horizontal" size={16} color={colors.muted} />
          </Pressable>
        )}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: radii.lg, margin: spacing.xs },
  compact: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radii.lg },
  textWrap: { flex: 1, gap: 2 },
});
