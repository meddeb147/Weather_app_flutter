import { EMPTY_DATA, type AppData, type LocalStorage } from './types';

/**
 * Browser preview only (for development screenshots). Not encrypted and not
 * a shipping target: the real app uses the SQLCipher storage in storage.ts.
 */

const KEY = 'momo.preview';

function read(): AppData {
  try {
    const raw = globalThis.localStorage?.getItem(KEY);
    if (!raw) return { ...EMPTY_DATA };
    const saved = JSON.parse(raw) as Partial<AppData>;
    return { ...EMPTY_DATA, ...saved, settings: { ...EMPTY_DATA.settings, ...saved.settings } };
  } catch {
    return { ...EMPTY_DATA };
  }
}

function patch(change: Partial<AppData>): void {
  try {
    globalThis.localStorage?.setItem(KEY, JSON.stringify({ ...read(), ...change }));
  } catch {
    // Preview keeps working in memory for this page load.
  }
}

export const storage: LocalStorage = {
  load: async () => read(),
  saveKV: async (key, value) => patch({ [key]: value }),
  savePeriods: async (periods) => patch({ periods }),
  saveLog: async (log) => patch({ logs: { ...read().logs, [log.date]: log } }),
  wipe: async () => patch({ ...EMPTY_DATA }),
};
