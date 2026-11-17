/*
 * Display formatting for vi-VN (and other locales through `locale`). Pure functions, no Angular.
 * Rules live in docs: foundations/formatting. Every function returns `empty` ("—") for null, undefined,
 * blank strings, NaN and invalid dates — never "N/A", "null" or "Invalid Date".
 */

export const NXT_DEFAULT_LOCALE = 'vi-VN';
/** Shown for a missing value (same symbol as table and descriptions). */
export const NXT_EMPTY = '—';

/** No-break space: keeps a number with its unit, and a range dash with its first value. */
const NBSP = ' ';
const RANGE_SEP = `${NBSP}– `;

export type NxtNumberInput = number | string | null | undefined;
export type NxtDateInput = Date | number | string | null | undefined;

export interface NxtFormatOptions {
  /** `Intl` locale. Default `vi-VN`. */
  locale?: string;
  /** Text for a missing value. Default "—". */
  empty?: string;
}

export interface NxtNumberOptions extends NxtFormatOptions {
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  /** Fixed number of decimals (min = max) — keep one value for a whole column or chart. */
  fractionDigits?: number;
}

export type NxtCompactDisplay = 'long' | 'short';

export interface NxtCompactLabels {
  thousand?: string;
  million?: string;
  billion?: string;
  trillion?: string;
}

export interface NxtCompactOptions extends NxtFormatOptions {
  /** `long`: nghìn / triệu / tỷ (default). `short`: nghìn / tr / tỷ — tight spaces only. */
  display?: NxtCompactDisplay;
  /** Default 1: "1,2 triệu". */
  maximumFractionDigits?: number;
  /** Appended after the compact number: "1,2 nghìn người". */
  unit?: string;
  /** Override the Vietnamese scale words (i18n). Non-vi locales use `Intl` compact notation instead. */
  labels?: NxtCompactLabels;
}

export type NxtMoneyDisplay = 'symbol' | 'code' | 'none';

export interface NxtMoneyOptions extends NxtNumberOptions {
  /** ISO 4217 code. Default `VND` (0 decimals). */
  currency?: string;
  /** `symbol` "15.000.000 ₫" (default), `code` "15.000.000 VND", `none` "15.000.000" (unit in the column header). */
  display?: NxtMoneyDisplay;
  /** Compact amount for KPIs: "1,2 tỷ ₫". `true` = `long`. */
  compact?: boolean | NxtCompactDisplay;
}

export interface NxtPercentOptions extends NxtNumberOptions {
  /** `true` (default): the value is a ratio, 0.25 → "25%". `false`: the value is already a percentage, 25 → "25%". */
  ratio?: boolean;
}

export type NxtDateStyle = 'numeric' | 'text' | 'weekday';

export interface NxtTimeOptions extends NxtFormatOptions {
  /** Add seconds: "14:05:09". */
  seconds?: boolean;
  /** IANA time zone, e.g. `Asia/Ho_Chi_Minh`. Default: the device's. */
  timeZone?: string;
}

export interface NxtDateOptions extends NxtTimeOptions {
  /** `numeric` "17/08/2023" (default) · `text` "17 tháng 8, 2023" · `weekday` "Thứ Năm, 17/08/2023". */
  style?: NxtDateStyle;
  /** Add the time after the date: "17/08/2023 14:05". */
  time?: boolean;
}

export interface NxtDateRangeOptions extends NxtDateOptions {
  /** Only a start: "Từ 17/08/2023". */
  fromLabel?: string;
  /** Only an end: "Đến 19/08/2023". */
  toLabel?: string;
}

export interface NxtRelativeOptions extends NxtFormatOptions {
  /** Reference moment. Default `new Date()`; pass a fixed one in tests and examples. */
  now?: NxtDateInput;
  /** Beyond ± this many calendar days the absolute date is returned. Default 6. */
  maxDays?: number;
  /** Less than a minute ago. Default "Vừa xong". */
  justNow?: string;
  /**
   * `time` (default): minutes and hours for today. `day`: calendar days only — "Hôm nay", "Ngày mai", "sau 3 ngày nữa" —
   * for date-only values (birthday, due date) that have no meaningful time.
   */
  precision?: 'time' | 'day';
}

export interface NxtDurationOptions extends NxtFormatOptions {
  hourLabel?: string;
  minuteLabel?: string;
}

export interface NxtFileSizeOptions extends NxtFormatOptions {
  maximumFractionDigits?: number;
}

export interface NxtListOptions extends NxtFormatOptions {
  /** `conjunction` "A, B và C" (default) · `disjunction` "A, B hoặc C". */
  type?: 'conjunction' | 'disjunction';
}

// ---------- internals ----------

const cache = new Map<string, unknown>();
function cached<T>(kind: string, locale: string, options: object, create: () => T): T {
  const key = `${kind}|${locale}|${JSON.stringify(options)}`;
  let f = cache.get(key) as T | undefined;
  if (!f) {
    f = create();
    cache.set(key, f);
  }
  return f;
}

const numberFormat = (locale: string, options: Intl.NumberFormatOptions) =>
  cached('n', locale, options, () => new Intl.NumberFormat(locale, options));
const dateFormat = (locale: string, options: Intl.DateTimeFormatOptions) =>
  cached('d', locale, options, () => new Intl.DateTimeFormat(locale, options));
const relativeFormat = (locale: string, numeric: 'auto' | 'always') =>
  cached('r', locale, { numeric }, () => new Intl.RelativeTimeFormat(locale, { numeric }));

const loc = (o: NxtFormatOptions | undefined) => o?.locale ?? NXT_DEFAULT_LOCALE;
const emp = (o: NxtFormatOptions | undefined) => o?.empty ?? NXT_EMPTY;
const isVi = (locale: string) => locale.toLowerCase().startsWith('vi');

/** A finite number, or `null` for anything that should display as empty. */
export function nxtToNumber(value: NxtNumberInput): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string') {
    const t = value.trim();
    if (!t) return null;
    const n = Number(t);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;

/** A valid `Date`, or `null`. A date-only string `yyyy-MM-dd` is a local calendar date (no UTC shift). */
export function nxtToDate(value: NxtDateInput): Date | null {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === 'number') return Number.isFinite(value) ? new Date(value) : null;
  if (typeof value === 'string') {
    const t = value.trim();
    if (!t) return null;
    const m = DATE_ONLY.exec(t);
    if (m) {
      const [y, mo, day] = [Number(m[1]), Number(m[2]) - 1, Number(m[3])];
      const d = new Date(y, mo, day);
      // `Date` rolls 2026-13-45 over into 2027; a day that does not exist is invalid, not a different day.
      return d.getFullYear() === y && d.getMonth() === mo && d.getDate() === day ? d : null;
    }
    const d = new Date(t);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

function fractionOptions(o: NxtNumberOptions | undefined, fallbackMax?: number): Intl.NumberFormatOptions {
  if (o?.fractionDigits !== undefined) return { minimumFractionDigits: o.fractionDigits, maximumFractionDigits: o.fractionDigits };
  const max = o?.maximumFractionDigits ?? fallbackMax;
  const min = o?.minimumFractionDigits;
  return {
    ...(min !== undefined ? { minimumFractionDigits: min } : {}),
    ...(max !== undefined ? { maximumFractionDigits: Math.max(max, min ?? 0) } : {}),
  };
}

// ---------- text & list ----------

/** Trimmed text; blank → "—". */
export function nxtText(value: string | null | undefined, options?: Pick<NxtFormatOptions, 'empty'>): string {
  const t = typeof value === 'string' ? value.trim() : '';
  return t || emp(options);
}

/** "Hà Nội, Đà Nẵng và TP.HCM" — never join with hard-coded commas. Blank items are dropped. */
export function nxtList(items: readonly (string | null | undefined)[] | null | undefined, options?: NxtListOptions): string {
  const clean = (items ?? []).map((i) => (typeof i === 'string' ? i.trim() : '')).filter(Boolean);
  if (!clean.length) return emp(options);
  const type = options?.type ?? 'conjunction';
  return cached('l', loc(options), { type }, () => new Intl.ListFormat(loc(options), { type })).format(clean);
}

// ---------- numbers ----------

/** "1.590.000,99" — thousands with ".", decimals with ",". */
export function nxtNumber(value: NxtNumberInput, options?: NxtNumberOptions): string {
  const n = nxtToNumber(value);
  if (n === null) return emp(options);
  return numberFormat(loc(options), fractionOptions(options)).format(n);
}

/** "2,2%". The value is a ratio by default (0.022); `ratio: false` for values already in percent (2.2). */
export function nxtPercent(value: NxtNumberInput, options?: NxtPercentOptions): string {
  const n = nxtToNumber(value);
  if (n === null) return emp(options);
  const ratio = options?.ratio === false ? n / 100 : n;
  return numberFormat(loc(options), { style: 'percent', ...fractionOptions(options, 1) }).format(ratio);
}

const VI_SCALE: { size: number; key: keyof NxtCompactLabels; long: string; short: string }[] = [
  { size: 1e12, key: 'trillion', long: 'nghìn tỷ', short: 'nghìn tỷ' },
  { size: 1e9, key: 'billion', long: 'tỷ', short: 'tỷ' },
  { size: 1e6, key: 'million', long: 'triệu', short: 'tr' },
  { size: 1e3, key: 'thousand', long: 'nghìn', short: 'nghìn' },
];

/** Compact number for KPIs and chart axes: "1,6 triệu", "3,4 tỷ" (`short`: "1,6 tr"). Below 1.000 the full number. */
export function nxtCompact(value: NxtNumberInput, options?: NxtCompactOptions): string {
  const n = nxtToNumber(value);
  if (n === null) return emp(options);
  const locale = loc(options);
  const digits = options?.maximumFractionDigits ?? 1;
  const unit = options?.unit ? `${NBSP}${options.unit}` : '';
  const display = options?.display ?? 'long';
  if (!isVi(locale)) {
    return numberFormat(locale, { notation: 'compact', compactDisplay: display, maximumFractionDigits: digits }).format(n) + unit;
  }
  const abs = Math.abs(n);
  const plain = numberFormat(locale, { maximumFractionDigits: digits });
  let i = VI_SCALE.findIndex((s) => abs >= s.size);
  if (i === -1) return plain.format(n) + unit;
  // 999.960 → "1 triệu", not "1.000 nghìn": move up a step when rounding reaches the next one.
  if (i > 0 && Number((abs / VI_SCALE[i].size).toFixed(digits)) >= 1000) i--;
  const step = VI_SCALE[i];
  const label = options?.labels?.[step.key] ?? step[display];
  return `${plain.format(Math.sign(n) * (abs / step.size))}${NBSP}${label}${unit}`;
}

/** Currency symbol or code as `Intl` writes it for this locale ("₫", "US$", "VND"). */
function currencyLabel(locale: string, currency: string, display: 'symbol' | 'code'): string {
  const parts = numberFormat(locale, { style: 'currency', currency, currencyDisplay: display }).formatToParts(0);
  return parts.find((p) => p.type === 'currency')?.value ?? currency;
}

/** "15.000.000 ₫" — VND has no decimals; the symbol follows the number. `display: 'none'` for table cells. */
export function nxtMoney(value: NxtNumberInput, options?: NxtMoneyOptions): string {
  const n = nxtToNumber(value);
  if (n === null) return emp(options);
  const locale = loc(options);
  const currency = options?.currency ?? 'VND';
  const display = options?.display ?? 'symbol';
  if (options?.compact) {
    const compact = nxtCompact(n, { locale, display: options.compact === true ? 'long' : options.compact });
    return display === 'none' ? compact : `${compact}${NBSP}${currencyLabel(locale, currency, display)}`;
  }
  const fraction = fractionOptions(options);
  if (display === 'none') {
    // Same digits as the currency style would use (VND 0, USD 2), so a cell matches the amount shown elsewhere.
    const r = numberFormat(locale, { style: 'currency', currency, ...fraction }).resolvedOptions();
    return numberFormat(locale, { minimumFractionDigits: r.minimumFractionDigits, maximumFractionDigits: r.maximumFractionDigits }).format(n);
  }
  return numberFormat(locale, { style: 'currency', currency, currencyDisplay: display, ...fraction }).format(n);
}

/** Number + unit with a no-break space: "12,5 kg", "3 ngày", "1.200 ₫/kg". The unit comes translated (i18n), not from `Intl`. */
export function nxtUnit(value: NxtNumberInput, unit: string, options?: NxtNumberOptions): string {
  const n = nxtToNumber(value);
  if (n === null) return emp(options);
  const u = unit.trim();
  return u ? `${nxtNumber(n, options)}${NBSP}${u}` : nxtNumber(n, options);
}

const FILE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB'];

/** "1,2 MB" (base 1024, as Windows Explorer shows it). */
export function nxtFileSize(bytes: NxtNumberInput, options?: NxtFileSizeOptions): string {
  const n = nxtToNumber(bytes);
  if (n === null || n < 0) return emp(options);
  const digits = options?.maximumFractionDigits ?? 1;
  let i = 0;
  let size = n;
  while (i < FILE_UNITS.length - 1 && Number(size.toFixed(digits)) >= 1024) {
    size /= 1024;
    i++;
  }
  return `${numberFormat(loc(options), { maximumFractionDigits: i === 0 ? 0 : digits }).format(size)}${NBSP}${FILE_UNITS[i]}`;
}

/** Duration in **minutes**, written in full: "8 giờ 30 phút", "45 phút". Never "8h30" or "PT8H30M". */
export function nxtDuration(minutes: NxtNumberInput, options?: NxtDurationOptions): string {
  const n = nxtToNumber(minutes);
  if (n === null) return emp(options);
  const total = Math.round(Math.abs(n));
  const h = Math.floor(total / 60);
  const m = total % 60;
  const hourLabel = options?.hourLabel ?? 'giờ';
  const minuteLabel = options?.minuteLabel ?? 'phút';
  const parts: string[] = [];
  if (h) parts.push(`${nxtNumber(h, options)}${NBSP}${hourLabel}`);
  if (m || !h) parts.push(`${nxtNumber(m, options)}${NBSP}${minuteLabel}`);
  return (n < 0 && total ? '-' : '') + parts.join(' ');
}

// ---------- dates ----------

function timePart(d: Date, o: NxtTimeOptions | undefined): string {
  return dateFormat(loc(o), {
    hour: '2-digit',
    minute: '2-digit',
    ...(o?.seconds ? { second: '2-digit' } : {}),
    hourCycle: 'h23',
    ...(o?.timeZone ? { timeZone: o.timeZone } : {}),
  }).format(d);
}

function datePart(d: Date, o: NxtDateOptions | undefined): string {
  const locale = loc(o);
  const tz = o?.timeZone ? { timeZone: o.timeZone } : {};
  const numeric = () => dateFormat(locale, { day: '2-digit', month: '2-digit', year: 'numeric', ...tz }).format(d);
  switch (o?.style) {
    case 'text':
      return dateFormat(locale, { day: 'numeric', month: 'long', year: 'numeric', ...tz }).format(d);
    case 'weekday':
      return `${dateFormat(locale, { weekday: 'long', ...tz }).format(d)}, ${numeric()}`;
    default:
      return numeric();
  }
}

/** "17/08/2023" (default) — with `time`: "17/08/2023 14:05". Never `dateStyle: 'short'` (vi gives "17/8/23"). */
export function nxtDate(value: NxtDateInput, options?: NxtDateOptions): string {
  const d = nxtToDate(value);
  if (!d) return emp(options);
  const date = datePart(d, options);
  return options?.time ? `${date} ${timePart(d, options)}` : date;
}

/** "14:05" — always 24-hour. */
export function nxtTime(value: NxtDateInput, options?: NxtTimeOptions): string {
  const d = nxtToDate(value);
  return d ? timePart(d, options) : emp(options);
}

/**
 * "17/08/2023 – 19/08/2023" (en dash). One day → one date; with `time` on one day: "06/11/2026 08:00 – 17:30".
 * Only a start / end: "Từ 17/08/2023" / "Đến 19/08/2023".
 */
export function nxtDateRange(start: NxtDateInput, end: NxtDateInput, options?: NxtDateRangeOptions): string {
  const s = nxtToDate(start);
  const e = nxtToDate(end);
  if (!s && !e) return emp(options);
  if (s && !e) return `${options?.fromLabel ?? 'Từ'} ${nxtDate(s, options)}`;
  if (!s && e) return `${options?.toLabel ?? 'Đến'} ${nxtDate(e, options)}`;
  const from = nxtDate(s, options);
  // Same calendar day in the zone being displayed (compare the formatted day, so `timeZone` is honoured).
  const sameDay = datePart(s!, { ...options, style: 'numeric' }) === datePart(e!, { ...options, style: 'numeric' });
  if (sameDay) return options?.time ? `${from}${RANGE_SEP}${timePart(e!, options)}` : from;
  return `${from}${RANGE_SEP}${nxtDate(e, options)}`;
}

/** "08:00 – 17:30". */
export function nxtTimeRange(start: NxtDateInput, end: NxtDateInput, options?: NxtTimeOptions): string {
  const s = nxtToDate(start);
  const e = nxtToDate(end);
  if (!s || !e) return s ? nxtTime(s, options) : e ? nxtTime(e, options) : emp(options);
  return `${timePart(s, options)}${RANGE_SEP}${timePart(e, options)}`;
}

const MINUTE = 60_000;
const HOUR = 3_600_000;
const DAY = 86_400_000;
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

/**
 * Relative time for recent events: "Vừa xong", "3 phút trước", "2 giờ trước", "Hôm qua", "3 ngày trước", "sau 2 ngày nữa".
 * Beyond ±`maxDays` (6) calendar days: the absolute date "dd/MM/yyyy". Show the absolute date in a `title` too.
 */
export function nxtRelative(value: NxtDateInput, options?: NxtRelativeOptions): string {
  const d = nxtToDate(value);
  if (!d) return emp(options);
  const now = nxtToDate(options?.now) ?? new Date();
  const locale = loc(options);
  const always = relativeFormat(locale, 'always');
  const days = Math.round((startOfDay(d) - startOfDay(now)) / DAY);
  if (options?.precision !== 'day') {
    const diff = d.getTime() - now.getTime();
    const abs = Math.abs(diff);
    if (abs < MINUTE) return diff <= 0 ? (options?.justNow ?? 'Vừa xong') : always.format(1, 'minute');
    if (abs < HOUR) return always.format(Math.trunc(diff / MINUTE), 'minute');
    if (days === 0) return always.format(Math.trunc(diff / HOUR), 'hour');
  }
  // `auto` only for 0 and ±1 ("Hôm nay", "Hôm qua", "Ngày mai"); at ±2 ICU says "Hôm kia"/"Ngày kia",
  // which not every reader knows.
  if (Math.abs(days) <= 1) return relativeFormat(locale, 'auto').format(days, 'day');
  if (Math.abs(days) <= (options?.maxDays ?? 6)) return always.format(days, 'day');
  return nxtDate(d, { locale, empty: options?.empty });
}
