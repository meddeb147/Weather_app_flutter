import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Share, StyleSheet, View } from 'react-native';

import { MascotAvatar } from '@/components/mascot-avatar';
import { MonthGrid } from '@/components/month-grid';
import { StepNav } from '@/components/month-nav';
import { colors, radius, space } from '@/components/theme';
import { Body, Button, Card, Option, Screen, Title } from '@/components/ui';
import { useStore } from '@/data/store';
import { LANGUAGES } from '@/i18n';
import { addDays, toDate } from '@/lib/dates';
import { MASCOTS } from '@/lib/mascots';
import { QUESTIONS, scoreQuiz, type Answers } from '@/lib/quiz/quiz';

const WELCOME = -1;
const RESULT = QUESTIONS.length;

export default function OnboardingScreen() {
  const { retake } = useLocalSearchParams<{ retake?: string }>();
  const { today, periods, language, setLanguage, setProfile, addPeriod } = useStore();
  const { t, i18n } = useTranslation();
  const [step, setStep] = useState(retake ? 0 : WELCOME);
  const [answers, setAnswers] = useState<Answers>({});
  const [cursor, setCursor] = useState(() => {
    const d = toDate(today);
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  if (step === WELCOME) {
    return (
      <Screen>
        <View style={styles.center}>
          <MascotAvatar mascot="momo" size={200} />
          <Title style={styles.centerText}>{t('onboarding.title')}</Title>
          <Body style={styles.centerText}>{t('onboarding.tagline')}</Body>
        </View>
        <Body style={styles.centerText}>{t('onboarding.intro')}</Body>
        <Button label={t('onboarding.start')} onPress={() => setStep(0)} />
        <Body soft style={styles.centerText}>
          {t('onboarding.privacy')}
        </Body>
        <View style={styles.languages}>
          {LANGUAGES.map((l) => (
            <Button key={l.code} kind="secondary" label={l.label} disabled={(language ?? i18n.language) === l.code} onPress={() => setLanguage(l.code)} />
          ))}
        </View>
      </Screen>
    );
  }

  if (step === RESULT) {
    const result = scoreQuiz(answers);
    const type = t(`mascot.${result.mascot}.type`);
    const finish = () => {
      setProfile({
        mascot: result.mascot,
        usualPeriodLength: result.usualPeriodLength,
        regularity: result.regularity,
        mainSymptoms: result.mainSymptoms,
        goal: result.goal,
      });
      if (periods.length === 0 && result.lastPeriod) {
        const end = addDays(result.lastPeriod, result.usualPeriodLength - 1);
        addPeriod({ start: result.lastPeriod, end: end < today ? end : null });
      }
      router.replace('/');
    };
    return (
      <Screen background={MASCOTS[result.mascot].tint}>
        <View style={styles.center}>
          <MascotAvatar mascot={result.mascot} size={220} />
          <Title style={styles.centerText}>{t('onboarding.resultTitle', { type })}</Title>
          <Body soft>{t(`mascot.${result.mascot}.name`)}</Body>
        </View>
        <Card>
          <Body style={styles.centerText}>{t(`mascot.${result.mascot}.reveal`)}</Body>
        </Card>
        <Button label={t('onboarding.meet', { name: t(`mascot.${result.mascot}.name`) })} onPress={finish} />
        <Button kind="secondary" label={t('onboarding.share')} onPress={() => Share.share({ message: t('onboarding.shareText', { type }) }).catch(() => {})} />
      </Screen>
    );
  }

  const q = QUESTIONS[step];
  const chosen = answers[q.id] ?? [];
  const choose = (id: string) => {
    if (q.kind === 'multi') {
      setAnswers({ ...answers, [q.id]: chosen.includes(id) ? chosen.filter((c) => c !== id) : [...chosen, id] });
    } else {
      setAnswers({ ...answers, [q.id]: [id] });
      if (q.kind === 'single') setStep(step + 1);
    }
  };
  const optionLabel = (id: string) => (q.id === 'symptoms' ? t(`symptom.${id}`) : t(`quiz.${q.id}.${id}`));
  const back = () => (step === 0 && retake ? router.back() : setStep(step - 1));

  return (
    <Screen>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${((step + 1) / QUESTIONS.length) * 100}%` }]} />
      </View>
      <Body soft>{t('onboarding.step', { current: step + 1, total: QUESTIONS.length })}</Body>
      <Title>{t(`quiz.${q.id}.title`)}</Title>

      {q.kind === 'date' ? (
        <>
          <Body soft>{t('quiz.lastPeriod.hint')}</Body>
          <StepNav
            title={new Intl.DateTimeFormat(i18n.language, { month: 'long', year: 'numeric' }).format(new Date(cursor.year, cursor.month, 1, 12))}
            canGoForward={new Date(cursor.year, cursor.month + 1, 1) <= toDate(today)}
            onStep={(delta) => {
              const d = new Date(cursor.year, cursor.month + delta, 1);
              setCursor({ year: d.getFullYear(), month: d.getMonth() });
            }}
          />
          <Card>
            <MonthGrid year={cursor.year} month={cursor.month} locale={i18n.language} today={today} maxDate={today} selected={chosen[0] ?? null} onPress={choose} />
          </Card>
        </>
      ) : (
        <>
          {q.kind === 'multi' && <Body soft>{t('onboarding.pickSeveral')}</Body>}
          {q.options.map((o) => (
            <Option key={o.id} label={optionLabel(o.id)} selected={chosen.includes(o.id)} onPress={() => choose(o.id)} />
          ))}
        </>
      )}

      {q.kind !== 'single' && <Button label={t('common.continue')} disabled={q.kind === 'date' && chosen.length === 0} onPress={() => setStep(step + 1)} />}
      <Button kind="secondary" label={t('common.back')} onPress={back} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', gap: space.sm, paddingTop: space.xl },
  centerText: { textAlign: 'center' },
  languages: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, justifyContent: 'center' },
  progressTrack: { height: 8, borderRadius: radius.pill, backgroundColor: colors.border, overflow: 'hidden' },
  progressFill: { height: 8, borderRadius: radius.pill, backgroundColor: colors.brand },
});
