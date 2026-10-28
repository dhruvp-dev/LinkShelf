import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FlatList, Pressable, Text, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Icon, type IconName } from '@/components/Icon';
import { useFolders } from '@/hooks/useFolders';
import { useFolderActions } from '@/hooks/useFolderActions';
import { useTheme } from '@/theme/useTheme';
import { radii, spacing, typography } from '@/theme/tokens';
import { FolderRow } from '@/components/FolderRow';
import type { Folder } from '@/types/folder';

const Separator = () => <View style={{ height: spacing.sm }} />;

export default function FoldersScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { folders, counts, reload } = useFolders();
  const actions = useFolderActions(reload);

  const shortcut = (label: string, count: number, icon: IconName, onPress: () => void, iconColor?: string) => (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={[styles.shortcut, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <Icon name={icon} size={20} color={iconColor ?? colors.text} />
      <Text style={[typography.linkTitle, { color: colors.text, flex: 1, fontSize: 16 }]}>{label}</Text>
      <Text style={[typography.meta, { color: colors.muted }]}>{count}</Text>
      <Icon name="chevron-forward" size={16} color={colors.muted} />
    </Pressable>
  );

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={[typography.display, { color: colors.text }]}>Shelves</Text>
          <Text style={[typography.body, { color: colors.muted }]}>Organize your saved links.</Text>
        </View>
        <Pressable
          onPress={() => router.push('/folders/edit')}
          accessibilityRole="button"
          accessibilityLabel="New shelf"
          style={[styles.newBtn, { backgroundColor: colors.fab }]}
        >
          <Icon name="add" size={20} color={colors.fabIcon} />
        </Pressable>
      </View>

      <FlatList
        data={folders}
        keyExtractor={(f) => f.id}
        renderItem={({ item }: { item: Folder }) => (
          <FolderRow
            name={item.name}
            icon={item.icon}
            color={item.color}
            count={item.linkCount}
            onPress={() => router.push(`/folders/${item.id}`)}
            onMore={() => actions.onMore(item)}
          />
        )}
        ItemSeparatorComponent={Separator}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={{ gap: spacing.sm, marginBottom: spacing.md }}>
            {shortcut('All Links', counts.all, 'albums-outline', () => router.push('/folders/all'))}
            {shortcut('Starred', counts.starred, 'star-filled', () => router.push('/folders/starred'), '#facc15')}
            <Text style={[typography.eyebrow, { color: colors.muted, marginTop: spacing.md }]}>Your shelves</Text>
          </View>
        }
        ListFooterComponent={
          <Pressable
            onPress={() => router.push('/trash')}
            accessibilityRole="button"
            style={[styles.shortcut, { backgroundColor: colors.card, borderColor: colors.border, marginTop: spacing.lg }]}
          >
            <Icon name="trash-outline" size={20} color={colors.text} />
            <Text style={[typography.linkTitle, { color: colors.text, flex: 1, fontSize: 16 }]}>Trash</Text>
            <Icon name="chevron-forward" size={16} color={colors.muted} />
          </Pressable>
        }
      />
      {actions.element}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  newBtn: { width: 44, height: 44, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: spacing.lg, paddingBottom: 140 },
  shortcut: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: radii.md, borderWidth: StyleSheet.hairlineWidth },
});
