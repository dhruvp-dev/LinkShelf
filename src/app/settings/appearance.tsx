import { useState } from 'react';
import { Pressable, ScrollView, Text, View, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Icon, type IconName } from '@/components/Icon';
import { useSettings } from '@/hooks/useSettings';
import { useToast } from '@/components/Toast';
import { PrimaryButton } from '@/components/Buttons';
import { useTheme } from '@/theme/useTheme';
import { APP_ICONS, type AppIconId } from '@/theme/appIcons';
import { radii, spacing, typography } from '@/theme/tokens';
import type { ThemePreference } from '@/types/settings';

const THEMES: { value: ThemePreference; label: string; icon: IconName }[] = [
  { value: 'light', label: 'Light', icon: 'sunny-outline' },
  { value: 'dark', label: 'Dark', icon: 'moon-outline' },
  { value: 'system', label: 'System', icon: 'phone-portrait-outline' },
];

/** Appearance: theme and app icon choices. Edits stay local until Save Changes. */
export default function AppearanceScreen() {
  const router = useRouter();
  const toast = useToast();
  const { colors } = useTheme();
  const { theme, appIcon, update } = useSettings();
  const [draftTheme, setDraftTheme] = useState<ThemePreference>(theme);
  const [draftIcon, setDraftIcon] = useState<AppIconId>(appIcon);
  const [saving, setSaving] = useState(false);

  const dirty = draftTheme !== theme || draftIcon !== appIcon;

  const save = async () => {
    setSaving(true);
    try {
      if (draftTheme !== theme) await update('theme', draftTheme);
      if (draftIcon !== appIcon) await update('appIcon', draftIcon);
      toast.show('Appearance saved');
      if (router.canGoBack()) router.back();
    } catch {
      toast.show("Couldn't save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: 'Appearance' }} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[typography.eyebrow, { color: colors.muted }]}>Theme</Text>
        <View style={styles.themeRow}>
          {THEMES.map((t) => {
            const active = draftTheme === t.value;
            return (
              <Pressable
                key={t.value}
                onPress={() => setDraftTheme(t.value)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                style={[
                  styles.themeCard,
                  { backgroundColor: colors.card, borderColor: active ? colors.text : colors.border, borderWidth: active ? 2 : StyleSheet.hairlineWidth },
                ]}
              >
                <Icon name={t.icon} size={22} color={colors.text} />
                <Text style={[typography.meta, { color: colors.text, fontSize: 13 }]}>{t.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[typography.eyebrow, { color: colors.muted, marginTop: spacing.lg }]}>App icon</Text>
        <View style={styles.iconRow}>
          {APP_ICONS.map((icon) => {
            const active = draftIcon === icon.id;
            return (
              <Pressable
                key={icon.id}
                onPress={() => setDraftIcon(icon.id)}
                accessibilityRole="button"
                accessibilityLabel={`${icon.label} app icon`}
                accessibilityState={{ selected: active }}
                style={styles.iconOption}
              >
                <View
                  style={[
                    styles.iconTile,
                    { backgroundColor: icon.background, borderColor: active ? colors.text : 'transparent', borderWidth: active ? 2 : 0 },
                  ]}
                >
                  <Icon name="bookmark" size={26} color={icon.glyph} />
                </View>
                <Text style={[typography.meta, { color: active ? colors.text : colors.muted }]}>{icon.label}</Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={[typography.meta, { color: colors.muted, marginTop: spacing.sm }]}>
          Your icon choice is saved here. Switching the icon on your home screen needs a development build.
        </Text>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <PrimaryButton label={saving ? 'Saving…' : 'Save Changes'} disabled={!dirty || saving} onPress={save} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: 120 },
  themeRow: { flexDirection: 'row', gap: spacing.sm },
  themeCard: { flex: 1, alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.lg, borderRadius: radii.md },
  iconRow: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: spacing.md },
  iconOption: { alignItems: 'center', gap: spacing.xs, width: 64 },
  iconTile: { width: 60, height: 60, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: spacing.lg, borderTopWidth: StyleSheet.hairlineWidth },
});
