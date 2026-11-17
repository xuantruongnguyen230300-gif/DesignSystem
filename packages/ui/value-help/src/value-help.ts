import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  afterNextRender,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
  numberAttribute,
  output,
  viewChild,
} from '@angular/core';
import { NxtButton } from '@nxt/ui/button';
import { NxtCheckbox } from '@nxt/ui/checkbox';
import { NxtHighlightPart, nxtHighlight } from '@nxt/ui/combobox';
import { NxtEmptyState } from '@nxt/ui/empty-state';
import { NxtIcon } from '@nxt/ui/icon';
import { NxtSearch, nxtMatches } from '@nxt/ui/search';
import { NxtTable, NxtTablePlaceholder, NxtTableScroll } from '@nxt/ui/table';

/** One column of the value help table. Code and name first; at most 4–5 columns. */
export interface NxtValueHelpColumn<T> {
  id: string;
  header: string;
  /** Cell value; empty shows "—". Searched (local mode). */
  value: (item: T) => string | number | null | undefined;
  /** Amounts and counts: right-aligned, tabular figures. */
  numeric?: boolean;
  /** The column that names the row (`th scope="row"`; the pick button when choosing one). Default: first column. */
  rowHeader?: boolean;
}

/** Every text the value help shows or announces (i18n). */
export interface NxtValueHelpTexts {
  search: string;
  searchPlaceholder: string;
  summary: (shown: number, total: number) => string;
  loading: string;
  selected: (count: number) => string;
  clearSelection: string;
  selectAll: string;
  /** Name of a row checkbox (multiple). */
  select: (label: string) => string;
  /** Name of the pick button in a row (single). */
  pick: (label: string) => string;
  emptyTitle: (query: string) => string;
  emptyHint: string;
  clearSearch: string;
}

const count = new Intl.NumberFormat('vi-VN');

const TEXTS: NxtValueHelpTexts = {
  search: 'Tìm kiếm',
  searchPlaceholder: 'Tìm theo mọi cột',
  summary: (shown, total) =>
    total === 0
      ? 'Không có kết quả'
      : shown < total
        ? `Hiện ${count.format(shown)} / ${count.format(total)} kết quả. Gõ thêm để thu hẹp.`
        : `${count.format(total)} kết quả`,
  loading: 'Đang tải…',
  selected: (n) => `Đã chọn: ${count.format(n)}`,
  clearSelection: 'Bỏ chọn tất cả',
  selectAll: 'Chọn tất cả kết quả đang hiện',
  select: (label) => `Chọn ${label}`,
  pick: (label) => `Chọn ${label}`,
  emptyTitle: (query) => (query.trim() ? `Không có kết quả khớp “${query.trim()}”` : 'Chưa có dữ liệu'),
  emptyHint: 'Thử tìm theo mã, hoặc gõ ít chữ hơn.',
  clearSearch: 'Xoá tìm kiếm',
};

interface Row<T, K> {
  item: T;
  key: K;
  label: string;
  cells: NxtHighlightPart[][];
}

/**
 * Choose one or several records from a large catalogue with several attributes (employees: code, name,
 * department, title): a search box over every column, a result count and a native table. Choosing one is done
 * with a single click; choosing several uses checkboxes, "Đã chọn: N" and the container's "Chọn" / "Huỷ".
 * Content only: put it in `NxtDialog` (field on a page) or make it a step inside the drawer (`step`; NXT never
 * opens a dialog from a drawer).
 */
@Component({
  selector: 'nxt-value-help',
  imports: [NxtButton, NxtCheckbox, NxtEmptyState, NxtIcon, NxtSearch, NxtTable, NxtTablePlaceholder, NxtTableScroll],
  template: `
    <div class="nxt-value-help__search" (keydown)="onSearchKeydown($event)">
      <nxt-search [label]="t().search" [placeholder]="t().searchPlaceholder" [debounce]="debounce()" [(value)]="query" (submitted)="onSubmit()" />
    </div>
    @if (hint()) {
      <p class="nxt-value-help__hint">{{ hint() }}</p>
    }
    <div class="nxt-value-help__bar">
      <p class="nxt-value-help__summary" role="status">{{ summary() }}</p>
      @if (multiple()) {
        <div class="nxt-value-help__selection">
          <span role="status">{{ t().selected(values().length) }}</span>
          @if (values().length) {
            <button nxtButton variant="ghost" size="sm" type="button" (click)="clearSelection()">{{ t().clearSelection }}</button>
          }
        </div>
      }
    </div>
    <nxt-table-scroll class="nxt-value-help__scroll" [label]="caption()">
      <table nxtTable stickyHeader [loading]="loading()" [attr.aria-label]="caption()">
        <thead>
          <tr>
            @if (multiple()) {
              <th scope="col" class="nxt-table__select">
                <nxt-checkbox
                  hideLabel
                  [label]="t().selectAll"
                  [checked]="allShown()"
                  [indeterminate]="someShown()"
                  [disabled]="!rows().length"
                  (checkedChange)="setShown($event)"
                />
              </th>
            }
            @for (c of columns(); track c.id) {
              <th scope="col" [class.nxt-table__num]="c.numeric">{{ c.header }}</th>
            }
          </tr>
        </thead>
        @if (loading() && !rows().length) {
          <tbody nxtTablePlaceholder [columns]="columnCount()"></tbody>
        }
        <tbody #body (keydown)="onRowsKeydown($event)">
          @for (row of rows(); track row.key) {
            <tr
              data-row
              [attr.aria-selected]="multiple() ? isSelected(row.key) : null"
              [attr.aria-current]="!multiple() && row.key === value() ? 'true' : null"
              (click)="onRowClick(row, $event)"
            >
              @if (multiple()) {
                <td class="nxt-table__select">
                  <nxt-checkbox
                    hideLabel
                    [label]="t().select(row.label)"
                    [checked]="isSelected(row.key)"
                    (toggled)="toggle(row, $event.checked, $event.shiftKey)"
                  />
                </td>
              }
              @for (c of columns(); track c.id; let ci = $index) {
                @if (ci === headerIndex()) {
                  <th scope="row" [class.nxt-table__num]="c.numeric">
                    @if (multiple()) {
                      @for (p of row.cells[ci]; track $index) {<span [class.nxt-value-help__match]="p.match">{{ p.text }}</span>}
                    } @else {
                      <button type="button" class="nxt-value-help__pick" [attr.aria-label]="t().pick(row.label)" (click)="pick(row)">
                        @for (p of row.cells[ci]; track $index) {<span [class.nxt-value-help__match]="p.match">{{ p.text }}</span>}
                      </button>
                      @if (row.key === value()) {
                        <nxt-icon class="nxt-value-help__current" name="check" />
                      }
                    }
                  </th>
                } @else {
                  <td [class.nxt-table__num]="c.numeric">
                    @for (p of row.cells[ci]; track $index) {<span [class.nxt-value-help__match]="p.match">{{ p.text }}</span>}
                  </td>
                }
              }
            </tr>
          }
          @if (!loading() && !rows().length) {
            <tr class="nxt-value-help__empty">
              <td [attr.colspan]="columnCount()">
                <nxt-empty-state size="sm" icon="search" [headingLevel]="3" [title]="t().emptyTitle(query())" [description]="t().emptyHint">
                  @if (query().trim()) {
                    <button nxtEmptyActions nxtButton type="button" (click)="clearSearch()">{{ t().clearSearch }}</button>
                  }
                </nxt-empty-state>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </nxt-table-scroll>
  `,
  styleUrl: './value-help.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'nxt-value-help',
    '[attr.data-step]': 'step() || null',
    '[attr.data-multiple]': 'multiple() || null',
    '(keydown.escape)': 'onEscape($event)',
  },
})
export class NxtValueHelp<T, K = string> {
  /** Records: all of them (`local`), or what the server returned for `query` (`server`). */
  readonly items = input<readonly T[]>([]);
  /** Columns shown, code and name first, at most 4–5. */
  readonly columns = input.required<readonly NxtValueHelpColumn<T>[]>();
  /** Key stored for a record. */
  readonly itemKey = input.required<(item: T) => K>();
  /** Name read out for a record: "Chọn Nguyễn Văn An". */
  readonly itemLabel = input.required<(item: T) => string>();
  /** Accessible name of the table and its scrolling region: "Nhân viên". */
  readonly caption = input.required<string>();
  /** Choose several records with checkboxes. */
  readonly multiple = input(false, { transform: booleanAttribute });
  /** Single choice: the field's current value (marked in the table); set when a row is picked. */
  readonly value = model<K | null>(null);
  /** Multiple: the draft selection. Apply it to the field only when the user presses "Chọn". */
  readonly values = model<K[]>([]);
  /** Search text; start it with what the user typed in the field. */
  readonly query = model('');
  /** `local`: filter `items` here, over every column. `server`: show `items` as given, reload them on `query`. */
  readonly searchMode = input<'local' | 'server'>('local');
  /** Delay before `query` updates while typing, in ms: 0 for local data, about 250 for a server. */
  readonly debounce = input(0, { transform: numberAttribute });
  /** Records are loading: the table is aria-busy; placeholder rows until the first results arrive. */
  readonly loading = input(false, { transform: booleanAttribute });
  /** Server mode: how many records match in total, for "Hiện 50 / 1.250 kết quả". */
  readonly total = input<number>();
  /** Local mode: most rows shown at once; more results ask the user to type more. */
  readonly limit = input(200, { transform: numberAttribute });
  /** Note under the search box, e.g. a fixed filter: "Chỉ hiện nhân viên đang làm việc". */
  readonly hint = input<string>();
  /** A step inside a drawer: search gets focus on show; Escape (empty search) emits `cancelled` instead of closing the drawer. */
  readonly step = input(false, { transform: booleanAttribute });
  /** Texts shown or announced (i18n); missing keys use the Vietnamese defaults. */
  readonly texts = input<Partial<NxtValueHelpTexts>>({});

  /** Single choice: a row was picked (`value` is already set). Close the dialog / go back to the form. */
  readonly picked = output<T>();
  /** Step mode: Escape with an empty search — go back to the form. */
  readonly cancelled = output<void>();

  protected readonly t = computed<NxtValueHelpTexts>(() => ({ ...TEXTS, ...this.texts() }));
  private readonly search = viewChild.required(NxtSearch);
  private readonly body = viewChild.required<ElementRef<HTMLElement>>('body');

  protected readonly headerIndex = computed(() => Math.max(0, this.columns().findIndex((c) => c.rowHeader)));
  protected readonly columnCount = computed(() => this.columns().length + (this.multiple() ? 1 : 0));

  private readonly filtered = computed(() => {
    const query = this.query();
    const items = this.items();
    if (this.searchMode() === 'server' || !query.trim()) return items;
    const columns = this.columns();
    return items.filter((item) => nxtMatches(query, ...columns.map((c) => c.value(item))));
  });
  private readonly resultCount = computed(() => (this.searchMode() === 'server' ? (this.total() ?? this.items().length) : this.filtered().length));

  protected readonly rows = computed<Row<T, K>[]>(() => {
    const list = this.searchMode() === 'local' ? this.filtered().slice(0, this.limit()) : this.filtered();
    const query = this.query().trim();
    const columns = this.columns();
    const key = this.itemKey();
    const label = this.itemLabel();
    return list.map((item) => ({
      item,
      key: key(item),
      label: label(item),
      cells: columns.map((c) => {
        const raw = c.value(item);
        const text = raw === null || raw === undefined || raw === '' ? '—' : String(raw);
        return query ? nxtHighlight(text, query) : [{ text, match: false }];
      }),
    }));
  });

  protected readonly summary = computed(() => (this.loading() ? this.t().loading : this.t().summary(this.rows().length, this.resultCount())));

  private readonly selectedSet = computed(() => new Set<K>(this.values()));
  private readonly shownKeys = computed(() => this.rows().map((r) => r.key));
  protected readonly allShown = computed(() => this.shownKeys().length > 0 && this.shownKeys().every((k) => this.selectedSet().has(k)));
  protected readonly someShown = computed(() => !this.allShown() && this.shownKeys().some((k) => this.selectedSet().has(k)));
  /** Row toggled last, start of a Shift range. */
  private anchor: K | null = null;

  constructor() {
    afterNextRender(() => {
      if (this.step()) this.focus();
    });
  }

  /** Focus the search box. */
  focus() {
    this.search().focus();
  }

  protected isSelected(key: K): boolean {
    return this.selectedSet().has(key);
  }

  protected pick(row: Row<T, K>) {
    this.value.set(row.key);
    this.picked.emit(row.item);
  }

  /** Check or uncheck a row; with Shift, every row between the last toggled one and this one (Gmail, Explorer). */
  protected toggle(row: Row<T, K>, checked: boolean, shift: boolean) {
    const order = this.shownKeys();
    const from = this.anchor === null ? -1 : order.indexOf(this.anchor);
    const to = order.indexOf(row.key);
    const keys = shift && from >= 0 && to >= 0 ? order.slice(Math.min(from, to), Math.max(from, to) + 1) : [row.key];
    this.setMany(keys, checked);
    this.anchor = row.key;
  }

  protected setShown(checked: boolean) {
    this.setMany(this.shownKeys(), checked);
  }

  /** The button disappears with the selection: focus goes back to the search box. */
  protected clearSelection() {
    this.values.set([]);
    this.anchor = null;
    this.focus();
  }

  protected clearSearch() {
    this.query.set('');
    this.focus();
  }

  /** A click anywhere on a row picks / toggles it; the row's own button or checkbox handles itself. */
  protected onRowClick(row: Row<T, K>, event: MouseEvent) {
    if ((event.target as HTMLElement).closest('button, input, label, a')) return;
    if (this.multiple()) this.toggle(row, !this.isSelected(row.key), event.shiftKey);
    else this.pick(row);
  }

  /** Enter in the search box with exactly one result picks it (single choice). */
  protected onSubmit() {
    const rows = this.rows();
    if (!this.multiple() && rows.length === 1) this.pick(rows[0]);
  }

  protected onSearchKeydown(event: KeyboardEvent) {
    if (event.key !== 'ArrowDown' || !this.rows().length) return;
    event.preventDefault();
    this.focusRow(0);
  }

  /** Up / Down / Home / End move between rows, on top of the normal Tab order (the table is not a grid). */
  protected onRowsKeydown(event: KeyboardEvent) {
    const rows = this.rowElements();
    const index = rows.findIndex((r) => r.contains(event.target as Node));
    if (index < 0 || event.altKey || event.ctrlKey || event.metaKey) return;
    let next: number;
    switch (event.key) {
      case 'ArrowDown':
        next = Math.min(rows.length - 1, index + 1);
        break;
      case 'ArrowUp':
        if (index === 0) {
          event.preventDefault();
          this.focus();
          return;
        }
        next = index - 1;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = rows.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    this.focusRow(next);
  }

  protected onEscape(event: Event) {
    if (!this.step() || event.defaultPrevented) return;
    event.preventDefault();
    event.stopPropagation();
    this.cancelled.emit();
  }

  private setMany(keys: readonly K[], checked: boolean) {
    const current = this.values();
    const has = new Set(current);
    const change = new Set(keys);
    this.values.set(checked ? [...current, ...keys.filter((k) => !has.has(k))] : current.filter((k) => !change.has(k)));
  }

  private rowElements(): HTMLElement[] {
    return [...this.body().nativeElement.querySelectorAll<HTMLElement>(':scope > tr[data-row]')];
  }

  private focusRow(index: number) {
    this.rowElements()[index]?.querySelector<HTMLElement>('.nxt-value-help__pick, input[type="checkbox"]')?.focus();
  }
}
