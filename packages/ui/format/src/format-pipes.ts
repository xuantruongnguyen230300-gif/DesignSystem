import { InjectionToken, Pipe, PipeTransform, Provider, inject } from '@angular/core';
import {
  NXT_DEFAULT_LOCALE,
  NXT_EMPTY,
  NxtCompactOptions,
  NxtDateInput,
  NxtDateOptions,
  NxtDateRangeOptions,
  NxtDurationOptions,
  NxtFileSizeOptions,
  NxtFormatOptions,
  NxtListOptions,
  NxtMoneyOptions,
  NxtNumberInput,
  NxtNumberOptions,
  NxtPercentOptions,
  NxtRelativeOptions,
  NxtTimeOptions,
  nxtCompact,
  nxtDate,
  nxtDateRange,
  nxtDuration,
  nxtFileSize,
  nxtList,
  nxtMoney,
  nxtNumber,
  nxtPercent,
  nxtRelative,
  nxtText,
  nxtTime,
  nxtTimeRange,
  nxtUnit,
} from './format';

/** App-wide defaults for the format pipes. */
export interface NxtFormatDefaults extends NxtFormatOptions {
  /** IANA time zone for date/time pipes, e.g. `Asia/Ho_Chi_Minh`. Default: the device's. */
  timeZone?: string;
}

export const NXT_FORMAT_DEFAULTS = new InjectionToken<NxtFormatDefaults>('NXT_FORMAT_DEFAULTS', {
  providedIn: 'root',
  factory: () => ({ locale: NXT_DEFAULT_LOCALE, empty: NXT_EMPTY }),
});

/** Change locale, empty text or time zone for every format pipe below this injector (app config or a component's `providers`). */
export function provideNxtFormat(defaults: NxtFormatDefaults): Provider {
  return { provide: NXT_FORMAT_DEFAULTS, useValue: { locale: NXT_DEFAULT_LOCALE, empty: NXT_EMPTY, ...defaults } };
}

abstract class NxtFormatPipe {
  protected readonly defaults = inject(NXT_FORMAT_DEFAULTS);
  protected merge<T extends object>(options: T | undefined): T {
    return { ...this.defaults, ...options } as T;
  }
}

/** `{{ 1590000.99 | nxtNumber }}` → "1.590.000,99". */
@Pipe({ name: 'nxtNumber' })
export class NxtNumberPipe extends NxtFormatPipe implements PipeTransform {
  transform(value: NxtNumberInput, options?: NxtNumberOptions): string {
    return nxtNumber(value, this.merge(options));
  }
}

/** `{{ 15000000 | nxtMoney }}` → "15.000.000 ₫"; `nxtMoney: { display: 'none' }` in table cells. */
@Pipe({ name: 'nxtMoney' })
export class NxtMoneyPipe extends NxtFormatPipe implements PipeTransform {
  transform(value: NxtNumberInput, options?: NxtMoneyOptions): string {
    return nxtMoney(value, this.merge(options));
  }
}

/** `{{ 0.022 | nxtPercent }}` → "2,2%"; `nxtPercent: { ratio: false }` for 2.2. */
@Pipe({ name: 'nxtPercent' })
export class NxtPercentPipe extends NxtFormatPipe implements PipeTransform {
  transform(value: NxtNumberInput, options?: NxtPercentOptions): string {
    return nxtPercent(value, this.merge(options));
  }
}

/** `{{ 1600000 | nxtCompact }}` → "1,6 triệu". */
@Pipe({ name: 'nxtCompact' })
export class NxtCompactPipe extends NxtFormatPipe implements PipeTransform {
  transform(value: NxtNumberInput, options?: NxtCompactOptions): string {
    return nxtCompact(value, this.merge(options));
  }
}

/** `{{ 12.5 | nxtUnit: 'kg' }}` → "12,5 kg". */
@Pipe({ name: 'nxtUnit' })
export class NxtUnitPipe extends NxtFormatPipe implements PipeTransform {
  transform(value: NxtNumberInput, unit: string, options?: NxtNumberOptions): string {
    return nxtUnit(value, unit, this.merge(options));
  }
}

/** `{{ 1258291 | nxtFileSize }}` → "1,2 MB". */
@Pipe({ name: 'nxtFileSize' })
export class NxtFileSizePipe extends NxtFormatPipe implements PipeTransform {
  transform(bytes: NxtNumberInput, options?: NxtFileSizeOptions): string {
    return nxtFileSize(bytes, this.merge(options));
  }
}

/** `{{ 510 | nxtDuration }}` (minutes) → "8 giờ 30 phút". */
@Pipe({ name: 'nxtDuration' })
export class NxtDurationPipe extends NxtFormatPipe implements PipeTransform {
  transform(minutes: NxtNumberInput, options?: NxtDurationOptions): string {
    return nxtDuration(minutes, this.merge(options));
  }
}

/** `{{ date | nxtDate }}` → "17/08/2023"; `nxtDate: { time: true }` → "17/08/2023 14:05". */
@Pipe({ name: 'nxtDate' })
export class NxtDatePipe extends NxtFormatPipe implements PipeTransform {
  transform(value: NxtDateInput, options?: NxtDateOptions): string {
    return nxtDate(value, this.merge(options));
  }
}

/** `{{ date | nxtTime }}` → "14:05". */
@Pipe({ name: 'nxtTime' })
export class NxtTimePipe extends NxtFormatPipe implements PipeTransform {
  transform(value: NxtDateInput, options?: NxtTimeOptions): string {
    return nxtTime(value, this.merge(options));
  }
}

/** `{{ start | nxtDateRange: end }}` → "17/08/2023 – 19/08/2023". */
@Pipe({ name: 'nxtDateRange' })
export class NxtDateRangePipe extends NxtFormatPipe implements PipeTransform {
  transform(start: NxtDateInput, end: NxtDateInput, options?: NxtDateRangeOptions): string {
    return nxtDateRange(start, end, this.merge(options));
  }
}

/** `{{ start | nxtTimeRange: end }}` → "08:00 – 17:30". */
@Pipe({ name: 'nxtTimeRange' })
export class NxtTimeRangePipe extends NxtFormatPipe implements PipeTransform {
  transform(start: NxtDateInput, end: NxtDateInput, options?: NxtTimeOptions): string {
    return nxtTimeRange(start, end, this.merge(options));
  }
}

/**
 * `{{ date | nxtRelative: { now } }}` → "3 phút trước", "Hôm qua". Pure pipe: it recomputes when `value` or `now`
 * changes, so pass a `now` that the app updates (e.g. every minute) instead of relying on the current time.
 */
@Pipe({ name: 'nxtRelative' })
export class NxtRelativePipe extends NxtFormatPipe implements PipeTransform {
  transform(value: NxtDateInput, options?: NxtRelativeOptions): string {
    return nxtRelative(value, this.merge(options));
  }
}

/** `{{ ['Hà Nội', 'Đà Nẵng', 'TP.HCM'] | nxtList }}` → "Hà Nội, Đà Nẵng và TP.HCM". */
@Pipe({ name: 'nxtList' })
export class NxtListPipe extends NxtFormatPipe implements PipeTransform {
  transform(items: readonly (string | null | undefined)[] | null | undefined, options?: NxtListOptions): string {
    return nxtList(items, this.merge(options));
  }
}

/** `{{ '  Kế toán  ' | nxtText }}` → "Kế toán"; blank → "—". */
@Pipe({ name: 'nxtText' })
export class NxtTextPipe extends NxtFormatPipe implements PipeTransform {
  transform(value: string | null | undefined, options?: Pick<NxtFormatOptions, 'empty'>): string {
    return nxtText(value, this.merge(options));
  }
}

/** Every format pipe, for `imports: [NXT_FORMAT_PIPES]`. */
export const NXT_FORMAT_PIPES = [
  NxtNumberPipe,
  NxtMoneyPipe,
  NxtPercentPipe,
  NxtCompactPipe,
  NxtUnitPipe,
  NxtFileSizePipe,
  NxtDurationPipe,
  NxtDatePipe,
  NxtTimePipe,
  NxtDateRangePipe,
  NxtTimeRangePipe,
  NxtRelativePipe,
  NxtListPipe,
  NxtTextPipe,
] as const;
