import { Tabs, useRouter } from 'expo-router';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { Icon, type IconName } from '@/components/Icon';
import { useTheme } from '@/theme/useTheme';
import { tabBarStyle } from '@/components/tabBarStyle';


/**
 * iOS-style bottom bar: solid surface with a hairline top edge, icon-only tabs, and a round accent
 * Save button that floats above the bar in the centre.
 */
function SaveButton() {
  const { colors } = useTheme();
  const router = useRouter();
  return (
    <View style={styles.saveWrap}>
      <Pressable
        onPress={() => router.push('/links/new')}
        accessibilityRole="button"
        accessibilityLabel="Save link"
        style={({ pressed }) => [styles.save, { backgroundColor: colors.fab, transform: [{ scale: pressed ? 0.94 : 1 }] }]}
      >
        <Icon name="add" size={26} color={colors.fabIcon} />
      </Pressable>
    </View>
  );
}

export default function TabsLayout() {
  const { colors } = useTheme();
  const icon = (name: IconName) =>
    function TabIcon({ focused }: { focused: boolean }) {
      return <Icon name={name} size={24} filled={focused} color={focused ? colors.accent : colors.muted} />;
    };
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarShowLabel: false,
        tabBarStyle: tabBarStyle(colors),
        tabBarItemStyle: { justifyContent: 'center' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: icon('home') }} />
      <Tabs.Screen name="search" options={{ title: 'Search', tabBarIcon: icon('search') }} />
      <Tabs.Screen name="save" options={{ title: '', tabBarButton: () => <SaveButton /> }} />
      <Tabs.Screen name="folders" options={{ title: 'Shelves', tabBarIcon: icon('folders') }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: icon('settings') }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  saveWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: -22 },
  save: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
});
