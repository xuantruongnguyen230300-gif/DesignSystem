import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  forwardRef,
  inject,
  input,
  model,
  numberAttribute,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { nxtNumber, nxtUnit } from '@nxt/ui/format';
import { NxtIcon } from '@nxt/ui/icon';

let nextId = 0;

/** Hold a button this long (ms) before it starts repeating, then repeat at this interval (ms). */
const HOLD_DELAY = 400;
const HOLD_INTERVAL = 100;
/** Page Up / Page Down move this many steps. */
const PAGE_STEPS = 10;

/** `numberAttribute` that stays `undefined` when the attribute is absent, empty or not numeric. */
function numberAttributeOrUndefined(value: unknown): number | undefined {
  if (value === null || value === undefined || value === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

/** Number of decimal places a number is written with (0.25 → 2, 1e-7 → 7). */
function decimalsOf(n: number | undefined): number {
  if (n === undefined || !Number.isFinite(n)) return 0;
  const [mantissa, exponent] = String(n).split('e-');
  const fraction = mantissa.split('.')[1]?.length ?? 0;
  return fraction + (exponent ? Number(exponent) : 0);
}

const round = (n: number, decimals: number) => Number(n.toFixed(Math.min(decimals, 20)));

const count = (text: string, char: string) => text.split(char).length - 1;

/** Group and decimal characters of a locale ("." and "," for vi-VN). */
function separators(locale: string): { group: string; decimal: string } {
  const parts = new Intl.NumberFormat(locale).formatToParts(11111.1);
  return {
    group: parts.find((p) => p.type === 'group')?.value ?? ',',
    decimal: parts.find((p) => p.type === 'decimal')?.value ?? '.',
  };
}

/**
 * Read a number typed by a person, in the locale's way: "1.250,5" (vi-VN) → 1250.5. Lenient on purpose:
 * both "," and "." work as the decimal mark when there is no ambiguity, and a lone group character followed by
 * exactly three digits ("1.500") is read as a group. Returns `null` when the text is not a number.
 */
function parseNumber(text: string, locale: string): number | null {
  const match = /^([+-]?)([\d.,]+)$/.exec(text.replace(/[\s  ]/g, '').replace(/−/g, '-'));
  if (!match || !/\d/.test(match[2])) return null;
  const [, sign, body] = match;
  const { group, decimal } = separators(locale);
  const dots = count(body, '.');
  const commas = count(body, ',');
  let normalized: string;
  if (dots && commas) {
    // The one written last is the decimal mark (and may appear once); the other one is a group.
    const mark = body.lastIndexOf('.') > body.lastIndexOf(',') ? '.' : ',';
    const other = mark === '.' ? ',' : '.';
    if (count(body, mark) > 1) return null;
    normalized = body.split(other).join('').replace(mark, '.');
  } else if (dots + commas > 1) {
    // The same character repeated: only a group character can repeat ("1.234.567").
    const char = dots ? '.' : ',';
    if (char !== group) return null;
    normalized = body.split(char).join('');
  } else if (dots + commas === 1) {
    const char = dots ? '.' : ',';
    const [before, after] = body.split(char);
    const isGroup = char !== decimal && /^[1-9]\d{0,2}$/.test(before) && /^\d{3}$/.test(after);
    normalized = isGroup ? before + after : `${before}.${after}`;
  } else {
    normalized = body;
  }
  const n = Number(sign + normalized);
  return Number.isFinite(n) ? n : null;
}

/**
 * A number in a small range changed by steps: − and + buttons around a value that can also be typed.
 * The value is `input[role=spinbutton]` (the only tab stop): ↑ ↓ ± step, Page Up / Down ± 10 steps, Home / End to the
 * limits. Results are clamped to `min` / `max`; typed text is applied on Enter or blur. Works with `[(value)]`
 * or Angular forms. For exact large numbers use a text field; for a position in a range use `nxt-slider`.
 */
@Component({
  selector: 'nxt-stepper',
  imports: [NxtIcon],
  template: `
    <label class="nxt-stepper__label" [for]="id" [class.nxt-visually-hidden]="hideLabel()">
      {{ label() }}
      @if (required()) {
        <span class="nxt-stepper__required" aria-hidden="true">*</span>
      }
    </label>
    <div class="nxt-stepper__control" (focusout)="onFocusOut($event)">
      <!-- Out of the tab order (APG): keyboard and screen reader users step with the arrows on the value. -->
      <button
        type="button"
        class="nxt-stepper__button"
        tabindex="-1"
        [attr.aria-label]="decreaseName()"
        [attr.aria-controls]="id"
        [disabled]="decrementDisabled()"
        (mousedown)="$event.preventDefault()"
        (contextmenu)="$event.preventDefault()"
        (pointerdown)="pressStart(-1, $event)"
        (pointerup)="pressEnd()"
        (pointercancel)="pressEnd()"
        (pointerleave)="pressEnd()"
        (keydown)="pointerStepped = false"
        (click)="pressClick(-1)"
      >
        <nxt-icon name="minus" />
      </button>
      <span class="nxt-stepper__field">
        <input
          class="nxt-stepper__input"
          type="text"
          role="spinbutton"
          autocomplete="off"
          spellcheck="false"
          enterkeyhint="done"
          [id]="id"
          [value]="displayText()"
          [style.--_chars]="chars()"
          [attr.inputmode]="inputMode()"
          [readOnly]="readonly()"
          [disabled]="isDisabled()"
          [attr.aria-valuenow]="value()"
          [attr.aria-valuemin]="min()"
          [attr.aria-valuemax]="max()"
          [attr.aria-valuetext]="valueText()"
          [attr.aria-required]="required() || null"
          [attr.aria-invalid]="invalid() ? 'true' : null"
          [attr.aria-readonly]="readonly() || null"
          [attr.aria-describedby]="describedBy()"
          (input)="onInput($event)"
          (keydown)="onKeydown($event)"
          (blur)="commit()"
        />
        @if (unit()) {
          <!-- The unit is already part of aria-valuetext: hidden so it is not read twice. -->
          <span class="nxt-stepper__unit" aria-hidden="true">{{ unit() }}</span>
        }
      </span>
      <button
        type="button"
        class="nxt-stepper__button"
        tabindex="-1"
        [attr.aria-label]="increaseName()"
        [attr.aria-controls]="id"
        [disabled]="incrementDisabled()"
        (mousedown)="$event.preventDefault()"
        (contextmenu)="$event.preventDefault()"
        (pointerdown)="pressStart(1, $event)"
        (pointerup)="pressEnd()"
        (pointercancel)="pressEnd()"
        (pointerleave)="pressEnd()"
        (keydown)="pointerStepped = false"
        (click)="pressClick(1)"
      >
        <nxt-icon name="plus" />
      </button>
    </div>
    @if (hint()) {
      <p class="nxt-stepper__hint" [id]="hintId">{{ hint() }}</p>
    }
    @if (message()) {
      <p class="nxt-stepper__error" [id]="errorId"><nxt-icon name="alert-circle" />{{ message() }}</p>
    }
  `,
  styleUrl: './stepper.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => NxtStepper), multi: true }],
  host: {
    class: 'nxt-stepper',
    '[attr.data-label-position]': 'labelPosition()',
    '[attr.data-invalid]': 'invalid() || null',
    '[attr.data-disabled]': 'isDisabled() || null',
    '[attr.data-readonly]': 'readonly() || null',
    '[attr.data-unit]': 'unit() ? "" : null',
  },
})
export class NxtStepper implements ControlValueAccessor {
  /** The number (two-way). `null` = nothing entered yet (empty field). */
  readonly value = model<number | null>(null);
  /** What is being adjusted, as a noun: "Số ngày nghỉ phép". */
  readonly label = input.required<string>();
  /** `top`: label above the control like a form-field label. `start`: label before it on one row (settings lists). */
  readonly labelPosition = input<'top' | 'start'>('top');
  /** Visually hide the label (still announced), e.g. in a table cell under a column header. */
  readonly hideLabel = input(false, { transform: booleanAttribute });
  /** The rule or consequence, read after the name and value: "Tối đa 30 ngày mỗi năm." */
  readonly hint = input<string>();
  /** An error from the app (form or server). Shown below the control; say how to fix it. */
  readonly error = input<string | null>();
  /** Lower limit (inclusive). Unset = no limit. */
  readonly min = input(undefined, { transform: numberAttributeOrUndefined });
  /** Upper limit (inclusive). Unset = no limit. */
  readonly max = input(undefined, { transform: numberAttributeOrUndefined });
  /** Size of one step for the buttons and arrow keys. Page Up / Down move 10 steps. A value of 0 or less counts as 1. */
  readonly step = input(1, { transform: (value: unknown) => numberAttribute(value, 1) });
  /** Unit written after the number: "ngày", "giờ", "%". */
  readonly unit = input<string>();
  /** Decimal places shown and rounded to. Default: as many as `step` and `min` have (step 0.5 → 1). */
  readonly fractionDigits = input(undefined, { transform: numberAttributeOrUndefined });
  /** `Intl` locale used to show and read the number. */
  readonly locale = input('vi-VN');
  /** Show `*` after the label and set aria-required. */
  readonly required = input(false, { transform: booleanAttribute });
  /** Holding a button repeats the step. */
  readonly autoRepeat = input(true, { transform: booleanAttribute });
  /** Replaces the default message shown when the typed value is not a number or is out of range (i18n). */
  readonly invalidText = input<string | null>();
  /** Name of the decrease button (i18n); the full name is "Giảm, <label>". */
  readonly decreaseLabel = input('Giảm');
  /** Name of the increase button (i18n); the full name is "Tăng, <label>". */
  readonly increaseLabel = input('Tăng');
  readonly disabled = input(false, { transform: booleanAttribute });
  /** The value is visible and focusable but cannot be changed; the buttons are hidden. */
  readonly readonly = input(false, { transform: booleanAttribute });

  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  protected readonly id = `nxt-stepper-${nextId++}`;
  protected readonly hintId = `${this.id}-hint`;
  protected readonly errorId = `${this.id}-error`;

  private readonly formDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled());

  /** Text being typed, or `null` while the field just shows the value. */
  private readonly draft = signal<string | null>(null);
  /** The last text applied was not a number: kept on screen with the error state until retyped or Esc. */
  private readonly parseFailed = signal(false);

  private readonly stepSize = computed(() => {
    const step = this.step();
    return Number.isFinite(step) && step > 0 ? step : 1;
  });
  private readonly decimals = computed(
    () => this.fractionDigits() ?? Math.max(decimalsOf(this.stepSize()), decimalsOf(this.min())),
  );

  protected readonly displayText = computed(() => this.draft() ?? this.formatNumber(this.value()));
  protected readonly valueText = computed(() => {
    const value = this.value();
    if (value === null) return null;
    const options = { locale: this.locale(), fractionDigits: this.decimals() };
    return this.unit() ? nxtUnit(value, this.unit()!, options) : nxtNumber(value, options);
  });
  /** Width of the value in `ch`: the longest of min, max and what is typed, so the control does not resize while stepping. */
  protected readonly chars = computed(() => {
    const min = this.min();
    const max = this.max();
    const length = (n: number | undefined) => (n === undefined ? 0 : this.formatNumber(n).length);
    return Math.min(14, Math.max(3, length(min), length(max), this.displayText().length));
  });
  /** Soft keyboards: no minus sign on the numeric pad, so allow full text when a negative number is possible. */
  protected readonly inputMode = computed(() => {
    const min = this.min();
    if (min === undefined || min < 0) return 'text';
    return this.decimals() > 0 ? 'decimal' : 'numeric';
  });

  private readonly outOfRange = computed(() => {
    const value = this.value();
    const min = this.min();
    const max = this.max();
    return value !== null && ((min !== undefined && value < min) || (max !== undefined && value > max));
  });
  protected readonly invalid = computed(() => !!this.error() || this.parseFailed() || this.outOfRange());
  protected readonly message = computed(() => {
    if (this.error()) return this.error();
    if (!this.parseFailed() && !this.outOfRange()) return null;
    const custom = this.invalidText();
    if (custom) return custom;
    const min = this.min();
    const max = this.max();
    const range =
      min !== undefined && max !== undefined
        ? ` từ ${this.formatNumber(min)} đến ${this.formatNumber(max)}`
        : min !== undefined
          ? ` từ ${this.formatNumber(min)} trở lên`
          : max !== undefined
            ? ` không quá ${this.formatNumber(max)}`
            : '';
    return this.parseFailed() ? `Nhập một số${range}.` : `Nhập số${range}.`;
  });
  protected readonly describedBy = computed(
    () => [this.hint() ? this.hintId : '', this.message() ? this.errorId : ''].filter(Boolean).join(' ') || null,
  );

  protected readonly decreaseName = computed(() => `${this.decreaseLabel()}, ${this.label()}`);
  protected readonly increaseName = computed(() => `${this.increaseLabel()}, ${this.label()}`);
  private readonly locked = computed(() => this.readonly() || this.isDisabled());
  /** A button is disabled at its limit (the number shown is already the limit) and while the control is locked. */
  protected readonly decrementDisabled = computed(() => {
    const value = this.value();
    const min = this.min();
    return this.locked() || (value !== null && min !== undefined && value <= min);
  });
  protected readonly incrementDisabled = computed(() => {
    const value = this.value();
    const max = this.max();
    return this.locked() || (value !== null && max !== undefined && value >= max);
  });

  /** The pointer already stepped on press, so the `click` that follows it must not step again. */
  protected pointerStepped = false;
  private holdTimer: ReturnType<typeof setTimeout> | undefined;
  private holdInterval: ReturnType<typeof setInterval> | undefined;
  private onChangeFn: (v: number | null) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    inject(DestroyRef).onDestroy(() => this.stopRepeat());
  }

  // ---------- buttons ----------

  /** Press with a mouse, finger or pen: one step now, then repeat while held (`autoRepeat`). */
  protected pressStart(direction: 1 | -1, event: PointerEvent) {
    if (event.button !== 0) return;
    this.pointerStepped = true;
    this.stopRepeat();
    if (!this.stepBy(direction) || !this.autoRepeat()) return;
    this.holdTimer = setTimeout(() => {
      this.holdInterval = setInterval(() => {
        if (!this.stepBy(direction)) this.stopRepeat();
      }, HOLD_INTERVAL);
    }, HOLD_DELAY);
  }

  protected pressEnd() {
    this.stopRepeat();
  }

  /** A click that did not come from a pointer press (Enter / Space, assistive technology): one step. */
  protected pressClick(direction: 1 | -1) {
    if (this.pointerStepped) {
      this.pointerStepped = false;
      return;
    }
    this.stepBy(direction);
  }

  private stopRepeat() {
    clearTimeout(this.holdTimer);
    clearInterval(this.holdInterval);
    this.holdTimer = undefined;
    this.holdInterval = undefined;
  }

  // ---------- the value field ----------

  protected onInput(event: Event) {
    this.draft.set((event.target as HTMLInputElement).value);
    this.parseFailed.set(false);
  }

  protected onKeydown(event: KeyboardEvent) {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    const act = (change: () => void) => {
      event.preventDefault();
      if (!this.locked()) change();
    };
    switch (event.key) {
      case 'ArrowUp':
        act(() => this.stepBy(1));
        break;
      case 'ArrowDown':
        act(() => this.stepBy(-1));
        break;
      case 'PageUp':
        act(() => this.stepBy(1, PAGE_STEPS));
        break;
      case 'PageDown':
        act(() => this.stepBy(-1, PAGE_STEPS));
        break;
      case 'Home':
        // Without a limit Home keeps its text-field job (caret to the start).
        if (this.min() !== undefined) act(() => this.setTo(this.min()!));
        break;
      case 'End':
        if (this.max() !== undefined) act(() => this.setTo(this.max()!));
        break;
      case 'Enter':
        // Not prevented: a form around the stepper still submits, now with the committed value.
        this.commit();
        break;
      case 'Escape':
        if (this.draft() !== null) {
          // Only swallow Esc when it undoes typing, so it still closes a dialog around the stepper otherwise.
          event.preventDefault();
          event.stopPropagation();
          this.cancelDraft();
        }
        break;
    }
  }

  protected onFocusOut(event: FocusEvent) {
    if (!this.host.contains(event.relatedTarget as Node | null)) this.onTouched();
  }

  /** Apply the typed text. `false` = it is not a number, so it stays on screen with the error state. */
  protected commit(): boolean {
    const text = this.draft();
    if (text === null) return true;
    const trimmed = text.trim();
    if (trimmed === '') {
      this.cancelDraft();
      this.apply(null);
      return true;
    }
    const parsed = parseNumber(trimmed, this.locale());
    if (parsed === null) {
      this.parseFailed.set(true);
      return false;
    }
    this.cancelDraft();
    this.apply(this.normalize(parsed));
    return true;
  }

  private cancelDraft() {
    this.draft.set(null);
    this.parseFailed.set(false);
  }

  /** Move by `multiplier` steps. Returns whether the value changed (the repeat stops when it did not). */
  private stepBy(direction: 1 | -1, multiplier = 1): boolean {
    if (this.locked()) return false;
    // Typed text counts first ("7", then ↑ → 8); text that is not a number is dropped.
    if (!this.commit()) this.cancelDraft();
    const base = this.value() ?? 0;
    return this.apply(this.normalize(base + direction * multiplier * this.stepSize()));
  }

  private setTo(value: number): boolean {
    this.cancelDraft();
    return this.apply(this.normalize(value));
  }

  private normalize(n: number): number {
    const min = this.min();
    const max = this.max();
    let result = n;
    if (min !== undefined && result < min) result = min;
    if (max !== undefined && result > max) result = max;
    return round(result, this.decimals());
  }

  private apply(next: number | null): boolean {
    if (next === this.value()) return false;
    this.value.set(next);
    this.onChangeFn(next);
    return true;
  }

  private formatNumber(value: number | null): string {
    return value === null ? '' : nxtNumber(value, { locale: this.locale(), fractionDigits: this.decimals() });
  }

  // ---------- ControlValueAccessor ----------

  writeValue(value: number | null): void {
    this.value.set(typeof value === 'number' && Number.isFinite(value) ? value : null);
    this.cancelDraft();
  }
  registerOnChange(fn: (v: number | null) => void): void {
    this.onChangeFn = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(disabled: boolean): void {
    this.formDisabled.set(disabled);
  }
}
