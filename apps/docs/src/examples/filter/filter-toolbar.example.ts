import { ChangeDetectionStrategy, Component, computed, signal, viewChild } from '@angular/core';
import { NxtButton } from '@nxt/ui/button';
import { NxtCard } from '@nxt/ui/card';
import { NxtCheckbox } from '@nxt/ui/checkbox';
import { NxtEmptyState } from '@nxt/ui/empty-state';
import { NxtFilter, NxtFilterChip, NxtFilterChips, NxtFilterState } from '@nxt/ui/filter';
import { NxtIcon } from '@nxt/ui/icon';
import { NxtSearch, nxtMatches } from '@nxt/ui/search';
import { NxtTable } from '@nxt/ui/table';
import { NxtTag, NxtTone } from '@nxt/ui/tag';
import { NxtTooltip } from '@nxt/ui/tooltip';

type ContractType = 'Thử việc' | 'Xác định thời hạn' | 'Không xác định thời hạn';
type Status = 'any' | 'active' | 'expiring' | 'ended';

interface Contract {
  code: string;
  name: string;
  dept: string;
  type: ContractType;
  end: string;
  status: Exclude<Status, 'any'>;
}

const STATUS: { value: Status; label: string; tone: NxtTone }[] = [
  { value: 'any', label: 'Tất cả', tone: 'neutral' },
  { value: 'active', label: 'Đang hiệu lực', tone: 'success' },
  { value: 'expiring', label: 'Sắp hết hạn', tone: 'warning' },
  { value: 'ended', label: 'Đã chấm dứt', tone: 'neutral' },
];
const TYPES: ContractType[] = ['Thử việc', 'Xác định thời hạn', 'Không xác định thời hạn'];
const DEPTS = ['Kế toán', 'Nhân sự', 'Kinh doanh', 'Công nghệ'];

const CONTRACTS: Contract[] = [
  { code: 'HĐ-2024-118', name: 'Phạm Thị Lan', dept: 'Kế toán', type: 'Xác định thời hạn', end: '28/10/2026', status: 'expiring' },
  { code: 'HĐ-2025-031', name: 'Lê Hoàng Nam', dept: 'Công nghệ', type: 'Thử việc', end: '02/11/2026', status: 'expiring' },
  { code: 'HĐ-2024-207', name: 'Đỗ Minh Thư', dept: 'Kinh doanh', type: 'Xác định thời hạn', end: '15/03/2027', status: 'active' },
  { code: 'HĐ-2021-094', name: 'Bùi Quang Huy', dept: 'Công nghệ', type: 'Không xác định thời hạn', end: '—', status: 'active' },
  { code: 'HĐ-2025-112', name: 'Vũ Thanh Tâm', dept: 'Nhân sự', type: 'Thử việc', end: '12/12/2026', status: 'active' },
  { code: 'HĐ-2023-076', name: 'Nguyễn Văn Hùng', dept: 'Kinh doanh', type: 'Xác định thời hạn', end: '30/09/2026', status: 'ended' },
  { code: 'HĐ-2022-140', name: 'Trần Thị Bích Ngọc', dept: 'Nhân sự', type: 'Không xác định thời hạn', end: '—', status: 'active' },
  { code: 'HĐ-2025-158', name: 'Hoàng Văn Đức', dept: 'Kế toán', type: 'Thử việc', end: '05/11/2026', status: 'expiring' },
];

/** Toolbar danh sách chuẩn: tìm kiếm + Bộ lọc, hàng chip, bảng và trạng thái không có kết quả */
@Component({
  selector: 'example-filter-toolbar',
  imports: [NxtButton, NxtCard, NxtCheckbox, NxtEmptyState, NxtFilter, NxtFilterChips, NxtIcon, NxtSearch, NxtTable, NxtTag, NxtTooltip],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-card padding="none">
      <div class="bar">
        <nxt-search class="bar__search" label="Tìm hợp đồng" placeholder="Mã hợp đồng, họ tên hoặc phòng ban" [(value)]="query" />
        <nxt-filter
          #filter
          title="Lọc hợp đồng"
          [activeCount]="filters.activeCount()"
          (opened)="filters.edit()"
          (applied)="filters.apply()"
          (reset)="filters.resetDraft()"
        >
          <fieldset class="group">
            <legend class="group__title">Trạng thái</legend>
            @for (s of statusOptions; track s.value) {
              <label class="radio">
                <input
                  type="radio"
                  name="filter-toolbar-status"
                  [value]="s.value"
                  [checked]="filters.draft().status === s.value"
                  (change)="filters.set('status', s.value)"
                />
                {{ s.label }}
              </label>
            }
          </fieldset>
          <fieldset class="group">
            <legend class="group__title">Loại hợp đồng</legend>
            @for (t of types; track t) {
              <nxt-checkbox [label]="t" [checked]="filters.draft().types.includes(t)" (checkedChange)="filters.toggle('types', t, $event)" />
            }
          </fieldset>
          <fieldset class="group">
            <legend class="group__title">Phòng ban</legend>
            @for (d of depts; track d) {
              <nxt-checkbox [label]="d" [checked]="filters.draft().depts.includes(d)" (checkedChange)="filters.toggle('depts', d, $event)" />
            }
          </fieldset>
        </nxt-filter>
        <div class="bar__actions">
          <button nxtIconButton type="button" [attr.aria-label]="'Xuất ' + rows().length + ' hợp đồng ra Excel'" [nxtTooltip]="'Xuất ' + rows().length + ' hợp đồng ra Excel'">
            <nxt-icon name="file-download" />
          </button>
          <button nxtButton variant="primary" type="button" aria-label="Thêm mới hợp đồng"><nxt-icon name="plus" />Thêm mới</button>
        </div>
      </div>

      @if (chips().length) {
        <div class="chips">
          <nxt-filter-chips [chips]="chips()" [returnFocusTo]="filter" (remove)="clear($event)" (clearAll)="filters.clearAll()" />
        </div>
      }

      <p class="nxt-visually-hidden" role="status">{{ narrowed() ? 'Tìm thấy ' + rows().length + ' hợp đồng' : '' }}</p>

      @if (rows().length) {
        <div class="wrap" role="region" aria-label="Bảng hợp đồng lao động" tabindex="0">
          <table nxtTable>
            <caption class="nxt-visually-hidden">Hợp đồng lao động, {{ rows().length }} hợp đồng</caption>
            <thead>
              <tr>
                <th scope="col">Mã hợp đồng</th>
                <th scope="col">Họ và tên</th>
                <th scope="col">Phòng ban</th>
                <th scope="col">Loại hợp đồng</th>
                <th scope="col">Ngày hết hạn</th>
                <th scope="col">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              @for (r of rows(); track r.code) {
                <tr>
                  <td class="code">{{ r.code }}</td>
                  <th scope="row" class="name">{{ r.name }}</th>
                  <td>{{ r.dept }}</td>
                  <td>{{ r.type }}</td>
                  <td class="nxt-tabular-nums">{{ r.end }}</td>
                  <td><nxt-tag size="sm" dot [tone]="statusOf(r).tone">{{ statusOf(r).label }}</nxt-tag></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      } @else {
        <nxt-empty-state icon="search" [headingLevel]="3" size="sm" title="Không có hợp đồng phù hợp" description="Thử từ khoá ngắn hơn, hoặc bỏ bớt bộ lọc.">
          <button nxtEmptyActions nxtButton type="button" (click)="clearAll()">Xoá tìm kiếm và bộ lọc</button>
        </nxt-empty-state>
      }
    </nxt-card>
  `,
  styles: `
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
    .bar__actions {
      display: flex;
      align-items: center;
      gap: var(--nxt-space-gap-sm);
      margin-inline-start: auto;
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
    .wrap {
      overflow-x: auto;
    }
    .wrap:focus-visible {
      outline: var(--nxt-focus-ring-width) solid var(--nxt-focus-ring-color);
      outline-offset: calc(-1 * var(--nxt-focus-ring-width));
    }
    .code {
      font: var(--nxt-typography-code);
    }
    .name {
      color: var(--nxt-color-text-strong);
      font: var(--nxt-typography-label-md);
    }
  `,
})
export class FilterToolbarExample {
  private readonly search = viewChild(NxtSearch);
  protected readonly statusOptions = STATUS;
  protected readonly types = TYPES;
  protected readonly depts = DEPTS;
  protected readonly query = signal('');
  protected readonly filters = new NxtFilterState({ status: 'any' as Status, types: [] as string[], depts: [] as string[] });

  protected readonly rows = computed(() => {
    const q = this.query();
    const { status, types, depts } = this.filters.applied();
    return CONTRACTS.filter(
      (r) =>
        nxtMatches(q, r.code, r.name, r.dept) &&
        (status === 'any' || r.status === status) &&
        (!types.length || types.includes(r.type)) &&
        (!depts.length || depts.includes(r.dept)),
    );
  });
  protected readonly narrowed = computed(() => !!this.query().trim() || this.filters.activeCount() > 0);

  protected readonly chips = computed<NxtFilterChip[]>(() => {
    const { status, types, depts } = this.filters.applied();
    const chips: NxtFilterChip[] = [];
    if (this.filters.isActive('status')) chips.push({ key: 'status', label: `Trạng thái: ${STATUS.find((s) => s.value === status)?.label}` });
    if (this.filters.isActive('types')) chips.push({ key: 'types', label: `Loại hợp đồng: ${types.join(', ')}` });
    if (this.filters.isActive('depts')) chips.push({ key: 'depts', label: `Phòng ban: ${depts.join(', ')}` });
    return chips;
  });

  protected statusOf(r: Contract) {
    return STATUS.find((s) => s.value === r.status)!;
  }

  protected clear(key: string) {
    this.filters.clear(key as 'status' | 'types' | 'depts');
  }

  /** The button goes away with the empty state: continue from the search box. */
  protected clearAll() {
    this.query.set('');
    this.filters.clearAll();
    this.search()?.focus();
  }
}
