import { ChangeDetectionStrategy, Component, ViewEncapsulation, input, numberAttribute } from '@angular/core';
import { NxtIcon, NxtIconName } from '@nxt/ui/icon';

/**
 * No data to show — explains why and offers the next step (`[nxtEmptyActions]`).
 * Distinguish "first use" (create the first record) from "no results" (clear filters).
 */
@Component({
  selector: 'nxt-empty-state',
  imports: [NxtIcon],
  template: `
    <span class="nxt-empty-state__icon" aria-hidden="true"><nxt-icon [name]="icon()" /></span>
    @switch (headingLevel()) {
      @case (3) {
        <h3 class="nxt-empty-state__title">{{ title() }}</h3>
      }
      @default {
        <h2 class="nxt-empty-state__title">{{ title() }}</h2>
      }
    }
    @if (description()) {
      <p class="nxt-empty-state__text">{{ description() }}</p>
    }
    <div class="nxt-empty-state__actions"><ng-content select="[nxtEmptyActions]" /></div>
  `,
  styleUrl: './empty-state.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'nxt-empty-state', '[attr.data-size]': 'size()', '[attr.title]': 'null' },
})
export class NxtEmptyState {
  readonly title = input.required<string>();
  readonly description = input<string>();
  readonly icon = input<NxtIconName>('inbox');
  readonly headingLevel = input(2, { transform: numberAttribute });
  readonly size = input<'sm' | 'md'>('md');
}
