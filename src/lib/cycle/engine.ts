import { addDays, diffDays, ISODate } from '../dates';

/**
 * Cycle predictions learned from her own history.
 * Estimates only: never a method of birth control and never a diagnosis.
 */

export type Phase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal';
export type Confidence = 'low' | 'medium' | 'high';
export type Regularity = 'regular' | 'somewhat' | 'irregular' | 'unsure';

export interface Period {
  start: ISODate;
  /** null while the period is still ongoing. */
  end: ISODate | null;
}

export interface CycleInputs {
  periods: Period[];
  /** Self-reported in the quiz; used until her own logs take over. */
  usualPeriodLength: number;
  regularity: Regularity;
}

export interface DateRange {
  start: ISODate;
  end: ISODate;
}

export interface Prediction {
  /** Number of completed cycles the estimate is learned from. */
  cyclesLearned: number;
  cycleLength: number;
  /** Spread of her cycle lengths in days (standard deviation). */
  variability: number;
  periodLength: number;
  lastPeriodStart: ISODate;
  /** 1 on the first day of her period. */
  cycleDay: number;
  phase: Phase;
  nextPeriod: ISODate;
  /** Always present; equal start and end when `showRange` is false. */
  nextPeriodRange: DateRange;
  /** True for irregular or still-unknown cycles: show the range, not one date. */
  showRange: boolean;
  confidence: Confidence;
  ovulation: ISODate;
  fertileWindow: DateRange;
  /** Days past the latest expected start, 0 when not late. */
  daysLate: number;
  periodOngoing: boolean;
}

/** Population average, used only until she has logged cycles of her own. */
const PRIOR_CYCLE_LENGTH = 28;
const LUTEAL_LENGTH = 14;
const MIN_VALID_CYCLE = 15;
const MAX_VALID_CYCLE = 60;
const MAX_CYCLES_USED = 6;
const MAX_PERIOD_LENGTH = 10;
const MAX_FERTILE_MARGIN = 3;

const PRIOR_SPREAD: Record<Regularity, number> = {
  regular: 1.5,
  somewhat: 3,
  irregular: 6,
  unsure: 4,
};

export function sortPeriods(periods: Period[]): Period[] {
  return [...periods].sort((a, b) => a.start.localeCompare(b.start));
}

/** Lengths of completed cycles, oldest first. Gaps that look like a missed log are dropped. */
export function cycleLengths(periods: Period[]): number[] {
  const sorted = sortPeriods(periods);
  const lengths: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const len = diffDays(sorted[i - 1].start, sorted[i].start);
    if (len >= MIN_VALID_CYCLE && len <= MAX_VALID_CYCLE) lengths.push(len);
  }
  return lengths.slice(-MAX_CYCLES_USED);
}

/** Mean and standard deviation, weighting recent cycles more heavily. */
function weightedStats(values: number[]): { mean: number; sd: number } {
  const weights = values.map((_, i) => i + 1);
  const total = weights.reduce((a, b) => a + b, 0);
  const mean = values.reduce((sum, v, i) => sum + v * weights[i], 0) / total;
  const variance = values.reduce((sum, v, i) => sum + weights[i] * (v - mean) ** 2, 0) / total;
  return { mean, sd: Math.sqrt(variance) };
}

function learnedPeriodLength(periods: Period[], fallback: number): number {
  const done = periods
    .filter((p) => p.end !== null)
    .map((p) => diffDays(p.start, p.end as ISODate) + 1)
    .filter((len) => len >= 1 && len <= MAX_PERIOD_LENGTH)
    .slice(-MAX_CYCLES_USED);
  if (done.length === 0) return fallback;
  return Math.round(done.reduce((a, b) => a + b, 0) / done.length);
}

export function predict(inputs: CycleInputs, todayISO: ISODate): Prediction | null {
  const periods = sortPeriods(inputs.periods).filter((p) => p.start <= todayISO);
  if (periods.length === 0) return null;

  const last = periods[periods.length - 1];
  const lengths = cycleLengths(periods);
  const n = lengths.length;

  let mean: number;
  let sd: number;
  if (n === 0) {
    mean = PRIOR_CYCLE_LENGTH;
    sd = PRIOR_SPREAD[inputs.regularity];
  } else if (n === 1) {
    // One cycle is real data but thin: lean on it, keep the spread she reported.
    mean = (lengths[0] * 2 + PRIOR_CYCLE_LENGTH) / 3;
    sd = PRIOR_SPREAD[inputs.regularity];
  } else {
    ({ mean, sd } = weightedStats(lengths));
  }

  const cycleLength = Math.round(mean);
  const variability = Math.round(sd * 10) / 10;
  const periodLength = learnedPeriodLength(periods, inputs.usualPeriodLength);

  let confidence: Confidence = 'low';
  if (n >= 3 && sd <= 2) confidence = 'high';
  else if (n >= 2 && sd <= 4) confidence = 'medium';

  const showRange = confidence !== 'high' && (sd > 2 || n < 2);
  const margin = showRange ? Math.max(1, Math.round(sd * 1.5)) : 0;

  const nextPeriod = addDays(last.start, cycleLength);
  const nextPeriodRange = { start: addDays(nextPeriod, -margin), end: addDays(nextPeriod, margin) };
  const ovulation = addDays(nextPeriod, -LUTEAL_LENGTH);
  // Widen for uncertain cycles, but keep the window short enough to stay useful.
  const fertileMargin = Math.min(margin, MAX_FERTILE_MARGIN);
  const fertileWindow = { start: addDays(ovulation, -5 - fertileMargin), end: addDays(ovulation, 1 + fertileMargin) };

  const cycleDay = diffDays(last.start, todayISO) + 1;
  const assumedEnd = last.end ?? addDays(last.start, Math.min(periodLength, MAX_PERIOD_LENGTH) - 1);
  const periodOngoing = last.end === null && todayISO <= addDays(last.start, MAX_PERIOD_LENGTH - 1);
  const inPeriod = last.end === null ? periodOngoing && todayISO <= assumedEnd : todayISO <= last.end;

  let phase: Phase;
  if (inPeriod || (periodOngoing && last.end === null)) phase = 'menstrual';
  else if (todayISO < addDays(ovulation, -1)) phase = 'follicular';
  else if (todayISO <= addDays(ovulation, 1)) phase = 'ovulation';
  else phase = 'luteal';

  return {
    cyclesLearned: n,
    cycleLength,
    variability,
    periodLength,
    lastPeriodStart: last.start,
    cycleDay,
    phase,
    nextPeriod,
    nextPeriodRange,
    showRange,
    confidence,
    ovulation,
    fertileWindow,
    daysLate: Math.max(0, diffDays(nextPeriodRange.end, todayISO)),
    periodOngoing,
  };
}

/** What a given calendar day is: logged period, predicted period, fertile window or ovulation. */
export type DayKind = 'period' | 'predictedPeriod' | 'ovulation' | 'fertile' | 'none';

export function dayKind(date: ISODate, inputs: CycleInputs, prediction: Prediction | null): DayKind {
  for (const p of inputs.periods) {
    const fallbackLen = prediction?.periodLength ?? inputs.usualPeriodLength;
    const end = p.end ?? addDays(p.start, fallbackLen - 1);
    if (date >= p.start && date <= end) return 'period';
  }
  if (!prediction) return 'none';

  // Project the next three cycles forward from the last logged period.
  for (let k = 1; k <= 3; k++) {
    const start = addDays(prediction.lastPeriodStart, prediction.cycleLength * k);
    const ovulation = addDays(start, -LUTEAL_LENGTH);
    if (date >= start && date <= addDays(start, prediction.periodLength - 1)) return 'predictedPeriod';
    if (date > prediction.lastPeriodStart) {
      if (date === ovulation) return 'ovulation';
      if (date >= addDays(ovulation, -5) && date <= addDays(ovulation, 1)) return 'fertile';
    }
  }
  return 'none';
}
