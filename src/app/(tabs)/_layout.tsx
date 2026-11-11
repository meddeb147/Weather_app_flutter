import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';
import { useTranslation } from 'react-i18next';
import { Text } from 'react-native';

import { colors } from '@/components/theme';
import { useStore } from '@/data/store';

const icon = (glyph: string) =>
  function TabIcon({ focused }: { focused: boolean }) {
    return <Text style={{ fontSize: 17, lineHeight: 22, opacity: focused ? 1 : 0.5 }}>{glyph}</Text>;
  };

export default function TabsLayout() {
  const { profile } = useStore();
  const { t } = useTranslation();
  if (!profile) return <Redirect href="/onboarding" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brandDark,
        tabBarInactiveTintColor: colors.textSoft,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}>
      <Tabs.Screen name="index" options={{ title: t('tabs.home'), tabBarIcon: icon('🏠') }} />
      <Tabs.Screen name="calendar" options={{ title: t('tabs.calendar'), tabBarIcon: icon('🗓️') }} />
      <Tabs.Screen name="log" options={{ title: t('tabs.log'), tabBarIcon: icon('✏️') }} />
      <Tabs.Screen name="settings" options={{ title: t('tabs.settings'), tabBarIcon: icon('⚙️') }} />
    </Tabs>
  );
}
