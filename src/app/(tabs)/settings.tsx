import { useState, type ReactNode } from 'react';
import { Alert, Pressable, ScrollView, Text, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSQLiteContext } from 'expo-sqlite';
import Constants from 'expo-constants';
import * as Updates from 'expo-updates';
import { Icon, type IconName } from '@/components/Icon';
import { ConfirmDialog, type ConfirmOptions } from '@/components/ConfirmDialog';
import { SORT_LABELS } from '@/components/SortMenu';
import { useSettings } from '@/hooks/useSettings';
import { useToast } from '@/components/Toast';
import { useTheme } from '@/theme/useTheme';
import { APP_ICONS } from '@/theme/appIcons';
import { radii, spacing, typography } from '@/theme/tokens';
import type { AppSettings, ThemePreference } from '@/types/settings';
import type { ViewMode } from '@/types/link';
import { clearAppData, exportLibrary, importLibrary } from '@/services/importExportService';
import { clearRecentSearches } from '@/services/settingsService';
import { pluralize } from '@/utils/format';

const THEME_LABEL: Record<ThemePreference, string> = { system: 'System', light: 'Light', dark: 'Dark' };

export default function SettingsScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { theme, appIcon, defaultView, defaultSort, update, reload } = useSettings();
  const [confirm, setConfirm] = useState<ConfirmOptions | null>(null);

  const iconLabel = APP_ICONS.find((i) => i.id === appIcon)?.label ?? 'Classic';
  const version = Constants.expoConfig?.version ?? '1.0.0';
  const build = Constants.nativeBuildVersion ?? 'Development';

  const runData = async (label: string, task: () => Promise<string | void>) => {
    try {
      const message = await task();
      if (message) toast.show(message);
    } catch (e) {
      toast.show(e instanceof Error ? e.message : `${label} failed.`);
    }
  };

  /**
   * Checks for an over-the-air update. An update is only installed after the user confirms.
   * Links, shelves and settings live in the local database, which updates don't touch.
   */
  const checkForUpdates = async () => {
    if (__DEV__) {
      toast.show('Updates are not available in development builds.');
      return;
    }
    let available = false;
    try {
      const result = await Updates.checkForUpdateAsync();
      available = result.isAvailable;
    } catch {
      toast.show("Couldn't check for updates. Check your connection.");
      return;
    }
    if (!available) {
      toast.show("You're up to date.");
      return;
    }
    Alert.alert('Update available', 'A new version of LinkShelf is ready. Your links, shelves and settings will be kept.', [
      { text: 'Later', style: 'cancel' },
      {
        text: 'Install and restart',
        onPress: async () => {
          try {
            await Updates.fetchUpdateAsync();
            await Updates.reloadAsync();
          } catch {
            toast.show("Couldn't install the update. Please try again.");
          }
        },
      },
    ]);
  };

  const confirmClear = () =>
    setConfirm({
      title: 'Delete everything?',
      message: 'This permanently removes every link, shelf, tag and setting on this device. It cannot be undone.',
      confirmLabel: 'Delete everything',
      destructive: true,
      onConfirm: () =>
        runData('Clearing data', async () => {
          await clearAppData(db);
          await clearRecentSearches(db);
          await reload();
          return 'All app data cleared';
        }),
    });

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.lg }]}
    >
      <View style={styles.header}>
        <Text style={[typography.display, { color: colors.text }]}>Settings</Text>
        <Text style={[typography.body, { color: colors.muted }]}>Preferences, data and about LinkShelf.</Text>
      </View>

      <Group title="Appearance">
        <Row icon="color-palette-outline" label="Theme and app icon" value={`${THEME_LABEL[theme]} · ${iconLabel}`} onPress={() => router.push('/settings/appearance')} last />
      </Group>

      <Group title="Library">
        <View style={[styles.rowStack, { borderBottomColor: colors.border }]}>
          <Text style={[typography.linkTitle, { color: colors.text }]}>Default view</Text>
          <Segmented<ViewMode>
            value={defaultView}
            onChange={(v) => update('defaultView', v)}
            options={[
              { value: 'grid', label: 'Grid' },
              { value: 'list', label: 'List' },
            ]}
          />
        </View>
        {(Object.keys(SORT_LABELS) as AppSettings['defaultSort'][]).map((key, i, all) => (
          <Row
            key={key}
            icon="arrows-sort"
            label={`Sort by ${SORT_LABELS[key].toLowerCase()}`}
            selected={defaultSort === key}
            onPress={() => update('defaultSort', key)}
            last={i === all.length - 1}
          />
        ))}
      </Group>

      <Group title="Data" footer="Exports are JSON files you can keep as a backup or move to another device. Import skips links you already have.">
        <Row
          icon="download-outline"
          label="Export links"
          onPress={() => runData('Export', () => exportLibrary(db).then(() => undefined))}
        />
        <Row
          icon="push-outline"
          label="Import links"
          last
          onPress={() =>
            runData('Import', async () => {
              const result = await importLibrary(db);
              if (!result) return undefined;
              return `Imported ${pluralize(result.added, 'link')}, skipped ${result.skipped} duplicate${result.skipped === 1 ? '' : 's'}.`;
            })
          }
        />
      </Group>

      <Group title="Danger zone" footer="Removes every link, shelf and setting on this device. This can't be undone.">
        <Row icon="trash-outline" label="Clear all app data" danger last onPress={confirmClear} />
      </Group>

      <Group title="About">
        <Row icon="info" label="LinkShelf" value={`Version ${version}`} />
        <Row icon="database" label="Build" value={build} />
        <Row icon="database" label="Storage" value="On this device" />
        <Row icon="refresh" label="Check for updates" accent last onPress={checkForUpdates} />
      </Group>

      <ConfirmDialog options={confirm} onClose={() => setConfirm(null)} />
    </ScrollView>
  );
}

/** A titled group: a faint icon and accent label above one card of rows, with an optional footer. */
function Group({ title, footer, children }: { title: string; footer?: string; children: ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={styles.group}>
      <Text style={[typography.section, styles.groupTitle, { color: colors.text }]}>{title}</Text>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>{children}</View>
      {footer ? <Text style={[typography.meta, styles.footer, { color: colors.muted }]}>{footer}</Text> : null}
    </View>
  );
}

/** One line in a group: faint icon, label, and an optional value, check mark or chevron. */
function Row({
  icon,
  label,
  value,
  selected,
  danger,
  accent,
  last,
  onPress,
}: {
  icon: IconName;
  label: string;
  value?: string;
  selected?: boolean;
  danger?: boolean;
  accent?: boolean;
  last?: boolean;
  onPress?: () => void;
}) {
  const { colors } = useTheme();
  const tint = danger ? colors.danger : accent ? colors.accent : colors.muted;
  const textColor = danger ? colors.danger : accent ? colors.accent : colors.text;
  const body = (
    <View style={[styles.row, !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
      <Icon name={icon} size={20} color={tint} />
      <Text style={[typography.body, { flex: 1, color: textColor }]}>{label}</Text>
      {value ? <Text style={[typography.meta, { color: colors.muted }]}>{value}</Text> : null}
      {selected ? <Icon name="checkmark" size={18} color={colors.text} /> : null}
      {onPress && !selected && !danger && !accent ? <Icon name="chevron-forward" size={16} color={colors.muted} /> : null}
    </View>
  );
  if (!onPress) return body;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
      {body}
    </Pressable>
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
            <Text style={[typography.meta, { color: active ? colors.text : colors.muted }]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.lg, paddingBottom: 140, gap: spacing.xl },
  group: { gap: spacing.sm },
  groupTitle: { paddingHorizontal: spacing.xs },
  header: { gap: spacing.xs, paddingBottom: spacing.sm },
  card: { borderWidth: 1, borderRadius: radii.md, overflow: 'hidden' },
  footer: { paddingHorizontal: spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, minHeight: 52 },
  rowStack: { gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth },
  segmented: { flexDirection: 'row', alignSelf: 'stretch', borderRadius: radii.pill, padding: 3 },
  segment: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.sm, borderRadius: radii.pill },
});
