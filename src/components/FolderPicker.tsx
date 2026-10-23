import { Modal, Pressable, ScrollView, Text, View, StyleSheet } from 'react-native';
import { Icon, type IconName } from '@/components/Icon';
import type { Folder } from '@/types/folder';
import { useTheme } from '@/theme/useTheme';
import { radii, spacing, typography } from '@/theme/tokens';

type Props = {
  visible: boolean;
  folders: Folder[];
  /** Folder that is currently selected. `null` means All Links / no folder. */
  selectedId: string | null;
  /** Show the "All Links" (no folder) option. */
  allowNone?: boolean;
  /** Folder ids to hide, e.g. the folder being deleted. */
  exclude?: string[];
  onSelect: (folderId: string | null) => void;
  onClose: () => void;
};

/** Modal list for choosing a folder. Used by Move, Save, and folder-delete flows. */
export function FolderPicker({ visible, folders, selectedId, allowNone = true, exclude = [], onSelect, onClose }: Props) {
  const { colors } = useTheme();
  const options = folders.filter((f) => !exclude.includes(f.id));

  const Row = ({ label, color, selected, onPress }: { label: string; color: string; selected: boolean; onPress: () => void }) => (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => [styles.row, { opacity: pressed ? 0.6 : 1, borderColor: colors.border }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[typography.body, { flex: 1, color: colors.text, fontSize: 16 }]}>{label}</Text>
      {selected && <Icon name="checkmark" size={20} color={colors.text} />}
    </Pressable>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[typography.section, { color: colors.text }]}>Choose shelf</Text>
          <Pressable onPress={onClose} hitSlop={10} accessibilityRole="button" accessibilityLabel="Close">
            <Icon name="close" size={24} color={colors.text} />
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl }}>
          {allowNone && (
            <Row label="All Links (no shelf)" color={colors.muted} selected={selectedId === null} onPress={() => onSelect(null)} />
          )}
          {options.map((f) => (
            <Row key={f.id} label={f.name} color={f.color} selected={selectedId === f.id} onPress={() => onSelect(f.id)} />
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: spacing.xl },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth },
  dot: { width: 12, height: 12, borderRadius: radii.md },
});
