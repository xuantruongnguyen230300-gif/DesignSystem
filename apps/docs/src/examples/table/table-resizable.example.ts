import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NxtButton } from '@nxt/ui/button';
import { NxtColumnResize, NxtColumnsState, NxtResizable, NxtSort, NxtSortHeader, NxtSortState, NxtTable, NxtTableScroll } from '@nxt/ui/table';

interface Employee {
  code: string;
  name: string;
  title: string;
  dept: string;
  salary: number;
}

const EMPLOYEES: Employee[] = [
  { code: 'NV-0087', name: 'Phạm Thu Hà', title: 'Chuyên viên C&B', dept: 'Phòng Nhân sự', salary: 24000000 },
  { code: 'NV-0142', name: 'Nguyễn Thị Ngọc Diệp', title: 'Trưởng nhóm kinh doanh khu vực miền Nam', dept: 'Kinh doanh miền Nam', salary: 32500000 },
  { code: 'NV-0215', name: 'Lê Minh Anh', title: 'Kế toán thanh toán', dept: 'Phòng Kế toán', salary: 18000000 },
  { code: 'NV-0301', name: 'Hoàng Văn Đức', title: 'Nhân viên kho', dept: 'Kho vận', salary: 11500000 },
  { code: 'NV-0056', name: 'Võ Thành Nam', title: 'Trưởng nhóm Chăm sóc khách hàng', dept: 'Chăm sóc khách hàng', salary: 27800000 },
];

const money = new Intl.NumberFormat('vi-VN');
const collator = new Intl.Collator('vi');

/** Đổi độ rộng cột: kéo mép phải tiêu đề, hoặc dùng bàn phím; độ rộng được lưu trong NxtColumnsState */
@Component({
  selector: 'example-table-resizable',
  imports: [NxtButton, NxtResizable, NxtSort, NxtSortHeader, NxtTable, NxtTableScroll],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bar">
      <span class="bar__title" role="status">{{ status() }}</span>
      <span class="bar__spacer"></span>
      <button nxtButton variant="ghost" size="sm" type="button" [disabled]="!hasWidths()" (click)="reset()">Khôi phục độ rộng cột</button>
    </div>
    <nxt-table-scroll class="wrap" label="Danh sách nhân viên">
      <table nxtTable stickyHeader [(nxtSort)]="sort">
        <caption class="nxt-visually-hidden">Danh sách nhân viên. Kéo mép phải tiêu đề cột để đổi độ rộng.</caption>
        <thead>
          <tr>
            <th scope="col" nxtResizable="code" [nxtResizeColumns]="columns" [nxtResizeMin]="96" (nxtResized)="resized($event)">Mã NV</th>
            <th scope="col" nxtSortHeader="name" nxtResizable="name" [nxtResizeColumns]="columns" [nxtResizeMin]="144" (nxtResized)="resized($event)">Họ và tên</th>
            <th scope="col" nxtResizable="title" [nxtResizeColumns]="columns" [nxtResizeMin]="120" (nxtResized)="resized($event)">Chức danh</th>
            <th scope="col" nxtSortHeader="dept" nxtResizable="dept" [nxtResizeColumns]="columns" [nxtResizeMin]="144" (nxtResized)="resized($event)">Phòng ban</th>
            <th scope="col" class="nxt-table__num" nxtSortHeader="salary" nxtResizable="salary" [nxtResizeColumns]="columns" [nxtResizeMin]="160" (nxtResized)="resized($event)">
              Lương cơ bản (₫)
            </th>
          </tr>
        </thead>
        <tbody>
          @for (r of rows(); track r.code) {
            <tr>
              <td class="code">{{ r.code }}</td>
              <th scope="row">{{ r.name }}</th>
              <td>{{ r.title }}</td>
              <td>{{ r.dept }}</td>
              <td class="nxt-table__num">{{ money.format(r.salary) }}</td>
            </tr>
          }
        </tbody>
      </table>
    </nxt-table-scroll>
    <p class="docs-demo-label hint">
      Kéo mép phải của tiêu đề cột. Bằng bàn phím: Tab tới tay nắm, rồi ← / → (giữ Shift để bước lớn), Home / End; Enter hoặc nhấp đúp để về độ rộng mặc định; Esc huỷ khi đang kéo.
    </p>
  `,
  styles: `
    .bar {
      display: flex;
      align-items: center;
      gap: var(--nxt-space-gap-sm);
      padding-block-end: var(--nxt-space-inset-sm);
    }
    .bar__title {
      color: var(--nxt-color-text-subtle);
      font: var(--nxt-typography-body-sm);
    }
    .bar__spacer {
      flex: 1;
    }
    .wrap {
      max-block-size: var(--nxt-layout-item-min-lg);
      border: var(--nxt-border-width-default) solid var(--nxt-color-border-default);
      border-radius: var(--nxt-radius-container);
    }
    .code {
      font: var(--nxt-typography-code);
    }
    .hint {
      margin-block-start: var(--nxt-space-gap-sm);
    }
  `,
})
export class TableResizableExample {
  protected readonly money = money;
  protected readonly sort = signal<NxtSortState>({ active: 'name', direction: 'asc' });

  /** Độ rộng người dùng đặt nằm trong `columns.value().widths`: lưu cùng chế độ xem (`@nxt/ui/view-manager`). */
  protected readonly columns = new NxtColumnsState([
    { key: 'code', label: 'Mã NV' },
    { key: 'name', label: 'Họ và tên', locked: true },
    { key: 'title', label: 'Chức danh' },
    { key: 'dept', label: 'Phòng ban' },
    { key: 'salary', label: 'Lương cơ bản (₫)' },
  ]);
  protected readonly hasWidths = computed(() => Object.keys(this.columns.widths()).length > 0);
  protected readonly status = signal('Độ rộng cột theo nội dung.');

  protected readonly rows = computed(() => {
    const { active, direction } = this.sort();
    if (!direction) return EMPLOYEES;
    const sign = direction === 'asc' ? 1 : -1;
    const by: Record<string, (a: Employee, b: Employee) => number> = {
      name: (a, b) => collator.compare(a.name, b.name),
      dept: (a, b) => collator.compare(a.dept, b.dept),
      salary: (a, b) => a.salary - b.salary,
    };
    const compare = by[active];
    return compare ? [...EMPLOYEES].sort((a, b) => sign * compare(a, b)) : EMPLOYEES;
  });

  protected resized(event: NxtColumnResize) {
    const label = this.columns.def(event.key)?.label ?? event.key;
    this.status.set(event.width === null ? `${label}: về độ rộng mặc định.` : `${label}: rộng ${event.width} px.`);
  }

  protected reset() {
    this.columns.resetWidths();
    this.status.set('Độ rộng cột theo nội dung.');
  }
}
