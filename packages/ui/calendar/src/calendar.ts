import { LiveAnnouncer } from '@angular/cdk/a11y';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  InjectionToken,
  Injector,
  ViewEncapsulation,
  afterNextRender,
  booleanAttribute,
  computed,
  inject,
  input,
  linkedSignal,
  model,
  output,
  signal,
} from '@angular/core';
import { NxtButton } from '@nxt/ui/button';
import { NxtIcon } from '@nxt/ui/icon';
import {
  NxtDateRange,
  NxtIsoDate,
  nxtAddDays,
  nxtAddMonths,
  nxtClampDate,
  nxtDateParts,
  nxtDaysInMonth,
  nxtIsoDate,
  nxtIsoWeekday,
  nxtOrderRange,
  nxtTodayIso,
} from './date';

/** `single` picks one day; `range` picks a start, then an end (end included). */
export type NxtCalendarMode = 'single' | 'range';
/** What the grid shows: days of a month, months of a year, or a page of 20 years. */
export type NxtCalendarLevel = 'day' | 'month' | 'year';
/** Kinds of special day — each has its own marker shape, not only a color. */
export type NxtCalendarSpecialKind = 'holiday' | 'non-working' | 'event';

/** A day the product marks on the calendar (public holiday, compensatory day off, payroll cut-off…). */
export interface NxtCalendarSpecialDay {
  /** `yyyy-MM-dd`. */
  date: NxtIsoDate;
  kind: NxtCalendarSpecialKind;
  /** Short noun for the legend, tooltip and accessible name: "Quốc khánh". */
  label: string;
}

/** Every string the calendar shows or announces. `{name}` placeholders are filled in at runtime. */
export interface NxtCalendarLabels {
  /** Monday first: T2 … CN. */
  weekdaysShort: readonly string[];
  /** Monday first, read by screen readers in the column header and cell name. */
  weekdaysLong: readonly string[];
  /** Month cells: "Tháng 1" … "Tháng 12". */
  months: readonly string[];
  /** Day-level title: `{month}`, `{year}`. */
  dayTitle: string;
  /** Month-level title: `{year}`. */
  monthTitle: string;
  /** Year-level title: `{from}`, `{to}`. */
  yearTitle: string;
  /** Accessible name of a day cell: `{weekday}`, `{day}`, `{month}`, `{year}`. */
  dayLabel: string;
  /** Accessible name of a month cell: `{month}`, `{year}`. */
  monthLabel: string;
  prevMonth: string;
  nextMonth: string;
  prevYear: string;
  nextYear: string;
  prevYears: string;
  nextYears: string;
  /** Appended to the title button name: what pressing it does. */
  toMonthLevel: string;
  toYearLevel: string;
  toDayLevel: string;
  today: string;
  rangeStart: string;
  rangeEnd: string;
  legend: string;
  holiday: string;
  nonWorking: string;
  event: string;
}

export const NXT_CALENDAR_LABELS_VI: NxtCalendarLabels = {
  weekdaysShort: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
  weekdaysLong: ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'],
  months: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'],
  dayTitle: 'Tháng {month} năm {year}',
  monthTitle: 'Năm {year}',
  yearTitle: '{from} – {to}',
  dayLabel: '{weekday}, {day} tháng {month} năm {year}',
  monthLabel: 'Tháng {month} năm {year}',
  prevMonth: 'Tháng trước',
  nextMonth: 'Tháng sau',
  prevYear: 'Năm trước',
  nextYear: 'Năm sau',
  prevYears: '20 năm trước',
  nextYears: '20 năm sau',
  toMonthLevel: 'chọn tháng',
  toYearLevel: 'chọn năm',
  toDayLevel: 'về lịch ngày',
  today: 'Hôm nay',
  rangeStart: 'ngày bắt đầu',
  rangeEnd: 'ngày kết thúc',
  legend: 'Chú giải',
  holiday: 'Ngày lễ',
  nonWorking: 'Ngày nghỉ',
  event: 'Sự kiện',
};

/** App-wide strings (e.g. from ngx-translate). The `labels` input still overrides per instance. */
export const NXT_CALENDAR_LABELS = new InjectionToken<Partial<NxtCalendarLabels>>('NXT_CALENDAR_LABELS', {
  providedIn: 'root',
  factory: () => ({}),
});

/** Fill `{name}` placeholders: nxtFillLabel('Tháng {month}', { month: 11 }) → "Tháng 11". */
export function nxtFillLabel(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}

interface DayCell {
  iso: NxtIsoDate;
  day: number;
  outside: boolean;
  disabled: boolean;
  /** aria-selected */
  selected: boolean;
  /** Filled shape: the chosen day, or either end of the (preview) range. */
  filled: boolean;
  inRange: boolean;
  rangeStart: boolean;
  rangeEnd: boolean;
  today: boolean;
  nonWorking: boolean;
  holiday: boolean;
  marker: 'holiday' | 'event' | null;
  label: string;
  tip: string | null;
}

interface PeriodCell {
  key: string;
  /** Date the focus lands on when this month/year is opened. */
  target: NxtIsoDate;
  text: string;
  label: string;
  active: boolean;
  selected: boolean;
  current: boolean;
  disabled: boolean;
}

const YEARS_PER_PAGE = 20;
const YEAR_COLS = 4;
const MONTH_COLS = 3;
const KINDS: readonly NxtCalendarSpecialKind[] = ['non-working', 'holiday', 'event'];

const valid = (iso: string | null | undefined): NxtIsoDate | null => (nxtDateParts(iso) ? iso! : null);
const pageStart = (year: number) => Math.floor(year / YEARS_PER_PAGE) * YEARS_PER_PAGE;
const rows = <T>(cells: T[], cols: number): T[][] => Array.from({ length: Math.ceil(cells.length / cols) }, (_, i) => cells.slice(i * cols, i * cols + cols));
const twoDigits = (n: number) => String(n).padStart(2, '0');

let nextId = 0;

/**
 * Month grid for picking a day or a range — the core of `nxt-date-picker` and `nxt-date-range-picker`, or
 * on its own when the calendar is the point of the screen. Week starts on Monday (vi-VN), keyboard follows
 * the WAI-ARIA APG date picker grid, special days come from the product (no holidays are built in).
 */
@Component({
  selector: 'nxt-calendar',
  exportAs: 'nxtCalendar',
  imports: [NxtButton, NxtIcon],
  template: `
    <div class="nxt-calendar__header">
      <button nxtIconButton variant="ghost" size="sm" type="button" [attr.aria-label]="prevLabel()" [disabled]="!canPrev()" (click)="page(-1)">
        <nxt-icon name="chevron-left" />
      </button>
      <button type="button" class="nxt-calendar__title" (click)="cycleLevel()">
        <span [id]="titleId">{{ title() }}</span><span class="nxt-visually-hidden">, {{ titleAction() }}</span>
      </button>
      <button nxtIconButton variant="ghost" size="sm" type="button" [attr.aria-label]="nextLabel()" [disabled]="!canNext()" (click)="page(1)">
        <nxt-icon name="chevron-right" />
      </button>
    </div>

    @if (level() === 'day') {
      <table
        class="nxt-calendar__grid"
        role="grid"
        data-level="day"
        [attr.aria-labelledby]="titleId"
        [attr.aria-multiselectable]="mode() === 'range' || null"
        (keydown)="onKeydown($event)"
      >
        <thead>
          <tr>
            @for (w of L().weekdaysShort; track $index) {
              <th scope="col" class="nxt-calendar__weekday" [attr.abbr]="L().weekdaysLong[$index]">{{ w }}</th>
            }
          </tr>
        </thead>
        <tbody>
          @for (week of weeks(); track $index) {
            <tr>
              @for (c of week; track c.iso) {
                <td
                  class="nxt-calendar__cell"
                  [attr.tabindex]="c.iso === active() ? 0 : -1"
                  [attr.aria-selected]="c.selected"
                  [attr.aria-current]="c.today ? 'date' : null"
                  [attr.aria-disabled]="c.disabled || null"
                  [attr.aria-label]="c.label"
                  [attr.title]="c.tip"
                  [attr.data-date]="c.iso"
                  [attr.data-outside]="c.outside || null"
                  [attr.data-today]="c.today || null"
                  [attr.data-selected]="c.filled || null"
                  [attr.data-in-range]="c.inRange || null"
                  [attr.data-range-start]="c.rangeStart || null"
                  [attr.data-range-end]="c.rangeEnd || null"
                  [attr.data-non-working]="c.nonWorking || null"
                  [attr.data-holiday]="c.holiday || null"
                  (click)="activate(c.iso)"
                  (mouseenter)="preview(c.iso)"
                >
                  <span class="nxt-calendar__day">
                    {{ c.day }}
                    @if (c.marker) {
                      <span class="nxt-calendar__marker" [attr.data-kind]="c.marker"></span>
                    }
                  </span>
                </td>
              }
            </tr>
          }
        </tbody>
      </table>
    } @else {
      <!-- Month/year grids have no header row: ARIA grid on divs, so table-header rules do not apply. -->
      <div class="nxt-calendar__grid nxt-calendar__periods" role="grid" [attr.data-level]="level()" [attr.aria-labelledby]="titleId" (keydown)="onKeydown($event)">
        @for (row of periods(); track $index) {
          <div class="nxt-calendar__row" role="row">
            @for (c of row; track c.key) {
              <div
                class="nxt-calendar__cell"
                role="gridcell"
                [attr.tabindex]="c.active ? 0 : -1"
                [attr.aria-selected]="c.selected"
                [attr.aria-current]="c.current ? 'date' : null"
                [attr.aria-disabled]="c.disabled || null"
                [attr.aria-label]="c.label"
                [attr.data-today]="c.current || null"
                [attr.data-selected]="c.selected || null"
                (click)="activate(c.target)"
              >
                <span class="nxt-calendar__day">{{ c.text }}</span>
              </div>
            }
          </div>
        }
      </div>
    }

    @if (showToday()) {
      <div class="nxt-calendar__footer">
        <button nxtButton variant="ghost" size="sm" type="button" (click)="goToday()">{{ L().today }}</button>
      </div>
    }

    @if (legend() && legendKinds().length) {
      <div class="nxt-calendar__legend" role="group" [attr.aria-label]="L().legend">
        <ul class="nxt-calendar__legend-list">
          <li class="nxt-calendar__legend-item"><span class="nxt-calendar__swatch" data-kind="today" aria-hidden="true"></span>{{ L().today }}</li>
          @for (k of legendKinds(); track k) {
            <li class="nxt-calendar__legend-item"><span class="nxt-calendar__swatch" [attr.data-kind]="k" aria-hidden="true"></span>{{ kindLabel(k) }}</li>
          }
        </ul>
        @if (level() === 'day' && monthSpecials().length) {
          <ul class="nxt-calendar__specials">
            @for (s of monthSpecials(); track s.date + s.label) {
              <li class="nxt-calendar__legend-item">
                <span class="nxt-calendar__swatch" [attr.data-kind]="s.kind" aria-hidden="true"></span>
                <span><span class="nxt-calendar__special-date">{{ s.short }}</span> · {{ s.label }}</span>
              </li>
            }
          </ul>
        }
      </div>
    }
  `,
  styleUrl: './calendar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'nxt-calendar',
    '[attr.data-level]': 'level()',
    '[attr.data-mode]': 'mode()',
    '[attr.data-disabled]': 'disabled() || null',
  },
})
export class NxtCalendar {
  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  private readonly injector = inject(Injector);
  private readonly announcer = inject(LiveAnnouncer);
  private readonly appLabels = inject(NXT_CALENDAR_LABELS);

  /** `single`: one day (`value`). `range`: start then end (`range`), end included. */
  readonly mode = input<NxtCalendarMode>('single');
  /** Selected day in `single` mode, ISO `yyyy-MM-dd`. */
  readonly value = model<string | null>(null);
  /** Selected range in `range` mode: start ≤ end, the end day is part of the range. */
  readonly range = model<NxtDateRange | null>(null);
  /** First selectable day (ISO). Focus never moves before it. */
  readonly min = input<string | null>(null);
  /** Last selectable day (ISO). Focus never moves after it. */
  readonly max = input<string | null>(null);
  /** Return false to block single days (already booked, outside a cycle). Blocked days stay focusable. */
  readonly dateFilter = input<((date: string) => boolean) | null>(null);
  /** Holidays, days off and events supplied by the product — the calendar has none built in. */
  readonly specialDays = input<readonly NxtCalendarSpecialDay[]>([]);
  /** Weekly days off, ISO weekday numbers (1 = Monday … 7 = Sunday), e.g. [6, 7]. */
  readonly nonWorkingWeekdays = input<readonly number[]>([]);
  /** Today (ISO). Defaults to the machine date; set it to keep tests and examples stable. */
  readonly today = input<string>(nxtTodayIso());
  /** Month and focused day when nothing is selected yet (e.g. the end date opens after the start date). */
  readonly startAt = input<string | null>(null);
  /** Show a "Hôm nay" button that brings the grid back to today (does not select it). */
  readonly showToday = input(false, { transform: booleanAttribute });
  /** Show the legend when the month has days off or special days. */
  readonly legend = input(true, { transform: booleanAttribute });
  /** Nothing can be selected; the grid can still be browsed. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Override any string (weekday and month names, titles, button names, legend). */
  readonly labels = input<Partial<NxtCalendarLabels>>({});
  /** Each day the user picks (both modes, also re-picking the selected day). */
  readonly dateSelected = output<string>();
  /** A range was completed: the second day was picked. */
  readonly rangeSelected = output<NxtDateRange>();

  protected readonly L = computed<NxtCalendarLabels>(() => ({ ...NXT_CALENDAR_LABELS_VI, ...this.appLabels, ...this.labels() }));
  protected readonly titleId = `nxt-calendar-${nextId++}-title`;
  /** Current level of the grid: days, months or years. */
  readonly level = signal<NxtCalendarLevel>('day');
  /** Range mode: the first day picked, waiting for the second. */
  protected readonly anchor = signal<NxtIsoDate | null>(null);
  /** Range mode: day under the pointer or focus while the end is being picked. */
  protected readonly hovered = signal<NxtIsoDate | null>(null);

  private readonly minIso = computed(() => valid(this.min()));
  private readonly maxIso = computed(() => valid(this.max()));
  private readonly todayIso = computed(() => valid(this.today()) ?? nxtTodayIso());
  private readonly seed = computed(() => {
    const picked = this.mode() === 'range' ? this.range()?.start : this.value();
    return nxtClampDate(valid(picked) ?? valid(this.startAt()) ?? this.todayIso(), this.minIso(), this.maxIso());
  });

  /** Day holding the roving tab stop; the grid always shows its month. Follows the selection when it changes. */
  readonly active = linkedSignal<NxtIsoDate, NxtIsoDate>({
    source: this.seed,
    // Keep the focused day when it is part of the new selection (the end of a range just picked).
    computation: (seed, previous) => (previous && this.isPicked(previous.value) ? previous.value : seed),
  });

  protected readonly view = computed(() => nxtDateParts(this.active())!);

  private readonly specialMap = computed(() => {
    const map = new Map<string, NxtCalendarSpecialDay[]>();
    for (const s of this.specialDays()) if (valid(s.date)) map.set(s.date, [...(map.get(s.date) ?? []), s]);
    return map;
  });

  /** Range drawn on the grid: the preview while picking the end, otherwise the committed range. */
  private readonly shownRange = computed<NxtDateRange | null>(() => {
    if (this.mode() !== 'range') return null;
    const anchor = this.anchor();
    if (anchor) return nxtOrderRange(anchor, this.hovered() ?? anchor);
    const r = this.range();
    return r && valid(r.start) && valid(r.end) ? nxtOrderRange(r.start, r.end) : null;
  });

  protected readonly weeks = computed<DayCell[][]>(() => {
    const { y, m } = this.view();
    const L = this.L();
    const first = nxtIsoDate(y, m, 1)!;
    const start = nxtAddDays(first, 1 - nxtIsoWeekday(first));
    const today = this.todayIso();
    const single = this.mode() === 'single';
    const value = single ? valid(this.value()) : null;
    const anchor = this.anchor();
    const shown = this.shownRange();
    const offDays = this.nonWorkingWeekdays();
    const specials = this.specialMap();
    const cells: DayCell[] = [];
    for (let i = 0; i < 42; i++) {
      const iso = nxtAddDays(start, i);
      const p = nxtDateParts(iso)!;
      const weekday = (i % 7) + 1;
      const list = specials.get(iso) ?? [];
      const inRange = !!shown && iso >= shown.start && iso <= shown.end;
      const rangeStart = !!shown && iso === shown.start;
      const rangeEnd = !!shown && iso === shown.end;
      const nonWorking = offDays.includes(weekday) || list.some((s) => s.kind === 'non-working');
      const holiday = list.some((s) => s.kind === 'holiday');
      const parts = [nxtFillLabel(L.dayLabel, { weekday: L.weekdaysLong[weekday - 1], day: p.d, month: p.m, year: p.y })];
      for (const s of list) parts.push(`${this.kindLabel(s.kind)}: ${s.label}`);
      if (offDays.includes(weekday) && !list.some((s) => s.kind === 'non-working')) parts.push(L.nonWorking);
      if (anchor ? iso === anchor : rangeStart) parts.push(L.rangeStart);
      if (!anchor && rangeEnd) parts.push(L.rangeEnd);
      cells.push({
        iso,
        day: p.d,
        outside: p.m !== m,
        disabled: this.isDisabled(iso),
        selected: single ? iso === value : anchor ? iso === anchor : inRange,
        filled: single ? iso === value : rangeStart || rangeEnd,
        inRange,
        rangeStart,
        rangeEnd,
        today: iso === today,
        nonWorking,
        holiday,
        marker: holiday ? 'holiday' : list.some((s) => s.kind === 'event') ? 'event' : null,
        label: parts.join(', '),
        tip: list.length ? list.map((s) => `${this.kindLabel(s.kind)}: ${s.label}`).join('; ') : null,
      });
    }
    return rows(cells, 7);
  });

  protected readonly periods = computed<PeriodCell[][]>(() => {
    const { y, m, d } = this.view();
    const L = this.L();
    const today = nxtDateParts(this.todayIso())!;
    const picked = this.pickedDates();
    if (this.level() === 'month') {
      const cells = Array.from({ length: 12 }, (_, i): PeriodCell => {
        const month = i + 1;
        const prefix = `${y}-${twoDigits(month)}`;
        return {
          key: prefix,
          target: nxtIsoDate(y, month, Math.min(d, nxtDaysInMonth(y, month)))!,
          text: L.months[i],
          label: nxtFillLabel(L.monthLabel, { month, year: y }),
          active: month === m,
          selected: picked.some((iso) => iso.startsWith(prefix)),
          current: today.y === y && today.m === month,
          disabled: this.periodDisabled(`${prefix}-01`, nxtIsoDate(y, month, nxtDaysInMonth(y, month))!),
        };
      });
      return rows(cells, MONTH_COLS);
    }
    const from = pageStart(y);
    const cells = Array.from({ length: YEARS_PER_PAGE }, (_, i): PeriodCell => {
      const year = from + i;
      return {
        key: String(year),
        target: nxtIsoDate(year, m, Math.min(d, nxtDaysInMonth(year, m))) ?? this.active(),
        text: String(year),
        label: String(year),
        active: year === y,
        selected: picked.some((iso) => iso.startsWith(`${year}-`)),
        current: today.y === year,
        disabled: this.periodDisabled(`${year}-01-01`, `${year}-12-31`),
      };
    });
    return rows(cells, YEAR_COLS);
  });

  protected readonly title = computed(() => {
    const { y, m } = this.view();
    const L = this.L();
    const level = this.level();
    if (level === 'day') return nxtFillLabel(L.dayTitle, { month: m, year: y });
    if (level === 'month') return nxtFillLabel(L.monthTitle, { year: y });
    const from = pageStart(y);
    return nxtFillLabel(L.yearTitle, { from, to: from + YEARS_PER_PAGE - 1 });
  });
  protected readonly titleAction = computed(() => {
    const L = this.L();
    return { day: L.toMonthLevel, month: L.toYearLevel, year: L.toDayLevel }[this.level()];
  });
  protected readonly prevLabel = computed(() => {
    const L = this.L();
    return { day: L.prevMonth, month: L.prevYear, year: L.prevYears }[this.level()];
  });
  protected readonly nextLabel = computed(() => {
    const L = this.L();
    return { day: L.nextMonth, month: L.nextYear, year: L.nextYears }[this.level()];
  });

  /** A previous month/year/page still has a selectable day. */
  protected readonly canPrev = computed(() => {
    const min = this.minIso();
    if (!min) return true;
    const { y, m } = this.view();
    const level = this.level();
    const lastBefore = level === 'day' ? nxtAddDays(nxtIsoDate(y, m, 1)!, -1) : `${(level === 'month' ? y : pageStart(y)) - 1}-12-31`;
    return lastBefore >= min;
  });
  protected readonly canNext = computed(() => {
    const max = this.maxIso();
    if (!max) return true;
    const { y, m } = this.view();
    const level = this.level();
    const firstAfter =
      level === 'day' ? nxtAddMonths(nxtIsoDate(y, m, 1)!, 1) : `${level === 'month' ? y + 1 : pageStart(y) + YEARS_PER_PAGE}-01-01`;
    return firstAfter <= max;
  });

  protected readonly legendKinds = computed(() => {
    const kinds = new Set<NxtCalendarSpecialKind>(this.specialDays().map((s) => s.kind));
    if (this.nonWorkingWeekdays().length) kinds.add('non-working');
    return KINDS.filter((k) => kinds.has(k));
  });

  /** Special days of the month on screen, for the legend list ("02/09 · Quốc khánh"). */
  protected readonly monthSpecials = computed(() => {
    const { y, m } = this.view();
    const prefix = `${y}-${twoDigits(m)}-`;
    return this.specialDays()
      .filter((s) => valid(s.date) && s.date.startsWith(prefix))
      .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
      .map((s) => ({ ...s, short: `${s.date.slice(8, 10)}/${s.date.slice(5, 7)}` }));
  });

  /** Move focus to the cell that holds the tab stop, after the next render (the picker calls this on open). */
  focusActiveCell() {
    afterNextRender(() => this.host.querySelector<HTMLElement>('.nxt-calendar__cell[tabindex="0"]')?.focus(), { injector: this.injector });
  }

  /** Disabled by `disabled`, `min`/`max` or `dateFilter`. */
  isDisabled(iso: NxtIsoDate): boolean {
    if (this.disabled()) return true;
    const min = this.minIso();
    const max = this.maxIso();
    if ((min && iso < min) || (max && iso > max)) return true;
    const filter = this.dateFilter();
    return !!filter && !filter(iso);
  }

  protected kindLabel(kind: NxtCalendarSpecialKind): string {
    const L = this.L();
    return kind === 'holiday' ? L.holiday : kind === 'non-working' ? L.nonWorking : L.event;
  }

  /** Click / Enter / Space on a cell: select a day, or open the month/year under it. */
  protected activate(iso: NxtIsoDate) {
    const level = this.level();
    if (level === 'day') {
      this.select(iso);
      return;
    }
    const { y, m } = nxtDateParts(iso)!;
    const first = level === 'month' ? nxtIsoDate(y, m, 1)! : `${y}-01-01`;
    const last = level === 'month' ? nxtIsoDate(y, m, nxtDaysInMonth(y, m))! : `${y}-12-31`;
    if (this.periodDisabled(first, last)) return;
    this.active.set(nxtClampDate(iso, this.minIso(), this.maxIso()));
    this.level.set(level === 'year' ? 'month' : 'day');
    this.focusActiveCell();
  }

  protected preview(iso: NxtIsoDate) {
    if (this.anchor()) this.hovered.set(iso);
  }

  protected onKeydown(event: KeyboardEvent) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const key = event.key;
    const active = this.active();
    if (key === 'Enter' || key === ' ') {
      event.preventDefault();
      this.activate(active);
      return;
    }
    const next = this.level() === 'day' ? this.dayKeyTarget(key, active, event.shiftKey) : this.periodKeyTarget(key, active);
    if (!next) return;
    event.preventDefault();
    this.moveTo(next);
  }

  protected page(direction: 1 | -1) {
    const level = this.level();
    const months = level === 'day' ? 1 : level === 'month' ? 12 : 12 * YEARS_PER_PAGE;
    this.active.set(nxtClampDate(nxtAddMonths(this.active(), direction * months), this.minIso(), this.maxIso()));
    this.announcer.announce(this.title(), 'polite');
  }

  protected cycleLevel() {
    this.level.update((l) => (l === 'day' ? 'month' : l === 'month' ? 'year' : 'day'));
    this.announcer.announce(this.title(), 'polite');
  }

  protected goToday() {
    this.level.set('day');
    this.moveTo(this.todayIso());
  }

  /** Day grid: arrows ±1 day / ±1 week, Home/End Monday/Sunday, PageUp/PageDown ±1 month (Shift: ±1 year). */
  private dayKeyTarget(key: string, active: NxtIsoDate, shift: boolean): NxtIsoDate | null {
    const weekday = nxtIsoWeekday(active);
    switch (key) {
      case 'ArrowLeft':
        return nxtAddDays(active, -1);
      case 'ArrowRight':
        return nxtAddDays(active, 1);
      case 'ArrowUp':
        return nxtAddDays(active, -7);
      case 'ArrowDown':
        return nxtAddDays(active, 7);
      case 'Home':
        return nxtAddDays(active, 1 - weekday);
      case 'End':
        return nxtAddDays(active, 7 - weekday);
      case 'PageUp':
        return nxtAddMonths(active, shift ? -12 : -1);
      case 'PageDown':
        return nxtAddMonths(active, shift ? 12 : 1);
      default:
        return null;
    }
  }

  /** Month grid (4 × 3) and year grid (5 × 4): arrows, Home/End of the row, PageUp/PageDown ±1 year / ±20 years. */
  private periodKeyTarget(key: string, active: NxtIsoDate): NxtIsoDate | null {
    const { y, m } = nxtDateParts(active)!;
    const months = this.level() === 'month';
    const cols = months ? MONTH_COLS : YEAR_COLS;
    const unit = months ? 1 : 12;
    const col = months ? (m - 1) % MONTH_COLS : (y - pageStart(y)) % YEAR_COLS;
    const pageBy = months ? 12 : 12 * YEARS_PER_PAGE;
    const by = (n: number) => nxtAddMonths(active, n);
    switch (key) {
      case 'ArrowLeft':
        return by(-unit);
      case 'ArrowRight':
        return by(unit);
      case 'ArrowUp':
        return by(-unit * cols);
      case 'ArrowDown':
        return by(unit * cols);
      case 'Home':
        return by(-unit * col);
      case 'End':
        return by(unit * (cols - 1 - col));
      case 'PageUp':
        return by(-pageBy);
      case 'PageDown':
        return by(pageBy);
      default:
        return null;
    }
  }

  private moveTo(iso: NxtIsoDate) {
    const next = nxtClampDate(iso, this.minIso(), this.maxIso());
    this.active.set(next);
    if (this.anchor()) this.hovered.set(next);
    this.focusActiveCell();
  }

  private select(iso: NxtIsoDate) {
    this.active.set(iso);
    this.focusActiveCell();
    if (this.isDisabled(iso)) return;
    if (this.mode() === 'single') {
      this.value.set(iso);
      this.dateSelected.emit(iso);
      return;
    }
    const anchor = this.anchor();
    if (!anchor) {
      this.anchor.set(iso);
      this.hovered.set(iso);
      this.dateSelected.emit(iso);
      return;
    }
    const range = nxtOrderRange(anchor, iso);
    this.anchor.set(null);
    this.hovered.set(null);
    this.range.set(range);
    this.dateSelected.emit(iso);
    this.rangeSelected.emit(range);
  }

  private isPicked(iso: NxtIsoDate): boolean {
    if (this.mode() === 'single') return iso === this.value();
    const r = this.range();
    return !!r && iso >= r.start && iso <= r.end;
  }

  private pickedDates(): NxtIsoDate[] {
    if (this.mode() === 'single') return [valid(this.value())].filter((d): d is NxtIsoDate => !!d);
    const r = this.range();
    return r ? [r.start, r.end] : [];
  }

  /** Every day of [first, last] is blocked by `disabled`, `min` or `max`. */
  private periodDisabled(first: NxtIsoDate, last: NxtIsoDate): boolean {
    const min = this.minIso();
    const max = this.maxIso();
    return this.disabled() || (!!min && last < min) || (!!max && first > max);
  }
}

