import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, Switch, Text, View, StyleSheet } from 'react-native';
import { Icon, type IconName } from '@/components/Icon';
import { useSQLiteContext } from 'expo-sqlite';
import type { Folder } from '@/types/folder';
import type { LinkDraft } from '@/types/link';
import { useTheme } from '@/theme/useTheme';
import { radii, spacing, typography } from '@/theme/tokens';
import { useLinkPreview } from '@/hooks/useLinkPreview';
import { useClipboardUrl } from '@/hooks/useClipboardUrl';
import { normalizeUrl } from '@/utils/url';
import { Field } from './Field';
import { LinkPreview } from './LinkPreview';

export type LinkFormValues = Omit<LinkDraft, 'tags'> & { tags: string[]; titleEdited?: boolean };

type Props = {
  initial: LinkFormValues;
  folders: Folder[];
  submitLabel: string;
  /** Edit mode skips the clipboard suggestion and treats the existing title as user-owned. */
  mode: 'create' | 'edit';
  onSubmit: (draft: LinkDraft) => Promise<void>;
};

/**
 * Shared form for Save Link and Edit Link. Saving never waits on metadata: the button stays
 * enabled as long as the URL is valid, and metadata only fills an empty title.
 */
export function LinkForm({ initial, folders, submitLabel, mode, onSubmit }: Props) {
  const { colors } = useTheme();
  const db = useSQLiteContext();
  const [url, setUrl] = useState(initial.url);
  const [title, setTitle] = useState(initial.title);
  const [tagsText, setTagsText] = useState(initial.tags.join(', '));
  const [folderId, setFolderId] = useState<string | null>(initial.folderId);
  const [isStarred, setIsStarred] = useState(initial.isStarred);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const titleEdited = useRef(initial.titleEdited ?? false);

  const preview = useLinkPreview(url);
  const clipboard = useClipboardUrl(mode === 'create');
  const showClipboardHint = mode === 'create' && clipboard.available && !url.trim();

  // Fill the title from metadata only when the user has not written one.
  useEffect(() => {
    if (!titleEdited.current && preview.metadata?.title) setTitle(preview.metadata.title);
  }, [preview.metadata]);

  const sourceMeta = preview.status === 'ready' || preview.status === 'failed' ? preview.metadata : null;
  const metaFor = (key: 'thumbnailUrl' | 'faviconUrl' | 'description' | 'siteName') =>
    sourceMeta?.[key] ?? initial[key] ?? null;

  const pasteFromClipboard = async () => {
    const text = await clipboard.readUrl();
    setUrl(text);
    clipboard.dismiss();
  };

  const submit = async () => {
    setSaveError(null);
    const result = normalizeUrl(url);
    if (!result.ok) {
      setUrlError(result.error);
      return;
    }
    setUrlError(null);
    setSaving(true);
    try {
      await onSubmit({
        url: result.url,
        title,
        description: metaFor('description'),
        siteName: metaFor('siteName'),
        thumbnailUrl: metaFor('thumbnailUrl'),
        faviconUrl: metaFor('faviconUrl'),
        folderId,
        tags: tagsText.split(','),
        isStarred,
      });
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const normalized = normalizeUrl(url);
  const domain = normalized.ok ? new URL(normalized.url).hostname.replace(/^www\./, '') : null;

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {showClipboardHint && (
        <Pressable onPress={pasteFromClipboard} style={[styles.hint, { backgroundColor: colors.surface }]} accessibilityRole="button">
          <Icon name="clipboard-outline" size={18} color={colors.text} />
          <Text style={[typography.body, { color: colors.text, flex: 1 }]}>Link detected from clipboard</Text>
          <Text style={[typography.meta, { color: colors.accent, fontFamily: 'PublicSans_700Bold' }]}>Paste Link</Text>
        </Pressable>
      )}

      <Field
        label="Link"
        value={url}
        onChangeText={(v) => {
          setUrl(v);
          if (urlError) setUrlError(null);
        }}
        onBlur={() => {
          const r = normalizeUrl(url);
          if (r.ok) setUrl(r.url);
        }}
        placeholder="https://"
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
        error={urlError}
      />
      <Pressable onPress={pasteFromClipboard} accessibilityRole="button" style={styles.pasteBtn}>
        <Icon name="clipboard-outline" size={16} color={colors.text} />
        <Text style={[typography.meta, { color: colors.text }]}>Paste from Clipboard</Text>
      </Pressable>

      {domain && <LinkPreview domain={domain} preview={preview} title={title} />}

      <Field
        label="Title"
        value={title}
        onChangeText={(v) => {
          titleEdited.current = true;
          setTitle(v);
        }}
        placeholder={domain ?? 'Title'}
        hint="Leave empty to use the page title."
      />

      <View style={styles.section}>
        <Text style={[typography.meta, { color: colors.muted }]}>Shelf</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          <Chip label="All Links" icon="albums-outline" color={colors.muted} active={folderId === null} onPress={() => setFolderId(null)} />
          {folders.map((f) => (
            <Chip key={f.id} label={f.name} icon={f.icon as IconName} color={f.color} active={folderId === f.id} onPress={() => setFolderId(f.id)} />
          ))}
        </ScrollView>
      </View>

      <Field
        label="Tags"
        value={tagsText}
        onChangeText={setTagsText}
        placeholder="inspiration, typography"
        hint="Separate tags with commas."
        autoCapitalize="none"
      />

      <View style={[styles.starRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Icon name={isStarred ? 'star' : 'star-outline'} size={20} color={isStarred ? '#facc15' : colors.muted} />
        <Text style={[typography.body, { color: colors.text, flex: 1, fontSize: 15 }]}>Add to Starred</Text>
        <Switch value={isStarred} onValueChange={setIsStarred} />
      </View>

      {saveError && <Text style={[typography.meta, { color: colors.danger }]}>{saveError}</Text>}

      <Pressable
        onPress={submit}
        disabled={saving}
        accessibilityRole="button"
        style={({ pressed }) => [styles.submit, { backgroundColor: colors.fab, opacity: saving ? 0.6 : pressed ? 0.85 : 1 }]}
      >
        <Text style={[typography.section, { color: colors.fabIcon, fontSize: 16 }]}>{saving ? 'Saving…' : submitLabel}</Text>
      </Pressable>
    </ScrollView>
  );
}

function Chip({ label, icon, color, active, onPress }: { label: string; icon: IconName; color: string; active: boolean; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Shelf ${label}`}
      accessibilityState={{ selected: active }}
      style={[
        styles.chip,
        {
          backgroundColor: active ? `${color}33` : colors.card,
          borderColor: active ? color : colors.border,
        },
      ]}
    >
      <View style={[styles.chipIcon, { backgroundColor: `${color}55` }]}>
        <Icon name={icon} size={14} color={colors.text} />
      </View>
      <Text style={[typography.meta, { color: active ? colors.text : colors.muted, fontFamily: active ? 'PublicSans_600SemiBold' : 'PublicSans_400Regular' }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  hint: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, borderRadius: radii.md },
  pasteBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, alignSelf: 'flex-start', marginTop: -spacing.sm },
  section: { gap: spacing.xs },
  chips: { gap: spacing.sm, paddingVertical: spacing.xs },
  chip: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingLeft: spacing.xs + 2, paddingRight: spacing.md, paddingVertical: spacing.xs + 2, borderRadius: radii.pill, borderWidth: 1 },
  chipIcon: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  starRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: radii.md, borderWidth: StyleSheet.hairlineWidth },
  submit: { alignItems: 'center', paddingVertical: spacing.lg, borderRadius: radii.pill, marginTop: spacing.sm },
});
