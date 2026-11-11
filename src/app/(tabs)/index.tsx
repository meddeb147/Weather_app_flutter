import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Burst } from '@/components/burst';
import { CycleRing } from '@/components/cycle-ring';
import { Mascot } from '@/components/mascot';
import { colors, font, radius, shadow, space } from '@/components/theme';
import { Body, Button, Card, Chip, Heading, Screen, Squish } from '@/components/ui';
import { emptyLog, useStore } from '@/data/store';
import { MOOD_EMOJI, MOODS } from '@/data/types';
import { diffDays, formatDate } from '@/lib/dates';
import { celebrate } from '@/lib/haptics';
import { MASCOTS, PHASE_COLORS } from '@/lib/mascots';

export default function HomeScreen() {
  const { profile, prediction: p, today, periodOn, startPeriod, endPeriod, growth, settings, fineToday, updateSettings, logs, saveLog } = useStore();
  const { t, i18n } = useTranslation();
  const [bounce, setBounce] = useState(0);
  if (!profile) return null;

  const locale = i18n.language;
  const fmt = (d: string) => formatDate(d, locale);
  const number = new Intl.NumberFormat(locale);
  const daysUntil = p ? diffDays(today, p.nextPeriod) : 0;
  const anyDay = p ? p.daysLate === 0 && (daysUntil <= 1 || today >= p.nextPeriodRange.start) : false;
  const log = logs[today] ?? emptyLog(today);
  const toughPhase = p?.phase === 'menstrual' || p?.phase === 'luteal';
  const cheer = () => {
    celebrate();
    setBounce((b) => b + 1);
  };

  return (
    <Screen tint={MASCOTS[profile.mascot].tint}>
      <View style={styles.topRow}>
        <View style={[styles.pill, shadow]}>
          <Text style={styles.pillText}>{t('extra.level', { level: number.format(growth.level), stage: t(`stage.${growth.stage}`) })}</Text>
        </View>
        <View style={[styles.pill, shadow]}>
          <Text style={styles.pillText}>♥ {number.format(settings.lovePoints)}</Text>
        </View>
      </View>

      <Animated.View entering={FadeIn.duration(500)} style={styles.hero}>
        <CycleRing prediction={p}>
          <Squish onPress={cheer} haptic="none" label={t(`mascot.${profile.mascot}.name`)}>
            <Mascot mascot={profile.mascot} phase={p?.phase} mood={fineToday ? 'happy' : undefined} size={190} bounceKey={bounce} />
          </Squish>
          <Burst emoji="💗" trigger={bounce} />
        </CycleRing>
        {p && (
          <View style={styles.phaseRow}>
            <View style={[styles.phasePill, { backgroundColor: PHASE_COLORS[p.phase] }]}>
              <Text style={styles.phaseLabel}>{t(`phase.${p.phase}`)}</Text>
            </View>
            <Text style={styles.cycleDay}>{t('home.cycleDay', { day: number.format(p.cycleDay) })}</Text>
          </View>
        )}
      </Animated.View>

      {p ? (
        <>
          <Card index={0} style={styles.bubble}>
            <View style={styles.bubbleTail} />
            <Body>{fineToday ? t('extra.fineVoice') : t(`voice.${profile.mascot}.${p.phase}`, { day: number.format(p.cycleDay) })}</Body>
            {(toughPhase || fineToday) && (
              <View style={styles.fineRow}>
                <Chip
                  label={t('extra.fine')}
                  selected={fineToday}
                  onPress={() => {
                    updateSettings({ fineOn: fineToday ? null : today });
                    if (!fineToday) cheer();
                  }}
                />
              </View>
            )}
          </Card>

          <Card index={1} style={styles.rowCard}>
            <View style={[styles.countdown, { backgroundColor: PHASE_COLORS.menstrual }]}>
              {anyDay || p.daysLate > 0 ? (
                <Text style={styles.countEmoji}>🌙</Text>
              ) : (
                <>
                  <Text style={styles.countNumber}>{number.format(daysUntil)}</Text>
                  <Text style={styles.countUnit}>{t(daysUntil === 1 ? 'extra.day' : 'extra.days')}</Text>
                </>
              )}
            </View>
            <View style={styles.flex}>
              <Body soft>{t('home.nextPeriod')}</Body>
              <Heading>
                {p.showRange
                  ? t('home.range', { start: fmt(p.nextPeriodRange.start), end: fmt(p.nextPeriodRange.end) })
                  : formatDate(p.nextPeriod, locale, { weekday: 'long', day: 'numeric', month: 'long' })}
              </Heading>
              <Body soft>
                {p.daysLate > 0 ? t('home.late', { days: number.format(p.daysLate) }) : anyDay ? t('home.nextPeriodSoon') : t(`home.confidence.${p.confidence}`)}
              </Body>
            </View>
          </Card>

          <Card index={2} style={styles.rowCard}>
            <View style={[styles.countdown, { backgroundColor: '#DDF1E4' }]}>
              <Text style={styles.countEmoji}>🌱</Text>
            </View>
            <View style={styles.flex}>
              <Body soft>{t('home.fertile')}</Body>
              <Heading>{t('home.range', { start: fmt(p.fertileWindow.start), end: fmt(p.fertileWindow.end) })}</Heading>
              <Body soft>{t('home.ovulation', { date: fmt(p.ovulation) })}</Body>
            </View>
          </Card>
        </>
      ) : (
        <Card>
          <Body>{t('home.noData')}</Body>
        </Card>
      )}

      <Card index={3}>
        <Heading>{t('extra.quickMood')}</Heading>
        <View style={styles.moodRow}>
          {MOODS.map((m) => {
            const on = log.mood === m;
            return (
              <Squish key={m} label={t(`mood.${m}`)} selected={on} onPress={() => saveLog({ ...log, mood: on ? null : m })} style={styles.moodItem}>
                <View style={[styles.moodCircle, on && styles.moodCircleOn]}>
                  <Text style={styles.moodEmoji}>{MOOD_EMOJI[m]}</Text>
                </View>
                <Text numberOfLines={1} style={[styles.moodLabel, on && styles.moodLabelOn]}>
                  {t(`mood.${m}`)}
                </Text>
              </Squish>
            );
          })}
        </View>
        <Button kind="secondary" label={t('extra.addDetails')} onPress={() => router.push({ pathname: '/log', params: { date: today } })} />
      </Card>

      {p?.periodOngoing ? (
        <Button label={t('home.periodEnd')} onPress={() => endPeriod(today)} />
      ) : (
        !periodOn(today) && (
          <Button
            label={t('home.periodStart')}
            onPress={() => {
              startPeriod(today);
              cheer();
            }}
          />
        )
      )}

      {p && <Body soft style={styles.center}>{p.cyclesLearned >= 2 ? t('home.learned', { count: p.cyclesLearned, length: p.cycleLength }) : t('home.learning')}</Body>}
      <Body soft style={styles.center}>
        {t('common.disclaimer')}
      </Body>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { textAlign: 'center' },
  topRow: { flexDirection: 'row', justifyContent: 'space-between' },
  pill: { backgroundColor: colors.card, borderRadius: radius.pill, paddingHorizontal: space.md + 2, paddingVertical: 6 },
  pillText: { fontFamily: font.bold, fontSize: 13.5, lineHeight: 20, color: colors.text },
  hero: { alignItems: 'center', gap: space.md },
  phaseRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: space.md },
  phasePill: { borderRadius: radius.pill, paddingHorizontal: space.lg, paddingVertical: 6 },
  phaseLabel: { fontFamily: font.bold, color: colors.text, fontSize: 15, lineHeight: 22 },
  cycleDay: { fontFamily: font.bold, fontSize: 17, lineHeight: 24, color: colors.text },
  bubble: { marginTop: space.xs },
  bubbleTail: { position: 'absolute', top: -8, alignSelf: 'center', width: 18, height: 18, backgroundColor: colors.card, transform: [{ rotate: '45deg' }], borderRadius: 4 },
  fineRow: { flexDirection: 'row', marginTop: space.xs },
  rowCard: { flexDirection: 'row', alignItems: 'center', gap: space.lg },
  countdown: { width: 76, height: 76, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  countNumber: { fontFamily: font.extra, fontSize: 30, lineHeight: 34, color: colors.white },
  countUnit: { fontFamily: font.bold, fontSize: 13, lineHeight: 16, color: colors.white },
  countEmoji: { fontSize: 32 },
  moodRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: space.xs },
  moodItem: { alignItems: 'center', gap: 4, width: 50 },
  moodCircle: { width: 46, height: 46, borderRadius: 23, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent' },
  moodCircleOn: { backgroundColor: colors.brandSoft, borderColor: colors.brand },
  moodEmoji: { fontSize: 24 },
  moodLabel: { fontFamily: font.medium, fontSize: 11, lineHeight: 15, color: colors.textSoft },
  moodLabelOn: { fontFamily: font.bold, color: colors.brandDark },
});
