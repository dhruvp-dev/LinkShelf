import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import * as Clipboard from 'expo-clipboard';

/**
 * Checks, without reading the clipboard contents, whether it holds a URL. Runs when the
 * screen gains focus. Reading the text only happens in `readUrl`, on a user tap.
 */
export function useClipboardUrl(enabled: boolean) {
  const [available, setAvailable] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!enabled) return;
      let active = true;
      Clipboard.hasUrlAsync()
        .then((has) => active && setAvailable(has))
        .catch(() => active && setAvailable(false));
      return () => {
        active = false;
      };
    }, [enabled]),
  );

  const readUrl = useCallback(async () => (await Clipboard.getStringAsync()).trim(), []);
  return { available, readUrl, dismiss: () => setAvailable(false) };
}
