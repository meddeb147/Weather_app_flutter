import type { Period, Regularity } from '@/lib/cycle/engine';
import type { ISODate } from '@/lib/dates';
import type { MascotId } from '@/lib/mascots';
import type { Goal, QuizSymptom } from '@/lib/quiz/quiz';

export type Language = 'en' | 'fr' | 'ar';

export const MOODS = ['happy', 'calm', 'sensitive', 'low', 'irritable', 'anxious'] as const;
export type Mood = (typeof MOODS)[number];

export const SYMPTOMS = ['cramps', 'headache', 'bloating', 'acne', 'cravings', 'fatigue', 'discharge', 'poorSleep', 'lowEnergy'] as const;
export type Symptom = (typeof SYMPTOMS)[number];

/** 0 none, 1 light, 2 medium, 3 heavy. */
export type Flow = 0 | 1 | 2 | 3;

export interface DailyLog {
  date: ISODate;
  mood: Mood | null;
  symptoms: Symptom[];
  flow: Flow;
}

export interface Profile {
  mascot: MascotId;
  usualPeriodLength: number;
  regularity: Regularity;
  mainSymptoms: QuizSymptom[];
  goal: Goal;
}

export interface AppData {
  profile: Profile | null;
  /** null means "follow the phone's language". */
  language: Language | null;
  periods: Period[];
  logs: Record<ISODate, DailyLog>;
}

export const EMPTY_DATA: AppData = { profile: null, language: null, periods: [], logs: {} };

/** Everything here stays on her device. Nothing in this interface talks to a server. */
export interface LocalStorage {
  load(): Promise<AppData>;
  saveProfile(profile: Profile | null): Promise<void>;
  saveLanguage(language: Language | null): Promise<void>;
  savePeriods(periods: Period[]): Promise<void>;
  saveLog(log: DailyLog): Promise<void>;
  wipe(): Promise<void>;
}
