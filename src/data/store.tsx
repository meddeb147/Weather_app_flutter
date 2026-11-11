import { createContext, use, useEffect, useMemo, useState, type ReactNode } from 'react';

import { predict, sortPeriods, type CycleInputs, type Period, type Prediction } from '@/lib/cycle/engine';
import { addDays, today, type ISODate } from '@/lib/dates';

import { storage } from './storage';
import { EMPTY_DATA, type AppData, type DailyLog, type Language, type Profile } from './types';

interface Store extends AppData {
  ready: boolean;
  today: ISODate;
  cycleInputs: CycleInputs;
  prediction: Prediction | null;
  /** The period that contains `date`, if any. */
  periodOn(date: ISODate): Period | null;
  setProfile(profile: Profile): void;
  setLanguage(language: Language | null): void;
  addPeriod(period: Period): void;
  startPeriod(date: ISODate): void;
  endPeriod(date: ISODate): void;
  removePeriod(start: ISODate): void;
  saveLog(log: DailyLog): void;
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
      periodOn,
      setProfile(profile) {
        setData((d) => ({ ...d, profile }));
        storage.saveProfile(profile).catch(console.warn);
      },
      setLanguage(language) {
        setData((d) => ({ ...d, language }));
        storage.saveLanguage(language).catch(console.warn);
      },
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
      wipe() {
        setData({ ...EMPTY_DATA, language: data.language });
        storage
          .wipe()
          .then(() => storage.saveLanguage(data.language))
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
