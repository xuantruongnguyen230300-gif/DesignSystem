import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input, numberAttribute } from '@angular/core';

/** Determinate progress (completion rate, quota used). Always has an accessible label. */
@Component({
  selector: 'nxt-progress',
  template: `<span class="nxt-progress__fill" [style.inline-size.%]="percent()"></span>`,
  styleUrl: './progress.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'nxt-progress',
    role: 'progressbar',
    'aria-valuemin': '0',
    'aria-valuemax': '100',
    '[attr.aria-valuenow]': 'percent()',
    '[attr.aria-valuetext]': 'valueText() || null',
    '[attr.aria-label]': 'label()',
    '[attr.data-tone]': 'tone()',
  },
})
export class NxtProgress {
  /** 0–100. */
  readonly value = input(0, { transform: numberAttribute });
  readonly label = input.required<string>();
  /** Spoken value, e.g. "92 trên 100 hồ sơ". */
  readonly valueText = input<string>();
  readonly tone = input<'brand' | 'success' | 'warning' | 'danger'>('brand');
  protected readonly percent = computed(() => Math.max(0, Math.min(100, Math.round(this.value()))));
}
