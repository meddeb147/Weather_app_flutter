import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSpring } from 'react-native-reanimated';

import { Mascot } from '@/components/mascot';
import { colors, font, radius, space } from '@/components/theme';
import { Body, Card, Heading, Label, Screen, Title } from '@/components/ui';
import { useStore } from '@/data/store';
import { MOOD_EMOJI, type DailyLog } from '@/data/types';
import { cycleLengths } from '@/lib/cycle/engine';
import { PHASE_COLORS } from '@/lib/mascots';

function Bar({ value, max, index, label }: { value: number; max: number; index: number; label: string }) {
  const h = useSharedValue(0);
  useEffect(() => {
    h.value = withDelay(120 + index * 80, withSpring(value / max, { damping: 14, stiffness: 120 }));
  }, [h, value, max, index]);
  const style = useAnimatedStyle(() => ({ height: `${Math.max(6, h.value * 100)}%` }));
  return (
    <View style={styles.barColumn}>
      <Text style={styles.barValue}>{label}</Text>
      <View style={styles.barTrack}>
        <Animated.View style={[styles.bar, style]} />
      </View>
    </View>
  );
}

function ProgressBar({ progress }: { progress: number }) {
  const w = useSharedValue(0);
  useEffect(() => {
    w.value = withDelay(200, withSpring(progress, { damping: 16, stiffness: 90 }));
  }, [w, progress]);
  const style = useAnimatedStyle(() => ({ width: `${Math.max(4, w.value * 100)}%` }));
  return (
    <View style={styles.progressTrack}>
      <Animated.View style={[styles.progressFill, style]} />
    </View>
  );
}

function top<K extends string>(logs: DailyLog[], pick: (l: DailyLog) => K[]): [K, number][] {
  const counts = new Map<K, number>();
  for (const l of logs) for (const k of pick(l)) counts.set(k, (counts.get(k) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
}

export default function InsightsScreen() {
  const { profile, periods, logs, prediction: p, growth } = useStore();
  const { t, i18n } = useTranslation();
  if (!profile) return null;

  const number = new Intl.NumberFormat(i18n.language);
  const lengths = cycleLengths(periods);
  const allLogs = Object.values(logs);
  const symptoms = top(allLogs, (l) => l.symptoms);
  const moods = top(allLogs, (l) => (l.mood ? [l.mood] : []));
  const rhythm = !p || lengths.length < 2 ? null : p.variability <= 2 ? 'steady' : p.variability <= 4 ? 'some' : 'lots';

  return (
    <Screen tint="#E9E5FA">
      <Title>{t('insights.title')}</Title>

      <Card index={0} style={styles.growth}>
        <Mascot mascot={profile.mascot} phase={null} size={84} still />
        <View style={styles.flex}>
          <Heading>{t('insights.growthTitle')}</Heading>
          <Body>{t('extra.level', { level: number.format(growth.level), stage: t(`stage.${growth.stage}`) })}</Body>
          <ProgressBar progress={growth.progress} />
          <Body soft>
            {growth.nextStage ? t('insights.growthNext', { n: number.format(growth.cyclesToNext), stage: t(`stage.${growth.nextStage}`) }) : t('insights.growthMax')}
          </Body>
        </View>
      </Card>

      <View style={styles.stats}>
        {[
          [t('insights.cycles'), number.format(lengths.length)],
          [t('insights.avgCycle'), lengths.length ? t('insights.daysValue', { n: number.format(p?.cycleLength ?? 0) }) : '–'],
          [t('insights.avgPeriod'), p ? t('insights.daysValue', { n: number.format(p.periodLength) }) : '–'],
        ].map(([label, value], i) => (
          <Card key={label} index={1 + i} style={styles.stat}>
            <Text style={styles.statValue}>{value}</Text>
            <Body soft style={styles.center}>
              {label}
            </Body>
          </Card>
        ))}
      </View>

      {lengths.length === 0 ? (
        <Card index={4}>
          <Body>{t('insights.empty')}</Body>
        </Card>
      ) : (
        <>
          <Label>{t('insights.history')}</Label>
          <Card index={4}>
            <View style={styles.chart}>
              {lengths.map((len, i) => (
                <Bar key={i} index={i} value={len} max={Math.max(...lengths)} label={number.format(len)} />
              ))}
            </View>
            {rhythm && (
              <Body soft>
                {t('insights.rhythm')}: {t(`insights.variability.${rhythm}`)}
              </Body>
            )}
          </Card>
        </>
      )}

      <Label>{t('insights.topSymptoms')}</Label>
      <Card index={5}>
        {symptoms.length === 0 ? (
          <Body soft>{t('insights.nothingLogged')}</Body>
        ) : (
          symptoms.map(([s, count]) => (
            <View key={s} style={styles.row}>
              <Body style={styles.flex}>{t(`symptom.${s}`)}</Body>
              <View style={styles.count}>
                <Text style={styles.countText}>{number.format(count)}×</Text>
              </View>
            </View>
          ))
        )}
      </Card>

      <Label>{t('insights.topMoods')}</Label>
      <Card index={6}>
        {moods.length === 0 ? (
          <Body soft>{t('insights.nothingLogged')}</Body>
        ) : (
          moods.map(([m, count]) => (
            <View key={m} style={styles.row}>
              <Text style={styles.emoji}>{MOOD_EMOJI[m]}</Text>
              <Body style={styles.flex}>{t(`mood.${m}`)}</Body>
              <View style={styles.count}>
                <Text style={styles.countText}>{number.format(count)}×</Text>
              </View>
            </View>
          ))
        )}
      </Card>

      <Body soft style={styles.center}>
        {t('common.disclaimer')}
      </Body>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: 4 },
  center: { textAlign: 'center' },
  growth: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  progressTrack: { height: 10, borderRadius: radius.pill, backgroundColor: colors.border, overflow: 'hidden', marginVertical: 4 },
  progressFill: { height: 10, borderRadius: radius.pill, backgroundColor: colors.brand },
  stats: { flexDirection: 'row', gap: space.sm },
  stat: { flex: 1, alignItems: 'center', paddingHorizontal: space.sm, gap: 2 },
  statValue: { fontFamily: font.extra, fontSize: 22, lineHeight: 30, color: colors.brandDark, textAlign: 'center' },
  chart: { flexDirection: 'row', alignItems: 'flex-end', gap: space.md, height: 150, direction: 'ltr' },
  barColumn: { flex: 1, alignItems: 'center', gap: 4, height: '100%' },
  barTrack: { flex: 1, width: '100%', maxWidth: 38, justifyContent: 'flex-end' },
  bar: { width: '100%', borderRadius: 12, backgroundColor: PHASE_COLORS.luteal },
  barValue: { fontFamily: font.bold, fontSize: 13, lineHeight: 18, color: colors.textSoft },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 40 },
  emoji: { fontSize: 22 },
  count: { backgroundColor: colors.brandSoft, borderRadius: radius.pill, paddingHorizontal: space.md, paddingVertical: 2 },
  countText: { fontFamily: font.bold, fontSize: 14, lineHeight: 20, color: colors.brandDark },
});
