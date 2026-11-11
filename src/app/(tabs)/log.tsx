import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { StepNav } from '@/components/month-nav';
import { Body, Button, Card, Chip, ChipRow, Heading, Screen } from '@/components/ui';
import { emptyLog, useStore } from '@/data/store';
import { MOODS, SYMPTOMS, type DailyLog, type Flow } from '@/data/types';
import { addDays, formatDate } from '@/lib/dates';
import { PHASE_COLORS } from '@/lib/mascots';

const FLOWS: Flow[] = [0, 1, 2, 3];
const ISO = /^\d{4}-\d{2}-\d{2}$/;

/** Every tap saves straight away, so a full daily log takes a few seconds. */
export default function LogScreen() {
  const params = useLocalSearchParams<{ date?: string }>();
  const router = useRouter();
  const { today, logs, saveLog, periodOn, startPeriod, endPeriod, removePeriod } = useStore();
  const { t, i18n } = useTranslation();

  const date = params.date && ISO.test(params.date) && params.date <= today ? params.date : today;
  const log = logs[date] ?? emptyLog(date);
  const period = periodOn(date);
  const update = (change: Partial<DailyLog>) => saveLog({ ...log, ...change });
  const goTo = (d: string) => router.setParams({ date: d });

  const title = date === today ? t('common.today') : formatDate(date, i18n.language, { weekday: 'short', day: 'numeric', month: 'long' });

  return (
    <Screen>
      <StepNav title={title} onStep={(delta) => goTo(addDays(date, delta))} canGoForward={date < today} />

      <Card>
        <Heading>{t('log.mood')}</Heading>
        <ChipRow>
          {MOODS.map((m) => (
            <Chip key={m} label={t(`mood.${m}`)} selected={log.mood === m} onPress={() => update({ mood: log.mood === m ? null : m })} />
          ))}
        </ChipRow>
      </Card>

      <Card>
        <Heading>{t('log.symptoms')}</Heading>
        <ChipRow>
          {SYMPTOMS.map((s) => {
            const on = log.symptoms.includes(s);
            return (
              <Chip
                key={s}
                label={t(`symptom.${s}`)}
                selected={on}
                color={PHASE_COLORS.luteal}
                onPress={() => update({ symptoms: on ? log.symptoms.filter((x) => x !== s) : [...log.symptoms, s] })}
              />
            );
          })}
        </ChipRow>
      </Card>

      <Card>
        <Heading>{t('flow.title')}</Heading>
        <ChipRow>
          {FLOWS.map((f) => (
            <Chip key={f} label={t(`flow.${f}`)} selected={log.flow === f} color={PHASE_COLORS.menstrual} onPress={() => update({ flow: f })} />
          ))}
        </ChipRow>
      </Card>

      <Card>
        <Heading>{t('log.period')}</Heading>
        {period ? (
          <>
            <Button kind="secondary" label={t('log.endHere')} onPress={() => endPeriod(date)} disabled={period.end === date} />
            <Button kind="danger" label={t('log.remove')} onPress={() => removePeriod(period.start)} />
          </>
        ) : (
          <Button kind="secondary" label={t('log.startHere')} onPress={() => startPeriod(date)} />
        )}
      </Card>

      <Body soft style={{ textAlign: 'center' }}>
        {t('log.saved')}
      </Body>
    </Screen>
  );
}
