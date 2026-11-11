import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Share, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInLeft, FadeInRight, ZoomIn, useAnimatedStyle, withSpring } from 'react-native-reanimated';

import { Burst } from '@/components/burst';
import { Mascot } from '@/components/mascot';
import { MonthGrid } from '@/components/month-grid';
import { StepNav } from '@/components/month-nav';
import { colors, radius, space } from '@/components/theme';
import { Body, Button, Card, Chip, ChipRow, Option, Screen, Title } from '@/components/ui';
import { useStore } from '@/data/store';
import { isRTL, LANGUAGES } from '@/i18n';
import { addDays, toDate } from '@/lib/dates';
import { celebrate } from '@/lib/haptics';
import { MASCOT_IDS, MASCOTS } from '@/lib/mascots';
import { QUESTIONS, scoreQuiz, type Answers } from '@/lib/quiz/quiz';

const WELCOME = -1;
const RESULT = QUESTIONS.length;

function Progress({ value }: { value: number }) {
  const style = useAnimatedStyle(() => ({ width: withSpring(`${value * 100}%`, { damping: 18, stiffness: 120 }) }));
  return (
    <View style={styles.progressTrack}>
      <Animated.View style={[styles.progressFill, style]} />
    </View>
  );
}

function Reveal({ answers, onDone }: { answers: Answers; onDone: (result: ReturnType<typeof scoreQuiz>) => void }) {
  const { t } = useTranslation();
  const [burst, setBurst] = useState(0);
  const result = scoreQuiz(answers);
  const type = t(`mascot.${result.mascot}.type`);
  useEffect(() => {
    const timer = setTimeout(() => {
      celebrate();
      setBurst(1);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Screen tint={MASCOTS[result.mascot].tint}>
      <View style={styles.revealStage}>
        <Animated.View entering={ZoomIn.springify().damping(9).stiffness(120).delay(150)}>
          <Mascot mascot={result.mascot} mood="happy" size={230} bounceKey={burst} />
        </Animated.View>
        <Burst emoji="✨" trigger={burst} />
      </View>
      <Animated.View entering={FadeInDown.delay(500).duration(450)} style={styles.center}>
        <Body soft>{t(`mascot.${result.mascot}.name`)}</Body>
        <Title style={styles.centerText}>{t('onboarding.resultTitle', { type })}</Title>
      </Animated.View>
      <Card index={10}>
        <Body style={styles.centerText}>{t(`mascot.${result.mascot}.reveal`)}</Body>
      </Card>
      <Animated.View entering={FadeInDown.delay(800).duration(450)} style={styles.stack}>
        <Button label={t('onboarding.meet', { name: t(`mascot.${result.mascot}.name`) })} onPress={() => onDone(result)} />
        <Button kind="secondary" label={t('onboarding.share')} onPress={() => Share.share({ message: t('onboarding.shareText', { type }) }).catch(() => {})} />
      </Animated.View>
    </Screen>
  );
}

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
  const slideIn = isRTL(i18n.language) ? FadeInLeft : FadeInRight;

  if (step === WELCOME) {
    return (
      <Screen>
        <Animated.View entering={ZoomIn.springify().damping(11)} style={styles.center}>
          <Mascot mascot="momo" mood="happy" size={210} />
        </Animated.View>
        <View style={styles.friends}>
          {MASCOT_IDS.filter((m) => m !== 'momo').map((m, i) => (
            <Animated.View key={m} entering={ZoomIn.springify().damping(10).delay(250 + i * 110)}>
              <Mascot mascot={m} mood="happy" size={70} />
            </Animated.View>
          ))}
        </View>
        <Animated.View entering={FadeInDown.delay(400).duration(450)} style={styles.stack}>
          <Title style={styles.centerText}>{t('onboarding.title')}</Title>
          <Body style={styles.centerText}>{t('onboarding.tagline')}</Body>
          <Body soft style={styles.centerText}>
            {t('onboarding.intro')}
          </Body>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(650).duration(450)} style={styles.stack}>
          <Button label={t('onboarding.start')} onPress={() => setStep(0)} />
          <Body soft style={styles.centerText}>
            🔒 {t('onboarding.privacy')}
          </Body>
          <ChipRow center>
            {LANGUAGES.map((l) => (
              <Chip key={l.code} label={l.label} selected={(language ?? i18n.language) === l.code} onPress={() => setLanguage(l.code)} />
            ))}
          </ChipRow>
        </Animated.View>
      </Screen>
    );
  }

  if (step === RESULT) {
    return (
      <Reveal
        answers={answers}
        onDone={(result) => {
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
        }}
      />
    );
  }

  const q = QUESTIONS[step];
  const chosen = answers[q.id] ?? [];
  const choose = (id: string) => {
    if (q.kind === 'multi') {
      setAnswers({ ...answers, [q.id]: chosen.includes(id) ? chosen.filter((c) => c !== id) : [...chosen, id] });
    } else {
      setAnswers({ ...answers, [q.id]: [id] });
      // A short pause so she sees her choice light up before moving on.
      if (q.kind === 'single') setTimeout(() => setStep((s) => (s === step ? step + 1 : s)), 260);
    }
  };
  const optionLabel = (id: string) => (q.id === 'symptoms' ? t(`symptom.${id}`) : t(`quiz.${q.id}.${id}`));
  const back = () => (step === 0 && retake ? router.back() : setStep(step - 1));

  return (
    <Screen>
      <Progress value={(step + 1) / QUESTIONS.length} />
      <Body soft>{t('onboarding.step', { current: step + 1, total: QUESTIONS.length })}</Body>

      <Animated.View key={step} entering={slideIn.duration(320)} style={styles.stack}>
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
              <Animated.View key={`${cursor.year}-${cursor.month}`} entering={FadeIn.duration(240)}>
                <MonthGrid year={cursor.year} month={cursor.month} locale={i18n.language} today={today} maxDate={today} selected={chosen[0] ?? null} onPress={choose} />
              </Animated.View>
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
      </Animated.View>

      {q.kind !== 'single' && <Button label={t('common.continue')} disabled={q.kind === 'date' && chosen.length === 0} onPress={() => setStep(step + 1)} />}
      <Button kind="ghost" label={t('common.back')} onPress={back} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', gap: space.xs },
  centerText: { textAlign: 'center' },
  stack: { gap: space.md },
  friends: { flexDirection: 'row', justifyContent: 'center', gap: space.sm, marginTop: -space.sm },
  revealStage: { alignItems: 'center', justifyContent: 'center', paddingTop: space.xl },
  progressTrack: { height: 10, borderRadius: radius.pill, backgroundColor: colors.white, overflow: 'hidden' },
  progressFill: { height: 10, borderRadius: radius.pill, backgroundColor: colors.brand },
});
