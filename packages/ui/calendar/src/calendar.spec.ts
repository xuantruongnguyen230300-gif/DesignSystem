import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NxtCalendar, NxtCalendarLabels, NxtCalendarMode, NxtCalendarSpecialDay } from './calendar';
import {
  NxtDateRange,
  nxtAddMonths,
  nxtFormatDate,
  nxtFormatDateRange,
  nxtIsoWeekday,
  nxtParseDate,
  nxtParseDateRange,
  nxtRangeTokenAt,
} from './date';

describe('date helpers', () => {
  it('parses day-month-year in every accepted form', () => {
    for (const text of ['6/11/2026', '06/11/2026', '06-11-2026', '6.11.2026', '06112026', ' 6 / 11 / 2026 ', '2026-11-06']) {
      expect(nxtParseDate(text)).toEqual({ value: '2026-11-06' });
    }
    expect(nxtParseDate('')).toEqual({ value: null });
    expect(nxtParseDate('   ')).toEqual({ value: null });
  });

  it('never reads month-first and rejects days that do not exist or 2-digit years', () => {
    expect(nxtParseDate('12/25/2026').error).toBe(true); // would be 25 December in en-US
    expect(nxtParseDate('31/02/2026').error).toBe(true);
    expect(nxtParseDate('29/02/2026').error).toBe(true);
    expect(nxtParseDate('29/02/2028')).toEqual({ value: '2028-02-29' });
    expect(nxtParseDate('06/11/26').error).toBe(true);
    expect(nxtParseDate('20261106').error).toBe(true);
    expect(nxtParseDate('06/11/2026 x').error).toBe(true);
    expect(nxtParseDate('hôm nay').error).toBe(true);
  });

  it('formats with leading zeros and an en dash for ranges', () => {
    expect(nxtFormatDate('2026-01-05')).toBe('05/01/2026');
    expect(nxtFormatDate(null)).toBe('');
    expect(nxtFormatDateRange({ start: '2026-12-01', end: '2026-12-05' })).toBe('01/12/2026 – 05/12/2026');
  });

  it('parses ranges with any separator, swaps a reversed range and accepts one day', () => {
    const range = { value: { start: '2026-12-01', end: '2026-12-05' } };
    expect(nxtParseDateRange('01/12/2026 – 05/12/2026')).toEqual(range);
    expect(nxtParseDateRange('1/12/2026 - 5/12/2026')).toEqual(range);
    expect(nxtParseDateRange('01-12-2026-05-12-2026')).toEqual(range);
    expect(nxtParseDateRange('01/12/2026 đến 05/12/2026')).toEqual(range);
    expect(nxtParseDateRange('05/12/2026 - 01/12/2026')).toEqual(range);
    expect(nxtParseDateRange('01122026')).toEqual({ value: { start: '2026-12-01', end: '2026-12-01' } });
    expect(nxtParseDateRange('01/12/2026 x 05/12/2026').error).toBe(true);
    expect(nxtParseDateRange('01/12/2026 - 31/02/2027').error).toBe(true);
  });

  it('adds months keeping the day, clamping to the end of shorter months', () => {
    expect(nxtAddMonths('2026-01-31', 1)).toBe('2026-02-28');
    expect(nxtAddMonths('2028-02-29', 12)).toBe('2029-02-28');
    expect(nxtAddMonths('2026-11-06', -11)).toBe('2025-12-06');
    expect(nxtIsoWeekday('2026-11-06')).toBe(5);
    expect(nxtIsoWeekday('2026-11-08')).toBe(7);
  });

  it('finds which date of a typed range the caret is on', () => {
    const text = '01/12/2026 – 05/12/2026';
    expect(nxtRangeTokenAt(text, 3)).toBe(0);
    expect(nxtRangeTokenAt(text, 18)).toBe(1);
  });
});

@Component({
  imports: [NxtCalendar],
  template: `
    <nxt-calendar
      #cal
      today="2026-11-06"
      [mode]="mode()"
      [(value)]="value"
      [(range)]="range"
      [min]="min()"
      [max]="max()"
      [dateFilter]="filter()"
      [specialDays]="specials()"
      [nonWorkingWeekdays]="offDays()"
      [labels]="labels()"
      [showToday]="true"
      (dateSelected)="picked.push($event)"
      (rangeSelected)="ranges.push($event)"
    />
  `,
})
class Host {
  readonly mode = signal<NxtCalendarMode>('single');
  readonly value = signal<string | null>(null);
  readonly range = signal<NxtDateRange | null>(null);
  readonly min = signal<string | null>(null);
  readonly max = signal<string | null>(null);
  readonly filter = signal<((d: string) => boolean) | null>(null);
  readonly specials = signal<NxtCalendarSpecialDay[]>([]);
  readonly offDays = signal<number[]>([]);
  readonly labels = signal<Partial<NxtCalendarLabels>>({});
  readonly picked: string[] = [];
  readonly ranges: NxtDateRange[] = [];
}

describe('NxtCalendar', () => {
  async function setup(init?: (host: Host) => void) {
    const fixture = TestBed.createComponent(Host);
    init?.(fixture.componentInstance);
    fixture.detectChanges();
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    const cell = (iso: string) => el.querySelector<HTMLElement>(`td[data-date="${iso}"]`)!;
    const active = () => el.querySelector<HTMLElement>('.nxt-calendar__cell[tabindex="0"]')!;
    const title = () => el.querySelector<HTMLElement>('.nxt-calendar__title')!;
    const press = async (key: string, opts: KeyboardEventInit = {}) => {
      active().dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...opts }));
      fixture.detectChanges();
      await fixture.whenStable();
    };
    const click = async (target: HTMLElement) => {
      target.click();
      fixture.detectChanges();
      await fixture.whenStable();
    };
    return { fixture, host: fixture.componentInstance, el, cell, active, title, press, click };
  }

  describe('rendering (vi-VN)', () => {
    it('shows "Tháng 11 năm 2026", weeks from Monday with T2…CN headers and 6 rows', async () => {
      const { el, title } = await setup();
      expect(title().textContent).toContain('Tháng 11 năm 2026');
      const headers = [...el.querySelectorAll('th')];
      expect(headers.map((h) => h.textContent!.trim())).toEqual(['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']);
      expect(headers[0].getAttribute('abbr')).toBe('Thứ Hai');
      expect(el.querySelectorAll('tbody tr').length).toBe(6);
      // 1/11/2026 is a Sunday: the first row starts on Monday 26/10.
      expect(el.querySelector('td')!.getAttribute('data-date')).toBe('2026-10-26');
      expect(el.querySelector('td')!.hasAttribute('data-outside')).toBe(true);
    });

    it('is a named grid; today has aria-current="date" and the only tab stop when nothing is selected', async () => {
      const { el, cell, active, title } = await setup();
      const grid = el.querySelector('table')!;
      expect(grid.getAttribute('role')).toBe('grid');
      expect(document.getElementById(grid.getAttribute('aria-labelledby')!)!.textContent).toBe('Tháng 11 năm 2026');
      expect(cell('2026-11-06').getAttribute('aria-current')).toBe('date');
      expect(active()).toBe(cell('2026-11-06'));
      expect(el.querySelectorAll('.nxt-calendar__cell[tabindex="0"]').length).toBe(1);
      expect(cell('2026-11-06').getAttribute('aria-label')).toBe('Thứ Sáu, 6 tháng 11 năm 2026');
      expect(cell('2026-11-06').getAttribute('aria-selected')).toBe('false');
      expect(title().textContent).toContain('chọn tháng');
    });

    it('starts on the selected day', async () => {
      const { active } = await setup((h) => h.value.set('2026-12-24'));
      expect(active().getAttribute('data-date')).toBe('2026-12-24');
      expect(active().getAttribute('aria-selected')).toBe('true');
    });

    it('takes every string from labels', async () => {
      const { el, title } = await setup((h) =>
        h.labels.set({ weekdaysShort: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'], dayTitle: '{month}/{year}', prevMonth: 'Previous month' }),
      );
      expect(el.querySelector('th')!.textContent!.trim()).toBe('Mo');
      expect(title().textContent).toContain('11/2026');
      expect(el.querySelector('[aria-label="Previous month"]')).not.toBeNull();
    });
  });

  describe('keyboard (APG date grid)', () => {
    it('ArrowRight / ArrowLeft move one day, across the month edge', async () => {
      const { press, active, title } = await setup((h) => h.value.set('2026-11-30'));
      await press('ArrowRight');
      expect(active().getAttribute('data-date')).toBe('2026-12-01');
      expect(title().textContent).toContain('Tháng 12 năm 2026');
      expect(document.activeElement).toBe(active());
      await press('ArrowLeft');
      expect(active().getAttribute('data-date')).toBe('2026-11-30');
    });

    it('ArrowDown / ArrowUp move one week', async () => {
      const { press, active } = await setup();
      await press('ArrowDown');
      expect(active().getAttribute('data-date')).toBe('2026-11-13');
      await press('ArrowUp');
      await press('ArrowUp');
      expect(active().getAttribute('data-date')).toBe('2026-10-30');
    });

    it('Home / End go to Monday / Sunday of the week', async () => {
      const { press, active } = await setup();
      await press('Home');
      expect(active().getAttribute('data-date')).toBe('2026-11-02');
      await press('End');
      expect(active().getAttribute('data-date')).toBe('2026-11-08');
    });

    it('PageUp / PageDown change the month and keep the day, clamping to the last day', async () => {
      const { press, active } = await setup((h) => h.value.set('2026-01-31'));
      await press('PageDown');
      expect(active().getAttribute('data-date')).toBe('2026-02-28');
      await press('PageUp');
      expect(active().getAttribute('data-date')).toBe('2026-01-28');
    });

    it('Shift+PageUp / Shift+PageDown change the year', async () => {
      const { press, active, title } = await setup();
      await press('PageDown', { shiftKey: true });
      expect(active().getAttribute('data-date')).toBe('2027-11-06');
      expect(title().textContent).toContain('Tháng 11 năm 2027');
      await press('PageUp', { shiftKey: true });
      await press('PageUp', { shiftKey: true });
      expect(active().getAttribute('data-date')).toBe('2025-11-06');
    });

    it('Enter and Space select the focused day', async () => {
      const { host, press, active } = await setup();
      await press('ArrowRight');
      await press('Enter');
      expect(host.value()).toBe('2026-11-07');
      expect(host.picked).toEqual(['2026-11-07']);
      expect(active().getAttribute('aria-selected')).toBe('true');
      expect(active().hasAttribute('data-selected')).toBe(true);
      await press('ArrowRight');
      await press(' ');
      expect(host.value()).toBe('2026-11-08');
    });

    it('keeps focus inside min/max and blocks days outside', async () => {
      const { host, press, active, cell, el } = await setup((h) => {
        h.min.set('2026-11-03');
        h.max.set('2026-11-20');
      });
      await press('PageDown');
      expect(active().getAttribute('data-date')).toBe('2026-11-20');
      await press('PageUp', { shiftKey: true });
      expect(active().getAttribute('data-date')).toBe('2026-11-03');
      expect(cell('2026-11-02').getAttribute('aria-disabled')).toBe('true');
      cell('2026-11-02').click();
      expect(host.value()).toBeNull();
      const [prev, next] = [...el.querySelectorAll<HTMLButtonElement>('.nxt-calendar__header .nxt-button')];
      expect(prev.getAttribute('aria-disabled')).toBe('true');
      expect(next.getAttribute('aria-disabled')).toBe('true');
    });

    it('days blocked by dateFilter stay focusable but cannot be selected', async () => {
      const { host, press, active, cell } = await setup((h) => h.filter.set((d) => d !== '2026-11-09'));
      expect(cell('2026-11-09').getAttribute('aria-disabled')).toBe('true');
      await press('ArrowDown');
      await press('ArrowLeft');
      await press('ArrowLeft');
      await press('ArrowLeft');
      await press('ArrowLeft');
      expect(active().getAttribute('data-date')).toBe('2026-11-09');
      await press('Enter');
      expect(host.value()).toBeNull();
    });
  });

  describe('levels: day → month → year', () => {
    it('the title button goes up a level; Enter on a month/year goes back down', async () => {
      const { el, title, press, active, click } = await setup();
      await click(title());
      expect(title().textContent).toContain('Năm 2026');
      const grid = el.querySelector('[role="grid"]')!;
      expect(grid.getAttribute('data-level')).toBe('month');
      expect(grid.getAttribute('aria-labelledby')).toBeTruthy();
      expect(el.querySelectorAll('[role="gridcell"]').length).toBe(12);
      expect(el.querySelectorAll('[role="row"]').length).toBe(4);
      expect(active().getAttribute('aria-label')).toBe('Tháng 11 năm 2026');
      await press('ArrowDown'); // +3 months → Tháng 2 năm 2027
      expect(active().textContent!.trim()).toBe('Tháng 2');
      expect(title().textContent).toContain('Năm 2027');
      await click(title());
      expect(title().textContent).toContain('2020 – 2039');
      expect(el.querySelectorAll('[role="gridcell"]').length).toBe(20);
      await press('End');
      expect(active().textContent!.trim()).toBe('2027');
      await press('ArrowRight'); // 2028
      await press('Enter');
      expect(title().textContent).toContain('Năm 2028');
      await press('Enter');
      expect(title().textContent).toContain('Tháng 2 năm 2028');
      expect(active().getAttribute('data-date')).toBe('2028-02-06');
      expect(document.activeElement).toBe(active());
    });

    it('PageUp / PageDown move a year on the month level and 20 years on the year level', async () => {
      const { title, press, click } = await setup();
      await click(title());
      await press('PageDown');
      expect(title().textContent).toContain('Năm 2027');
      await click(title());
      await press('PageUp');
      expect(title().textContent).toContain('2000 – 2019');
    });
  });

  describe('range mode', () => {
    it('picks start then end, previews on hover, swaps a reversed pick, and is multiselectable', async () => {
      const { host, el, cell, click } = await setup((h) => h.mode.set('range'));
      expect(el.querySelector('table')!.getAttribute('aria-multiselectable')).toBe('true');
      await click(cell('2026-11-14'));
      expect(host.range()).toBeNull();
      expect(cell('2026-11-14').getAttribute('aria-selected')).toBe('true');
      expect(cell('2026-11-14').getAttribute('aria-label')).toContain('ngày bắt đầu');
      cell('2026-11-10').dispatchEvent(new MouseEvent('mouseenter'));
      host.picked.length = 0;
      await click(cell('2026-11-10'));
      expect(host.range()).toEqual({ start: '2026-11-10', end: '2026-11-14' });
      expect(host.ranges).toEqual([{ start: '2026-11-10', end: '2026-11-14' }]);
      for (const d of ['2026-11-10', '2026-11-12', '2026-11-14']) expect(cell(d).getAttribute('aria-selected')).toBe('true');
      expect(cell('2026-11-15').getAttribute('aria-selected')).toBe('false');
      expect(cell('2026-11-12').hasAttribute('data-in-range')).toBe(true);
      expect(cell('2026-11-14').getAttribute('aria-label')).toContain('ngày kết thúc');
    });

    it('tints the preview while the end is being chosen with the keyboard', async () => {
      const { cell, press } = await setup((h) => h.mode.set('range'));
      await press('Enter'); // start 06/11
      await press('ArrowRight');
      await press('ArrowRight');
      expect(cell('2026-11-07').hasAttribute('data-in-range')).toBe(true);
      expect(cell('2026-11-08').hasAttribute('data-range-end')).toBe(true);
    });
  });

  describe('special days and legend', () => {
    it('names special days, marks days off and shows a legend with the month list', async () => {
      const { el, cell, fixture } = await setup((h) => {
        h.specials.set([
          { date: '2026-11-20', kind: 'event', label: 'Hạn chốt công' },
          { date: '2026-12-25', kind: 'holiday', label: 'Ngày lễ công ty' },
        ]);
        h.offDays.set([6, 7]);
      });
      expect(cell('2026-11-20').getAttribute('aria-label')).toBe('Thứ Sáu, 20 tháng 11 năm 2026, Sự kiện: Hạn chốt công');
      expect(cell('2026-11-20').getAttribute('title')).toBe('Sự kiện: Hạn chốt công');
      expect(cell('2026-11-20').querySelector('.nxt-calendar__marker')!.getAttribute('data-kind')).toBe('event');
      expect(cell('2026-11-07').hasAttribute('data-non-working')).toBe(true);
      expect(cell('2026-11-07').getAttribute('aria-label')).toContain('Ngày nghỉ');
      const legend = el.querySelector('.nxt-calendar__legend')!;
      expect(legend.getAttribute('aria-label')).toBe('Chú giải');
      expect(legend.textContent).toContain('Hôm nay');
      expect(legend.textContent).toContain('Ngày nghỉ');
      expect(legend.textContent).toContain('Ngày lễ');
      expect(legend.textContent).toContain('20/11 · Hạn chốt công');
      expect(legend.textContent).not.toContain('Ngày lễ công ty');
      fixture.componentInstance.value.set('2026-12-01');
      fixture.detectChanges();
      await fixture.whenStable();
      expect(cell('2026-12-25').hasAttribute('data-holiday')).toBe(true);
      expect(el.querySelector('.nxt-calendar__legend')!.textContent).toContain('25/12 · Ngày lễ công ty');
    });

    it('has no legend without special days', async () => {
      const { el } = await setup();
      expect(el.querySelector('.nxt-calendar__legend')).toBeNull();
    });
  });

  it('prev / next buttons change the month; "Hôm nay" brings the grid back and focuses today', async () => {
    const { el, title, click, active } = await setup();
    const [prev, next] = [...el.querySelectorAll<HTMLButtonElement>('.nxt-calendar__header .nxt-button')];
    expect(prev.getAttribute('aria-label')).toBe('Tháng trước');
    await click(next);
    await click(next);
    expect(title().textContent).toContain('Tháng 1 năm 2027');
    expect(active().getAttribute('data-date')).toBe('2027-01-06');
    const today = [...el.querySelectorAll<HTMLButtonElement>('.nxt-calendar__footer button')][0];
    expect(today.textContent!.trim()).toBe('Hôm nay');
    await click(today);
    expect(title().textContent).toContain('Tháng 11 năm 2026');
    expect(document.activeElement).toBe(active());
    expect(active().getAttribute('data-date')).toBe('2026-11-06');
  });
});
