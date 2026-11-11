/** Calendar dates as ISO strings (YYYY-MM-DD), handled in UTC so time zones never shift a day. */
export type ISODate = string;

const DAY_MS = 86_400_000;

export function toISO(d: Date): ISODate {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function today(): ISODate {
  return toISO(new Date());
}

function toUTC(iso: ISODate): number {
  const [y, m, d] = iso.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

export function addDays(iso: ISODate, days: number): ISODate {
  return new Date(toUTC(iso) + days * DAY_MS).toISOString().slice(0, 10);
}

/** Whole days from `a` to `b` (positive when `b` is later). */
export function diffDays(a: ISODate, b: ISODate): number {
  return Math.round((toUTC(b) - toUTC(a)) / DAY_MS);
}

export function isBetween(d: ISODate, start: ISODate, end: ISODate): boolean {
  return d >= start && d <= end;
}

/** Local Date at noon, safe to pass to Intl formatters. */
export function toDate(iso: ISODate): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d, 12);
}

export function formatDate(iso: ISODate, locale: string, opts?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(locale, opts ?? { day: 'numeric', month: 'short' }).format(toDate(iso));
}
