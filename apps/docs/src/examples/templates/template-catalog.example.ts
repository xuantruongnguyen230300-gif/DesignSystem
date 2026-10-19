import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NxtButton } from '@nxt/ui/button';
import { NxtCard } from '@nxt/ui/card';
import { NxtCheckbox } from '@nxt/ui/checkbox';
import { NxtDrawer } from '@nxt/ui/drawer';
import { NxtEmptyState } from '@nxt/ui/empty-state';
import { NxtFormField, NxtInput } from '@nxt/ui/form-field';
import { NxtIcon } from '@nxt/ui/icon';
import { NxtMenu, NxtMenuItem, NxtMenuSeparator, NxtMenuTrigger } from '@nxt/ui/menu';
import { NxtPageHeader } from '@nxt/ui/page-header';
import { NxtPagination } from '@nxt/ui/pagination';
import { NxtSort, NxtSortHeader, NxtSortState, NxtTable } from '@nxt/ui/table';
import { NxtTag } from '@nxt/ui/tag';
import { NxtTooltip } from '@nxt/ui/tooltip';
import { JOB_GROUPS, JOB_TITLES, JobTitle, dateKey, fold } from './catalog-data';
import { HrmFrame } from './hrm-frame';
import { JobTitleForm, JobTitleFormData } from './job-title-form';

/** Danh mục chức danh — tìm không dấu, lọc, sắp xếp, chọn nhiều, thêm/sửa trong drawer */
@Component({
  selector: 'example-template-catalog',
  imports: [
    HrmFrame,
    NxtButton,
    NxtCard,
    NxtCheckbox,
    NxtEmptyState,
    NxtFormField,
    NxtInput,
    NxtIcon,
    NxtMenu,
    NxtMenuItem,
    NxtMenuSeparator,
    NxtMenuTrigger,
    NxtPageHeader,
    NxtPagination,
    NxtSort,
    NxtSortHeader,
    NxtTable,
    NxtTag,
    NxtTooltip,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <example-hrm-frame>
      <div class="stack">
        <nxt-page-header
          title="Chức danh"
          description="Danh mục chức danh dùng trong hồ sơ nhân viên, hợp đồng và đánh giá năng lực."
          [breadcrumb]="[{ label: 'Thiết lập' }, { label: 'Danh mục' }, { label: 'Chức danh' }]"
        >
          <ng-container ngProjectAs="[nxtPageActions]">
            <button nxtButton type="button"><nxt-icon name="file-import" />Nhập từ Excel</button>
            <button nxtButton variant="primary" type="button" (click)="openForm()"><nxt-icon name="plus" />Thêm chức danh</button>
          </ng-container>
        </nxt-page-header>

        <p class="status" role="status">{{ message() }}</p>

        <nxt-card padding="none">
          @if (selected().size) {
            <div class="bar bar--bulk" role="group" aria-label="Thao tác với chức danh đã chọn">
              <span class="bar__count">Đã chọn {{ selected().size }} chức danh</span>
              <button nxtButton size="sm" type="button" (click)="setActiveForSelected(false)"><nxt-icon name="ban" />Ngừng sử dụng</button>
              <button nxtButton size="sm" type="button" (click)="setActiveForSelected(true)"><nxt-icon name="restore" />Dùng lại</button>
              <button nxtButton size="sm" variant="danger" type="button" (click)="removeSelected()">
                <nxt-icon name="trash" />Xoá {{ selected().size }} chức danh
              </button>
              <span class="bar__spacer"></span>
              <button nxtButton size="sm" variant="ghost" type="button" (click)="clearSelection()">Bỏ chọn</button>
            </div>
          } @else {
            <div class="bar">
              <nxt-form-field class="bar__search" label="Tìm chức danh" hideLabel size="sm">
                <nxt-icon nxtPrefix name="search" />
                <input nxtInput type="search" placeholder="Tìm theo mã hoặc tên (không cần dấu)" [value]="query()" (input)="setQuery($event)" />
              </nxt-form-field>
              <nxt-form-field label="Nhóm chức danh" hideLabel size="sm">
                <select nxtInput (change)="setGroup($event)">
                  <option value="" [selected]="!group()">Tất cả nhóm</option>
                  @for (g of groups; track g) {
                    <option [value]="g" [selected]="group() === g">{{ g }}</option>
                  }
                </select>
              </nxt-form-field>
              <nxt-form-field label="Trạng thái" hideLabel size="sm">
                <select nxtInput (change)="setStatus($event)">
                  <option value="" [selected]="!status()">Mọi trạng thái</option>
                  <option value="active" [selected]="status() === 'active'">Đang sử dụng</option>
                  <option value="inactive" [selected]="status() === 'inactive'">Ngừng sử dụng</option>
                </select>
              </nxt-form-field>
              @if (hasFilters()) {
                <button nxtButton size="sm" variant="ghost" type="button" (click)="clearFilters()"><nxt-icon name="filter-off" />Xoá lọc</button>
              }
              <span class="bar__spacer"></span>
              <button nxtIconButton size="sm" variant="ghost" type="button" aria-label="Làm mới" nxtTooltip="Làm mới"><nxt-icon name="refresh" /></button>
              <button nxtIconButton size="sm" variant="ghost" type="button" aria-label="Xuất Excel" nxtTooltip="Xuất Excel"><nxt-icon name="download" /></button>
            </div>
          }

          @if (rows().length) {
            <div class="table-wrap" role="region" aria-label="Bảng chức danh" tabindex="0">
              <table nxtTable stickyHeader [(nxtSort)]="sort">
                <caption class="nxt-visually-hidden">Danh sách chức danh, {{ rows().length }} kết quả</caption>
                <thead>
                  <tr>
                    <th scope="col" class="nxt-table__select">
                      <nxt-checkbox label="Chọn tất cả chức danh trên trang" hideLabel [checked]="allOnPage()" [indeterminate]="someOnPage()" (checkedChange)="togglePage($event)" />
                    </th>
                    <th scope="col" nxtSortHeader="code">Mã</th>
                    <th scope="col" nxtSortHeader="name">Tên chức danh</th>
                    <th scope="col">Nhóm</th>
                    <th scope="col">Cấp bậc</th>
                    <th scope="col" nxtSortHeader="headcount" class="nxt-table__num">Nhân sự</th>
                    <th scope="col">Trạng thái</th>
                    <th scope="col" nxtSortHeader="updated">Cập nhật</th>
                    <th scope="col" class="nxt-table__actions"><span class="nxt-visually-hidden">Thao tác</span></th>
                  </tr>
                </thead>
                <tbody>
                  @for (r of pageRows(); track r.code) {
                    <tr [attr.aria-selected]="selected().has(r.code)">
                      <td class="nxt-table__select">
                        <nxt-checkbox [label]="'Chọn ' + r.name" hideLabel [checked]="selected().has(r.code)" (checkedChange)="toggle(r.code, $event)" />
                      </td>
                      <td class="code">{{ r.code }}</td>
                      <th scope="row" class="name">{{ r.name }}</th>
                      <td>{{ r.group }}</td>
                      <td class="level">{{ r.level }}</td>
                      <td class="nxt-table__num">{{ r.headcount }}</td>
                      <td>
                        <nxt-tag [tone]="r.active ? 'success' : 'neutral'" dot>{{ r.active ? 'Đang sử dụng' : 'Ngừng sử dụng' }}</nxt-tag>
                      </td>
                      <td class="nxt-tabular-nums">{{ r.updated }}</td>
                      <td class="nxt-table__actions">
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
                            <button nxtMenuItem tone="danger" (triggered)="remove([r.code])"><nxt-icon name="trash" />Xoá chức danh</button>
                          </div>
                        </ng-template>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
            <div class="footer">
              <nxt-pagination [total]="rows().length" [(page)]="page" [(pageSize)]="pageSize" [pageSizeOptions]="[10, 20, 50]" itemLabel="chức danh" />
            </div>
          } @else if (items().length) {
            <nxt-empty-state icon="search" title="Không có chức danh phù hợp" description="Thử từ khoá ngắn hơn hoặc xoá bộ lọc để xem toàn bộ danh mục." size="sm">
              <button nxtEmptyActions nxtButton type="button" (click)="clearFilters()">Xoá bộ lọc</button>
            </nxt-empty-state>
          } @else {
            <nxt-empty-state icon="briefcase" title="Chưa có chức danh nào" description="Chức danh dùng để gán cho nhân viên và hợp đồng. Thêm chức danh đầu tiên hoặc nhập từ Excel.">
              <button nxtEmptyActions nxtButton variant="primary" type="button" (click)="openForm()"><nxt-icon name="plus" />Thêm chức danh</button>
            </nxt-empty-state>
          }
        </nxt-card>
      </div>
    </example-hrm-frame>
  `,
  styles: `
    .stack {
      display: grid;
      gap: var(--nxt-space-gap-lg);
    }
    .status {
      color: var(--nxt-color-text-success);
      font: var(--nxt-typography-label-sm);
    }
    .status:empty {
      display: none;
    }
    .bar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--nxt-space-gap-sm);
      min-block-size: calc(var(--nxt-size-control-md) + 2 * var(--nxt-space-inset-sm));
      padding: var(--nxt-space-inset-sm) var(--nxt-space-inset-md);
      border-block-end: var(--nxt-border-width-default) solid var(--nxt-color-border-default);
    }
    .bar--bulk {
      background: var(--nxt-color-bg-selected);
    }
    .bar__count {
      margin-inline-end: var(--nxt-space-gap-sm);
      color: var(--nxt-color-text-strong);
      font: var(--nxt-typography-label-md);
    }
    .bar__search {
      inline-size: min(100%, var(--nxt-layout-item-min-lg));
    }
    .bar__spacer {
      flex: 1;
    }
    .table-wrap {
      max-block-size: calc(var(--nxt-size-row-md) * 12);
      overflow: auto;
    }
    .table-wrap:focus-visible {
      outline: var(--nxt-focus-ring-width) solid var(--nxt-focus-ring-color);
      outline-offset: calc(-1 * var(--nxt-focus-ring-width));
    }
    .code {
      color: var(--nxt-color-text-subtle);
      font: var(--nxt-typography-code);
      white-space: nowrap;
    }
    .name {
      color: var(--nxt-color-text-strong);
      font: var(--nxt-typography-label-md);
    }
    .level {
      white-space: nowrap;
    }
    .footer {
      padding: var(--nxt-space-inset-sm) var(--nxt-space-inset-md);
      border-block-start: var(--nxt-border-width-default) solid var(--nxt-color-border-default);
    }
  `,
})
export class TemplateCatalogExample {
  private readonly drawer = inject(NxtDrawer);
  protected readonly groups = JOB_GROUPS;
  protected readonly items = signal<JobTitle[]>(JOB_TITLES);
  protected readonly query = signal('');
  protected readonly group = signal('');
  protected readonly status = signal<'' | 'active' | 'inactive'>('');
  protected readonly sort = signal<NxtSortState>({ active: 'code', direction: 'asc' });
  protected readonly page = signal(1);
  protected readonly pageSize = signal(10);
  protected readonly selected = signal(new Set<string>());
  protected readonly message = signal('');

  protected readonly hasFilters = computed(() => !!(this.query() || this.group() || this.status()));

  protected readonly rows = computed(() => {
    const q = fold(this.query().trim());
    const { active, direction } = this.sort();
    const filtered = this.items().filter(
      (r) =>
        (!q || fold(`${r.code} ${r.name}`).includes(q)) &&
        (!this.group() || r.group === this.group()) &&
        (!this.status() || r.active === (this.status() === 'active')),
    );
    if (!direction) return filtered;
    const dir = direction === 'asc' ? 1 : -1;
    const value = (r: JobTitle): string | number =>
      active === 'headcount' ? r.headcount : active === 'updated' ? dateKey(r.updated) : active === 'name' ? r.name : r.code;
    return [...filtered].sort((a, b) => {
      const x = value(a);
      const y = value(b);
      return (typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y), 'vi')) * dir;
    });
  });

  protected readonly pageRows = computed(() => {
    const start = (this.page() - 1) * this.pageSize();
    return this.rows().slice(start, start + this.pageSize());
  });
  protected readonly allOnPage = computed(() => this.pageRows().length > 0 && this.pageRows().every((r) => this.selected().has(r.code)));
  protected readonly someOnPage = computed(() => !this.allOnPage() && this.pageRows().some((r) => this.selected().has(r.code)));

  protected setQuery(event: Event) {
    this.query.set((event.target as HTMLInputElement).value);
    this.page.set(1);
  }
  protected setGroup(event: Event) {
    this.group.set((event.target as HTMLSelectElement).value);
    this.page.set(1);
  }
  protected setStatus(event: Event) {
    this.status.set((event.target as HTMLSelectElement).value as '' | 'active' | 'inactive');
    this.page.set(1);
  }
  protected clearFilters() {
    this.query.set('');
    this.group.set('');
    this.status.set('');
    this.page.set(1);
  }

  protected toggle(code: string, checked: boolean) {
    const next = new Set(this.selected());
    if (checked) next.add(code);
    else next.delete(code);
    this.selected.set(next);
  }
  protected togglePage(checked: boolean) {
    const next = new Set(this.selected());
    for (const r of this.pageRows()) {
      if (checked) next.add(r.code);
      else next.delete(r.code);
    }
    this.selected.set(next);
  }

  protected setActive(codes: string[], active: boolean) {
    this.items.update((list) => list.map((r) => (codes.includes(r.code) ? { ...r, active } : r)));
    this.message.set(`${active ? 'Đã dùng lại' : 'Đã ngừng sử dụng'} ${codes.length} chức danh.`);
  }
  protected setActiveForSelected(active: boolean) {
    this.setActive([...this.selected()], active);
    this.selected.set(new Set());
  }
  protected remove(codes: string[]) {
    this.items.update((list) => list.filter((r) => !codes.includes(r.code)));
    this.selected.update((s) => new Set([...s].filter((c) => !codes.includes(c))));
    this.message.set(`Đã xoá ${codes.length} chức danh.`);
  }
  protected removeSelected() {
    this.remove([...this.selected()]);
  }
  protected clearSelection() {
    this.selected.set(new Set());
  }
  protected duplicate(r: JobTitle) {
    this.openForm(undefined, { ...r, code: '', name: `${r.name} (bản sao)`, headcount: 0 });
  }

  protected openForm(item?: JobTitle, prefill?: Partial<JobTitle>) {
    const ref = this.drawer.open<JobTitle, JobTitleFormData>(JobTitleForm, {
      title: item ? `Sửa chức danh ${item.name}` : 'Thêm chức danh',
      data: { item, prefill, existingCodes: this.items().map((r) => r.code) },
    });
    ref.closed.subscribe((saved) => {
      if (!saved) return;
      const exists = this.items().some((r) => r.code === saved.code);
      this.items.update((list) => (exists ? list.map((r) => (r.code === saved.code ? saved : r)) : [saved, ...list]));
      this.message.set(exists ? `Đã lưu thay đổi cho “${saved.name}”.` : `Đã thêm chức danh “${saved.name}”.`);
    });
  }

}
