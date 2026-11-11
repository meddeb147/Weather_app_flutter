import { createContext, use, useEffect, useMemo, useState, type ReactNode } from 'react';

import { cycleLengths, predict, sortPeriods, type CycleInputs, type Period, type Prediction } from '@/lib/cycle/engine';
import { addDays, today, type ISODate } from '@/lib/dates';

import { storage } from './storage';
import { EMPTY_DATA, type AppData, type ComfortCategory, type DailyLog, type KVKey, type Language, type Profile, type Settings } from './types';

export type Stage = 'baby' | 'friend' | 'bestFriend';

export interface Growth {
  /** Completed cycles: each one levels the mascot up. */
  level: number;
  stage: Stage;
  nextStage: Stage | null;
  cyclesToNext: number;
  /** 0 to 1 progress through the current stage. */
  progress: number;
}

export function growthFor(completedCycles: number): Growth {
  const level = completedCycles + 1;
  if (completedCycles < 3) return { level, stage: 'baby', nextStage: 'friend', cyclesToNext: 3 - completedCycles, progress: completedCycles / 3 };
  if (completedCycles < 9) return { level, stage: 'friend', nextStage: 'bestFriend', cyclesToNext: 9 - completedCycles, progress: (completedCycles - 3) / 6 };
  return { level, stage: 'bestFriend', nextStage: null, cyclesToNext: 0, progress: 1 };
}

interface Store extends AppData {
  ready: boolean;
  today: ISODate;
  cycleInputs: CycleInputs;
  prediction: Prediction | null;
  growth: Growth;
  /** True when she said she is fine today: the mascot shows a happy face. */
  fineToday: boolean;
  /** The period that contains `date`, if any. */
  periodOn(date: ISODate): Period | null;
  setProfile(profile: Profile): void;
  setLanguage(language: Language | null): void;
  updateSettings(change: Partial<Settings>): void;
  addPeriod(period: Period): void;
  startPeriod(date: ISODate): void;
  endPeriod(date: ISODate): void;
  removePeriod(start: ISODate): void;
  saveLog(log: DailyLog): void;
  addComfort(category: ComfortCategory, text: string): void;
  removeComfort(id: string): void;
  wipe(): void;
}

const StoreContext = createContext<Store | null>(null);

export function emptyLog(date: ISODate): DailyLog {
  return { date, mood: null, symptoms: [], flow: 0 };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(EMPTY_DATA);
  const [ready, setReady] = useState(false);
  const now = today();

  useEffect(() => {
    storage
      .load()
      .then(setData)
      .catch((e) => console.warn('Could not open local storage', e))
      .finally(() => setReady(true));
  }, []);

  const store = useMemo<Store>(() => {
    const cycleInputs: CycleInputs = {
      periods: data.periods,
      usualPeriodLength: data.profile?.usualPeriodLength ?? 5,
      regularity: data.profile?.regularity ?? 'unsure',
    };
    const prediction = predict(cycleInputs, now);
    const fallbackLength = prediction?.periodLength ?? cycleInputs.usualPeriodLength;

    const periodOn = (date: ISODate) =>
      data.periods.find((p) => date >= p.start && date <= (p.end ?? addDays(p.start, fallbackLength - 1))) ?? null;

    const write = <K extends KVKey>(key: K, value: AppData[K]) => {
      setData((d) => ({ ...d, [key]: value }));
      storage.saveKV(key, value).catch(console.warn);
    };
    const writePeriods = (periods: Period[]) => {
      const sorted = sortPeriods(periods);
      setData((d) => ({ ...d, periods: sorted }));
      storage.savePeriods(sorted).catch(console.warn);
    };

    return {
      ...data,
      ready,
      today: now,
      cycleInputs,
      prediction,
      growth: growthFor(cycleLengths(data.periods).length),
      fineToday: data.settings.fineOn === now,
      periodOn,
      setProfile: (profile) => write('profile', profile),
      setLanguage: (language) => write('language', language),
      updateSettings: (change) => write('settings', { ...data.settings, ...change }),
      addPeriod(period) {
        if (data.periods.some((p) => p.start === period.start)) return;
        writePeriods([...data.periods, period]);
      },
      startPeriod(date) {
        if (periodOn(date)) return;
        writePeriods([...data.periods, { start: date, end: null }]);
      },
      endPeriod(date) {
        // Close the most recent period that began on or before this date.
        const target = [...data.periods].reverse().find((p) => p.start <= date);
        if (!target) return;
        writePeriods(data.periods.map((p) => (p === target ? { ...p, end: date } : p)));
      },
      removePeriod(start) {
        writePeriods(data.periods.filter((p) => p.start !== start));
      },
      saveLog(log) {
        setData((d) => ({ ...d, logs: { ...d.logs, [log.date]: log } }));
        storage.saveLog(log).catch(console.warn);
      },
      addComfort(category, text) {
        const clean = text.trim();
        if (!clean) return;
        write('comfort', [...data.comfort, { id: `${Date.now()}-${data.comfort.length}`, category, text: clean }]);
      },
      removeComfort: (id) => write('comfort', data.comfort.filter((c) => c.id !== id)),
      wipe() {
        setData({ ...EMPTY_DATA, language: data.language });
        storage
          .wipe()
          .then(() => storage.saveKV('language', data.language))
          .catch(console.warn);
      },
    };
  }, [data, ready, now]);

  return <StoreContext value={store}>{children}</StoreContext>;
}

export function useStore(): Store {
  const store = use(StoreContext);
  if (!store) throw new Error('useStore must be used inside StoreProvider');
  return store;
}
