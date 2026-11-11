import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import * as SQLite from 'expo-sqlite';

import type { Period } from '@/lib/cycle/engine';

import { EMPTY_DATA, type AppData, type DailyLog, type Language, type LocalStorage, type Profile } from './types';

/**
 * On-device storage: a SQLCipher-encrypted SQLite file. The key is generated
 * on first launch and kept in the iOS Keychain through expo-secure-store.
 */

const KEY_NAME = 'momo.db.key';
let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function databaseKey(): Promise<string> {
  const existing = await SecureStore.getItemAsync(KEY_NAME);
  if (existing) return existing;
  const bytes = await Crypto.getRandomBytesAsync(32);
  const key = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  await SecureStore.setItemAsync(KEY_NAME, key, { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY });
  return key;
}

async function open(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync('momo.db');
  // The key is hex we generated ourselves, so it is safe to inline in the PRAGMA.
  await db.execAsync(`PRAGMA key = "x'${await databaseKey()}'";`);
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS kv (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS periods (start TEXT PRIMARY KEY NOT NULL, end TEXT);
    CREATE TABLE IF NOT EXISTS daily_logs (date TEXT PRIMARY KEY NOT NULL, mood TEXT, symptoms TEXT NOT NULL, flow INTEGER NOT NULL);
  `);
  return db;
}

function db(): Promise<SQLite.SQLiteDatabase> {
  dbPromise ??= open();
  return dbPromise;
}

async function setKV(key: string, value: unknown): Promise<void> {
  const d = await db();
  if (value === null) await d.runAsync('DELETE FROM kv WHERE key = ?', key);
  else await d.runAsync('INSERT OR REPLACE INTO kv (key, value) VALUES (?, ?)', key, JSON.stringify(value));
}

export const storage: LocalStorage = {
  async load(): Promise<AppData> {
    const d = await db();
    const kv = Object.fromEntries(
      (await d.getAllAsync<{ key: string; value: string }>('SELECT key, value FROM kv')).map((r) => [r.key, JSON.parse(r.value)])
    );
    const periods = await d.getAllAsync<Period>('SELECT start, end FROM periods ORDER BY start');
    const rows = await d.getAllAsync<{ date: string; mood: string | null; symptoms: string; flow: number }>('SELECT * FROM daily_logs');
    const logs: AppData['logs'] = {};
    for (const r of rows) logs[r.date] = { date: r.date, mood: r.mood, symptoms: JSON.parse(r.symptoms), flow: r.flow } as DailyLog;
    return { ...EMPTY_DATA, profile: kv.profile ?? null, language: kv.language ?? null, periods, logs };
  },
  saveProfile: (profile: Profile | null) => setKV('profile', profile),
  saveLanguage: (language: Language | null) => setKV('language', language),
  async savePeriods(periods: Period[]) {
    const d = await db();
    await d.withTransactionAsync(async () => {
      await d.runAsync('DELETE FROM periods');
      for (const p of periods) await d.runAsync('INSERT INTO periods (start, end) VALUES (?, ?)', p.start, p.end);
    });
  },
  async saveLog(log: DailyLog) {
    const d = await db();
    await d.runAsync(
      'INSERT OR REPLACE INTO daily_logs (date, mood, symptoms, flow) VALUES (?, ?, ?, ?)',
      log.date,
      log.mood,
      JSON.stringify(log.symptoms),
      log.flow
    );
  },
  async wipe() {
    const d = await db();
    await d.execAsync('DELETE FROM kv; DELETE FROM periods; DELETE FROM daily_logs;');
  },
};
