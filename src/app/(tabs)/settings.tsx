import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Alert, Pressable, ScrollView, Text, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Icon, type IconName } from '@/components/Icon';
import { APP_ICONS } from '@/theme/appIcons';
import { useSQLiteContext } from 'expo-sqlite';
import Constants from 'expo-constants';
import * as Updates from 'expo-updates';
import { useSettings } from '@/hooks/useSettings';
import { useToast } from '@/components/Toast';
import { useTheme } from '@/theme/useTheme';
import { radii, spacing, typography } from '@/theme/tokens';
import type { ThemePreference, AppSettings } from '@/types/settings';
import type { ViewMode } from '@/types/link';
import { SORT_LABELS } from '@/components/SortMenu';
import { SecondaryButton } from '@/components/Buttons';
import { clearAppData, exportLibrary, importLibrary } from '@/services/importExportService';
import { clearRecentSearches } from '@/services/settingsService';
import { pluralize } from '@/utils/format';

export default function SettingsScreen() {
  const db = useSQLiteContext();
  const toast = useToast();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { theme, appIcon, defaultView, defaultSort, update, reload } = useSettings();
  const APP_ICON_LABEL = Object.fromEntries(APP_ICONS.map((i) => [i.id, i.label]));
  const version = Constants.expoConfig?.version ?? '1.0.0';

  const runData = async (label: string, task: () => Promise<string | void>) => {
    try {
      const message = await task();
      if (message) toast.show(message);
    } catch (e) {
      toast.show(e instanceof Error ? e.message : `${label} failed.`);
    }
  };

  const checkForUpdates = () =>
    runData('Update check', async () => {
      if (__DEV__) return 'Updates are not available in development builds.';
      const result = await Updates.checkForUpdateAsync();
      if (!result.isAvailable) return "You're up to date.";
      await Updates.fetchUpdateAsync();
      await Updates.reloadAsync();
      return undefined;
    });

  const confirmClear = () =>
    Alert.alert(
      'Clear all app data?',
      'This permanently deletes every saved link, shelf, tag and setting. It cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear everything',
          style: 'destructive',
          onPress: () =>
            runData('Clearing data', async () => {
              await clearAppData(db);
              await clearRecentSearches(db);
              await reload();
              return 'All app data cleared';
            }),
        },
      ],
    );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.lg }]}>
      <Text style={[typography.title, { color: colors.text, marginBottom: spacing.lg }]}>Settings</Text>

      <Section title="Appearance" icon="sun-moon">
        <Pressable
          onPress={() => router.push('/settings/appearance')}
          accessibilityRole="button"
          style={[styles.option, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Icon name="color-palette-outline" size={20} color={colors.text} />
          <Text style={[typography.body, { color: colors.text, flex: 1, fontSize: 15 }]}>
            {theme === 'system' ? 'System' : theme === 'dark' ? 'Dark' : 'Light'} theme · {APP_ICON_LABEL[appIcon]} icon
          </Text>
          <Icon name="chevron-forward" size={16} color={colors.muted} />
        </Pressable>
      </Section>

      <Section title="Default view" icon="layout-list">
        <Segmented<ViewMode>
          value={defaultView}
          onChange={(v) => update('defaultView', v)}
          options={[
            { value: 'grid', label: 'Grid' },
            { value: 'list', label: 'List' },
          ]}
        />
      </Section>

      <Section title="Default sorting" icon="arrows-sort">
        <View style={{ gap: spacing.xs }}>
          {(Object.keys(SORT_LABELS) as AppSettings['defaultSort'][]).map((key) => (
            <Option key={key} label={SORT_LABELS[key]} selected={defaultSort === key} onPress={() => update('defaultSort', key)} />
          ))}
        </View>
      </Section>

      <Section title="Data" icon="database">
        <View style={styles.dataRow}>
          <SecondaryButton
            icon="download-outline"
            label="Export links"
            onPress={() => runData('Export', async () => {
              await exportLibrary(db);
            })}
          />
          <SecondaryButton
            icon="push-outline"
            label="Import links"
            onPress={() =>
              runData('Import', async () => {
                const result = await importLibrary(db);
                if (!result) return undefined;
                return `Imported ${pluralize(result.added, 'link')}, skipped ${result.skipped} duplicate${result.skipped === 1 ? '' : 's'}.`;
              })
            }
          />
        </View>
        <Text style={[typography.meta, { color: colors.muted }]}>
          Exports are JSON files you can keep as a backup or move to another device. Import skips links you already have.
        </Text>
        <SecondaryButton icon="trash-outline" label="Clear all app data" destructive onPress={confirmClear} />
      </Section>

      <Section title="About" icon="info">
        <View style={[styles.aboutCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[typography.section, { color: colors.text }]}>LinkShelf</Text>
          <Text style={[typography.meta, { color: colors.muted }]}>Version {version}</Text>
          <Text style={[typography.body, { color: colors.text, marginTop: spacing.sm }]}>
            Save links from anywhere, organize them into folders, and find them again. Everything is stored on this device.
          </Text>
        </View>
        <SecondaryButton icon="refresh" label="Check for updates" onPress={checkForUpdates} />
      </Section>
    </ScrollView>
  );
}

function Section({ title, icon, children }: { title: string; icon: IconName; children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={{ marginBottom: spacing.xl, gap: spacing.sm }}>
      <View style={styles.sectionTitle}>
        <Icon name={icon} size={16} color={colors.muted} />
        <Text style={[typography.eyebrow, { color: colors.muted }]}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function Segmented<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.segmented, { backgroundColor: colors.surface }]}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            style={[styles.segment, active && { backgroundColor: colors.card }]}
          >
            <Text style={[typography.meta, { color: active ? colors.text : colors.muted, fontSize: 13 }]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function Option({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[styles.option, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <Text style={[typography.body, { color: colors.text, flex: 1, fontSize: 15 }]}>{label}</Text>
      {selected && <Text style={{ color: colors.text, fontFamily: 'PublicSans_700Bold' }}>✓</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, paddingBottom: 140 },
  segmented: { flexDirection: 'row', borderRadius: radii.pill, padding: 3 },
  segment: { flex: 1, alignItems: 'center', paddingVertical: spacing.sm, borderRadius: radii.pill },
  option: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderRadius: radii.md, borderWidth: StyleSheet.hairlineWidth },
  sectionTitle: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  dataRow: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  aboutCard: { padding: spacing.lg, borderRadius: radii.md, borderWidth: StyleSheet.hairlineWidth, gap: spacing.xs },
});
