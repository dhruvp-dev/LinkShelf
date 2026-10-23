import { useCallback, useState } from 'react';
import { Alert, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { useSQLiteContext } from 'expo-sqlite';
import { FolderPicker } from '@/components/FolderPicker';
import { OptionsSheet, type SheetAction } from '@/components/OptionsSheet';
import { moveLink, setStarred, trashLink } from '@/services/linkService';
import type { Link } from '@/types/link';
import { useToast } from '@/components/Toast';
import { useFolders } from './useFolders';

/**
 * Every per-link action in one place: open, copy, star, move, edit and trash. Screens get
 * the functions for buttons and `onMore` for the options sheet, and render `element` once.
 */
export function useLinkActions(onChanged: () => void) {
  const db = useSQLiteContext();
  const router = useRouter();
  const toast = useToast();
  const { folders } = useFolders();
  const [target, setTarget] = useState<Link | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const openLink = useCallback(
    async (link: Link) => {
      try {
        const supported = await Linking.canOpenURL(link.url);
        if (!supported) throw new Error('unsupported');
        await Linking.openURL(link.url);
      } catch {
        toast.show("Couldn't open this link.");
      }
    },
    [toast],
  );

  const copyLink = useCallback(
    async (link: Link) => {
      await Clipboard.setStringAsync(link.url);
      toast.show('Link copied');
    },
    [toast],
  );

  const toggleStar = useCallback(
    async (link: Link) => {
      await setStarred(db, link.id, !link.isStarred);
      toast.show(link.isStarred ? 'Removed from Starred' : 'Added to Starred');
      onChanged();
    },
    [db, onChanged, toast],
  );

  const moveTo = useCallback(
    async (link: Link, folderId: string | null) => {
      await moveLink(db, link.id, folderId);
      const name = folderId ? folders.find((f) => f.id === folderId)?.name ?? 'shelf' : 'All Links';
      toast.show(`Moved to ${name}`);
      onChanged();
    },
    [db, folders, onChanged, toast],
  );

  const trash = useCallback(
    (link: Link) => {
      Alert.alert('Move to Trash?', `"${link.title}" will be moved to Trash. You can restore it later.`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Move to Trash',
          style: 'destructive',
          onPress: async () => {
            await trashLink(db, link.id);
            toast.show('Moved to Trash');
            onChanged();
          },
        },
      ]);
    },
    [db, onChanged, toast],
  );

  const onMore = useCallback((link: Link) => {
    setTarget(link);
    setSheetOpen(true);
  }, []);

  const actions: SheetAction[] = target
    ? [
        { label: 'Open link', icon: 'open-outline', onPress: () => openLink(target) },
        { label: 'Copy link', icon: 'copy-outline', onPress: () => copyLink(target) },
        {
          label: target.isStarred ? 'Remove from Starred' : 'Add to Starred',
          icon: target.isStarred ? 'star-outline' : 'star',
          onPress: () => toggleStar(target),
        },
        { label: 'Move to shelf', icon: 'folder-outline', onPress: () => setPickerOpen(true) },
        { label: 'Edit', icon: 'create-outline', onPress: () => router.push(`/links/edit/${target.id}`) },
        { label: 'Move to Trash', icon: 'trash-outline', destructive: true, onPress: () => trash(target) },
      ]
    : [];

  const element = (
    <>
      <OptionsSheet visible={sheetOpen} title={target?.title} actions={actions} onClose={() => setSheetOpen(false)} />
      <FolderPicker
        visible={pickerOpen}
        folders={folders}
        selectedId={target?.folderId ?? null}
        onSelect={(folderId) => {
          setPickerOpen(false);
          if (target) moveTo(target, folderId);
        }}
        onClose={() => setPickerOpen(false)}
      />
    </>
  );

  return { openLink, copyLink, toggleStar, moveTo, trash, onMore, element };
}
