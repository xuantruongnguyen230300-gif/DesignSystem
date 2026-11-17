/**
 * Calendar-date helpers for NXT pickers. A date is an ISO string `yyyy-MM-dd` (a day on the calendar,
 * no time, no time zone), so values survive JSON and compare as plain strings.
 * Arithmetic runs in UTC to stay clear of daylight-saving and local time-zone shifts.
 */

/** A calendar day as `yyyy-MM-dd`. */
export type NxtIsoDate = string;

/** Inclusive range: `end` is part of the range (00:00 of `start` → 23:59:59.999 of `end`). */
export interface NxtDateRange {
  start: NxtIsoDate;
  end: NxtIsoDate;
}

/** Result of parsing typed text: `value` (null = empty input) or `error`. */
export type NxtDateParseResult<T> = { value: T | null; error?: undefined } | { value?: undefined; error: true };

const ISO_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const pad = (n: number, size = 2) => String(n).padStart(size, '0');

/** Number of days in month `m` (1–12) of year `y`. */
export function nxtDaysInMonth(y: number, m: number): number {
  if (m === 2) return isLeap(y) ? 29 : 28;
  return m === 4 || m === 6 || m === 9 || m === 11 ? 30 : 31;
}

function isLeap(y: number): boolean {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

/** Build an ISO date; returns null when the day does not exist (31/02). */
export function nxtIsoDate(y: number, m: number, d: number): NxtIsoDate | null {
  if (!Number.isInteger(y) || !Number.isInteger(m) || !Number.isInteger(d)) return null;
  if (y < 1000 || y > 9999 || m < 1 || m > 12 || d < 1 || d > nxtDaysInMonth(y, m)) return null;
  return `${pad(y, 4)}-${pad(m)}-${pad(d)}`;
}

/** Split an ISO date into numbers; null when it is not a real `yyyy-MM-dd` day. */
export function nxtDateParts(iso: string | null | undefined): { y: number; m: number; d: number } | null {
  const match = iso ? ISO_RE.exec(iso) : null;
  if (!match) return null;
  const [y, m, d] = [Number(match[1]), Number(match[2]), Number(match[3])];
  return nxtIsoDate(y, m, d) ? { y, m, d } : null;
}

function toUtc(iso: NxtIsoDate): Date {
  const p = nxtDateParts(iso);
  if (!p) throw new Error(`[nxt] not an ISO date: ${iso}`);
  const date = new Date(Date.UTC(2000, p.m - 1, p.d));
  date.setUTCFullYear(p.y);
  return date;
}

function fromUtc(date: Date): NxtIsoDate {
  return `${pad(date.getUTCFullYear(), 4)}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

export function nxtAddDays(iso: NxtIsoDate, days: number): NxtIsoDate {
  const date = toUtc(iso);
  date.setUTCDate(date.getUTCDate() + days);
  return fromUtc(date);
}

/** Same day number in another month; a shorter month clamps to its last day (31/01 + 1 month → 28/02). */
export function nxtAddMonths(iso: NxtIsoDate, months: number): NxtIsoDate {
  const p = nxtDateParts(iso)!;
  const index = p.y * 12 + (p.m - 1) + months;
  const y = Math.floor(index / 12);
  const m = (index % 12) + 1;
  return nxtIsoDate(y, m, Math.min(p.d, nxtDaysInMonth(y, m))) ?? iso;
}

/** -1, 0 or 1. ISO strings with 4-digit years sort like dates. */
export function nxtCompareDate(a: NxtIsoDate, b: NxtIsoDate): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/** ISO weekday: 1 = Monday … 7 = Sunday. */
export function nxtIsoWeekday(iso: NxtIsoDate): number {
  return toUtc(iso).getUTCDay() || 7;
}

/** Today on the user's machine (local calendar day). */
export function nxtTodayIso(): NxtIsoDate {
  const now = new Date();
  return `${pad(now.getFullYear(), 4)}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** Keep `iso` within [min, max] (either bound may be null). */
export function nxtClampDate(iso: NxtIsoDate, min: NxtIsoDate | null | undefined, max: NxtIsoDate | null | undefined): NxtIsoDate {
  if (min && iso < min) return min;
  if (max && iso > max) return max;
  return iso;
}

/** `dd/MM/yyyy` with leading zeros: 06/11/2026. Empty string for null. */
export function nxtFormatDate(iso: NxtIsoDate | null | undefined): string {
  const p = nxtDateParts(iso);
  return p ? `${pad(p.d)}/${pad(p.m)}/${pad(p.y, 4)}` : '';
}

/** `dd/MM/yyyy – dd/MM/yyyy` (en dash with spaces). */
export function nxtFormatDateRange(range: NxtDateRange | null | undefined): string {
  return range ? `${nxtFormatDate(range.start)} – ${nxtFormatDate(range.end)}` : '';
}

// One typed date: day–month–year with / - . separators (spaces around them allowed), ddMMyyyy, or ISO yyyy-MM-dd.
// Never month-first; the year must have 4 digits (no century guessing for "85").
const TOKEN_SRC = String.raw`(?<!\d)(?:(\d{4})\s*[-/.]\s*(\d{1,2})\s*[-/.]\s*(\d{1,2})|(\d{1,2})\s*[-/.]\s*(\d{1,2})\s*[-/.]\s*(\d{4})|(\d{2})(\d{2})(\d{4}))(?!\d)`;
const RANGE_GAP = /^\s*(?:[-–—~]|đến|den|to)?\s*$/i;

interface Token {
  iso: NxtIsoDate | null;
  index: number;
  end: number;
}

function tokens(text: string): Token[] {
  return [...text.matchAll(new RegExp(TOKEN_SRC, 'g'))].map((m) => {
    const [, iy, im, id, dd, dm, dy, cd, cm, cy] = m;
    const [y, mo, d] = iy ? [iy, im, id] : dd ? [dy, dm, dd] : [cy, cm, cd];
    return { iso: nxtIsoDate(Number(y), Number(mo), Number(d)), index: m.index, end: m.index + m[0].length };
  });
}

/**
 * Parse one typed date. Accepts `6/11/2026`, `06-11-2026`, `06.11.2026`, `06112026`, `2026-11-06`.
 * Empty text → `{ value: null }`; anything else that is not a real day → `{ error: true }`.
 */
export function nxtParseDate(text: string): NxtDateParseResult<NxtIsoDate> {
  const trimmed = text.trim();
  if (!trimmed) return { value: null };
  const found = tokens(trimmed);
  if (found.length !== 1 || found[0].index !== 0 || found[0].end !== trimmed.length || !found[0].iso) return { error: true };
  return { value: found[0].iso };
}

/**
 * Parse a typed range: two dates separated by `–`, `—`, `-`, `~` or "đến". One date means a one-day range.
 * An end before the start is swapped, never rejected.
 */
export function nxtParseDateRange(text: string): NxtDateParseResult<NxtDateRange> {
  const trimmed = text.trim();
  if (!trimmed) return { value: null };
  const found = tokens(trimmed);
  if (found.length < 1 || found.length > 2 || found.some((t) => !t.iso)) return { error: true };
  const [a, b = a] = found;
  const gap = found.length === 2 ? trimmed.slice(a.end, b.index) : '';
  if (a.index !== 0 || b.end !== trimmed.length || !RANGE_GAP.test(gap)) return { error: true };
  return { value: nxtOrderRange(a.iso!, b.iso!) };
}

/** `{ start, end }` with start ≤ end. */
export function nxtOrderRange(a: NxtIsoDate, b: NxtIsoDate): NxtDateRange {
  return a <= b ? { start: a, end: b } : { start: b, end: a };
}

/** Index (0 = start, 1 = end) of the date under the caret in a typed range. */
export function nxtRangeTokenAt(text: string, caret: number): 0 | 1 {
  const found = tokens(text);
  if (found.length < 2) return 0;
  return caret > found[0].end + (found[1].index - found[0].end) / 2 ? 1 : 0;
}
