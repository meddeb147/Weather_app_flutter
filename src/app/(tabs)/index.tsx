import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { MascotAvatar } from '@/components/mascot-avatar';
import { colors, radius, space } from '@/components/theme';
import { Body, Button, Card, Heading, Screen } from '@/components/ui';
import { useStore } from '@/data/store';
import { diffDays, formatDate } from '@/lib/dates';
import { MASCOTS, PHASE_COLORS } from '@/lib/mascots';

export default function HomeScreen() {
  const { profile, prediction: p, today, periodOn, startPeriod, endPeriod } = useStore();
  const { t, i18n } = useTranslation();
  if (!profile) return null;

  const locale = i18n.language;
  const fmt = (d: string) => formatDate(d, locale);
  const daysUntil = p ? diffDays(today, p.nextPeriod) : 0;

  return (
    <Screen background={MASCOTS[profile.mascot].tint}>
      <View style={styles.hero}>
        <MascotAvatar mascot={profile.mascot} phase={p?.phase} />
        <Body soft>{t(`mascot.${profile.mascot}.name`)}</Body>
        {p && (
          <View style={styles.phaseRow}>
            <View style={[styles.phasePill, { backgroundColor: PHASE_COLORS[p.phase] }]}>
              <Text style={styles.phaseLabel}>{t(`phase.${p.phase}`)}</Text>
            </View>
            <Body style={styles.cycleDay}>{t('home.cycleDay', { day: p.cycleDay })}</Body>
          </View>
        )}
      </View>

      {p ? (
        <>
          <Card style={styles.bubble}>
            <Body>{t(`voice.${profile.mascot}.${p.phase}`, { day: p.cycleDay })}</Body>
          </Card>

          <Card>
            <Body soft>{t('home.nextPeriod')}</Body>
            <Heading style={styles.big}>
              {p.showRange
                ? t('home.range', { start: fmt(p.nextPeriodRange.start), end: fmt(p.nextPeriodRange.end) })
                : formatDate(p.nextPeriod, locale, { weekday: 'long', day: 'numeric', month: 'long' })}
            </Heading>
            <Body>
              {p.daysLate > 0
                ? t('home.late', { days: p.daysLate })
                : daysUntil <= 1 || today >= p.nextPeriodRange.start
                  ? t('home.nextPeriodSoon')
                  : t('home.nextPeriodIn', { days: daysUntil })}
            </Body>
            <Body soft>
              {t(`home.confidence.${p.confidence}`)}
              {' · '}
              {p.cyclesLearned >= 2 ? t('home.learned', { count: p.cyclesLearned, length: p.cycleLength }) : t('home.learning')}
            </Body>
          </Card>

          <Card>
            <Body soft>{t('home.fertile')}</Body>
            <Heading>{t('home.range', { start: fmt(p.fertileWindow.start), end: fmt(p.fertileWindow.end) })}</Heading>
            <Body soft>{t('home.ovulation', { date: fmt(p.ovulation) })}</Body>
          </Card>
        </>
      ) : (
        <Card>
          <Body>{t('home.noData')}</Body>
        </Card>
      )}

      {p?.periodOngoing ? (
        <Button label={t('home.periodEnd')} onPress={() => endPeriod(today)} />
      ) : (
        !periodOn(today) && <Button label={t('home.periodStart')} onPress={() => startPeriod(today)} />
      )}
      <Button kind="secondary" label={t('home.logToday')} onPress={() => router.push({ pathname: '/log', params: { date: today } })} />

      <Body soft style={styles.disclaimer}>
        {t('common.disclaimer')}
      </Body>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: space.sm, paddingTop: space.sm },
  phaseRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: space.md },
  phasePill: { borderRadius: radius.pill, paddingHorizontal: space.md, paddingVertical: 6 },
  phaseLabel: { color: colors.text, fontWeight: '700', fontSize: 14 },
  cycleDay: { fontWeight: '600' },
  bubble: { borderColor: colors.brand, borderWidth: 1.5 },
  big: { fontSize: 22, lineHeight: 28 },
  disclaimer: { textAlign: 'center' },
});
