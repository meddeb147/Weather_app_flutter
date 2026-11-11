import type { Period, Regularity } from '@/lib/cycle/engine';
import type { ISODate } from '@/lib/dates';
import type { MascotId } from '@/lib/mascots';
import type { Goal, QuizSymptom } from '@/lib/quiz/quiz';

export type Language = 'en' | 'fr' | 'ar';

export const MOODS = ['happy', 'calm', 'sensitive', 'low', 'irritable', 'anxious'] as const;
export type Mood = (typeof MOODS)[number];
export const MOOD_EMOJI: Record<Mood, string> = { happy: '😊', calm: '😌', sensitive: '🥺', low: '😔', irritable: '😤', anxious: '😰' };

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

export const COMFORT_CATEGORIES = ['snacks', 'drinks', 'flowers', 'movies'] as const;
export type ComfortCategory = (typeof COMFORT_CATEGORIES)[number];
export interface ComfortItem {
  id: string;
  category: ComfortCategory;
  text: string;
}

/** What a linked partner or crew member may see. Her full health log is never shared. */
export type Sharing = 'mood' | 'moodAndDates' | 'paused';

export const GIFTS = ['hug', 'tea', 'flowers', 'chocolate'] as const;
export type Gift = (typeof GIFTS)[number];
export const GIFT_EMOJI: Record<Gift, string> = { hug: '🤗', tea: '🍵', flowers: '💐', chocolate: '🍫' };

export interface Settings {
  sharing: Sharing;
  /** Fertility and ovulation are never shared unless she turns this on. */
  shareFertility: boolean;
  appLock: boolean;
  lovePoints: number;
  /** The day she tapped "I'm actually fine today!", if any. */
  fineOn: ISODate | null;
}

export const DEFAULT_SETTINGS: Settings = { sharing: 'mood', shareFertility: false, appLock: false, lovePoints: 0, fineOn: null };

export interface AppData {
  profile: Profile | null;
  /** null means "follow the phone's language". */
  language: Language | null;
  periods: Period[];
  logs: Record<ISODate, DailyLog>;
  comfort: ComfortItem[];
  settings: Settings;
}

export const EMPTY_DATA: AppData = { profile: null, language: null, periods: [], logs: {}, comfort: [], settings: DEFAULT_SETTINGS };

export type KVKey = 'profile' | 'language' | 'comfort' | 'settings';

/** Everything here stays on her device. Nothing in this interface talks to a server. */
export interface LocalStorage {
  load(): Promise<AppData>;
  saveKV(key: KVKey, value: unknown): Promise<void>;
  savePeriods(periods: Period[]): Promise<void>;
  saveLog(log: DailyLog): Promise<void>;
  wipe(): Promise<void>;
}
