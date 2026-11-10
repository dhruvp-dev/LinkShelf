import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, Switch, Text, View, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Icon, type IconName } from '@/components/Icon';
import type { Folder } from '@/types/folder';
import type { LinkDraft } from '@/types/link';
import { useTheme } from '@/theme/useTheme';
import { radii, spacing, typography } from '@/theme/tokens';
import { useLinkPreview } from '@/hooks/useLinkPreview';
import { useClipboardUrl } from '@/hooks/useClipboardUrl';
import { normalizeUrl } from '@/utils/url';
import { extractKeywords, suggestFolder } from '@/utils/keywords';
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
  const [url, setUrl] = useState(initial.url);
  const [title, setTitle] = useState(initial.title);
  const [tagsText, setTagsText] = useState(initial.tags.join(', '));
  const [folderId, setFolderId] = useState<string | null>(initial.folderId);
  const [isStarred, setIsStarred] = useState(initial.isStarred);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const titleEdited = useRef(initial.titleEdited ?? false);
  const userFolderChosen = useRef(mode === 'edit' || initial.folderId !== null);

  const preview = useLinkPreview(url);
  const clipboard = useClipboardUrl(mode === 'create');
  const showClipboardHint = mode === 'create' && clipboard.available && !url.trim();

  // Fill the title from metadata only when the user has not written one.
  useEffect(() => {
    if (!titleEdited.current && preview.metadata?.title) setTitle(preview.metadata.title);
  }, [preview.metadata]);

  const sourceMeta = preview.status === 'ready' || preview.status === 'failed' ? preview.metadata : null;
  const metaFor = useCallback(
    (key: 'thumbnailUrl' | 'faviconUrl' | 'description' | 'siteName') => sourceMeta?.[key] ?? initial[key] ?? null,
    [sourceMeta, initial],
  );

  const normalized = normalizeUrl(url);
  const domain = normalized.ok ? new URL(normalized.url).hostname.replace(/^www\./, '') : null;

  const keywordContext = useMemo(
    () => ({
      url,
      title,
      description: metaFor('description'),
      siteName: metaFor('siteName'),
      domain,
      metadataKeywords: preview.metadata?.keywords,
    }),
    [url, title, metaFor, preview.metadata, domain],
  );

  const suggestedKeywords = useMemo(() => {
    return extractKeywords(keywordContext);
  }, [keywordContext]);

  const suggestedFolder = useMemo(() => {
    return suggestFolder(folders, keywordContext);
  }, [folders, keywordContext]);

  // Keyword-aware shelf auto-detection when creating a link
  useEffect(() => {
    if (mode === 'create' && !userFolderChosen.current && suggestedFolder) {
      setFolderId(suggestedFolder.id);
    }
  }, [mode, suggestedFolder]);

  const currentTags = useMemo(() => {
    return tagsText
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
  }, [tagsText]);

  const toggleKeywordTag = (keyword: string) => {
    Haptics.selectionAsync().catch(() => {});
    const kw = keyword.toLowerCase();
    let next: string[];
    if (currentTags.includes(kw)) {
      next = currentTags.filter((t) => t !== kw);
    } else {
      next = [...currentTags, kw];
    }
    setTagsText(next.join(', '));
  };

  const handleSelectFolder = (id: string | null) => {
    userFolderChosen.current = true;
    Haptics.selectionAsync().catch(() => {});
    setFolderId(id);
  };

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
        <View style={styles.sectionHeader}>
          <Text style={[typography.meta, { color: colors.muted }]}>Shelf</Text>
          {suggestedFolder && folderId === suggestedFolder.id && (
            <View style={[styles.suggestedBadge, { backgroundColor: `${suggestedFolder.color}22` }]}>
              <Icon name="bulb" size={12} color={suggestedFolder.color} />
              <Text style={[typography.meta, { color: suggestedFolder.color, fontSize: 11, fontFamily: 'PublicSans_600SemiBold' }]}>
                Suggested by keyword
              </Text>
            </View>
          )}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          <Chip
            label="All Links"
            icon="albums-outline"
            color={colors.muted}
            active={folderId === null}
            onPress={() => handleSelectFolder(null)}
          />
          {folders.map((f) => (
            <Chip
              key={f.id}
              label={f.name}
              icon={f.icon as IconName}
              color={f.color}
              active={folderId === f.id}
              suggested={suggestedFolder?.id === f.id && folderId !== f.id}
              onPress={() => handleSelectFolder(f.id)}
            />
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Field
          label="Tags"
          value={tagsText}
          onChangeText={setTagsText}
          placeholder="inspiration, typography"
          hint="Separate tags with commas."
          autoCapitalize="none"
        />

        {suggestedKeywords.length > 0 && (
          <View style={styles.keywordTagsContainer}>
            <View style={styles.keywordTagsHeader}>
              <Icon name="bulb" size={12} color={colors.accent} />
              <Text style={[typography.meta, { color: colors.muted, fontSize: 12 }]}>
                Keyword suggestions
              </Text>
            </View>
            <View style={styles.tagChips}>
              {suggestedKeywords.map((kw) => {
                const active = currentTags.includes(kw.toLowerCase());
                return (
                  <Pressable
                    key={kw}
                    onPress={() => toggleKeywordTag(kw)}
                    accessibilityRole="button"
                    accessibilityLabel={`Tag ${kw}`}
                    accessibilityState={{ selected: active }}
                    style={({ pressed }) => [
                      styles.tagChip,
                      {
                        backgroundColor: active ? `${colors.accent}24` : colors.surface,
                        borderColor: active ? colors.accent : colors.border,
                        transform: [{ scale: pressed ? 0.96 : 1 }],
                      },
                    ]}
                  >
                    <Icon
                      name={active ? 'checkmark' : 'add'}
                      size={11}
                      color={active ? colors.accent : colors.muted}
                    />
                    <Text
                      style={[
                        typography.meta,
                        {
                          fontSize: 12,
                          color: active ? colors.accent : colors.text,
                          fontFamily: active ? 'PublicSans_600SemiBold' : 'PublicSans_400Regular',
                        },
                      ]}
                    >
                      {kw}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}
      </View>

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

function Chip({
  label,
  icon,
  color,
  active,
  suggested,
  onPress,
}: {
  label: string;
  icon: IconName;
  color: string;
  active: boolean;
  suggested?: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Shelf ${label}`}
      accessibilityState={{ selected: active }}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: active ? `${color}33` : colors.card,
          borderColor: active ? color : suggested ? `${color}aa` : colors.border,
          borderStyle: suggested && !active ? 'dashed' : 'solid',
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
    >
      <View style={[styles.chipIcon, { backgroundColor: `${color}55` }]}>
        <Icon name={icon} size={14} color={colors.text} />
      </View>
      <Text
        style={[
          typography.meta,
          {
            color: active ? colors.text : colors.muted,
            fontFamily: active ? 'PublicSans_600SemiBold' : 'PublicSans_400Regular',
          },
        ]}
      >
        {label}
      </Text>
      {suggested && !active && (
        <View style={[styles.suggestedDot, { backgroundColor: color }]} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  hint: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, borderRadius: radii.md },
  pasteBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, alignSelf: 'flex-start', marginTop: -spacing.sm },
  section: { gap: spacing.xs },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  suggestedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.pill,
  },
  suggestedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: -spacing.xs + 2,
  },
  chips: { gap: spacing.sm, paddingVertical: spacing.xs },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingLeft: spacing.xs + 2,
    paddingRight: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  chipIcon: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  keywordTagsContainer: { gap: spacing.xs, marginTop: -spacing.sm },
  keywordTagsHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  tagChips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs + 2 },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  starRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: radii.md, borderWidth: StyleSheet.hairlineWidth },
  submit: { alignItems: 'center', paddingVertical: spacing.lg, borderRadius: radii.pill, marginTop: spacing.sm },
});
