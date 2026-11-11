import { EMPTY_DATA, type AppData, type LocalStorage } from './types';

/**
 * Browser preview only (for development screenshots). Not encrypted and not
 * a shipping target: the real app uses the SQLCipher storage in storage.ts.
 */

const KEY = 'momo.preview';

function read(): AppData {
  try {
    const raw = globalThis.localStorage?.getItem(KEY);
    return raw ? { ...EMPTY_DATA, ...JSON.parse(raw) } : { ...EMPTY_DATA };
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
  saveProfile: async (profile) => patch({ profile }),
  saveLanguage: async (language) => patch({ language }),
  savePeriods: async (periods) => patch({ periods }),
  saveLog: async (log) => patch({ logs: { ...read().logs, [log.date]: log } }),
  wipe: async () => patch({ ...EMPTY_DATA }),
};
