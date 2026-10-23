import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { getLink, updateLink } from '@/services/linkService';
import { useFolders } from '@/hooks/useFolders';
import { useToast } from '@/components/Toast';
import { LinkForm } from '@/components/LinkForm';
import { EmptyState } from '@/components/EmptyState';
import type { Link } from '@/types/link';
import { useTheme } from '@/theme/useTheme';

export default function EditLinkScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const db = useSQLiteContext();
  const toast = useToast();
  const { colors } = useTheme();
  const { folders } = useFolders();
  const [link, setLink] = useState<Link | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getLink(db, id).then((l) => {
      setLink(l);
      setLoaded(true);
    });
  }, [db, id]);

  if (!loaded) return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  if (!link) return <EmptyState icon="link-outline" title="Link not found" />;

  return (
    <>
      <Stack.Screen options={{ presentation: 'modal', title: 'Edit Link' }} />
      <LinkForm
        key={link.id}
        mode="edit"
        folders={folders}
        submitLabel="Save changes"
        initial={{
          url: link.url,
          title: link.title,
          description: link.description,
          siteName: link.siteName,
          thumbnailUrl: link.thumbnailUrl,
          faviconUrl: link.faviconUrl,
          folderId: link.folderId,
          tags: link.tags,
          isStarred: link.isStarred,
          titleEdited: true,
        }}
        onSubmit={async (draft) => {
          await updateLink(db, link.id, draft);
          toast.show('Changes saved');
          if (router.canGoBack()) router.back();
        }}
      />
    </>
  );
}
