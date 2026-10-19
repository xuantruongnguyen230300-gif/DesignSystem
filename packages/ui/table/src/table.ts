import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
} from '@angular/core';
import { NxtIcon, NxtIconName } from '@nxt/ui/icon';

export type NxtSortDirection = 'asc' | 'desc' | '';
export interface NxtSortState {
  active: string;
  direction: NxtSortDirection;
}

/**
 * Data table on native `<table>` (screen readers get real table semantics).
 * Row height follows density; header can stick while scrolling; selected rows use `aria-selected`.
 * Cell helpers: `.nxt-table__num` (right-aligned tabular numbers), `.nxt-table__actions`.
 */
@Component({
  selector: 'table[nxtTable]',
  template: '<ng-content />',
  styleUrl: './table.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'nxt-table', '[attr.data-sticky]': 'stickyHeader() || null' },
})
export class NxtTable {
  /** Keep the header row visible while the table scrolls inside its container. */
  readonly stickyHeader = input(false, { transform: booleanAttribute });
}

/** Holds the sort state for the sortable headers inside it: `[(nxtSort)]="sort"`. */
@Directive({ selector: '[nxtSort]' })
export class NxtSort {
  readonly state = model<NxtSortState>({ active: '', direction: '' }, { alias: 'nxtSort' });

  /** none → ascending → descending → none. */
  toggle(key: string) {
    const s = this.state();
    const direction: NxtSortDirection = s.active !== key ? 'asc' : s.direction === 'asc' ? 'desc' : s.direction === 'desc' ? '' : 'asc';
    this.state.set({ active: direction ? key : '', direction });
  }
}

/** Sortable column header: `<th nxtSortHeader="name">Họ và tên</th>`. Sets aria-sort on the sorted column. */
@Component({
  selector: 'th[nxtSortHeader]',
  imports: [NxtIcon],
  template: `
    <button type="button" class="nxt-sort-header" (click)="sort.toggle(key())">
      <ng-content />
      <nxt-icon class="nxt-sort-header__icon" [name]="icon()" />
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[attr.aria-sort]': 'ariaSort()',
    '[attr.data-sorted]': 'direction() || null',
  },
})
export class NxtSortHeader {
  protected readonly sort = inject(NxtSort);
  readonly key = input.required<string>({ alias: 'nxtSortHeader' });
  protected readonly direction = computed(() => (this.sort.state().active === this.key() ? this.sort.state().direction : ''));
  protected readonly ariaSort = computed(() => (this.direction() === 'asc' ? 'ascending' : this.direction() === 'desc' ? 'descending' : null));
  protected readonly icon = computed<NxtIconName>(() => (this.direction() === 'asc' ? 'arrow-up' : this.direction() === 'desc' ? 'arrow-down' : 'arrows-sort'));
}
