import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Mascot } from '@/components/mascot';
import { colors, font, radius, space } from '@/components/theme';
import { Body, Button, Card, Heading, Label, Option, Screen, Squish, Title, ToggleRow } from '@/components/ui';
import { useStore } from '@/data/store';
import { LANGUAGES } from '@/i18n';
import { MASCOT_IDS, MASCOTS } from '@/lib/mascots';

export default function SettingsScreen() {
  const { profile, language, setLanguage, setProfile, settings, updateSettings, wipe } = useStore();
  const { t } = useTranslation();
  const [confirming, setConfirming] = useState(false);
  if (!profile) return null;

  return (
    <Screen tint={MASCOTS[profile.mascot].tint}>
      <Title>{t('tabs.settings')}</Title>

      <Label>{t('settings.mascot')}</Label>
      <Card index={0}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mascots}>
          {MASCOT_IDS.map((m) => {
            const on = profile.mascot === m;
            return (
              <Squish key={m} label={t(`mascot.${m}.name`)} selected={on} onPress={() => setProfile({ ...profile, mascot: m })} style={[styles.mascot, { backgroundColor: MASCOTS[m].tint }, on && styles.mascotOn]}>
                <Mascot mascot={m} mood="happy" size={76} still />
              </Squish>
            );
          })}
        </ScrollView>
        <Heading>{t(`mascot.${profile.mascot}.name`)}</Heading>
        <Body soft>{t(`mascot.${profile.mascot}.type`)}</Body>
        <Button kind="secondary" label={t('settings.retake')} onPress={() => router.push({ pathname: '/onboarding', params: { retake: '1' } })} />
      </Card>

      <Label>{t('settings.language')}</Label>
      <Card index={1}>
        <Option label={t('settings.system')} selected={language === null} onPress={() => setLanguage(null)} />
        {LANGUAGES.map((l) => (
          <Option key={l.code} label={l.label} selected={language === l.code} onPress={() => setLanguage(l.code)} />
        ))}
      </Card>

      <Label>{t('settings.privacyTitle')}</Label>
      <Card index={2}>
        <Body>{t('settings.privacyBody')}</Body>
        {Platform.OS !== 'web' && <ToggleRow label={t('lock.title')} hint={t('lock.hint')} value={settings.appLock} onChange={(v) => updateSettings({ appLock: v })} />}
      </Card>

      <Label>{t('settings.about')}</Label>
      <Card index={3}>
        <Body>{t('common.disclaimer')}</Body>
      </Card>

      {confirming ? (
        <Card style={styles.danger}>
          <Heading>{t('settings.deleteConfirmTitle')}</Heading>
          <Body>{t('settings.deleteConfirmBody')}</Body>
          <Button kind="danger" label={t('settings.delete')} onPress={wipe} />
          <Button kind="secondary" label={t('common.cancel')} onPress={() => setConfirming(false)} />
        </Card>
      ) : (
        <Button kind="danger" label={t('settings.deleteAll')} onPress={() => setConfirming(true)} />
      )}
      <View>
        <Text style={styles.version}>Momo & Friends 0.1</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  mascots: { gap: space.sm, paddingVertical: 4 },
  mascot: { width: 92, height: 92, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: 'transparent' },
  mascotOn: { borderColor: colors.brand },
  danger: { borderWidth: 2, borderColor: '#F6D2CC' },
  version: { fontFamily: font.regular, fontSize: 12, color: colors.textSoft, textAlign: 'center' },
});
