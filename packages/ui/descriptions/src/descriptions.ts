import { ChangeDetectionStrategy, Component, ViewEncapsulation, booleanAttribute, input } from '@angular/core';

/**
 * Read-only label–value list for record details (native `dl`). Columns adapt to the list's own width.
 *
 *   <dl nxtDescriptions>
 *     <div nxtDescription label="Mã">KT-TH</div>
 *     <div nxtDescription label="Mô tả" full>…</div>
 *   </dl>
 */
@Component({
  selector: 'dl[nxtDescriptions]',
  template: '<ng-content />',
  styleUrl: './descriptions.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'nxt-descriptions', '[attr.data-columns]': 'columns()' },
})
export class NxtDescriptions {
  /** `auto`: as many columns as fit (each at least `layout.item-min-sm`). */
  readonly columns = input<'auto' | 1 | 2 | 3>('auto');
}

/** One item: label (`dt`) above the projected value (`dd`). Must be a direct child of `dl[nxtDescriptions]`. */
@Component({
  selector: 'div[nxtDescription]',
  template: `
    <dt class="nxt-descriptions__label">{{ label() }}</dt>
    <dd class="nxt-descriptions__value"><ng-content /></dd>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'nxt-descriptions__item', '[attr.data-full]': 'full() || null' },
})
export class NxtDescription {
  readonly label = input.required<string>();
  /** Span the whole row (description, reason, long notes). */
  readonly full = input(false, { transform: booleanAttribute });
}
