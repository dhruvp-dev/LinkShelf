import { Text, View, StyleSheet, type ViewStyle } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Icon, type IconName } from '@/components/Icon';
import { useTheme } from '@/theme/useTheme';
import { spacing, typography, radii } from '@/theme/tokens';

type Props = {
  icon: IconName;
  title: string;
  message?: string;
  action?: React.ReactNode;
  style?: ViewStyle;
};

export function EmptyState({ icon, title, message, action, style }: Props) {
  const { colors } = useTheme();
  return (
    <Animated.View entering={FadeIn.duration(200)} style={[styles.wrap, style]}>
      <View style={[styles.iconWrap, { backgroundColor: colors.surface }]}>
        <Icon name={icon} size={28} color={colors.muted} />
      </View>
      <Text style={[typography.section, { color: colors.text, textAlign: 'center' }]}>{title}</Text>
      {message ? (
        <Text style={[typography.body, { color: colors.muted, textAlign: 'center', maxWidth: 300 }]}>{message}</Text>
      ) : null}
      {action ? <View style={{ marginTop: spacing.md }}>{action}</View> : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xxl, paddingHorizontal: spacing.xl, gap: spacing.sm },
  iconWrap: { width: 64, height: 64, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
});
