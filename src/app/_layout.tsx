import { useFonts } from 'expo-font';
import { useEffect } from 'react';

import * as SplashScreen from 'expo-splash-screen';
import { Stack, useRouter } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useShareIntent } from 'expo-share-intent';
import { migrateDatabase } from '@/database/migrations';
import { SettingsProvider } from '@/hooks/useSettings';
import { ToastProvider } from '@/components/Toast';
import { useTheme } from '@/theme/useTheme';
import { extractUrl } from '@/utils/url';

// Per-weight files: the package barrel would bundle all 18 Public Sans faces (~3 MB).
const PublicSans_300Light = require('@expo-google-fonts/public-sans/300Light/PublicSans_300Light.ttf');
const PublicSans_400Regular = require('@expo-google-fonts/public-sans/400Regular/PublicSans_400Regular.ttf');
const PublicSans_500Medium = require('@expo-google-fonts/public-sans/500Medium/PublicSans_500Medium.ttf');
const PublicSans_600SemiBold = require('@expo-google-fonts/public-sans/600SemiBold/PublicSans_600SemiBold.ttf');
const PublicSans_700Bold = require('@expo-google-fonts/public-sans/700Bold/PublicSans_700Bold.ttf');

/** Opens the Save Link screen with the URL from a share-sheet action (cold or warm start). */
function ShareIntentRouter() {
  const router = useRouter();
  const { hasShareIntent, shareIntent, resetShareIntent, isReady } = useShareIntent();

  useEffect(() => {
    if (!isReady || !hasShareIntent) return;
    const url = extractUrl(shareIntent.webUrl) ?? extractUrl(shareIntent.text);
    resetShareIntent();
    if (url) router.push({ pathname: '/links/new', params: { url } });
  }, [isReady, hasShareIntent, shareIntent, resetShareIntent, router]);

  return null;
}

function AppStack() {
  const { colors, scheme } = useTheme();
  return (
    <>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { color: colors.text, fontFamily: 'PublicSans_600SemiBold' },
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="links/new" options={{ presentation: 'modal', title: 'Save Link' }} />
        <Stack.Screen name="links/edit/[id]" options={{ presentation: 'modal', title: 'Edit Link' }} />
        <Stack.Screen name="folders/edit" options={{ presentation: 'modal', title: 'Shelf' }} />
      </Stack>
    </>
  );
}

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ PublicSans_300Light, PublicSans_400Regular, PublicSans_500Medium, PublicSans_600SemiBold, PublicSans_700Bold });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded]);

  // Hold the first frame until the fonts are ready so text never flashes in a fallback face.
  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SQLiteProvider databaseName="linkshelf.db" onInit={migrateDatabase}>
          <SettingsProvider>
            <ToastProvider>
              <ShareIntentRouter />
              <AppStack />
            </ToastProvider>
          </SettingsProvider>
        </SQLiteProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
