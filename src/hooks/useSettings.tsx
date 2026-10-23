import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { useColorScheme } from 'react-native';
import { DEFAULT_SETTINGS, loadSettings, saveSetting } from '@/services/settingsService';
import type { AppSettings } from '@/types/settings';

type SettingsContextValue = AppSettings & {
  resolvedScheme: 'light' | 'dark';
  update: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => Promise<void>;
  reload: () => Promise<void>;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const db = useSQLiteContext();
  const system = useColorScheme();
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  const reload = useCallback(async () => {
    setSettings(await loadSettings(db));
  }, [db]);

  useEffect(() => {
    reload();
  }, [reload]);

  const update = useCallback<SettingsContextValue['update']>(
    async (key, value) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
      await saveSetting(db, key, value);
    },
    [db],
  );

  const value = useMemo<SettingsContextValue>(() => {
    const resolved = settings.theme === 'system' ? (system ?? 'light') : settings.theme;
    return { ...settings, resolvedScheme: resolved, update, reload };
  }, [settings, system, update, reload]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider');
  return ctx;
}
