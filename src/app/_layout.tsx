import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { I18nManager, Platform, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { colors } from '@/components/theme';
import { StoreProvider, useStore } from '@/data/store';
import { deviceLanguage, isRTL } from '@/i18n';

function Shell() {
  const { ready, language } = useStore();
  const { i18n } = useTranslation();
  const active = language ?? deviceLanguage();
  const rtl = isRTL(active);

  useEffect(() => {
    if (i18n.language !== active) i18n.changeLanguage(active);
    // System chrome (tab order, gestures) follows this from the next launch;
    // the `direction` style below mirrors the screens straight away.
    if (Platform.OS !== 'web') {
      I18nManager.allowRTL(rtl);
      I18nManager.forceRTL(rtl);
    } else if (typeof document !== 'undefined') {
      document.documentElement.lang = active;
    }
  }, [active, rtl, i18n]);

  return (
    <View style={{ flex: 1, direction: rtl ? 'rtl' : 'ltr', backgroundColor: colors.background }}>
      <StatusBar style="dark" />
      {ready && <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />}
    </View>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <Shell />
      </StoreProvider>
    </SafeAreaProvider>
  );
}
