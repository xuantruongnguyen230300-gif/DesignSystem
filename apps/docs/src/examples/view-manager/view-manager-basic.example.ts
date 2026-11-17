import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NxtButton } from '@nxt/ui/button';
import { NxtCheckbox } from '@nxt/ui/checkbox';
import { NxtFilter, NxtFilterChip, NxtFilterChips, NxtFilterState } from '@nxt/ui/filter';
import { NxtIcon } from '@nxt/ui/icon';
import { NxtSearch, nxtMatches } from '@nxt/ui/search';
import { NxtColumnsState, NxtSort, NxtSortHeader, NxtSortState, NxtTable, NxtTableColumnsTrigger, NxtTableScroll } from '@nxt/ui/table';
import { NxtTag } from '@nxt/ui/tag';
import { NxtTooltip } from '@nxt/ui/tooltip';
import { NxtMemoryViewStore, NxtViewManager, NxtViews, nxtViewTargets } from '@nxt/ui/view-manager';

type Filters = { status: string; depts: string[] };

interface Employee {
  code: string;
  name: string;
  dept: string;
  title: string;
  joined: string;
  status: 'working' | 'leave' | 'probation';
}

const STATUS: Record<Employee['status'], { label: string; tone: 'success' | 'neutral' | 'info' }> = {
  working: { label: 'Đang làm việc', tone: 'success' },
  probation: { label: 'Thử việc', tone: 'info' },
  leave: { label: 'Nghỉ phép dài hạn', tone: 'neutral' },
};

const EMPLOYEES: Employee[] = [
  { code: 'NV-0142', name: 'Nguyễn Thị Ngọc Diệp', dept: 'Kinh doanh miền Nam', title: 'Trưởng nhóm kinh doanh', joined: '03/04/2019', status: 'working' },
  { code: 'NV-0087', name: 'Phạm Thu Hà', dept: 'Phòng Nhân sự', title: 'Chuyên viên C&B', joined: '12/08/2017', status: 'working' },
  { code: 'NV-0215', name: 'Lê Minh Anh', dept: 'Phòng Kế toán', title: 'Kế toán thanh toán', joined: '20/02/2021', status: 'leave' },
  { code: 'NV-0301', name: 'Hoàng Văn Đức', dept: 'Kho vận', title: 'Nhân viên kho', joined: '01/06/2023', status: 'working' },
  { code: 'NV-0056', name: 'Võ Thành Nam', dept: 'Chăm sóc khách hàng', title: 'Trưởng nhóm Chăm sóc khách hàng', joined: '15/10/2016', status: 'working' },
  { code: 'NV-0318', name: 'Trịnh Bảo Ngọc', dept: 'Phòng Nhân sự', title: 'Chuyên viên tuyển dụng', joined: '02/11/2026', status: 'probation' },
  { code: 'NV-0199', name: 'Bùi Khánh Linh', dept: 'Phòng Nhân sự', title: 'Chuyên viên đào tạo', joined: '09/09/2020', status: 'working' },
  { code: 'NV-0270', name: 'Đỗ Minh Khoa', dept: 'Kinh doanh miền Bắc', title: 'Nhân viên kinh doanh', joined: '14/03/2022', status: 'working' },
];

const DEPTS = [...new Set(EMPLOYEES.map((e) => e.dept))].sort((a, b) => a.localeCompare(b, 'vi'));
const dateKey = (d: string) => Number(d.split('/').reverse().join(''));

/** Chế độ xem đã lưu: tìm kiếm, bộ lọc, sắp xếp và cột được lưu dưới một tên; "Đã sửa" khi màn hình lệch chế độ xem */
@Component({
  selector: 'example-view-manager-basic',
  imports: [NxtButton, NxtCheckbox, NxtFilter, NxtFilterChips, NxtIcon, NxtSearch, NxtSort, NxtSortHeader, NxtTable, NxtTableColumnsTrigger, NxtTableScroll, NxtTag, NxtTooltip, NxtViewManager],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Head of the list: the view in use and how many records it shows. -->
    <div class="head">
      <nxt-view-manager [views]="views" [count]="rows().length" itemLabel="nhân viên" />
    </div>
    <div class="bar">
      <nxt-search class="bar__search" label="Tìm nhân viên" placeholder="Tên, mã hoặc chức danh" [value]="query()" (valueChange)="query.set($event)" />
      <nxt-filter #filter title="Lọc nhân viên" [activeCount]="filters.activeCount()" (opened)="filters.edit()" (applied)="filters.apply()" (reset)="filters.resetDraft()">
        <fieldset class="group">
          <legend class="group__title">Trạng thái</legend>
          @for (s of statusOptions; track s.value) {
            <label class="radio">
              <input type="radio" name="vm-status" [value]="s.value" [checked]="filters.draft().status === s.value" (change)="filters.set('status', s.value)" />
              {{ s.label }}
            </label>
          }
        </fieldset>
        <fieldset class="group">
          <legend class="group__title">Phòng ban</legend>
          @for (d of depts; track d) {
            <nxt-checkbox [label]="d" [checked]="filters.draft().depts.includes(d)" (checkedChange)="filters.toggle('depts', d, $event)" />
          }
        </fieldset>
      </nxt-filter>
      <span class="bar__spacer"></span>
      <button nxtIconButton type="button" aria-label="Cài đặt bảng" nxtTooltip="Cài đặt bảng" [nxtTableColumnsFor]="columns">
        <nxt-icon name="adjustments" />
      </button>
    </div>
    @if (chips().length) {
      <div class="chips">
        <nxt-filter-chips [chips]="chips()" [returnFocusTo]="filter" (remove)="filters.clear($any($event))" (clearAll)="filters.clearAll()" />
      </div>
    }
    <nxt-table-scroll class="wrap" label="Danh sách nhân viên">
      <table nxtTable stickyHeader [(nxtSort)]="sort">
        <caption class="nxt-visually-hidden">Danh sách nhân viên</caption>
        <thead>
          <tr>
            @for (c of columns.visible(); track c.key) {
              @switch (c.key) {
                @case ('name') {
                  <th scope="col" class="nxt-table__sticky" nxtSortHeader="name">{{ c.label }}</th>
                }
                @case ('joined') {
                  <th scope="col" class="nxt-table__num" nxtSortHeader="joined">{{ c.label }}</th>
                }
                @default {
                  <th scope="col">{{ c.label }}</th>
                }
              }
            }
          </tr>
        </thead>
        <tbody>
          @for (r of rows(); track r.code) {
            <tr>
              @for (c of columns.visible(); track c.key) {
                @switch (c.key) {
                  @case ('name') {
                    <th scope="row" class="nxt-table__sticky name">{{ r.name }}</th>
                  }
                  @case ('code') {
                    <td class="code">{{ r.code }}</td>
                  }
                  @case ('joined') {
                    <td class="nxt-table__num">{{ r.joined }}</td>
                  }
                  @case ('status') {
                    <td><nxt-tag [tone]="statusOf(r).tone" dot>{{ statusOf(r).label }}</nxt-tag></td>
                  }
                  @case ('dept') {
                    <td>{{ r.dept }}</td>
                  }
                  @default {
                    <td>{{ r.title }}</td>
                  }
                }
              }
            </tr>
          } @empty {
            <tr>
              <td class="empty" [attr.colspan]="columns.visible().length">Không có nhân viên phù hợp. Thử bỏ bớt bộ lọc.</td>
            </tr>
          }
        </tbody>
      </table>
    </nxt-table-scroll>
  `,
  styles: `
    .head {
      padding-block-end: var(--nxt-space-inset-xs);
    }
    .bar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--nxt-space-gap-sm);
      padding-block-end: var(--nxt-space-inset-sm);
    }
    .bar__search {
      flex: 1 1 var(--nxt-layout-item-min-sm);
      max-inline-size: var(--nxt-size-400);
    }
    .bar__spacer {
      flex: 1;
    }
    .chips {
      padding-block-end: var(--nxt-space-inset-sm);
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
      max-block-size: var(--nxt-layout-item-min-lg);
    }
    .code {
      font: var(--nxt-typography-code);
    }
    .name {
      color: var(--nxt-color-text-strong);
      font: var(--nxt-typography-label-md);
    }
    .empty {
      color: var(--nxt-color-text-subtle);
    }
  `,
})
export class ViewManagerBasicExample {
  protected readonly depts = DEPTS;
  protected readonly statusOptions = [
    { value: 'all', label: 'Tất cả' },
    ...Object.entries(STATUS).map(([value, s]) => ({ value, label: s.label })),
  ];
  protected readonly query = signal('');
  protected readonly filters = new NxtFilterState<Filters>({ status: 'all', depts: [] });
  protected readonly sort = signal<NxtSortState>({ active: 'name', direction: 'asc' });
  protected readonly columns = new NxtColumnsState([
    { key: 'name', label: 'Họ và tên', locked: true },
    { key: 'code', label: 'Mã nhân viên' },
    { key: 'title', label: 'Chức danh' },
    { key: 'dept', label: 'Phòng ban' },
    { key: 'joined', label: 'Ngày vào làm' },
    { key: 'status', label: 'Trạng thái' },
  ]);

  /**
   * A product would load and save views on its server; the example keeps them in memory, with one view the
   * user saved earlier ("Phòng Nhân sự").
   */
  protected readonly views = new NxtViews<Filters>({
    ...nxtViewTargets({ query: this.query, filters: this.filters, sort: this.sort, columns: this.columns }),
    store: new NxtMemoryViewStore<Filters>({
      views: [
        {
          id: 'hr',
          name: 'Phòng Nhân sự theo ngày vào làm',
          state: {
            query: '',
            filters: { status: 'all', depts: ['Phòng Nhân sự'] },
            sort: { active: 'joined', direction: 'desc' },
            columns: { order: ['name', 'title', 'joined', 'code', 'dept', 'status'], hidden: ['code', 'dept'] },
          },
        },
      ],
    }),
  });

  protected readonly rows = computed(() => {
    const { status, depts } = this.filters.applied();
    const list = EMPLOYEES.filter(
      (e) => nxtMatches(this.query(), e.name, e.code, e.title) && (status === 'all' || e.status === status) && (!depts.length || depts.includes(e.dept)),
    );
    const { active, direction } = this.sort();
    if (!direction) return list;
    const dir = direction === 'asc' ? 1 : -1;
    return [...list].sort((a, b) => (active === 'joined' ? dateKey(a.joined) - dateKey(b.joined) : a.name.localeCompare(b.name, 'vi')) * dir);
  });

  protected readonly chips = computed<NxtFilterChip[]>(() => {
    const { status, depts } = this.filters.applied();
    return [
      ...(status !== 'all' ? [{ key: 'status', label: `Trạng thái: ${STATUS[status as Employee['status']].label}` }] : []),
      ...(depts.length ? [{ key: 'depts', label: `Phòng ban: ${depts.join(', ')}` }] : []),
    ];
  });

  protected statusOf(e: Employee) {
    return STATUS[e.status];
  }
}
