import { MASCOT_IDS } from '../mascots';
import { QUESTIONS, scoreQuiz } from './quiz';

describe('quiz', () => {
  it('has eight questions', () => {
    expect(QUESTIONS).toHaveLength(8);
  });

  it.each(MASCOT_IDS)('can reach %s by answering in character', (mascot) => {
    const r = scoreQuiz({ firstMove: [mascot], twoDaysBefore: [mascot], perfectDay: [mascot] });
    expect(r.mascot).toBe(mascot);
  });

  it('lets symptoms break a personality tie', () => {
    const r = scoreQuiz({ firstMove: ['cat'], twoDaysBefore: ['koala'], perfectDay: ['duck'], symptoms: ['fatigue', 'poorSleep'] });
    expect(r.mascot).toBe('koala');
  });

  it('collects the tracking data', () => {
    const r = scoreQuiz({ lastPeriod: ['2026-03-01'], periodLength: ['6'], regularity: ['irregular'], symptoms: ['cramps'], goal: ['moods'] });
    expect(r).toMatchObject({ lastPeriod: '2026-03-01', usualPeriodLength: 6, regularity: 'irregular', mainSymptoms: ['cramps'], goal: 'moods' });
  });

  it('falls back to Momo and safe defaults when nothing is answered', () => {
    expect(scoreQuiz({})).toMatchObject({ mascot: 'momo', usualPeriodLength: 5, regularity: 'unsure', goal: 'period', lastPeriod: null });
  });
});
