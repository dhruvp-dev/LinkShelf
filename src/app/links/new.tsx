import { useMemo } from 'react';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useFolders } from '@/hooks/useFolders';
import { createLink, findActiveLinkByUrl } from '@/services/linkService';
import { useToast } from '@/components/Toast';
import { LinkForm } from '@/components/LinkForm';
import { normalizeUrl } from '@/utils/url';
import { useTheme } from '@/theme/useTheme';

export default function SaveLinkScreen() {
  const router = useRouter();
  const db = useSQLiteContext();
  const toast = useToast();
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ url?: string }>();
  const { folders } = useFolders();

  // Share-sheet and deep-link URLs arrive as params; validate them like typed input.
  const initialUrl = useMemo(() => {
    if (!params.url) return '';
    const result = normalizeUrl(String(params.url));
    return result.ok ? result.url : String(params.url);
  }, [params.url]);

  const leave = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  return (
    <>
      <Stack.Screen options={{ presentation: 'modal', title: 'Save Link', headerStyle: { backgroundColor: colors.background } }} />
      <LinkForm
        mode="create"
        folders={folders}
        submitLabel="Save Link"
        initial={{
          url: initialUrl,
          title: '',
          description: null,
          siteName: null,
          thumbnailUrl: null,
          faviconUrl: null,
          folderId: null,
          tags: [],
          isStarred: false,
        }}
        onSubmit={async (draft) => {
          const existing = await findActiveLinkByUrl(db, draft.url);
          if (existing) throw new Error('This link is already in your shelf.');
          await createLink(db, draft);
          toast.show('Link saved');
          leave();
        }}
      />
    </>
  );
}
