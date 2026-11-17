import {
  ChangeDetectionStrategy,
  Component,
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
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { nxtNumber, nxtUnit } from '@nxt/ui/format';
import { NxtIcon, NxtIconName } from '@nxt/ui/icon';

/** Turns a value into the words shown next to the slider and read by screen readers. */
export type NxtSliderValueFormat = (value: number) => string;

let nextId = 0;

/** Page Up / Page Down move this many steps. */
const PAGE_STEPS = 10;

/** Number of decimal places a number is written with (0.25 → 2, 1e-7 → 7). */
function decimalsOf(n: number): number {
  if (!Number.isFinite(n)) return 0;
  const [mantissa, exponent] = String(n).split('e-');
  const fraction = mantissa.split('.')[1]?.length ?? 0;
  return fraction + (exponent ? Number(exponent) : 0);
}

const round = (n: number, decimals: number) => Number(n.toFixed(Math.min(decimals, 20)));

/** `numberAttribute` that stays `undefined` when the attribute is absent, empty or not numeric. */
function numberAttributeOrUndefined(value: unknown): number | undefined {
  if (value === null || value === undefined || value === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

/**
 * Pick one value in a range by dragging or pressing a thumb on a track, when position matters more than an exact
 * number. A `div role="slider"` (the only tab stop): arrows ± step, Page Up / Down ± 10 steps, Home / End to the limits.
 * Optional labels or icons at both ends and a value readout. Pointer drag has a keyboard equivalent. Works with
 * `[(value)]` or Angular forms. For an exact number use `nxt-stepper` or a text field.
 */
@Component({
  selector: 'nxt-slider',
  imports: [NxtIcon],
  template: `
    <div class="nxt-slider__header">
      <!-- A span, not a label: a div[role=slider] is not labelable, so aria-labelledby names it. -->
      <span class="nxt-slider__label" [id]="labelId" [class.nxt-visually-hidden]="hideLabel()" (click)="focusControl()">
        {{ label() }}
      </span>
      @if (showValue()) {
        <!-- aria-valuetext already says it: hidden so the value is not read twice. -->
        <span class="nxt-slider__value" aria-hidden="true">{{ valueText() }}</span>
      }
    </div>
    <div class="nxt-slider__row">
      @if (minLabel() || minIcon()) {
        <span class="nxt-slider__end" data-end="min">
          @if (minIcon(); as icon) {
            <nxt-icon [name]="icon" />
          }
          @if (minLabel()) {
            {{ minLabel() }}
          }
        </span>
      }
      <div
        #control
        class="nxt-slider__control"
        role="slider"
        aria-orientation="horizontal"
        [attr.tabindex]="isDisabled() ? null : 0"
        [attr.aria-labelledby]="labelId"
        [attr.aria-valuenow]="current()"
        [attr.aria-valuemin]="lower()"
        [attr.aria-valuemax]="upper()"
        [attr.aria-valuetext]="valueText()"
        [attr.aria-describedby]="hint() ? hintId : null"
        [attr.aria-readonly]="readonly() || null"
        [attr.aria-disabled]="isDisabled() || null"
        [style.--_pct]="fraction()"
        (keydown)="onKeydown($event)"
        (pointerdown)="onPointerDown($event)"
        (pointermove)="onPointerMove($event)"
        (pointerup)="endDrag($event)"
        (pointercancel)="endDrag($event)"
        (lostpointercapture)="endDrag($event)"
        (blur)="onTouched()"
      >
        <div #track class="nxt-slider__track" aria-hidden="true">
          <span class="nxt-slider__fill"></span>
          <span #thumb class="nxt-slider__thumb"></span>
        </div>
      </div>
      @if (maxLabel() || maxIcon()) {
        <span class="nxt-slider__end" data-end="max">
          @if (maxIcon(); as icon) {
            <nxt-icon [name]="icon" />
          }
          @if (maxLabel()) {
            {{ maxLabel() }}
          }
        </span>
      }
    </div>
    @if (hint()) {
      <p class="nxt-slider__hint" [id]="hintId">{{ hint() }}</p>
    }
  `,
  styleUrl: './slider.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => NxtSlider), multi: true }],
  host: {
    class: 'nxt-slider',
    '[attr.data-disabled]': 'isDisabled() || null',
    '[attr.data-readonly]': 'readonly() || null',
  },
})
export class NxtSlider implements ControlValueAccessor {
  /** The value (two-way). Always shown clamped to `min`–`max`. */
  readonly value = model(0);
  /** What is being chosen, as a noun: "Ngưỡng cảnh báo quá hạn". */
  readonly label = input.required<string>();
  /** Visually hide the label (still announced) when a heading right above already names it. */
  readonly hideLabel = input(false, { transform: booleanAttribute });
  /** Lower limit. */
  readonly min = input(0, { transform: (value: unknown) => numberAttribute(value, 0) });
  /** Upper limit. */
  readonly max = input(100, { transform: (value: unknown) => numberAttribute(value, 100) });
  /** Size of one step for the arrow keys; dragging snaps to it too. Page Up / Down move 10 steps. A value of 0 or less counts as 1. */
  readonly step = input(1, { transform: (value: unknown) => numberAttribute(value, 1) });
  /** Show the current value at the end of the label row. */
  readonly showValue = input(false, { transform: booleanAttribute });
  /** Unit written after the number: "%", "ngày". */
  readonly unit = input<string>();
  /** Decimal places shown and rounded to. Default: as many as `step` and `min` have. */
  readonly fractionDigits = input(undefined, { transform: numberAttributeOrUndefined });
  /** Words for a value when the number alone says too little (1–5 → "Rất thấp" … "Rất cao"). Used for the readout and aria-valuetext. */
  readonly formatValue = input<NxtSliderValueFormat>();
  /** `Intl` locale used to show the number. */
  readonly locale = input('vi-VN');
  /** Short text before the track that says what the low end means: "Ít". */
  readonly minLabel = input<string>();
  /** Short text after the track that says what the high end means: "Nhiều". */
  readonly maxLabel = input<string>();
  /** Icon before the track (decorative). */
  readonly minIcon = input<NxtIconName>();
  /** Icon after the track (decorative). */
  readonly maxIcon = input<NxtIconName>();
  /** How to read the scale or what changing it does, read after the name and value. */
  readonly hint = input<string>();
  readonly disabled = input(false, { transform: booleanAttribute });
  /** The position is visible and focusable but cannot be changed. */
  readonly readonly = input(false, { transform: booleanAttribute });

  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  private readonly controlRef = viewChild.required<ElementRef<HTMLElement>>('control');
  private readonly trackRef = viewChild.required<ElementRef<HTMLElement>>('track');
  private readonly thumbRef = viewChild.required<ElementRef<HTMLElement>>('thumb');
  private readonly id = `nxt-slider-${nextId++}`;
  protected readonly labelId = `${this.id}-label`;
  protected readonly hintId = `${this.id}-hint`;

  private readonly formDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled());
  private readonly locked = computed(() => this.readonly() || this.isDisabled());

  protected readonly lower = computed(() => this.min());
  /** A `max` at or below `min` leaves a one-value range. */
  protected readonly upper = computed(() => Math.max(this.min(), this.max()));
  private readonly stepSize = computed(() => {
    const step = this.step();
    return Number.isFinite(step) && step > 0 ? step : 1;
  });
  private readonly decimals = computed(() => this.fractionDigits() ?? Math.max(decimalsOf(this.stepSize()), decimalsOf(this.min())));

  /** The value as shown and announced: clamped into the range. */
  protected readonly current = computed(() => this.normalize(Number.isFinite(this.value()) ? this.value() : this.lower()));
  /** 0 at `min`, 1 at `max`: drives the thumb and fill position in CSS. */
  protected readonly fraction = computed(() => {
    const span = this.upper() - this.lower();
    return span > 0 ? (this.current() - this.lower()) / span : 0;
  });
  protected readonly valueText = computed(() => {
    const value = this.current();
    const format = this.formatValue();
    if (format) return format(value);
    const options = { locale: this.locale(), fractionDigits: this.decimals() };
    return this.unit() ? nxtUnit(value, this.unit()!, options) : nxtNumber(value, options);
  });

  private dragging = false;
  /** Distance between the press and the thumb's centre when the thumb itself was grabbed, so it does not jump. */
  private grabOffset = 0;
  private onChangeFn: (v: number) => void = () => {};
  protected onTouched: () => void = () => {};

  protected focusControl() {
    this.controlRef().nativeElement.focus();
  }

  // ---------- keyboard ----------

  protected onKeydown(event: KeyboardEvent) {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    const rtl = this.isRtl();
    const step = this.stepSize();
    const current = this.current();
    let next: number;
    switch (event.key) {
      // Left / Right follow what the eye sees: in a right-to-left page the low end is on the right.
      case 'ArrowRight':
        next = current + (rtl ? -step : step);
        break;
      case 'ArrowLeft':
        next = current + (rtl ? step : -step);
        break;
      case 'ArrowUp':
        next = current + step;
        break;
      case 'ArrowDown':
        next = current - step;
        break;
      case 'PageUp':
        next = current + PAGE_STEPS * step;
        break;
      case 'PageDown':
        next = current - PAGE_STEPS * step;
        break;
      case 'Home':
        next = this.lower();
        break;
      case 'End':
        next = this.upper();
        break;
      default:
        return;
    }
    // The page must not scroll with these keys while the slider has focus, even when it cannot change.
    event.preventDefault();
    if (!this.locked()) this.setValue(this.normalize(next));
  }

  // ---------- pointer ----------

  protected onPointerDown(event: PointerEvent) {
    if (event.button !== 0) return;
    // A div[tabindex] takes focus on press by itself; this also covers presses that start on the thumb or label.
    if (!this.isDisabled()) this.focusControl();
    if (this.locked()) return;
    this.dragging = true;
    this.controlRef().nativeElement.setPointerCapture?.(event.pointerId);
    const thumb = this.thumbRef().nativeElement;
    const grabbed = event.target instanceof Node && thumb.contains(event.target);
    this.grabOffset = grabbed ? event.clientX - this.centreOf(thumb) : 0;
    this.moveTo(event.clientX - this.grabOffset);
  }

  protected onPointerMove(event: PointerEvent) {
    if (this.dragging) this.moveTo(event.clientX - this.grabOffset);
  }

  protected endDrag(event: PointerEvent) {
    if (!this.dragging) return;
    this.dragging = false;
    const control = this.controlRef().nativeElement;
    if (control.hasPointerCapture?.(event.pointerId)) control.releasePointerCapture(event.pointerId);
  }

  private centreOf(el: HTMLElement): number {
    const rect = el.getBoundingClientRect();
    return rect.left + rect.width / 2;
  }

  /** Set the value for a pointer at `clientX`, mapping the track (minus the thumb, so the thumb stays inside it). */
  private moveTo(clientX: number) {
    const track = this.trackRef().nativeElement.getBoundingClientRect();
    const thumbSize = this.thumbRef().nativeElement.offsetWidth;
    const usable = track.width - thumbSize;
    if (usable <= 0) return;
    const offset = this.isRtl() ? track.right - clientX : clientX - track.left;
    const fraction = Math.min(1, Math.max(0, (offset - thumbSize / 2) / usable));
    this.setValue(this.snap(this.lower() + fraction * (this.upper() - this.lower())));
  }

  /** Nearest step from `min`; the upper limit counts as a stop too, so it is reachable when it is off the grid. */
  private snap(raw: number): number {
    const step = this.stepSize();
    const grid = this.normalize(this.lower() + Math.round((raw - this.lower()) / step) * step);
    return Math.abs(this.upper() - raw) < Math.abs(grid - raw) ? this.upper() : grid;
  }

  private isRtl(): boolean {
    return getComputedStyle(this.host).direction === 'rtl';
  }

  // ---------- value ----------

  private normalize(n: number): number {
    return round(Math.min(this.upper(), Math.max(this.lower(), n)), this.decimals());
  }

  private setValue(next: number) {
    if (next === this.value()) return;
    this.value.set(next);
    this.onChangeFn(next);
  }

  // ---------- ControlValueAccessor ----------

  writeValue(value: number | null): void {
    this.value.set(typeof value === 'number' && Number.isFinite(value) ? value : this.lower());
  }
  registerOnChange(fn: (v: number) => void): void {
    this.onChangeFn = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(disabled: boolean): void {
    this.formDisabled.set(disabled);
  }
}
