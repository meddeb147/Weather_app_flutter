import { cycleLengths, dayKind, phaseSegments, predict, type CycleInputs, type Period } from './engine';

const p = (start: string, end: string | null = null): Period => ({ start, end });
const inputs = (periods: Period[], over: Partial<CycleInputs> = {}): CycleInputs => ({
  periods,
  usualPeriodLength: 5,
  regularity: 'regular',
  ...over,
});

describe('cycleLengths', () => {
  it('measures start-to-start gaps', () => {
    expect(cycleLengths([p('2026-01-01'), p('2026-01-30'), p('2026-02-27')])).toEqual([29, 28]);
  });

  it('drops gaps that look like a missed log', () => {
    expect(cycleLengths([p('2026-01-01'), p('2026-01-29'), p('2026-04-20')])).toEqual([28]);
  });
});

describe('predict', () => {
  it('returns null with no period logged', () => {
    expect(predict(inputs([]), '2026-03-01')).toBeNull();
  });

  it('starts from a low-confidence range when only the quiz answer exists', () => {
    const r = predict(inputs([p('2026-03-01', '2026-03-05')], { regularity: 'irregular' }), '2026-03-10')!;
    expect(r.cyclesLearned).toBe(0);
    expect(r.confidence).toBe('low');
    expect(r.showRange).toBe(true);
    expect(r.nextPeriodRange.start < r.nextPeriod).toBe(true);
    expect(r.nextPeriodRange.end > r.nextPeriod).toBe(true);
  });

  it('learns her own cycle length instead of assuming 28 days', () => {
    const periods = [p('2026-01-01', '2026-01-04'), p('2026-02-02', '2026-02-05'), p('2026-03-06', '2026-03-09'), p('2026-04-07', '2026-04-10')];
    const r = predict(inputs(periods), '2026-04-12')!;
    expect(r.cycleLength).toBe(32);
    expect(r.nextPeriod).toBe('2026-05-09');
    expect(r.confidence).toBe('high');
    expect(r.showRange).toBe(false);
    expect(r.nextPeriodRange).toEqual({ start: '2026-05-09', end: '2026-05-09' });
    expect(r.periodLength).toBe(4);
    expect(r.ovulation).toBe('2026-04-25');
  });

  it('shows a range with low confidence for irregular history', () => {
    const periods = [p('2026-01-01'), p('2026-01-25'), p('2026-03-03'), p('2026-03-29'), p('2026-05-08')];
    const r = predict(inputs(periods), '2026-05-10')!;
    expect(r.variability).toBeGreaterThan(4);
    expect(r.confidence).toBe('low');
    expect(r.showRange).toBe(true);
  });

  it('keeps the fertile window to a usable width even when the cycle is uncertain', () => {
    const r = predict(inputs([p('2026-03-01', '2026-03-05')], { regularity: 'irregular' }), '2026-03-10')!;
    expect(r.fertileWindow).toEqual({ start: '2026-03-07', end: '2026-03-19' });
  });

  it('walks through the four phases', () => {
    const periods = [p('2026-01-01', '2026-01-05'), p('2026-01-29', '2026-02-02'), p('2026-02-26', '2026-03-02'), p('2026-03-26', '2026-03-30')];
    const at = (d: string) => predict(inputs(periods), d)!.phase;
    expect(at('2026-03-27')).toBe('menstrual');
    expect(at('2026-04-03')).toBe('follicular');
    expect(at('2026-04-09')).toBe('ovulation');
    expect(at('2026-04-18')).toBe('luteal');
  });

  it('counts cycle day from the first day of the last period', () => {
    const r = predict(inputs([p('2026-03-01', '2026-03-05')]), '2026-03-01')!;
    expect(r.cycleDay).toBe(1);
    expect(r.phase).toBe('menstrual');
  });

  it('treats an open period as ongoing and reports lateness', () => {
    const open = predict(inputs([p('2026-03-01')]), '2026-03-03')!;
    expect(open.periodOngoing).toBe(true);
    const late = predict(inputs([p('2026-01-01', '2026-01-05'), p('2026-01-29', '2026-02-02'), p('2026-02-26', '2026-03-02'), p('2026-03-26', '2026-03-30')]), '2026-04-27')!;
    expect(late.daysLate).toBe(4);
    expect(late.phase).toBe('luteal');
  });

  it('ignores periods logged in the future', () => {
    const r = predict(inputs([p('2026-03-01', '2026-03-05'), p('2026-09-01')]), '2026-03-10')!;
    expect(r.lastPeriodStart).toBe('2026-03-01');
  });
});

describe('dayKind', () => {
  const periods = [p('2026-01-01', '2026-01-05'), p('2026-01-29', '2026-02-02'), p('2026-02-26', '2026-03-02'), p('2026-03-26', '2026-03-30')];
  const i = inputs(periods);
  const r = predict(i, '2026-04-01');

  it('labels logged, predicted, fertile and ovulation days', () => {
    expect(dayKind('2026-03-27', i, r)).toBe('period');
    expect(dayKind('2026-04-23', i, r)).toBe('predictedPeriod');
    expect(dayKind('2026-04-09', i, r)).toBe('ovulation');
    expect(dayKind('2026-04-06', i, r)).toBe('fertile');
    expect(dayKind('2026-04-15', i, r)).toBe('none');
  });
});

describe('phaseSegments', () => {
  it('splits the cycle into four phases that add up to its length', () => {
    const r = predict(inputs([p('2026-01-01', '2026-01-05'), p('2026-01-29', '2026-02-02'), p('2026-02-26', '2026-03-02')]), '2026-03-05')!;
    const segments = phaseSegments(r);
    expect(segments.map((s) => s.phase)).toEqual(['menstrual', 'follicular', 'ovulation', 'luteal']);
    expect(segments.reduce((sum, s) => sum + s.days, 0)).toBe(r.cycleLength);
    expect(segments[3].days).toBe(12);
  });
});
