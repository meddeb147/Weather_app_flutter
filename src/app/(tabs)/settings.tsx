import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Body, Button, Card, Heading, Option, Screen, Title } from '@/components/ui';
import { useStore } from '@/data/store';
import { LANGUAGES } from '@/i18n';
import { MASCOT_IDS } from '@/lib/mascots';

export default function SettingsScreen() {
  const { profile, language, setLanguage, setProfile, wipe } = useStore();
  const { t } = useTranslation();
  const [confirming, setConfirming] = useState(false);
  if (!profile) return null;

  return (
    <Screen>
      <Title>{t('tabs.settings')}</Title>

      <Card>
        <Heading>{t('settings.mascot')}</Heading>
        {MASCOT_IDS.map((m) => (
          <Option
            key={m}
            label={`${t(`mascot.${m}.name`)} · ${t(`mascot.${m}.type`)}`}
            selected={profile.mascot === m}
            onPress={() => setProfile({ ...profile, mascot: m })}
          />
        ))}
        <Button kind="secondary" label={t('settings.retake')} onPress={() => router.push({ pathname: '/onboarding', params: { retake: '1' } })} />
      </Card>

      <Card>
        <Heading>{t('settings.language')}</Heading>
        <Option label={t('settings.system')} selected={language === null} onPress={() => setLanguage(null)} />
        {LANGUAGES.map((l) => (
          <Option key={l.code} label={l.label} selected={language === l.code} onPress={() => setLanguage(l.code)} />
        ))}
      </Card>

      <Card>
        <Heading>{t('settings.privacyTitle')}</Heading>
        <Body>{t('settings.privacyBody')}</Body>
      </Card>

      <Card>
        <Heading>{t('settings.about')}</Heading>
        <Body>{t('common.disclaimer')}</Body>
      </Card>

      {confirming ? (
        <Card>
          <Heading>{t('settings.deleteConfirmTitle')}</Heading>
          <Body>{t('settings.deleteConfirmBody')}</Body>
          <Button kind="danger" label={t('settings.delete')} onPress={wipe} />
          <Button kind="secondary" label={t('common.cancel')} onPress={() => setConfirming(false)} />
        </Card>
      ) : (
        <Button kind="danger" label={t('settings.deleteAll')} onPress={() => setConfirming(true)} />
      )}
    </Screen>
  );
}
