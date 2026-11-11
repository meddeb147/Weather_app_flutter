import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { MonthGrid, type DayLook } from '@/components/month-grid';
import { StepNav } from '@/components/month-nav';
import { colors, space } from '@/components/theme';
import { Body, Card, Screen, Title } from '@/components/ui';
import { useStore } from '@/data/store';
import { dayKind, type DayKind } from '@/lib/cycle/engine';
import { toDate } from '@/lib/dates';

const LOOKS: Record<DayKind, DayLook> = {
  period: { fill: '#F28CA5', textColor: colors.white },
  predictedPeriod: { ring: '#F28CA5' },
  ovulation: { fill: '#F2C230' },
  fertile: { fill: '#DDF1E4' },
  none: {},
};

export default function CalendarScreen() {
  const { cycleInputs, prediction, today, logs } = useStore();
  const { t, i18n } = useTranslation();
  const [cursor, setCursor] = useState(() => {
    const d = toDate(today);
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const title = new Intl.DateTimeFormat(i18n.language, { month: 'long', year: 'numeric' }).format(new Date(cursor.year, cursor.month, 1, 12));
  const step = (delta: number) => {
    const d = new Date(cursor.year, cursor.month + delta, 1);
    setCursor({ year: d.getFullYear(), month: d.getMonth() });
  };

  const legend: [DayKind, string][] = [
    ['period', t('calendar.legendPeriod')],
    ['predictedPeriod', t('calendar.legendPredicted')],
    ['fertile', t('calendar.legendFertile')],
    ['ovulation', t('calendar.legendOvulation')],
  ];

  return (
    <Screen tint="#FFE3EA">
      <Title>{t('tabs.calendar')}</Title>
      <StepNav title={title} onStep={step} />
      <Card>
        <Animated.View key={`${cursor.year}-${cursor.month}`} entering={FadeIn.duration(260)}>
        <MonthGrid
          dot={(date) => {
            const l = logs[date];
            return l !== undefined && (l.mood !== null || l.symptoms.length > 0 || l.flow > 0);
          }}
          year={cursor.year}
          month={cursor.month}
          locale={i18n.language}
          today={today}
          look={(date) => LOOKS[dayKind(date, cycleInputs, prediction)]}
          onPress={(date) => {
            if (date <= today) router.push({ pathname: '/log', params: { date } });
          }}
        />
        </Animated.View>
      </Card>
      <View style={styles.legend}>
        {legend.map(([kind, label]) => (
          <View key={kind} style={styles.legendItem}>
            <View
              style={[
                styles.swatch,
                LOOKS[kind].fill !== undefined && { backgroundColor: LOOKS[kind].fill },
                LOOKS[kind].ring !== undefined && { borderWidth: 2, borderStyle: 'dashed', borderColor: LOOKS[kind].ring },
              ]}
            />
            <Body soft>{label}</Body>
          </View>
        ))}
      </View>
      <Body soft>{t('calendar.tapHint')}</Body>
      <Body soft>{t('common.disclaimer')}</Body>
    </Screen>
  );
}

const styles = StyleSheet.create({
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  swatch: { width: 18, height: 18, borderRadius: 9 },
});
