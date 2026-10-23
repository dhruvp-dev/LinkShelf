import { useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { fetchMetadata, type LinkMetadata } from '@/services/metadataService';
import { normalizeUrl } from '@/utils/url';
import { useDebouncedValue } from './useDebouncedValue';

export type PreviewState = {
  status: 'idle' | 'loading' | 'ready' | 'failed';
  metadata: LinkMetadata | null;
};

/** Debounced metadata lookup for whatever URL is typed. Failures are reported, never thrown. */
export function useLinkPreview(rawUrl: string): PreviewState {
  const db = useSQLiteContext();
  const debounced = useDebouncedValue(rawUrl.trim(), 500);
  const [state, setState] = useState<PreviewState>({ status: 'idle', metadata: null });

  useEffect(() => {
    const result = normalizeUrl(debounced);
    if (!debounced || !result.ok) {
      setState({ status: 'idle', metadata: null });
      return;
    }
    let cancelled = false;
    setState({ status: 'loading', metadata: null });
    fetchMetadata(db, result.url).then((metadata) => {
      if (!cancelled) setState({ status: metadata ? 'ready' : 'failed', metadata });
    });
    return () => {
      cancelled = true;
    };
  }, [db, debounced]);

  return state;
}
