import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View, StyleSheet } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Icon, type IconName } from '@/components/Icon';
import { useSQLiteContext } from 'expo-sqlite';
import { createFolder, getFolder, updateFolder } from '@/services/folderService';
import { FOLDER_COLORS, FOLDER_ICONS } from '@/database/defaults';
import { useToast } from '@/components/Toast';
import { Field } from '@/components/Field';
import { PrimaryButton } from '@/components/Buttons';
import { useTheme } from '@/theme/useTheme';
import { radii, spacing, typography } from '@/theme/tokens';

/** Create or edit a folder: name, icon and color. Pass `?id=` to edit. */
export default function FolderEditScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const db = useSQLiteContext();
  const toast = useToast();
  const { colors } = useTheme();
  const isEdit = !!id;

  const [name, setName] = useState('');
  const [icon, setIcon] = useState<string>('folder');
  const [color, setColor] = useState<string>(FOLDER_COLORS[0]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    getFolder(db, id).then((f) => {
      if (!f) return;
      setName(f.name);
      setIcon(f.icon);
      setColor(f.color);
    });
  }, [db, id]);

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      if (isEdit && id) {
        await updateFolder(db, id, { name, icon, color });
        toast.show('Shelf updated');
      } else {
        await createFolder(db, { name, icon, color });
        toast.show('Shelf created');
      }
      if (router.canGoBack()) router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save the shelf.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Stack.Screen options={{ presentation: 'modal', title: isEdit ? 'Edit shelf' : 'New shelf' }} />
      <Field label="Name" value={name} onChangeText={setName} placeholder="e.g. Recipes" error={error} autoFocus={!isEdit} maxLength={40} />

      <View style={[styles.preview, { backgroundColor: `${color}26` }]}>
        <Icon name={icon as IconName} size={32} color={color} />
        <Text style={[typography.linkTitle, { color: colors.text }]}>{name.trim() || 'Untitled shelf'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={[typography.meta, { color: colors.muted }]}>Icon</Text>
        <View style={styles.grid}>
          {FOLDER_ICONS.map((name) => {
            const active = name === icon;
            return (
              <Pressable
                key={name}
                onPress={() => setIcon(name)}
                accessibilityRole="button"
                accessibilityLabel={`Icon ${name}`}
                accessibilityState={{ selected: active }}
                style={[styles.iconCell, { backgroundColor: active ? color : colors.surface }]}
              >
                <Icon name={name as IconName} size={22} color={active ? '#1A1917' : colors.muted} />
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[typography.meta, { color: colors.muted }]}>Color</Text>
        <View style={styles.grid}>
          {FOLDER_COLORS.map((c) => (
            <Pressable
              key={c}
              onPress={() => setColor(c)}
              accessibilityRole="button"
              accessibilityLabel={`Color ${c}`}
              accessibilityState={{ selected: c === color }}
              style={[styles.swatch, { backgroundColor: c, borderColor: c === color ? colors.text : 'transparent' }]}
            />
          ))}
        </View>
      </View>

      <PrimaryButton label={saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create shelf'} disabled={saving} onPress={save} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.xl, paddingBottom: spacing.xxl },
  section: { gap: spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  preview: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg, borderRadius: radii.lg },
  iconCell: { width: 48, height: 48, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' },
  swatch: { width: 40, height: 40, borderRadius: radii.md, borderWidth: 3 },
});
