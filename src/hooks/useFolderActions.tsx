import { useCallback, useState } from 'react';
import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { FolderPicker } from '@/components/FolderPicker';
import { OptionsSheet, type SheetAction } from '@/components/OptionsSheet';
import { deleteFolder } from '@/services/folderService';
import type { Folder } from '@/types/folder';
import { useToast } from '@/components/Toast';
import { useFolders } from './useFolders';

/**
 * Folder menu and delete flow. Deleting a folder never deletes its links: the user chooses
 * whether they move to All Links or to another folder.
 */
export function useFolderActions(onChanged: () => void) {
  const db = useSQLiteContext();
  const router = useRouter();
  const toast = useToast();
  const { folders } = useFolders();
  const [target, setTarget] = useState<Folder | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [askOpen, setAskOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Folder | null>(null);

  const removeFolder = useCallback(
    async (folder: Folder, moveTo: string | null) => {
      await deleteFolder(db, folder.id, moveTo);
      const destination = moveTo ? folders.find((f) => f.id === moveTo)?.name ?? 'another shelf' : 'All Links';
      toast.show(`"${folder.name}" deleted. Links moved to ${destination}.`);
      onChanged();
    },
    [db, folders, onChanged, toast],
  );

  const onMore = useCallback((folder: Folder) => {
    setTarget(folder);
    setMenuOpen(true);
  }, []);

  const menuActions: SheetAction[] = target
    ? [
        { label: 'Edit folder', icon: 'create-outline', onPress: () => router.push(`/folders/edit?id=${target.id}`) },
        {
          label: 'Delete shelf…',
          icon: 'trash-outline',
          destructive: true,
          onPress: () => {
            setPendingDelete(target);
            setAskOpen(true);
          },
        },
      ]
    : [];

  const askActions: SheetAction[] = pendingDelete
    ? [
        { label: 'Move links to All Links', icon: 'albums-outline', onPress: () => removeFolder(pendingDelete, null) },
        { label: 'Move links to another shelf', icon: 'folder-outline', onPress: () => setPickerOpen(true) },
      ]
    : [];

  const element = (
    <>
      <OptionsSheet visible={menuOpen} title={target?.name} actions={menuActions} onClose={() => setMenuOpen(false)} />
      <OptionsSheet
        visible={askOpen}
        title={pendingDelete ? `Delete "${pendingDelete.name}"? Its links will be kept.` : undefined}
        actions={askActions}
        onClose={() => setAskOpen(false)}
      />
      <FolderPicker
        visible={pickerOpen}
        folders={folders}
        selectedId={null}
        allowNone={false}
        exclude={pendingDelete ? [pendingDelete.id] : []}
        onSelect={(id) => {
          setPickerOpen(false);
          if (pendingDelete) removeFolder(pendingDelete, id);
          setPendingDelete(null);
        }}
        onClose={() => {
          setPickerOpen(false);
          setPendingDelete(null);
        }}
      />
    </>
  );

  return { onMore, element };
}
