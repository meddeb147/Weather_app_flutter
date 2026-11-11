import {
  BalooBhaijaan2_400Regular,
  BalooBhaijaan2_500Medium,
  BalooBhaijaan2_600SemiBold,
  BalooBhaijaan2_700Bold,
  BalooBhaijaan2_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/baloo-bhaijaan-2';
import * as LocalAuthentication from 'expo-local-authentication';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { I18nManager, Platform, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Mascot } from '@/components/mascot';
import { colors } from '@/components/theme';
import { Body, Button, Screen } from '@/components/ui';
import { StoreProvider, useStore } from '@/data/store';
import { deviceLanguage, isRTL } from '@/i18n';

function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const { profile } = useStore();
  const { t } = useTranslation();
  const ask = useCallback(() => {
    LocalAuthentication.authenticateAsync()
      .then((r) => r.success && onUnlock())
      .catch(() => {});
  }, [onUnlock]);
  useEffect(ask, [ask]);
  return (
    <Screen scroll={false}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <Mascot mascot={profile?.mascot ?? 'momo'} mood="sleepy" />
        <Body>{t('extra.locked')}</Body>
        <Button label={t('extra.unlock')} onPress={ask} />
      </View>
    </Screen>
  );
}

function Shell() {
  const { ready, language, settings } = useStore();
  const { i18n } = useTranslation();
  const [unlocked, setUnlocked] = useState(false);
  const [fontsLoaded] = useFonts({
    BalooBhaijaan2_400Regular,
    BalooBhaijaan2_500Medium,
    BalooBhaijaan2_600SemiBold,
    BalooBhaijaan2_700Bold,
    BalooBhaijaan2_800ExtraBold,
  });
  const active = language ?? deviceLanguage();
  const rtl = isRTL(active);

  useEffect(() => {
    if (i18n.language !== active) i18n.changeLanguage(active);
    // System chrome follows this from the next launch; the `direction`
    // style below mirrors the screens straight away.
    if (Platform.OS !== 'web') {
      I18nManager.allowRTL(rtl);
      I18nManager.forceRTL(rtl);
    } else if (typeof document !== 'undefined') {
      document.documentElement.lang = active;
    }
  }, [active, rtl, i18n]);

  const locked = settings.appLock && Platform.OS !== 'web' && !unlocked;

  return (
    <View style={{ flex: 1, direction: rtl ? 'rtl' : 'ltr', backgroundColor: colors.background }}>
      <StatusBar style="dark" />
      {ready && fontsLoaded && locked && <LockScreen onUnlock={() => setUnlocked(true)} />}
      {ready && fontsLoaded && !locked && (
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
          <Stack.Screen name="log" options={{ presentation: 'modal' }} />
        </Stack>
      )}
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
