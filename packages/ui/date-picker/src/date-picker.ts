import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { Overlay } from '@angular/cdk/overlay';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Directive,
  ElementRef,
  InputSignal,
  InputSignalWithTransform,
  Injector,
  ModelSignal,
  Signal,
  TemplateRef,
  ViewEncapsulation,
  afterNextRender,
  booleanAttribute,
  computed,
  effect,
  forwardRef,
  inject,
  input,
  linkedSignal,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { AbstractControl, ControlValueAccessor, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator } from '@angular/forms';
import { NxtButton } from '@nxt/ui/button';
import {
  NxtCalendar,
  NxtCalendarLabels,
  NxtCalendarSpecialDay,
  NxtDateParseResult,
  NxtDateRange,
  nxtAddDays,
  nxtAddMonths,
  nxtClampDate,
  nxtDateParts,
  nxtFormatDate,
  nxtFormatDateRange,
  nxtOrderRange,
  nxtParseDate,
  nxtParseDateRange,
  nxtRangeTokenAt,
  nxtTodayIso,
} from '@nxt/ui/calendar';
import { NxtFormField, NxtInput } from '@nxt/ui/form-field';
import { NxtIcon } from '@nxt/ui/icon';

/** Strings of the picker itself; `calendar` overrides strings inside the calendar grid. */
export interface NxtDatePickerLabels {
  /** Name of the calendar button. The field label is appended: "Chọn ngày, Ngày sinh". */
  openCalendar: string;
  /** Accessible name of the calendar panel (dialog). */
  dialog: string;
  /** Optional "Hôm nay" button in the panel. */
  today: string;
  calendar: Partial<NxtCalendarLabels>;
}

export const NXT_DATE_PICKER_LABELS_VI: NxtDatePickerLabels = {
  openCalendar: 'Chọn ngày',
  dialog: 'Chọn ngày',
  today: 'Hôm nay',
  calendar: {},
};

export const NXT_DATE_RANGE_PICKER_LABELS_VI: NxtDatePickerLabels = {
  openCalendar: 'Chọn khoảng ngày',
  dialog: 'Chọn khoảng ngày',
  today: 'Hôm nay',
  calendar: {},
};

type Step = 'day' | 'month';
type DateFilter = ((date: string) => boolean) | null;

const validIso = (iso: unknown): string | null => (typeof iso === 'string' && nxtDateParts(iso) ? iso : null);

/** Calendar selector of the cell holding the roving tab stop — receives focus when the panel opens. */
const ACTIVE_CELL = '.nxt-calendar__cell[tabindex="0"]';

/**
 * Next day for PageUp/PageDown in the input: ±1 day or ±1 month, kept within [min, max],
 * skipping days blocked by `dateFilter` in the same direction. Empty input starts from today.
 */
function stepDate(from: string | null, dir: 1 | -1, unit: Step, today: string, min: string | null, max: string | null, filter: DateFilter): string {
  let d = nxtClampDate(from ? (unit === 'day' ? nxtAddDays(from, dir) : nxtAddMonths(from, dir)) : today, min, max);
  for (let i = 0; i < 366 && filter && !filter(d); i++) {
    const n = nxtAddDays(d, dir);
    if ((min && n < min) || (max && n > max)) return from ?? d;
    d = n;
  }
  return d;
}

/**
 * Shared behavior of `nxt-date-picker` and `nxt-date-range-picker`: typed text committed on blur / Enter,
 * keys in the input, the calendar panel (CDK Dialog anchored to the form field), ControlValueAccessor and Validator.
 */
@Directive()
abstract class NxtDateInputBase<V> implements ControlValueAccessor, Validator {
  protected readonly host: HTMLElement = inject(ElementRef).nativeElement;
  /** The surrounding `nxt-form-field`: its label names the calendar button. */
  protected readonly field = inject(NxtFormField, { optional: true });
  private readonly dialog = inject(Dialog);
  private readonly overlay = inject(Overlay);
  private readonly injector = inject(Injector);

  abstract readonly value: ModelSignal<V | null>;
  abstract readonly min: InputSignal<string | null>;
  abstract readonly max: InputSignal<string | null>;
  abstract readonly dateFilter: InputSignal<DateFilter>;
  abstract readonly today: InputSignal<string>;
  abstract readonly disabled: InputSignalWithTransform<boolean, unknown>;
  abstract readonly readonly: InputSignalWithTransform<boolean, unknown>;
  abstract readonly labels: InputSignal<Partial<NxtDatePickerLabels>>;
  protected abstract readonly inputEl: Signal<ElementRef<HTMLInputElement>>;
  protected abstract readonly panelTemplate: Signal<TemplateRef<unknown>>;
  protected abstract readonly defaultLabels: NxtDatePickerLabels;

  protected abstract parse(text: string): NxtDateParseResult<V>;
  protected abstract format(value: V | null): string;
  protected abstract coerce(value: unknown): V | null;
  protected abstract same(a: V | null, b: V | null): boolean;
  protected abstract limitErrors(value: V): ValidationErrors | null;
  protected abstract stepValue(current: V | null, dir: 1 | -1, unit: Step, caret: number): V;
  protected abstract todayValue(): V;

  private readonly formDisabled = signal(false);
  private readonly parseErrorText = signal<string | null>(null);
  /** Text the user typed that is not a date (null when the field is empty or valid). Use it to show an error without forms. */
  readonly parseError = this.parseErrorText.asReadonly();

  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled());
  protected readonly isOpen = signal(false);
  protected readonly L = computed<NxtDatePickerLabels>(() => ({ ...this.defaultLabels, ...this.labels() }));
  protected readonly buttonLabel = computed(() => {
    const label = this.field?.label();
    return label ? `${this.L().openCalendar}, ${label}` : this.L().openCalendar;
  });
  /** What the input shows: the committed value, or the user's text until it is committed. */
  protected readonly text = linkedSignal(() => this.format(this.value()));
  protected readonly todayIso = computed(() => validIso(this.today()) ?? nxtTodayIso());
  protected readonly todayAllowed = computed(() => this.allowed(this.todayIso()));

  private ref: DialogRef | null = null;
  private onChange: (value: V | null) => void = () => {};
  private onTouched: () => void = () => {};
  private onValidatorChange: () => void = () => {};

  constructor() {
    inject(DestroyRef).onDestroy(() => this.ref?.close());
    // New limits re-run the validator — after the render, not during it (the field's error is already bound).
    let first = true;
    effect(() => {
      this.min();
      this.max();
      this.dateFilter();
      if (first) {
        first = false;
        return;
      }
      afterNextRender(() => this.onValidatorChange(), { injector: this.injector });
    });
  }

  /** Open the calendar; focus goes to the selected day (or `startAt`, or today). */
  open() {
    if (this.ref || this.isDisabled() || this.readonly()) return;
    this.commit();
    const anchor = this.host.closest<HTMLElement>('.nxt-form-field__control') ?? this.host;
    this.ref = this.dialog.open(this.panelTemplate(), {
      ariaLabel: this.L().dialog,
      ariaModal: true,
      autoFocus: ACTIVE_CELL,
      restoreFocus: true,
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      panelClass: 'nxt-date-picker-pane',
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(anchor)
        .withPush(true)
        .withPositions([
          { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' },
          { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom' },
          { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top' },
          { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom' },
        ]),
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
    });
    this.isOpen.set(true);
    this.ref.closed.subscribe(() => {
      this.ref = null;
      this.isOpen.set(false);
    });
  }

  /** Close without changing the value; CDK returns focus to where the panel was opened from. */
  close() {
    this.ref?.close();
  }

  focus() {
    this.inputEl().nativeElement.focus();
  }

  // ---------- ControlValueAccessor + Validator ----------
  writeValue(value: unknown): void {
    const v = this.coerce(value);
    this.parseErrorText.set(null);
    this.value.set(v);
    this.text.set(this.format(v));
  }
  registerOnChange(fn: (value: V | null) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(disabled: boolean): void {
    this.formDisabled.set(disabled);
    if (disabled) this.close();
  }
  registerOnValidatorChange(fn: () => void): void {
    this.onValidatorChange = fn;
  }
  validate(control: AbstractControl): ValidationErrors | null {
    const text = this.parseErrorText();
    if (text !== null) return { nxtDateParse: { text } };
    const value = this.coerce(control.value);
    return value ? this.limitErrors(value) : null;
  }

  // ---------- template handlers ----------
  protected onInput(event: Event) {
    this.text.set((event.target as HTMLInputElement).value);
  }

  protected onBlur() {
    this.commit();
    this.onTouched();
  }

  protected toggle() {
    if (this.ref) this.close();
    else this.open();
  }

  protected onKeydown(event: KeyboardEvent) {
    if (event.altKey && event.key === 'ArrowDown') {
      event.preventDefault();
      this.open();
      return;
    }
    if (event.key === 'Enter') {
      this.commit();
      return;
    }
    if (event.key === 'Escape') {
      // Undo unfinished typing; with nothing to undo, let Escape reach the drawer/dialog around the field.
      if (this.text() !== this.format(this.value()) || this.parseErrorText() !== null) {
        event.preventDefault();
        event.stopPropagation();
        this.assign(this.value(), null);
      }
      return;
    }
    if ((event.key === 'PageUp' || event.key === 'PageDown') && !event.altKey && !event.ctrlKey && !event.metaKey) {
      if (this.readonly() || this.isDisabled()) return;
      event.preventDefault();
      this.commit();
      if (this.parseErrorText() !== null) return;
      const input = this.inputEl().nativeElement;
      const caret = input.selectionStart ?? 0;
      this.assign(this.stepValue(this.value(), event.key === 'PageUp' ? 1 : -1, event.shiftKey ? 'month' : 'day', caret), null);
      // Write the DOM now so the caret stays on the same date; Angular later writes the same string (no caret jump).
      input.value = this.text();
      input.setSelectionRange(caret, caret);
    }
  }

  protected onPanelKeydown(event: KeyboardEvent) {
    if (event.altKey && event.key === 'ArrowUp') {
      event.preventDefault();
      this.close();
    }
  }

  /** A day (or range) chosen in the calendar, or "Hôm nay". */
  protected pick(value: V) {
    this.assign(value, null);
    this.close();
  }

  protected pickToday() {
    if (this.todayAllowed()) this.pick(this.todayValue());
  }

  // ---------- internals ----------
  protected allowed(iso: string): boolean {
    const min = validIso(this.min());
    const max = validIso(this.max());
    const filter = this.dateFilter();
    return (!min || iso >= min) && (!max || iso <= max) && (!filter || filter(iso));
  }

  protected step(from: string | null, dir: 1 | -1, unit: Step): string {
    return stepDate(from, dir, unit, this.todayIso(), validIso(this.min()), validIso(this.max()), this.dateFilter());
  }

  /** Read the typed text: valid → normalized value; not a date → value null, text kept, `nxtDateParse` error. */
  protected commit() {
    const raw = this.text();
    const result = this.parse(raw);
    if (result.error) this.assign(null, raw);
    else this.assign(result.value, null);
  }

  private assign(value: V | null, error: string | null) {
    const errorChanged = error !== this.parseErrorText();
    const changed = !this.same(value, this.value());
    this.parseErrorText.set(error);
    if (changed) this.value.set(value);
    this.text.set(error ?? this.format(value));
    if (changed) this.onChange(value);
    else if (errorChanged) this.onValidatorChange();
  }
}

/**
 * Date field for one day: type `06112026` or `6/11/2026`, or pick on the calendar (Alt+↓ or the button).
 * Value is ISO `yyyy-MM-dd`, shown as `dd/MM/yyyy`; never read month-first. Place it inside `nxt-form-field`.
 */
@Component({
  selector: 'nxt-date-picker',
  exportAs: 'nxtDatePicker',
  imports: [NxtButton, NxtCalendar, NxtIcon, NxtInput],
  template: `
    <input
      #input
      nxtInput
      type="text"
      class="nxt-date-picker__input"
      autocomplete="off"
      spellcheck="false"
      [value]="text()"
      [placeholder]="placeholder()"
      [disabled]="isDisabled()"
      [readOnly]="readonly()"
      (input)="onInput($event)"
      (blur)="onBlur()"
      (keydown)="onKeydown($event)"
    />
    @if (!readonly()) {
      <button
        nxtIconButton
        variant="ghost"
        size="sm"
        type="button"
        class="nxt-date-picker__trigger"
        aria-haspopup="dialog"
        [attr.aria-expanded]="isOpen()"
        [attr.aria-label]="buttonLabel()"
        [disabled]="isDisabled()"
        (click)="toggle()"
      >
        <nxt-icon name="calendar" />
      </button>
    }
    <ng-template #panel>
      <div class="nxt-date-picker__panel" (keydown)="onPanelKeydown($event)">
        <nxt-calendar
          [value]="value()"
          [min]="min()"
          [max]="max()"
          [dateFilter]="dateFilter()"
          [specialDays]="specialDays()"
          [nonWorkingWeekdays]="nonWorkingWeekdays()"
          [today]="todayIso()"
          [startAt]="startAt()"
          [labels]="L().calendar"
          (dateSelected)="pick($event)"
        />
        @if (todayButton()) {
          <div class="nxt-date-picker__footer">
            <button nxtButton variant="ghost" size="sm" type="button" [disabled]="!todayAllowed()" (click)="pickToday()">{{ L().today }}</button>
          </div>
        }
      </div>
    </ng-template>
  `,
  styleUrl: './date-picker.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => NxtDatePicker), multi: true },
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => NxtDatePicker), multi: true },
  ],
  host: {
    class: 'nxt-date-picker',
    '[attr.data-open]': 'isOpen() || null',
    '[attr.data-readonly]': 'readonly() || null',
  },
})
export class NxtDatePicker extends NxtDateInputBase<string> {
  /** Committed day, ISO `yyyy-MM-dd` (null when empty or when the typed text is not a date). */
  readonly value = model<string | null>(null);
  /** First allowed day (ISO). Earlier days are blocked on the calendar; typing one gives `nxtDateMin`. */
  readonly min = input<string | null>(null);
  /** Last allowed day (ISO), e.g. today for a date of birth. Typing a later one gives `nxtDateMax`. */
  readonly max = input<string | null>(null);
  /** Return false to block single days; typing one gives `nxtDateFilter`. */
  readonly dateFilter = input<((date: string) => boolean) | null>(null);
  /** Holidays, days off and events shown on the calendar (from the product's work calendar). */
  readonly specialDays = input<readonly NxtCalendarSpecialDay[]>([]);
  /** Weekly days off shown on the calendar: 1 = Monday … 7 = Sunday. */
  readonly nonWorkingWeekdays = input<readonly number[]>([]);
  /** Month the calendar opens on while the field is empty. */
  readonly startAt = input<string | null>(null);
  /** Today (ISO); defaults to the machine date. Fix it in tests and examples. */
  readonly today = input<string>(nxtTodayIso());
  /** "Hôm nay" button in the panel: picks today and closes. */
  readonly todayButton = input(false, { transform: booleanAttribute });
  /** Same as disabling the form control. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Value can be focused and copied but not changed; the calendar button is hidden. */
  readonly readonly = input(false, { transform: booleanAttribute });
  /** Format hint shown while empty — a pattern, not a sample date. */
  readonly placeholder = input('dd/mm/yyyy');
  /** Override the button name, panel name, "Hôm nay" and the calendar strings. */
  readonly labels = input<Partial<NxtDatePickerLabels>>({});

  protected readonly inputEl = viewChild.required<ElementRef<HTMLInputElement>>('input');
  protected readonly panelTemplate = viewChild.required<TemplateRef<unknown>>('panel');
  protected readonly defaultLabels = NXT_DATE_PICKER_LABELS_VI;

  protected parse(text: string) {
    return nxtParseDate(text);
  }
  protected format(value: string | null) {
    return nxtFormatDate(value);
  }
  protected coerce(value: unknown) {
    return validIso(value);
  }
  protected same(a: string | null, b: string | null) {
    return a === b;
  }
  protected limitErrors(value: string): ValidationErrors | null {
    const min = validIso(this.min());
    const max = validIso(this.max());
    if (min && value < min) return { nxtDateMin: { min, actual: value } };
    if (max && value > max) return { nxtDateMax: { max, actual: value } };
    const filter = this.dateFilter();
    return filter && !filter(value) ? { nxtDateFilter: { actual: value } } : null;
  }
  protected stepValue(current: string | null, dir: 1 | -1, unit: Step) {
    return this.step(current, dir, unit);
  }
  protected todayValue() {
    return this.todayIso();
  }
}

/**
 * Range field (leave period, payroll cycle, list filter): one input `dd/MM/yyyy – dd/MM/yyyy`, calendar in range mode.
 * Value `{ start, end }` in ISO, end included; an end typed or picked before the start is swapped.
 */
@Component({
  selector: 'nxt-date-range-picker',
  exportAs: 'nxtDateRangePicker',
  imports: [NxtButton, NxtCalendar, NxtIcon, NxtInput],
  template: `
    <input
      #input
      nxtInput
      type="text"
      class="nxt-date-picker__input"
      autocomplete="off"
      spellcheck="false"
      [value]="text()"
      [placeholder]="placeholder()"
      [disabled]="isDisabled()"
      [readOnly]="readonly()"
      (input)="onInput($event)"
      (blur)="onBlur()"
      (keydown)="onKeydown($event)"
    />
    @if (!readonly()) {
      <button
        nxtIconButton
        variant="ghost"
        size="sm"
        type="button"
        class="nxt-date-picker__trigger"
        aria-haspopup="dialog"
        [attr.aria-expanded]="isOpen()"
        [attr.aria-label]="buttonLabel()"
        [disabled]="isDisabled()"
        (click)="toggle()"
      >
        <nxt-icon name="calendar" />
      </button>
    }
    <ng-template #panel>
      <div class="nxt-date-picker__panel" (keydown)="onPanelKeydown($event)">
        <nxt-calendar
          mode="range"
          [range]="value()"
          [min]="min()"
          [max]="max()"
          [dateFilter]="dateFilter()"
          [specialDays]="specialDays()"
          [nonWorkingWeekdays]="nonWorkingWeekdays()"
          [today]="todayIso()"
          [startAt]="startAt()"
          [labels]="L().calendar"
          (rangeSelected)="pick($event)"
        />
        @if (todayButton()) {
          <div class="nxt-date-picker__footer">
            <button nxtButton variant="ghost" size="sm" type="button" [disabled]="!todayAllowed()" (click)="pickToday()">{{ L().today }}</button>
          </div>
        }
      </div>
    </ng-template>
  `,
  styleUrl: './date-picker.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => NxtDateRangePicker), multi: true },
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => NxtDateRangePicker), multi: true },
  ],
  host: {
    class: 'nxt-date-picker nxt-date-range-picker',
    '[attr.data-open]': 'isOpen() || null',
    '[attr.data-readonly]': 'readonly() || null',
  },
})
export class NxtDateRangePicker extends NxtDateInputBase<NxtDateRange> {
  /** Committed range `{ start, end }` (ISO, start ≤ end, end included); null when empty or not readable. */
  readonly value = model<NxtDateRange | null>(null);
  /** First allowed day (ISO). A start before it gives `nxtDateMin`. */
  readonly min = input<string | null>(null);
  /** Last allowed day (ISO). An end after it gives `nxtDateMax`. */
  readonly max = input<string | null>(null);
  /** Return false to block single days; a blocked start or end gives `nxtDateFilter` (days inside may be blocked). */
  readonly dateFilter = input<((date: string) => boolean) | null>(null);
  /** Holidays, days off and events shown on the calendar (from the product's work calendar). */
  readonly specialDays = input<readonly NxtCalendarSpecialDay[]>([]);
  /** Weekly days off shown on the calendar: 1 = Monday … 7 = Sunday. */
  readonly nonWorkingWeekdays = input<readonly number[]>([]);
  /** Month the calendar opens on while the field is empty. */
  readonly startAt = input<string | null>(null);
  /** Today (ISO); defaults to the machine date. Fix it in tests and examples. */
  readonly today = input<string>(nxtTodayIso());
  /** "Hôm nay" button in the panel: picks today as a one-day range and closes. */
  readonly todayButton = input(false, { transform: booleanAttribute });
  /** Same as disabling the form control. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Value can be focused and copied but not changed; the calendar button is hidden. */
  readonly readonly = input(false, { transform: booleanAttribute });
  /** Format hint shown while empty. */
  readonly placeholder = input('dd/mm/yyyy – dd/mm/yyyy');
  /** Override the button name, panel name, "Hôm nay" and the calendar strings. */
  readonly labels = input<Partial<NxtDatePickerLabels>>({});

  protected readonly inputEl = viewChild.required<ElementRef<HTMLInputElement>>('input');
  protected readonly panelTemplate = viewChild.required<TemplateRef<unknown>>('panel');
  protected readonly defaultLabels = NXT_DATE_RANGE_PICKER_LABELS_VI;

  protected parse(text: string) {
    return nxtParseDateRange(text);
  }
  protected format(value: NxtDateRange | null) {
    return nxtFormatDateRange(value);
  }
  protected coerce(value: unknown): NxtDateRange | null {
    const v = value as Partial<NxtDateRange> | null;
    const start = validIso(v?.start);
    const end = validIso(v?.end);
    return start && end ? nxtOrderRange(start, end) : null;
  }
  protected same(a: NxtDateRange | null, b: NxtDateRange | null) {
    return a?.start === b?.start && a?.end === b?.end;
  }
  protected limitErrors(value: NxtDateRange): ValidationErrors | null {
    const min = validIso(this.min());
    const max = validIso(this.max());
    if (min && value.start < min) return { nxtDateMin: { min, actual: value.start } };
    if (max && value.end > max) return { nxtDateMax: { max, actual: value.end } };
    const filter = this.dateFilter();
    const blocked = filter ? [value.start, value.end].find((d) => !filter(d)) : undefined;
    return blocked ? { nxtDateFilter: { actual: blocked } } : null;
  }
  /** PageUp/PageDown change the date under the caret; the other end follows when they would cross. */
  protected stepValue(current: NxtDateRange | null, dir: 1 | -1, unit: Step, caret: number): NxtDateRange {
    if (!current) {
      const day = this.step(null, dir, unit);
      return { start: day, end: day };
    }
    if (nxtRangeTokenAt(this.text(), caret) === 0) {
      const start = this.step(current.start, dir, unit);
      return { start, end: start > current.end ? start : current.end };
    }
    const end = this.step(current.end, dir, unit);
    return { start: end < current.start ? end : current.start, end };
  }
  protected todayValue() {
    const today = this.todayIso();
    return { start: today, end: today };
  }
}
