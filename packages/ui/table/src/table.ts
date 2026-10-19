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
  signal,
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

/**
 * Row selection for tables, keyed by a stable id (code, id). Plain signals, no DOM.
 * `select(key, checked, { range: true, order })` applies the new state to every row between the last
 * row the user toggled and this one — Shift+click in Gmail and Windows Explorer.
 *
 *   readonly selection = new NxtSelection<string>();
 *   <nxt-checkbox [checked]="selection.has(r.code)" (toggled)="selection.select(r.code, $event.checked, { range: $event.shiftKey, order: pageKeys() })" />
 */
export class NxtSelection<K = string> {
  readonly selected = signal<ReadonlySet<K>>(new Set());
  readonly count = computed(() => this.selected().size);
  private anchor: K | null = null;

  has(key: K): boolean {
    return this.selected().has(key);
  }

  select(key: K, checked: boolean, options: { range?: boolean; order?: readonly K[] } = {}) {
    const { range = false, order = [] } = options;
    const from = this.anchor === null ? -1 : order.indexOf(this.anchor);
    const to = order.indexOf(key);
    const keys = range && from >= 0 && to >= 0 ? order.slice(Math.min(from, to), Math.max(from, to) + 1) : [key];
    this.setMany(keys, checked);
    this.anchor = key;
  }

  /** Select or deselect many rows at once (header checkbox: the rows on the current page). */
  setMany(keys: Iterable<K>, checked: boolean) {
    const next = new Set(this.selected());
    for (const k of keys) {
      if (checked) next.add(k);
      else next.delete(k);
    }
    this.selected.set(next);
  }

  allSelected(keys: readonly K[]): boolean {
    return keys.length > 0 && keys.every((k) => this.has(k));
  }

  someSelected(keys: readonly K[]): boolean {
    return keys.some((k) => this.has(k)) && !this.allSelected(keys);
  }

  /** Drop keys that no longer exist (after deleting rows or reloading data). */
  retain(keys: Iterable<K>) {
    const keep = new Set(keys);
    this.selected.set(new Set([...this.selected()].filter((k) => keep.has(k))));
  }

  clear() {
    this.selected.set(new Set());
    this.anchor = null;
  }
}
