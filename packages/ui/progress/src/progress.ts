import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  numberAttribute,
} from '@angular/core';

/** Keep in sync with packages/ui/progress/SPEC.md → "Variants & sizes". */
export type NxtProgressTone = 'brand' | 'success' | 'warning' | 'danger';
/** Bar (horizontal track) or circle (ring). */
export type NxtProgressShape = 'bar' | 'circle';
/** Ring diameter; the density mode scales it. Not used by the bar. */
export type NxtProgressSize = 'sm' | 'md' | 'lg';

/**
 * Progress: a bar or a ring that shows how far a task or quantity has got.
 *
 * - Determinate (default): `value` 0–100.
 * - `indeterminate`: unknown progress; looping motion, no `aria-valuenow`, `value` is ignored.
 * - `shape="circle"`: a ring (`size` sm | md | lg); short content is projected into its centre.
 *
 * Always has an accessible label. The ring SVG is decorative (`aria-hidden`).
 */
@Component({
  selector: 'nxt-progress',
  template: `
    @if (shape() === 'circle') {
      <!-- viewBox 100 + pathLength 100: the geometry and the dash lengths are percentages of the ring. -->
      <svg class="nxt-progress__ring" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
        <circle class="nxt-progress__ring-track" cx="50" cy="50" r="45" />
        <circle
          class="nxt-progress__ring-fill"
          cx="50"
          cy="50"
          r="45"
          pathLength="100"
          transform="rotate(-90 50 50)"
          [attr.stroke-dasharray]="indeterminate() ? null : percent() + ' 100'"
        />
      </svg>
      <span class="nxt-progress__label"><ng-content /></span>
    } @else {
      <span class="nxt-progress__fill" [style.inline-size.%]="indeterminate() ? null : percent()"></span>
    }
  `,
  styleUrl: './progress.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'nxt-progress',
    role: 'progressbar',
    'aria-valuemin': '0',
    'aria-valuemax': '100',
    // No aria-valuenow = indeterminate (WAI-ARIA 1.2).
    '[attr.aria-valuenow]': 'indeterminate() ? null : percent()',
    '[attr.aria-valuetext]': 'valueText() || null',
    '[attr.aria-label]': 'label()',
    '[attr.data-tone]': 'tone()',
    '[attr.data-shape]': 'shape()',
    '[attr.data-size]': "shape() === 'circle' ? size() : null",
    '[attr.data-indeterminate]': 'indeterminate() || null',
  },
})
export class NxtProgress {
  /** 0–100; rounded and clamped. Ignored while `indeterminate`. */
  readonly value = input(0, { transform: numberAttribute });
  /** Accessible name (`aria-label`): what is being measured, or the task that is running. */
  readonly label = input.required<string>();
  /** Spoken value, e.g. "92 trên 100 hồ sơ". */
  readonly valueText = input<string>();
  readonly tone = input<NxtProgressTone>('brand');
  /** Progress is unknown: looping motion, no `aria-valuenow`. */
  readonly indeterminate = input(false, { transform: booleanAttribute });
  /** `bar` (default) or `circle`. */
  readonly shape = input<NxtProgressShape>('bar');
  /** Ring diameter (`shape="circle"` only): sm | md | lg, scaled by density. */
  readonly size = input<NxtProgressSize>('md');
  protected readonly percent = computed(() => Math.max(0, Math.min(100, Math.round(this.value()))));
}
