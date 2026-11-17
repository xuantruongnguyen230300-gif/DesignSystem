import { ChangeDetectionStrategy, Component, WritableSignal, computed, inject, signal } from '@angular/core';
import { NxtAlert, NxtAlertTone, NxtLiveRegion } from '@nxt/ui/alert';
import { NxtButton } from '@nxt/ui/button';
import { NxtCard } from '@nxt/ui/card';
import { NxtCheckbox } from '@nxt/ui/checkbox';
import { NxtDrawer } from '@nxt/ui/drawer';
import { NxtEmptyState } from '@nxt/ui/empty-state';
import { NxtFilter, NxtFilterChip, NxtFilterChips, NxtFilterState } from '@nxt/ui/filter';
import { NxtFormField, NxtInput } from '@nxt/ui/form-field';
import { NxtIcon } from '@nxt/ui/icon';
import { NxtMenu, NxtMenuItem, NxtMenuSeparator, NxtMenuTrigger } from '@nxt/ui/menu';
import { NxtPageHeader } from '@nxt/ui/page-header';
import { NxtPagination } from '@nxt/ui/pagination';
import { NxtSearch, nxtMatches } from '@nxt/ui/search';
import { NxtFill } from '@nxt/ui/layout';
import {
  NxtColumnsState,
  NxtRowActions,
  NxtRowHighlight,
  NxtSelection,
  NxtSort,
  NxtSortHeader,
  NxtSortState,
  NxtTable,
  NxtTableColumnsTrigger,
  NxtTableScroll,
} from '@nxt/ui/table';
import { NxtTab, NxtTabs } from '@nxt/ui/tabs';
import { NxtTag } from '@nxt/ui/tag';
import { NxtTooltip } from '@nxt/ui/tooltip';
import { NxtMemoryViewStore, NxtViewData, NxtViews, nxtViewTargets } from '@nxt/ui/view-manager';
import { CATALOGS, CatalogDef, CatalogField, CatalogItem, TODAY, dateKey, daysBetween, formatValue, usageOf } from './catalog-data';
import { download, fileDate, itemsToRows, toCsv } from './catalog-csv';
import { CatalogDetail, CatalogDetailData, CatalogDetailResult } from './catalog-detail';
import { CatalogForm, CatalogFormData } from './catalog-form';
import { CatalogImport, CatalogImportData } from './catalog-import';
import { HrmFrame } from './hrm-frame';

type FilterValues = Record<string, string | string[]>;
type Mark = 'added' | 'edited';

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'active', label: 'Đang sử dụng' },
  { value: 'inactive', label: 'Ngừng sử dụng' },
];
const UPDATED_OPTIONS = [
  { value: 'any', label: 'Bất kỳ lúc nào' },
  { value: '30', label: '30 ngày qua' },
  { value: '90', label: '90 ngày qua' },
  { value: '365', label: '12 tháng qua' },
];

/** Views the user saved earlier (a product loads them from its server). */
const SAVED_VIEWS: Record<string, NxtViewData<FilterValues>> = {
  'chuc-danh': {
    views: [
      {
        id: 'quan-ly',
        name: 'Nhóm Quản lý đang sử dụng',
        state: { query: '', filters: { status: 'active', updated: 'any', group: ['Quản lý'], level: [] }, sort: { active: 'name', direction: 'asc' }, pageSize: 10 },
      },
    ],
  },
};

/** One catalog tab: its data and everything the user set on it (kept when switching tabs). */
class CatalogView {
  readonly items: WritableSignal<CatalogItem[]>;
  readonly filters: NxtFilterState<FilterValues>;
  readonly query = signal('');
  readonly sort = signal<NxtSortState>({ active: 'code', direction: 'asc' });
  readonly page = signal(1);
  readonly pageSize = signal(10);
  readonly selection = new NxtSelection<string>();
  readonly filterFields: CatalogField[];
  readonly columns: NxtColumnsState;
  readonly views: NxtViews<FilterValues>;
  /** Rows saved in this session, newest first: shown at the top and highlighted until the next sort, search or filter. */
  readonly recent = signal<{ code: string; mark: Mark }[]>([]);
  /** Rows edited out of the current filters: kept (highlighted) until the next search or filter. */
  readonly stale = signal<ReadonlySet<string>>(new Set());
  /** The row shown in the detail drawer or being edited (aria-current). */
  readonly openCode = signal<string | null>(null);
  /** Read by screen readers after the results change. */
  readonly note = signal('');
  private readonly fieldMap: ReadonlyMap<string, CatalogField>;

  constructor(readonly def: CatalogDef) {
    this.items = signal(def.items);
    this.filterFields = def.fields.filter((f) => f.filter);
    this.fieldMap = new Map(def.fields.map((f) => [f.key, f]));
    this.filters = new NxtFilterState<FilterValues>({
      status: 'all',
      updated: 'any',
      ...Object.fromEntries(this.filterFields.map((f) => [f.key, [] as string[]])),
    });
    // Identifier first and locked (always shown, pinned while scrolling sideways); the description is optional.
    this.columns = new NxtColumnsState([
      { key: 'name', label: 'Tên', locked: true },
      { key: 'code', label: 'Mã', locked: true },
      ...def.fields.map((f) => ({ key: f.key, label: f.label })),
      { key: 'status', label: 'Trạng thái' },
      { key: 'updated', label: 'Cập nhật' },
      { key: 'description', label: 'Mô tả', hidden: true },
    ]);
    const targets = nxtViewTargets<FilterValues>({ query: this.query, filters: this.filters, sort: this.sort, columns: this.columns, pageSize: this.pageSize, page: this.page });
    this.views = new NxtViews<FilterValues>({
      current: targets.current,
      apply: (state) => {
        targets.apply(state);
        this.resultsChanged();
      },
      store: new NxtMemoryViewStore<FilterValues>(SAVED_VIEWS[def.id] ?? null),
    });
  }

  field(key: string): CatalogField | undefined {
    return this.fieldMap.get(key);
  }

  /** Matches the search and the applied filters. */
  matches(r: CatalogItem): boolean {
    const f = this.filters.applied();
    return (
      nxtMatches(this.query(), r.code, r.name, r.description, ...Object.values(r.extra)) &&
      (f['status'] === 'all' || r.active === (f['status'] === 'active')) &&
      (f['updated'] === 'any' || daysBetween(r.updated, TODAY) <= Number(f['updated'])) &&
      this.filterFields.every((field) => {
        const chosen = f[field.key] as string[];
        return !chosen.length || chosen.includes(String(r.extra[field.key]));
      })
    );
  }

  readonly rows = computed(() => {
    const stale = this.stale();
    const filtered = this.items().filter((r) => stale.has(r.code) || this.matches(r));
    const { active, direction } = this.sort();
    const dir = direction === 'asc' ? 1 : -1;
    const value = (r: CatalogItem): string | number =>
      active === 'name' ? r.name : active === 'updated' ? dateKey(r.updated) : active === 'code' ? r.code : (r.extra[active] ?? '');
    const sorted = !direction
      ? filtered
      : [...filtered].sort((a, b) => {
          const x = value(a);
          const y = value(b);
          return (typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y), 'vi')) * dir;
        });
    const recent = this.recent().map((x) => x.code);
    if (!recent.length) return sorted;
    const top = recent.map((c) => sorted.find((r) => r.code === c)).filter((r): r is CatalogItem => !!r);
    return [...top, ...sorted.filter((r) => !recent.includes(r.code))];
  });

  readonly pageRows = computed(() => {
    const start = (this.page() - 1) * this.pageSize();
    return this.rows().slice(start, start + this.pageSize());
  });
  readonly pageKeys = computed(() => this.pageRows().map((r) => r.code));
  readonly narrowed = computed(() => !!this.query().trim() || this.filters.activeCount() > 0);
  readonly selectedRows = computed(() => this.rows().filter((r) => this.selection.has(r.code)));

  readonly chips = computed<NxtFilterChip[]>(() => {
    const f = this.filters.applied();
    const chips: NxtFilterChip[] = [];
    if (this.filters.isActive('status')) chips.push({ key: 'status', label: `Trạng thái: ${STATUS_OPTIONS.find((o) => o.value === f['status'])?.label}` });
    if (this.filters.isActive('updated')) chips.push({ key: 'updated', label: `Cập nhật: ${UPDATED_OPTIONS.find((o) => o.value === f['updated'])?.label}` });
    for (const field of this.filterFields) {
      if (this.filters.isActive(field.key)) chips.push({ key: field.key, label: `${field.label}: ${(f[field.key] as string[]).join(', ')}` });
    }
    return chips;
  });

  /** Why a row stands out (the strip is a hint; the same words show in the row). */
  rowState(r: CatalogItem): { highlight: NxtRowHighlight; label: string } | null {
    if (this.stale().has(r.code)) return { highlight: 'warning', label: 'Không còn khớp bộ lọc' };
    const mark = this.recent().find((x) => x.code === r.code)?.mark;
    return mark ? { highlight: 'info', label: mark === 'added' ? 'Mới thêm' : 'Vừa sửa' } : null;
  }

  mark(codes: string[], mark: Mark) {
    this.recent.update((list) => [...codes.map((code) => ({ code, mark })), ...list.filter((x) => !codes.includes(x.code))]);
    this.page.set(1);
  }

  /** Sorting puts saved rows back in their place; rows edited out of the filters stay until the next filter. */
  setSort(sort: NxtSortState) {
    this.sort.set(sort);
    this.recent.set([]);
  }

  /**
   * Search, filters or the view changed the results: marks are dropped, back to page 1, and selected rows that are
   * no longer in the results are deselected (bulk actions never touch rows the user cannot see).
   */
  resultsChanged() {
    this.recent.set([]);
    this.stale.set(new Set());
    this.page.set(1);
    const dropped = this.selection.retain(this.rows().map((r) => r.code));
    this.note.set(dropped ? `Đã bỏ chọn ${dropped} ${this.def.noun} không còn trong kết quả.` : '');
  }
}

interface Notice {
  text: string;
  /** Default success. */
  tone?: NxtAlertTone;
  undo?: () => void;
}

/** Danh mục — nhiều danh mục trên một màn: tab, chế độ xem, tìm kiếm + bộ lọc, chọn cột, chọn nhiều (Shift), nhập/xuất Excel, thêm/sửa trong drawer */
@Component({
  selector: 'example-template-catalog',
  imports: [
    HrmFrame,
    NxtAlert,
    NxtButton,
    NxtCard,
    NxtCheckbox,
    NxtEmptyState,
    NxtFilter,
    NxtFilterChips,
    NxtFill,
    NxtFormField,
    NxtInput,
    NxtLiveRegion,
    NxtIcon,
    NxtMenu,
    NxtMenuItem,
    NxtMenuSeparator,
    NxtMenuTrigger,
    NxtPageHeader,
    NxtPagination,
    NxtRowActions,
    NxtSearch,
    NxtSort,
    NxtSortHeader,
    NxtTab,
    NxtTable,
    NxtTableColumnsTrigger,
    NxtTableScroll,
    NxtTabs,
    NxtTag,
    NxtTooltip,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- fill: the page fits the screen; the grid scrolls inside (vertical and horizontal). -->
    <example-hrm-frame fill>
      <div class="stack" nxtFill>
        <nxt-page-header placement="topbar" title="Danh mục tổ chức" [breadcrumb]="[{ label: 'Thiết lập' }, { label: 'Danh mục tổ chức' }]">
          <nxt-tabs label="Danh mục" [panels]="false" [value]="active()" (valueChange)="setCatalog($event!)">
            @for (v of views; track v.def.id) {
              <nxt-tab [value]="v.def.id" [label]="v.def.label" [count]="v.items().length" />
            }
          </nxt-tabs>
        </nxt-page-header>

        <div class="notice" nxtLiveRegion>
          @if (notice(); as n) {
            <nxt-alert [tone]="n.tone ?? 'success'">
              {{ n.text }}
              @if (n.undo) {
                <button nxtAlertActions nxtButton variant="ghost" size="sm" type="button" (click)="undo(n)">Hoàn tác</button>
              }
            </nxt-alert>
          }
        </div>

        @if (view(); as v) {
          <nxt-card padding="none" fill>
            @if (v.items().length) {
              @if (v.selection.count()) {
                <div class="bar bar--bulk" role="group" [attr.aria-label]="'Thao tác với ' + def().noun + ' đã chọn'">
                  <span class="bar__count">Đã chọn {{ v.selection.count() }}</span>
                  @if (v.selection.allSelected(v.pageKeys()) && v.rows().length > v.pageKeys().length && v.selection.count() < v.rows().length) {
                    <button nxtButton variant="ghost" size="sm" type="button" (click)="v.selection.setMany(allKeys(v), true)">Chọn tất cả {{ v.rows().length }} {{ def().noun }}</button>
                  }
                  <span class="bar__spacer"></span>
                  <!-- On when it applies to at least one selected row; off (still focusable) with the reason otherwise. -->
                  <button nxtButton size="sm" type="button" [disabled]="!countActive(v, true)" [nxtTooltip]="bulkTip(v, false)" (click)="setActive(selectedKeys(v), false)">
                    <nxt-icon name="ban" />Ngừng sử dụng
                  </button>
                  <button nxtButton size="sm" type="button" [disabled]="!countActive(v, false)" [nxtTooltip]="bulkTip(v, true)" (click)="setActive(selectedKeys(v), true)">
                    <nxt-icon name="restore" />Dùng lại
                  </button>
                  <button nxtButton size="sm" type="button" (click)="exportRows(v.selectedRows())"><nxt-icon name="file-download" />Xuất {{ v.selection.count() }}</button>
                  <button nxtButton variant="danger" size="sm" type="button" (click)="remove(selectedKeys(v))"><nxt-icon name="trash" />Xoá {{ v.selection.count() }}</button>
                  <button nxtButton variant="ghost" size="sm" type="button" (click)="v.selection.clear()">Bỏ chọn</button>
                </div>
              } @else {
                <div class="bar">
                  <nxt-search class="bar__search" [label]="'Tìm ' + def().noun" [placeholder]="'Mã hoặc tên ' + def().noun" [value]="v.query()" (valueChange)="setQuery(v, $event)" />
                  <nxt-filter
                    #filter
                    [title]="'Lọc ' + def().noun"
                    [activeCount]="v.filters.activeCount()"
                    (opened)="v.filters.edit()"
                    (applied)="applyFilters(v)"
                    (reset)="v.filters.resetDraft()"
                  >
                    <fieldset class="group">
                      <legend class="group__title">Trạng thái</legend>
                      @for (s of statusOptions; track s.value) {
                        <label class="radio">
                          <input type="radio" [name]="'status-' + v.def.id" [value]="s.value" [checked]="v.filters.draft()['status'] === s.value" (change)="v.filters.set('status', s.value)" />
                          {{ s.label }}
                        </label>
                      }
                    </fieldset>
                    @for (f of v.filterFields; track f.key) {
                      <fieldset class="group">
                        <legend class="group__title">{{ f.label }}</legend>
                        @for (o of f.options; track o) {
                          <nxt-checkbox [label]="o" [checked]="draftList(v, f.key).includes(o)" (checkedChange)="v.filters.toggle(f.key, o, $event)" />
                        }
                      </fieldset>
                    }
                    <nxt-form-field label="Cập nhật lần cuối" size="sm">
                      <select nxtInput (change)="v.filters.set('updated', $any($event.target).value)">
                        @for (u of updatedOptions; track u.value) {
                          <option [value]="u.value" [selected]="v.filters.draft()['updated'] === u.value">{{ u.label }}</option>
                        }
                      </select>
                    </nxt-form-field>
                  </nxt-filter>
                  <!-- Tools, the table settings last, then the primary action at the far right (Carbon, SAP Fiori, M365). -->
                  <span class="bar__spacer"></span>
                  <div class="bar__actions">
                    <button nxtIconButton variant="ghost" type="button" [attr.aria-label]="importLabel()" [nxtTooltip]="importLabel()" (click)="openImport()">
                      <nxt-icon name="file-upload" />
                    </button>
                    <button nxtIconButton variant="ghost" type="button" [attr.aria-label]="exportLabel()" [nxtTooltip]="exportLabel()" [disabled]="!v.rows().length" (click)="exportRows(v.rows())">
                      <nxt-icon name="file-download" />
                    </button>
                    <button nxtIconButton variant="ghost" type="button" aria-label="Cài đặt bảng" nxtTooltip="Cài đặt bảng" [nxtTableColumnsFor]="v.columns">
                      <nxt-icon name="adjustments" />
                    </button>
                    <span class="bar__divider" aria-hidden="true"></span>
                    <button nxtButton variant="primary" type="button" [attr.aria-label]="'Thêm mới ' + def().noun" (click)="openForm()"><nxt-icon name="plus" />Thêm mới</button>
                  </div>
                </div>
                @if (v.chips().length) {
                  <div class="chips">
                    <nxt-filter-chips [chips]="v.chips()" [returnFocusTo]="filter" (remove)="clearFilter(v, $event)" (clearAll)="clearFilters(v)" />
                  </div>
                }
              }
              <p class="nxt-visually-hidden" role="status">{{ v.narrowed() ? 'Tìm thấy ' + v.rows().length + ' ' + def().noun + '.' : '' }} {{ v.note() }}</p>

              @if (v.rows().length) {
                <nxt-table-scroll fill [label]="'Bảng ' + def().noun">
                  <table nxtTable stickyHeader [nxtSort]="v.sort()" (nxtSortChange)="v.setSort($event)">
                    <thead>
                      <tr>
                        <th scope="col" class="nxt-table__select nxt-table__sticky">
                          <nxt-checkbox
                            [label]="'Chọn tất cả ' + def().noun + ' trên trang'"
                            hideLabel
                            [checked]="v.selection.allSelected(v.pageKeys())"
                            [indeterminate]="v.selection.someSelected(v.pageKeys())"
                            (checkedChange)="v.selection.setMany(v.pageKeys(), $event)"
                          />
                        </th>
                        @for (c of v.columns.visible(); track c.key) {
                          @switch (c.key) {
                            @case ('name') {
                              <th scope="col" class="nxt-table__sticky" nxtSortHeader="name">{{ c.label }}</th>
                            }
                            @case ('code') {
                              <th scope="col" nxtSortHeader="code">{{ c.label }}</th>
                            }
                            @case ('status') {
                              <th scope="col">{{ c.label }}</th>
                            }
                            @case ('updated') {
                              <th scope="col" class="nxt-table__num" nxtSortHeader="updated">{{ c.label }}</th>
                            }
                            @case ('description') {
                              <th scope="col">{{ c.label }}</th>
                            }
                            @default {
                              <th scope="col" [nxtSortHeader]="c.key" [class.nxt-table__num]="v.field(c.key)?.type !== 'select'">{{ c.label }}</th>
                            }
                          }
                        }
                        <th scope="col" nxtRowActions></th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (r of v.pageRows(); track r.code) {
                        <tr
                          class="row"
                          [attr.aria-selected]="v.selection.has(r.code)"
                          [attr.aria-current]="r.code === v.openCode() ? 'true' : null"
                          [attr.data-highlight]="v.rowState(r)?.highlight ?? null"
                          (click)="onRowClick($event, v, r)"
                        >
                          <td class="nxt-table__select nxt-table__sticky">
                            <nxt-checkbox
                              [label]="'Chọn ' + r.name"
                              hideLabel
                              [checked]="v.selection.has(r.code)"
                              (toggled)="v.selection.select(r.code, $event.checked, { range: $event.shiftKey, order: v.pageKeys() })"
                            />
                          </td>
                          @for (c of v.columns.visible(); track c.key) {
                            @switch (c.key) {
                              @case ('name') {
                                <th scope="row" class="name nxt-table__sticky">
                                  <!-- Opens the read-only detail; the whole row does too (mouse), the checkbox only selects. -->
                                  <button type="button" class="name__open" (click)="openDetail(v, r)">{{ r.name }}</button>
                                  @if (v.rowState(r); as s) {
                                    <nxt-tag class="name__state" size="sm" [tone]="s.highlight === 'warning' ? 'warning' : 'info'">{{ s.label }}</nxt-tag>
                                  }
                                </th>
                              }
                              @case ('code') {
                                <td class="code">{{ r.code }}</td>
                              }
                              @case ('status') {
                                <td>
                                  <nxt-tag [tone]="r.active ? 'success' : 'neutral'" dot>{{ r.active ? 'Đang sử dụng' : 'Ngừng sử dụng' }}</nxt-tag>
                                </td>
                              }
                              @case ('updated') {
                                <td class="nxt-table__num">{{ r.updated }}</td>
                              }
                              @case ('description') {
                                <td class="nxt-table__wrap">{{ r.description || '—' }}</td>
                              }
                              @default {
                                <td [class.nxt-table__num]="v.field(c.key)?.type !== 'select'">{{ format(v.field(c.key)!, r.extra[c.key]) }}</td>
                              }
                            }
                          }
                          <td nxtRowActions>
                            <button nxtIconButton size="sm" variant="ghost" type="button" [attr.aria-label]="'Sửa ' + r.name" nxtTooltip="Sửa" (click)="openForm(r)">
                              <nxt-icon name="pencil" />
                            </button>
                            <button nxtIconButton size="sm" variant="ghost" type="button" [attr.aria-label]="'Thao tác khác cho ' + r.name" nxtTooltip="Thao tác khác" [nxtMenuTriggerFor]="more">
                              <nxt-icon name="dots" />
                            </button>
                            <ng-template #more>
                              <div nxtMenu>
                                <button nxtMenuItem (triggered)="duplicate(r)"><nxt-icon name="copy" />Nhân bản</button>
                                <button nxtMenuItem (triggered)="setActive([r.code], !r.active)">
                                  <nxt-icon [name]="r.active ? 'ban' : 'restore'" />{{ r.active ? 'Ngừng sử dụng' : 'Dùng lại' }}
                                </button>
                                <div nxtMenuSeparator></div>
                                @if (usage(r)) {
                                  <button nxtMenuItem tone="danger" [disabled]="true"><nxt-icon name="trash" />Không xoá được: đang được dùng ({{ usage(r) }})</button>
                                } @else {
                                  <button nxtMenuItem tone="danger" (triggered)="remove([r.code])"><nxt-icon name="trash" />Xoá {{ def().noun }}</button>
                                }
                              </div>
                            </ng-template>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </nxt-table-scroll>
                <div class="footer">
                  <nxt-pagination [total]="v.rows().length" [(page)]="v.page" [(pageSize)]="v.pageSize" [pageSizeOptions]="[10, 20, 50]" [itemLabel]="def().noun" />
                </div>
              } @else {
                <nxt-empty-state icon="search" [title]="'Không có ' + def().noun + ' phù hợp'" description="Thử từ khoá ngắn hơn, hoặc bỏ bớt bộ lọc." size="sm">
                  <button nxtEmptyActions nxtButton type="button" (click)="clearAll(v)">Xoá tìm kiếm và bộ lọc</button>
                </nxt-empty-state>
              }
            } @else {
              <nxt-empty-state
                icon="database"
                [title]="'Chưa có ' + def().noun + ' nào'"
                [description]="'Thêm ' + def().noun + ' đầu tiên, hoặc nhập nhiều ' + def().noun + ' một lúc từ file Excel.'"
              >
                <ng-container ngProjectAs="[nxtEmptyActions]">
                  <button nxtButton type="button" (click)="openImport()"><nxt-icon name="file-upload" />Nhập từ Excel</button>
                  <button nxtButton variant="primary" type="button" (click)="openForm()"><nxt-icon name="plus" />Thêm mới</button>
                </ng-container>
              </nxt-empty-state>
            }
          </nxt-card>
        }
      </div>
    </example-hrm-frame>
  `,
  styles: `
    .stack {
      gap: var(--nxt-space-gap-lg);
    }
    .bar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--nxt-space-gap-sm);
      padding: var(--nxt-space-inset-sm) var(--nxt-space-inset-md);
      border-block-end: var(--nxt-border-width-default) solid var(--nxt-color-border-default);
    }
    .bar__search {
      flex: 1 1 var(--nxt-layout-item-min-sm);
      max-inline-size: var(--nxt-size-400);
    }
    .bar--bulk {
      background: var(--nxt-color-bg-selected);
    }
    .bar__count {
      color: var(--nxt-color-text-strong);
      font: var(--nxt-typography-label-md);
    }
    .bar__spacer {
      flex: 1;
    }
    .bar__actions {
      display: flex;
      align-items: center;
      gap: var(--nxt-space-gap-sm);
      margin-inline-start: auto;
    }
    .bar__divider {
      align-self: stretch;
      margin-block: var(--nxt-space-inset-xs);
      border-inline-start: var(--nxt-border-width-default) solid var(--nxt-color-border-default);
    }
    .chips {
      padding: var(--nxt-space-inset-sm) var(--nxt-space-inset-md);
      border-block-end: var(--nxt-border-width-default) solid var(--nxt-color-border-default);
    }
    .group {
      display: grid;
      gap: var(--nxt-space-gap-xs);
      margin: 0;
      padding: 0;
      border: 0;
    }
    .group__title {
      margin-block-end: var(--nxt-space-gap-xs);
      padding: 0;
      color: var(--nxt-color-text-strong);
      font: var(--nxt-typography-label-md);
    }
    .radio {
      display: flex;
      align-items: center;
      gap: var(--nxt-space-gap-sm);
      min-block-size: var(--nxt-size-control-sm);
      font: var(--nxt-typography-body-md);
      cursor: pointer;
    }
    .radio input {
      accent-color: var(--nxt-color-bg-primary);
    }
    .row {
      cursor: pointer;
    }
    .code {
      font: var(--nxt-typography-code);
    }
    .name {
      text-align: start;
    }
    .name__open {
      padding: 0;
      border: 0;
      background: none;
      color: var(--nxt-color-text-strong);
      font: var(--nxt-typography-label-md);
      text-align: start;
      cursor: pointer;
    }
    .name__open:hover {
      color: var(--nxt-color-text-link);
      text-decoration: underline;
    }
    .name__open:focus-visible {
      outline: var(--nxt-focus-ring-width) solid var(--nxt-focus-ring-color);
      outline-offset: var(--nxt-focus-ring-offset);
      border-radius: var(--nxt-radius-control);
    }
    .name__state {
      margin-inline-start: var(--nxt-space-gap-sm);
    }
    .footer {
      padding: var(--nxt-space-inset-sm) var(--nxt-space-inset-md);
      border-block-start: var(--nxt-border-width-default) solid var(--nxt-color-border-default);
    }
  `,
})
export class TemplateCatalogExample {
  private readonly drawer = inject(NxtDrawer);
  protected readonly statusOptions = STATUS_OPTIONS;
  protected readonly updatedOptions = UPDATED_OPTIONS;
  protected readonly views = CATALOGS.map((def) => new CatalogView(def));
  protected readonly active = signal(CATALOGS[0].id);
  protected readonly view = computed(() => this.views.find((v) => v.def.id === this.active())!);
  protected readonly def = computed(() => this.view().def);
  protected readonly notice = signal<Notice | null>(null);

  protected readonly importLabel = computed(() => `Nhập ${this.def().noun} từ Excel`);
  protected readonly exportLabel = computed(() => {
    const v = this.view();
    const n = v.rows().length;
    if (!n) return `Không có ${v.def.noun} để xuất`;
    return `Xuất ${n} ${v.def.noun}${v.narrowed() ? ' đang lọc' : ''} ra Excel`;
  });

  protected format = formatValue;

  protected usage(r: CatalogItem): number {
    return usageOf(this.def(), r);
  }

  protected draftList(v: CatalogView, key: string): string[] {
    return v.filters.draft()[key] as string[];
  }

  protected allKeys(v: CatalogView): string[] {
    return v.rows().map((r) => r.code);
  }

  protected selectedKeys(v: CatalogView): string[] {
    return [...v.selection.selected()];
  }

  /** Selected rows that are (active = true) or are not (false) in use. */
  protected countActive(v: CatalogView, active: boolean): number {
    return v.selectedRows().filter((r) => r.active === active).length;
  }

  protected bulkTip(v: CatalogView, toActive: boolean): string {
    const n = this.countActive(v, !toActive);
    const noun = v.def.noun;
    if (!n) return toActive ? `Các ${noun} đã chọn đều đang sử dụng` : `Các ${noun} đã chọn đều đã ngừng sử dụng`;
    return `${toActive ? 'Dùng lại' : 'Ngừng sử dụng'} ${n} ${noun}`;
  }

  protected setCatalog(id: string) {
    this.active.set(id);
    this.notice.set(null);
  }

  protected setQuery(v: CatalogView, query: string) {
    v.query.set(query);
    v.resultsChanged();
  }

  protected applyFilters(v: CatalogView) {
    v.filters.apply();
    v.resultsChanged();
  }

  protected clearFilter(v: CatalogView, key: string) {
    v.filters.clear(key);
    v.resultsChanged();
  }

  protected clearFilters(v: CatalogView) {
    v.filters.clearAll();
    v.resultsChanged();
  }

  protected clearAll(v: CatalogView) {
    v.query.set('');
    this.clearFilters(v);
  }

  /**
   * Only rows whose state changes; the others are reported (partial processing). The selection stays, so a second
   * action can follow on the same rows. Rows that leave the filters stay until the next filter.
   */
  protected setActive(codes: string[], active: boolean) {
    const v = this.view();
    const before = v.items();
    const staleBefore = v.stale();
    const target = before.filter((r) => codes.includes(r.code));
    const change = target.filter((r) => r.active !== active).map((r) => r.code);
    if (!change.length) return;
    v.items.update((list) => list.map((r) => (change.includes(r.code) ? { ...r, active, updated: TODAY } : r)));
    const out = v.items().filter((r) => change.includes(r.code) && !v.matches(r)).map((r) => r.code);
    if (out.length) v.stale.update((s) => new Set([...s, ...out]));
    const noun = v.def.noun;
    const parts = [`${active ? 'Đã dùng lại' : 'Đã ngừng sử dụng'} ${change.length} ${noun}.`];
    const skipped = target.length - change.length;
    if (skipped) parts.push(`${skipped}/${target.length} ${noun} giữ nguyên vì ${active ? 'đang sử dụng' : 'đã ngừng sử dụng'} từ trước.`);
    if (out.length) parts.push(`${out.length} ${noun} không còn khớp bộ lọc; sẽ ẩn ở lần lọc sau.`);
    this.notice.set({
      text: parts.join(' '),
      tone: skipped ? 'warning' : 'success',
      undo: () => {
        v.items.set(before);
        v.stale.set(staleBefore);
      },
    });
  }

  /** Records still in use are kept: deleting them would break employee files. Suggest deactivating instead. */
  protected remove(codes: string[]) {
    const v = this.view();
    const before = v.items();
    const blocked = before.filter((r) => codes.includes(r.code) && usageOf(v.def, r) > 0).map((r) => r.code);
    const removable = codes.filter((c) => !blocked.includes(c));
    v.items.update((list) => list.filter((r) => !removable.includes(r.code)));
    v.selection.setMany(removable, false);
    const parts: string[] = [];
    if (removable.length) parts.push(`Đã xoá ${removable.length} ${v.def.noun}.`);
    if (blocked.length) parts.push(`${blocked.length} ${v.def.noun} đang được dùng nên chưa xoá; hãy chọn “Ngừng sử dụng”.`);
    this.notice.set({ text: parts.join(' '), tone: blocked.length ? 'warning' : 'success', undo: removable.length ? () => v.items.set(before) : undefined });
  }

  protected undo(n: Notice) {
    n.undo?.();
    this.notice.set({ text: 'Đã hoàn tác.', tone: 'info' });
  }

  /** Mouse convenience: a click anywhere on the row opens the detail, except on the checkbox and buttons. */
  protected onRowClick(event: MouseEvent, v: CatalogView, r: CatalogItem) {
    if ((event.target as Element).closest('button, a, input, label, nxt-checkbox')) return;
    this.openDetail(v, r);
  }

  /** The row stays marked as the open one (aria-current) while the drawer shows it, and follows previous / next. */
  protected openDetail(v: CatalogView, r: CatalogItem) {
    const rows = v.rows();
    v.openCode.set(r.code);
    const ref = this.drawer.open<CatalogDetailResult, CatalogDetailData>(CatalogDetail, {
      title: 'Chi tiết ' + v.def.noun + ' ' + r.name,
      data: { def: v.def, rows, index: Math.max(0, rows.findIndex((x) => x.code === r.code)), onMove: (item) => v.openCode.set(item.code) },
    });
    ref.closed.subscribe((result) => {
      v.openCode.set(null);
      if (!result) return;
      if (result.action === 'edit') this.openForm(result.item);
      else if (result.action === 'duplicate') this.duplicate(result.item);
      else this.setActive([result.item.code], !result.item.active);
    });
  }

  protected duplicate(r: CatalogItem) {
    this.openForm(undefined, { ...r, code: '', name: `${r.name} (bản sao)` });
  }

  /** Saved records go to the top of page 1, highlighted, until the next sort or filter (they are easy to lose otherwise). */
  protected openForm(item?: CatalogItem, prefill?: Partial<CatalogItem>) {
    const v = this.view();
    if (item) v.openCode.set(item.code);
    const ref = this.drawer.open<CatalogItem, CatalogFormData>(CatalogForm, {
      title: item ? `Sửa ${v.def.noun} ${item.name}` : `Thêm ${v.def.noun}`,
      data: { def: v.def, item, prefill, existingCodes: v.items().map((r) => r.code) },
    });
    ref.closed.subscribe((saved) => {
      v.openCode.set(null);
      if (!saved) return;
      const exists = v.items().some((r) => r.code === saved.code);
      v.items.update((list) => (exists ? list.map((r) => (r.code === saved.code ? saved : r)) : [saved, ...list]));
      v.mark([saved.code], exists ? 'edited' : 'added');
      const outside = !v.matches(saved);
      if (outside) v.stale.update((s) => new Set([...s, saved.code]));
      const text = exists ? `Đã lưu thay đổi cho “${saved.name}”.` : `Đã thêm ${v.def.noun} “${saved.name}”.`;
      this.notice.set({ text: outside ? `${text} “${saved.name}” không còn khớp bộ lọc đang dùng; sẽ ẩn ở lần lọc sau.` : text });
    });
  }

  protected openImport() {
    const v = this.view();
    const ref = this.drawer.open<CatalogItem[], CatalogImportData>(CatalogImport, {
      title: `Nhập ${v.def.noun} từ Excel`,
      size: 'lg',
      data: { def: v.def, existingCodes: v.items().map((r) => r.code) },
    });
    ref.closed.subscribe((imported) => {
      if (!imported?.length) return;
      const before = v.items();
      v.items.update((list) => [...imported, ...list]);
      v.mark(
        imported.map((r) => r.code),
        'added',
      );
      this.notice.set({ text: `Đã nhập ${imported.length} ${v.def.noun}.`, undo: () => v.items.set(before) });
    });
  }

  /** Exports what the user is looking at (search + filters, all pages), or the selected rows, in the import file format. */
  protected exportRows(rows: CatalogItem[]) {
    const v = this.view();
    if (!rows.length) return;
    const name = `${v.def.id}-${fileDate()}.csv`;
    download(name, toCsv(itemsToRows(v.def, rows)));
    this.notice.set({ text: `Đã xuất ${rows.length} ${v.def.noun} ra file ${name}.` });
  }
}
