import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Directive,
  ElementRef,
  ViewEncapsulation,
  afterNextRender,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
  numberAttribute,
  signal,
} from '@angular/core';
import { NxtIcon, NxtIconName } from '@nxt/ui/icon';

export type NxtSortDirection = 'asc' | 'desc' | '';
/** `tr[data-highlight]`: a strip at the start of the row. Always explain it with text in the row. */
export type NxtRowHighlight = 'danger' | 'warning' | 'success' | 'info';
export interface NxtSortState {
  active: string;
  direction: NxtSortDirection;
}

/**
 * Data table on native `<table>` (screen readers get real table semantics).
 * Row height follows density; header can stick while scrolling; selected rows use `aria-selected`.
 * Cell helpers: `.nxt-table__num` (right-aligned tabular numbers: numbers, money, dates), `.nxt-table__select`,
 * `.nxt-table__wrap`, `.nxt-table__sticky` (pinned to the start while scrolling sideways: select + identifier).
 * Rows: `tr[data-highlight="danger|warning|success|info"]` (strip at the start; explain it with text in the row),
 * `tr[aria-current="true"]` (the row open in the drawer / detail pane).
 * Row actions: `th/td[nxtRowActions]` (`.nxt-table__actions` is deprecated).
 */
@Component({
  selector: 'table[nxtTable]',
  template: '<ng-content />',
  styleUrl: './table.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'nxt-table',
    '[attr.data-sticky]': 'stickyHeader() || null',
    '[attr.data-loading]': 'loading() || null',
    '[attr.aria-busy]': 'loading() || null',
  },
})
export class NxtTable {
  /** Keep the header row visible while the table scrolls inside its container. */
  readonly stickyHeader = input(false, { transform: booleanAttribute });
  /**
   * Data is loading: `aria-busy`; the rows shown fade and cannot be clicked (a reload after a page / sort / filter
   * change keeps the layout still). For the first load put `<tbody nxtTablePlaceholder>` in place of the rows.
   */
  readonly loading = input(false, { transform: booleanAttribute });
}

/**
 * Scrolling region of a table: vertical and horizontal scrollbars stay inside the grid, the sticky header
 * stays visible, keyboard users can scroll it (focusable, named region). With `fill` it takes the free
 * height of its flex-column parent (`nxt-card fill`, `nxtFill`), never less than a usable minimum.
 */
@Component({
  selector: 'nxt-table-scroll',
  template: '<ng-content />',
  styleUrl: './table.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'nxt-table-scroll',
    role: 'region',
    tabindex: '0',
    '[attr.aria-label]': 'label()',
    '[attr.data-fill]': 'fill() || null',
    '[attr.data-scrolled]': 'scrolled() || null',
  },
})
export class NxtTableScroll {
  /** Accessible name of the region, e.g. "Bảng chức danh". */
  readonly label = input.required<string>();
  /** Fill the free height of a flex-column parent; rows scroll inside. */
  readonly fill = input(false, { transform: booleanAttribute });
  /** Scrolled sideways away from the start: pinned columns (`.nxt-table__sticky`) show a divider. */
  protected readonly scrolled = signal(false);

  constructor() {
    const host: HTMLElement = inject(ElementRef).nativeElement;
    const destroyRef = inject(DestroyRef);
    // Passive listener that touches the signal only when the answer changes: no change detection per scroll event.
    afterNextRender(() => {
      const onScroll = () => {
        const scrolled = Math.abs(host.scrollLeft) > 0;
        if (scrolled !== this.scrolled()) this.scrolled.set(scrolled);
      };
      host.addEventListener('scroll', onScroll, { passive: true });
      destroyRef.onDestroy(() => host.removeEventListener('scroll', onScroll));
    });
  }
}

/**
 * Placeholder rows for the first load: `<tbody nxtTablePlaceholder [columns]="7">` in place of the data rows,
 * with `loading` on the table. Bars at the row height of the density, hidden from screen readers (the table is
 * `aria-busy`; announce "Đang tải…" in a status region).
 */
@Component({
  selector: 'tbody[nxtTablePlaceholder]',
  template: `
    @for (r of rowList(); track r) {
      <tr>
        @for (c of columnList(); track c) {
          <td><span class="nxt-table__placeholder-bar"></span></td>
        }
      </tr>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'nxt-table-placeholder', 'aria-hidden': 'true' },
})
export class NxtTablePlaceholder {
  /** Cells per row: the number of columns shown. */
  readonly columns = input.required({ transform: numberAttribute });
  /** Rows to show, usually the page size (at most 50). */
  readonly rows = input(5, { transform: numberAttribute });
  protected readonly rowList = computed(() => range(this.rows()));
  protected readonly columnList = computed(() => range(this.columns()));
}

const range = (n: number) => Array.from({ length: Math.max(0, Math.min(Math.floor(n) || 0, 50)) }, (_, i) => i);

/**
 * Row actions, the last cell of each row: `<th scope="col" nxtRowActions></th>` in the header,
 * `<td nxtRowActions>…icon buttons…</td>` in each row.
 *
 * `reveal="hover"` (default, devices with hover): the cell takes no column width; its buttons float at the end
 * of the visible part of the row while the row is hovered, holds focus or has a menu open (Gmail, Outlook):
 * no scrolling sideways to the last column. Escape hides them until the pointer leaves the row (WCAG 1.4.13).
 * `reveal="always"`, and touch devices: a column pinned to the end of the scroll region, always visible.
 */
@Component({
  selector: 'th[nxtRowActions], td[nxtRowActions]',
  template: `
    @if (header) {
      <span class="nxt-visually-hidden">{{ label() }}</span>
    } @else {
      <div class="nxt-row-actions__bar"><ng-content /></div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'nxt-row-actions',
    '[attr.data-reveal]': 'reveal()',
    '[attr.data-dismissed]': 'dismissed() || null',
    '(document:keydown.escape)': 'dismiss()',
  },
})
export class NxtRowActions {
  /** `hover`: shown on row hover / focus, takes no column width. `always`: a pinned column, always visible. */
  readonly reveal = input<'hover' | 'always'>('hover');
  /** Header cell only: accessible column name (visually hidden). */
  readonly label = input('Thao tác');

  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  private readonly destroyRef = inject(DestroyRef);
  protected readonly header = this.host.tagName === 'TH';
  /** Escape pressed while hovering the row: stay hidden until the pointer leaves it. */
  protected readonly dismissed = signal(false);
  private hovered = false;

  constructor() {
    if (this.header) return;
    // The row is the hover target. Listen on it once the cell is attached to it (after the first render).
    afterNextRender(() => {
      const row = this.host.parentElement;
      if (!row) return;
      const enter = () => (this.hovered = true);
      const leave = () => {
        this.hovered = false;
        this.dismissed.set(false);
      };
      row.addEventListener('mouseenter', enter);
      row.addEventListener('mouseleave', leave);
      this.destroyRef.onDestroy(() => {
        row.removeEventListener('mouseenter', enter);
        row.removeEventListener('mouseleave', leave);
      });
    });
  }

  /** Hide what hover revealed. Never while focus is inside: focus must not sit on an invisible button. */
  protected dismiss() {
    if (this.header || this.dismissed() || !this.hovered || this.host.contains(document.activeElement)) return;
    this.dismissed.set(true);
  }
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

  /**
   * Keep only these keys: after deleting rows, reloading data, or when search / filters / the view change the
   * results (rows the user can no longer see are never acted on). Returns how many keys were dropped.
   */
  retain(keys: Iterable<K>): number {
    const keep = new Set(keys);
    const before = this.selected();
    const next = new Set([...before].filter((k) => keep.has(k)));
    if (next.size !== before.size) this.selected.set(next);
    return before.size - next.size;
  }

  clear() {
    this.selected.set(new Set());
    this.anchor = null;
  }
}
