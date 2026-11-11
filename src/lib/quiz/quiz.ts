import type { Regularity } from '../cycle/engine';
import { MASCOT_IDS, type MascotId } from '../mascots';

/**
 * "What's your period animal?" Eight questions: personality ones choose her
 * mascot, the others quietly collect what the tracker needs.
 * All wording lives in the locale files under `quiz.<questionId>`.
 */

export type Goal = 'period' | 'moods' | 'ovulation' | 'conceive';
export type QuizSymptom = 'cramps' | 'headache' | 'bloating' | 'acne' | 'cravings' | 'fatigue' | 'moodSwings' | 'poorSleep';

type Scores = Partial<Record<MascotId, number>>;
export interface QuizOption {
  id: string;
  scores?: Scores;
}
export interface QuizQuestion {
  id: string;
  kind: 'single' | 'multi' | 'date';
  options: QuizOption[];
}

const personality = (id: string): QuizQuestion => ({
  id,
  kind: 'single',
  options: MASCOT_IDS.map((m) => ({ id: m, scores: { [m]: 3 } })),
});

export const QUESTIONS: QuizQuestion[] = [
  personality('firstMove'),
  { id: 'lastPeriod', kind: 'date', options: [] },
  personality('twoDaysBefore'),
  { id: 'periodLength', kind: 'single', options: [{ id: '3' }, { id: '5' }, { id: '6' }, { id: '8' }] },
  personality('perfectDay'),
  { id: 'regularity', kind: 'single', options: [{ id: 'regular' }, { id: 'somewhat' }, { id: 'irregular' }, { id: 'unsure' }] },
  {
    id: 'symptoms',
    kind: 'multi',
    options: [
      { id: 'cramps', scores: { duck: 1 } },
      { id: 'headache', scores: { cat: 1 } },
      { id: 'bloating', scores: { pufferfish: 2 } },
      { id: 'acne', scores: { cat: 1 } },
      { id: 'cravings', scores: { pufferfish: 1 } },
      { id: 'fatigue', scores: { koala: 2 } },
      { id: 'moodSwings', scores: { momo: 2 } },
      { id: 'poorSleep', scores: { koala: 1 } },
    ],
  },
  { id: 'goal', kind: 'single', options: [{ id: 'period' }, { id: 'moods' }, { id: 'ovulation' }, { id: 'conceive' }] },
];

/** questionId -> chosen option ids (or one ISO date for the date question). */
export type Answers = Record<string, string[]>;

export interface QuizResult {
  mascot: MascotId;
  scores: Record<MascotId, number>;
  lastPeriod: string | null;
  usualPeriodLength: number;
  regularity: Regularity;
  mainSymptoms: QuizSymptom[];
  goal: Goal;
}

export function scoreQuiz(answers: Answers): QuizResult {
  const scores = Object.fromEntries(MASCOT_IDS.map((m) => [m, 0])) as Record<MascotId, number>;
  for (const q of QUESTIONS) {
    for (const chosen of answers[q.id] ?? []) {
      const option = q.options.find((o) => o.id === chosen);
      for (const [mascot, points] of Object.entries(option?.scores ?? {})) {
        scores[mascot as MascotId] += points;
      }
    }
  }
  // Ties go to the earlier mascot in the lineup, so Momo wins a dead heat.
  const mascot = MASCOT_IDS.reduce((best, m) => (scores[m] > scores[best] ? m : best), MASCOT_IDS[0]);

  return {
    mascot,
    scores,
    lastPeriod: answers.lastPeriod?.[0] ?? null,
    usualPeriodLength: Number(answers.periodLength?.[0] ?? 5),
    regularity: (answers.regularity?.[0] ?? 'unsure') as Regularity,
    mainSymptoms: (answers.symptoms ?? []) as QuizSymptom[],
    goal: (answers.goal?.[0] ?? 'period') as Goal,
  };
}
