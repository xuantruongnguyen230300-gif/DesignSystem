import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  NXT_EMPTY,
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
  nxtToDate,
  nxtUnit,
} from './format';
import { NXT_FORMAT_PIPES, provideNxtFormat } from './format-pipes';

/** No-break space (number ↔ unit, before the range dash). */
const S = ' ';

// Local-time dates so the tests do not depend on the machine's time zone.
const AUG_17 = new Date(2023, 7, 17, 14, 5, 9);
const NOW = new Date(2026, 10, 6, 9, 30); // 06/11/2026 09:30

describe('empty values', () => {
  const blanks = [null, undefined, '', '   ', Number.NaN, Number.POSITIVE_INFINITY, 'abc'];

  it('every number formatter shows "—" for blank or invalid input', () => {
    for (const v of blanks) {
      expect(nxtNumber(v)).toBe(NXT_EMPTY);
      expect(nxtMoney(v)).toBe(NXT_EMPTY);
      expect(nxtPercent(v)).toBe(NXT_EMPTY);
      expect(nxtCompact(v)).toBe(NXT_EMPTY);
      expect(nxtUnit(v, 'kg')).toBe(NXT_EMPTY);
      expect(nxtFileSize(v)).toBe(NXT_EMPTY);
      expect(nxtDuration(v)).toBe(NXT_EMPTY);
    }
  });

  it('every date formatter shows "—" for blank or invalid input', () => {
    for (const v of [null, undefined, '', '  ', 'không phải ngày', new Date(Number.NaN), Number.NaN]) {
      expect(nxtDate(v)).toBe(NXT_EMPTY);
      expect(nxtTime(v)).toBe(NXT_EMPTY);
      expect(nxtRelative(v, { now: NOW })).toBe(NXT_EMPTY);
      expect(nxtDateRange(v, v)).toBe(NXT_EMPTY);
      expect(nxtTimeRange(v, v)).toBe(NXT_EMPTY);
    }
  });

  it('the empty text can be overridden (e.g. blank money cells)', () => {
    expect(nxtMoney(null, { empty: '' })).toBe('');
    expect(nxtDate(undefined, { empty: 'Chưa có' })).toBe('Chưa có');
  });

  it('never prints a fake zero, "N/A" or "Invalid Date"', () => {
    expect(nxtNumber(null)).not.toBe('0');
    expect(nxtDate('2026-13-45')).toBe(NXT_EMPTY);
  });
});

describe('nxtText', () => {
  it('trims leading and trailing spaces (pasted from Excel)', () => {
    expect(nxtText('  Kế toán tổng hợp \t')).toBe('Kế toán tổng hợp');
  });

  it('keeps inner spaces and shows "—" for blank text', () => {
    expect(nxtText('Phòng  Nhân sự')).toBe('Phòng  Nhân sự');
    expect(nxtText('   ')).toBe(NXT_EMPTY);
    expect(nxtText(null)).toBe(NXT_EMPTY);
  });
});

describe('nxtNumber', () => {
  it('uses "." for thousands and "," for decimals', () => {
    expect(nxtNumber(10_000_000)).toBe('10.000.000');
    expect(nxtNumber(1_590_000.99)).toBe('1.590.000,99');
  });

  it('accepts numeric strings from an API', () => {
    expect(nxtNumber('15000000')).toBe('15.000.000');
    expect(nxtNumber(' 1.5 ')).toBe('1,5');
  });

  it('negative numbers and fixed decimals for a column', () => {
    expect(nxtNumber(-1234.5)).toBe('-1.234,5');
    expect(nxtNumber(1.5, { fractionDigits: 2 })).toBe('1,50');
    expect(nxtNumber(1.256, { maximumFractionDigits: 1 })).toBe('1,3');
  });

  it('honours another locale', () => {
    expect(nxtNumber(1_590_000.99, { locale: 'en-US' })).toBe('1,590,000.99');
  });
});

describe('nxtMoney', () => {
  it('VND has no decimals and the symbol follows the number', () => {
    expect(nxtMoney(15_000_000)).toBe(`15.000.000${S}₫`);
    expect(nxtMoney(0)).toBe(`0${S}₫`);
  });

  it('code or no symbol (unit in the column header)', () => {
    expect(nxtMoney(15_000_000, { display: 'code' })).toBe(`15.000.000${S}VND`);
    expect(nxtMoney(15_000_000, { display: 'none' })).toBe('15.000.000');
  });

  it('other currencies keep their own decimals', () => {
    expect(nxtMoney(1500.5, { currency: 'USD' })).toBe(`1.500,50${S}US$`);
    expect(nxtMoney(1500.5, { currency: 'USD', display: 'none' })).toBe('1.500,50');
  });

  it('compact amount for a KPI', () => {
    expect(nxtMoney(18_640_000_000, { compact: true })).toBe(`18,6${S}tỷ${S}₫`);
    expect(nxtMoney(214_000_000, { compact: 'short' })).toBe(`214${S}tr${S}₫`);
    expect(nxtMoney(214_000_000, { compact: true, display: 'none' })).toBe(`214${S}triệu`);
  });

  it('negative amounts', () => {
    expect(nxtMoney(-2_500_000)).toBe(`-2.500.000${S}₫`);
  });
});

describe('nxtPercent', () => {
  it('a ratio by default, at most one decimal', () => {
    expect(nxtPercent(0.022)).toBe('2,2%');
    expect(nxtPercent(0.25)).toBe('25%');
    expect(nxtPercent(0.96449)).toBe('96,4%');
  });

  it('values already in percent', () => {
    expect(nxtPercent(96.4, { ratio: false })).toBe('96,4%');
  });

  it('fixed decimals and negative change', () => {
    expect(nxtPercent(0.5, { fractionDigits: 1 })).toBe('50,0%');
    expect(nxtPercent(-0.021)).toBe('-2,1%');
  });
});

describe('nxtCompact', () => {
  it('below 1.000 the full number', () => {
    expect(nxtCompact(999)).toBe('999');
    expect(nxtCompact(12.34)).toBe('12,3');
  });

  it('nghìn, triệu, tỷ, nghìn tỷ in full words by default', () => {
    expect(nxtCompact(1_250)).toBe(`1,3${S}nghìn`);
    expect(nxtCompact(1_200_000)).toBe(`1,2${S}triệu`);
    expect(nxtCompact(3_400_000_000)).toBe(`3,4${S}tỷ`);
    expect(nxtCompact(2_500_000_000_000)).toBe(`2,5${S}nghìn tỷ`);
  });

  it('short labels for tight spaces', () => {
    expect(nxtCompact(1_200_000, { display: 'short' })).toBe(`1,2${S}tr`);
    expect(nxtCompact(3_400_000_000, { display: 'short' })).toBe(`3,4${S}tỷ`);
  });

  it('moves up a step when rounding reaches 1.000', () => {
    expect(nxtCompact(999_960)).toBe(`1${S}triệu`);
    expect(nxtCompact(999_940)).toBe(`999,9${S}nghìn`);
  });

  it('negative values, unit, digits and translated labels', () => {
    expect(nxtCompact(-1_500_000)).toBe(`-1,5${S}triệu`);
    expect(nxtCompact(1_284, { unit: 'người' })).toBe(`1,3${S}nghìn${S}người`);
    expect(nxtCompact(1_234_567, { maximumFractionDigits: 2 })).toBe(`1,23${S}triệu`);
    expect(nxtCompact(1_200_000, { labels: { million: 'triệu đồng' } })).toBe(`1,2${S}triệu đồng`);
  });

  it('other locales use Intl compact notation', () => {
    expect(nxtCompact(1_600_000, { locale: 'en-US', display: 'short' })).toBe('1.6M');
  });
});

describe('nxtUnit, nxtFileSize, nxtDuration', () => {
  it('number and unit with a no-break space', () => {
    expect(nxtUnit(12.5, 'kg')).toBe(`12,5${S}kg`);
    expect(nxtUnit(1200, '₫/kg')).toBe(`1.200${S}₫/kg`);
    expect(nxtUnit(3, '  ')).toBe('3');
  });

  it('file size in base 1024', () => {
    expect(nxtFileSize(0)).toBe(`0${S}B`);
    expect(nxtFileSize(512)).toBe(`512${S}B`);
    expect(nxtFileSize(1536)).toBe(`1,5${S}KB`);
    expect(nxtFileSize(1_258_291)).toBe(`1,2${S}MB`);
    expect(nxtFileSize(5 * 1024 ** 3)).toBe(`5${S}GB`);
    expect(nxtFileSize(-1)).toBe(NXT_EMPTY);
  });

  it('duration in minutes, written in full', () => {
    expect(nxtDuration(510)).toBe(`8${S}giờ 30${S}phút`);
    expect(nxtDuration(480)).toBe(`8${S}giờ`);
    expect(nxtDuration(45)).toBe(`45${S}phút`);
    expect(nxtDuration(0)).toBe(`0${S}phút`);
    expect(nxtDuration(75_000)).toBe(`1.250${S}giờ`);
    expect(nxtDuration(-90)).toBe(`-1${S}giờ 30${S}phút`);
    expect(nxtDuration(90, { hourLabel: 'h', minuteLabel: 'min' })).toBe(`1${S}h 30${S}min`);
  });
});

describe('nxtDate & nxtTime', () => {
  it('dd/MM/yyyy with leading zeros (not the vi "short" 17/8/23)', () => {
    expect(nxtDate(AUG_17)).toBe('17/08/2023');
    expect(nxtDate(new Date(2026, 0, 5))).toBe('05/01/2026');
  });

  it('date and 24-hour time', () => {
    expect(nxtDate(AUG_17, { time: true })).toBe('17/08/2023 14:05');
    expect(nxtDate(AUG_17, { time: true, seconds: true })).toBe('17/08/2023 14:05:09');
    expect(nxtTime(AUG_17)).toBe('14:05');
    expect(nxtTime(new Date(2026, 10, 6, 0, 7))).toBe('00:07');
    expect(nxtTime(AUG_17, { seconds: true })).toBe('14:05:09');
  });

  it('text and weekday styles', () => {
    expect(nxtDate(AUG_17, { style: 'text' })).toBe('17 tháng 8, 2023');
    expect(nxtDate(AUG_17, { style: 'weekday' })).toBe('Thứ Năm, 17/08/2023');
  });

  it('a date-only string is that calendar day (no UTC shift)', () => {
    expect(nxtDate('2026-11-06')).toBe('06/11/2026');
    expect(nxtToDate('2026-11-06')!.getDate()).toBe(6);
  });

  it('epoch ms and ISO strings', () => {
    expect(nxtDate(AUG_17.getTime())).toBe('17/08/2023');
    expect(nxtDate(new Date(Date.UTC(2026, 10, 5, 18, 0)).toISOString(), { timeZone: 'Asia/Ho_Chi_Minh', time: true })).toBe('06/11/2026 01:00');
  });

  it('honours another locale', () => {
    expect(nxtDate(AUG_17, { locale: 'en-US' })).toBe('08/17/2023');
  });
});

describe('ranges', () => {
  const START = new Date(2023, 7, 17);
  const END = new Date(2023, 7, 19);

  it('two dates joined by an en dash', () => {
    expect(nxtDateRange(START, END)).toBe(`17/08/2023${S}– 19/08/2023`);
  });

  it('full dates on both ends, also within one month or year', () => {
    expect(nxtDateRange(new Date(2026, 10, 2), new Date(2026, 11, 31))).toBe(`02/11/2026${S}– 31/12/2026`);
  });

  it('one day → one date; with time → the end time only', () => {
    expect(nxtDateRange(START, new Date(2023, 7, 17, 18))).toBe('17/08/2023');
    expect(nxtDateRange(new Date(2026, 10, 6, 8), new Date(2026, 10, 6, 17, 30), { time: true })).toBe(`06/11/2026 08:00${S}– 17:30`);
  });

  it('open-ended ranges', () => {
    expect(nxtDateRange(START, null)).toBe('Từ 17/08/2023');
    expect(nxtDateRange(undefined, END)).toBe('Đến 19/08/2023');
    expect(nxtDateRange(START, null, { fromLabel: 'Kể từ' })).toBe('Kể từ 17/08/2023');
  });

  it('time range', () => {
    expect(nxtTimeRange(new Date(2026, 10, 6, 8), new Date(2026, 10, 6, 17, 30))).toBe(`08:00${S}– 17:30`);
    expect(nxtTimeRange(new Date(2026, 10, 6, 8), null)).toBe('08:00');
  });
});

describe('nxtRelative', () => {
  const at = (days: number, h: number, m = 0) => new Date(2026, 10, 6 + days, h, m);

  it('under a minute ago: "Vừa xong"', () => {
    expect(nxtRelative(new Date(NOW.getTime() - 30_000), { now: NOW })).toBe('Vừa xong');
    expect(nxtRelative(NOW, { now: NOW, justNow: 'Mới đây' })).toBe('Mới đây');
  });

  it('minutes and hours, past and future', () => {
    expect(nxtRelative(at(0, 9, 27), { now: NOW })).toBe('3 phút trước');
    expect(nxtRelative(at(0, 7, 15), { now: NOW })).toBe('2 giờ trước');
    expect(nxtRelative(at(0, 9, 45), { now: NOW })).toMatch(/^sau 15 phút/);
    expect(nxtRelative(at(0, 13, 30), { now: NOW })).toMatch(/^sau 4 giờ/);
  });

  it('yesterday / tomorrow by calendar day, not by 24 hours', () => {
    expect(nxtRelative(at(-1, 23, 50), { now: NOW })).toBe('Hôm qua');
    expect(nxtRelative(at(1, 8), { now: NOW })).toBe('Ngày mai');
  });

  it('2–6 days as a number (not "Hôm kia")', () => {
    expect(nxtRelative(at(-2, 9), { now: NOW })).toBe('2 ngày trước');
    expect(nxtRelative(at(-6, 9), { now: NOW })).toBe('6 ngày trước');
    expect(nxtRelative(at(3, 9), { now: NOW })).toMatch(/^sau 3 ngày/);
  });

  it('precision "day" for date-only values: today, tomorrow, N days — never hours', () => {
    expect(nxtRelative('2026-11-06', { now: NOW, precision: 'day' })).toBe('Hôm nay');
    expect(nxtRelative('2026-11-07', { now: NOW, precision: 'day' })).toBe('Ngày mai');
    expect(nxtRelative('2026-11-04', { now: NOW, precision: 'day' })).toBe('2 ngày trước');
    expect(nxtRelative('2026-11-09', { now: NOW, precision: 'day' })).toMatch(/^sau 3 ngày/);
    expect(nxtRelative('2026-11-20', { now: NOW, precision: 'day' })).toBe('20/11/2026');
    // Without it, a date at midnight is "9 giờ trước" — wrong for a birthday.
    expect(nxtRelative('2026-11-06', { now: NOW })).toBe('9 giờ trước');
  });

  it('beyond ±6 days: the absolute date', () => {
    expect(nxtRelative(at(-7, 9), { now: NOW })).toBe('30/10/2026');
    expect(nxtRelative(at(-3, 9), { now: NOW, maxDays: 2 })).toBe('03/11/2026');
  });
});

describe('nxtList', () => {
  it('joins with "và" / "hoặc", dropping blank items', () => {
    expect(nxtList(['Hà Nội', ' Đà Nẵng ', '', null, 'TP.HCM'])).toBe('Hà Nội, Đà Nẵng và TP.HCM');
    expect(nxtList(['Nghỉ phép', 'Tăng ca', 'Công tác'], { type: 'disjunction' })).toBe('Nghỉ phép, Tăng ca hoặc Công tác');
    expect(nxtList(['Nghỉ phép'])).toBe('Nghỉ phép');
    expect(nxtList([])).toBe(NXT_EMPTY);
  });
});

@Component({
  imports: [NXT_FORMAT_PIPES],
  template: `
    <p id="number">{{ 1590000.99 | nxtNumber }}</p>
    <p id="money">{{ salary() | nxtMoney }}</p>
    <p id="cell">{{ salary() | nxtMoney: { display: 'none' } }}</p>
    <p id="percent">{{ 0.022 | nxtPercent }}</p>
    <p id="compact">{{ 3400000000 | nxtCompact }}</p>
    <p id="unit">{{ 12.5 | nxtUnit: 'kg' }}</p>
    <p id="size">{{ 1536 | nxtFileSize }}</p>
    <p id="duration">{{ 510 | nxtDuration }}</p>
    <p id="date">{{ day | nxtDate }}</p>
    <p id="datetime">{{ day | nxtDate: { time: true } }}</p>
    <p id="time">{{ day | nxtTime }}</p>
    <p id="range">{{ day | nxtDateRange: end }}</p>
    <p id="trange">{{ day | nxtTimeRange: day }}</p>
    <p id="relative">{{ day | nxtRelative: { now: now } }}</p>
    <p id="list">{{ cities | nxtList }}</p>
    <p id="text">{{ '  Kế toán  ' | nxtText }}</p>
    <p id="empty">{{ null | nxtDate }}</p>
  `,
})
class PipesHost {
  readonly salary = signal<number | null>(18_500_000);
  readonly day = new Date(2026, 10, 4, 14, 5);
  readonly end = new Date(2026, 10, 6);
  readonly now = NOW;
  readonly cities = ['Hà Nội', 'Đà Nẵng', 'TP.HCM'];
}

describe('format pipes', () => {
  function render() {
    const fixture = TestBed.createComponent(PipesHost);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const text = (id: string) => el.querySelector(`#${id}`)!.textContent!.trim();
    return { fixture, text };
  }

  it('every pipe calls its function with the vi-VN defaults', () => {
    const { text } = render();
    expect(text('number')).toBe('1.590.000,99');
    expect(text('money')).toBe(`18.500.000${S}₫`);
    expect(text('cell')).toBe('18.500.000');
    expect(text('percent')).toBe('2,2%');
    expect(text('compact')).toBe(`3,4${S}tỷ`);
    expect(text('unit')).toBe(`12,5${S}kg`);
    expect(text('size')).toBe(`1,5${S}KB`);
    expect(text('duration')).toBe(`8${S}giờ 30${S}phút`);
    expect(text('date')).toBe('04/11/2026');
    expect(text('datetime')).toBe('04/11/2026 14:05');
    expect(text('time')).toBe('14:05');
    expect(text('range')).toBe(`04/11/2026${S}– 06/11/2026`);
    expect(text('trange')).toBe(`14:05${S}– 14:05`);
    expect(text('relative')).toBe('2 ngày trước');
    expect(text('list')).toBe('Hà Nội, Đà Nẵng và TP.HCM');
    expect(text('text')).toBe('Kế toán');
    expect(text('empty')).toBe(NXT_EMPTY);
  });

  it('updates when the value changes, including to empty', async () => {
    const { fixture, text } = render();
    fixture.componentInstance.salary.set(null);
    await fixture.whenStable();
    expect(text('money')).toBe(NXT_EMPTY);
  });

  it('provideNxtFormat changes the defaults of every pipe', () => {
    TestBed.configureTestingModule({ providers: [provideNxtFormat({ locale: 'en-US', empty: 'Chưa có' })] });
    const { text } = render();
    expect(text('number')).toBe('1,590,000.99');
    expect(text('date')).toBe('11/04/2026');
    expect(text('empty')).toBe('Chưa có');
  });
});
