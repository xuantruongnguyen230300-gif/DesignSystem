import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NxtSort, NxtSortHeader, NxtSortState, NxtTable } from '@nxt/ui/table';

interface Employee {
  code: string;
  name: string;
  dept: string;
  /** ISO date, so string order is date order. */
  start: string;
  leave: number;
}

type SortKey = 'name' | 'dept' | 'start' | 'leave';

const LABELS: Record<SortKey, { column: string; asc: string; desc: string }> = {
  name: { column: 'Họ và tên', asc: 'A đến Z theo tên', desc: 'Z đến A theo tên' },
  dept: { column: 'Phòng ban', asc: 'A đến Z', desc: 'Z đến A' },
  start: { column: 'Ngày vào làm', asc: 'cũ nhất trước', desc: 'mới nhất trước' },
  leave: { column: 'Phép còn lại', asc: 'ít nhất trước', desc: 'nhiều nhất trước' },
};

/** Vietnamese lists are ordered by given name (last word), then by the full name. */
const byGivenName = (a: string, b: string) => {
  const given = (n: string) => n.trim().split(/\s+/).pop() ?? '';
  return given(a).localeCompare(given(b), 'vi') || a.localeCompare(b, 'vi');
};

/** Sắp xếp: bấm tiêu đề cột để đổi chiều, aria-sort báo cột đang sắp xếp */
@Component({
  selector: 'example-table-sort',
  imports: [NxtTable, NxtSort, NxtSortHeader],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="wrap" role="region" aria-label="Danh sách nhân viên" tabindex="0">
      <table nxtTable [(nxtSort)]="sort">
        <caption class="nxt-visually-hidden">Danh sách nhân viên. Bấm tiêu đề cột để sắp xếp.</caption>
        <thead>
          <tr>
            <th scope="col" nxtSortHeader="name">Họ và tên</th>
            <th scope="col" nxtSortHeader="dept">Phòng ban</th>
            <th scope="col" nxtSortHeader="start">Ngày vào làm</th>
            <th scope="col" nxtSortHeader="leave" class="nxt-table__num">Phép còn lại</th>
          </tr>
        </thead>
        <tbody>
          @for (r of rows(); track r.code) {
            <tr>
              <th scope="row">{{ r.name }}</th>
              <td>{{ r.dept }}</td>
              <td class="nxt-tabular-nums">{{ date(r.start) }}</td>
              <td class="nxt-table__num">{{ r.leave }} ngày</td>
            </tr>
          }
        </tbody>
      </table>
    </div>
    <p class="docs-demo-label status" role="status">{{ sortText() }}</p>
  `,
  styles: `
    .wrap {
      overflow-x: auto;
      border: var(--nxt-border-width-default) solid var(--nxt-color-border-default);
      border-radius: var(--nxt-radius-container);
    }
    .wrap:focus-visible {
      outline: var(--nxt-focus-ring-width) solid var(--nxt-focus-ring-color);
      outline-offset: var(--nxt-focus-ring-offset);
    }
    .status {
      margin-block-start: var(--nxt-space-gap-sm);
    }
  `,
})
export class TableSortExample {
  protected readonly sort = signal<NxtSortState>({ active: 'start', direction: 'asc' });

  private readonly employees: Employee[] = [
    { code: 'NV-0112', name: 'Trần Văn Bình', dept: 'Kế toán', start: '2015-03-02', leave: 4 },
    { code: 'NV-0245', name: 'Phạm Thị Lan', dept: 'Nhân sự', start: '2018-07-16', leave: 9 },
    { code: 'NV-0318', name: 'Lê Hoàng Nam', dept: 'Khối Công nghệ', start: '2021-11-01', leave: 12 },
    { code: 'NV-0402', name: 'Đỗ Minh Thư', dept: 'Kinh doanh miền Bắc', start: '2019-05-20', leave: 2 },
    { code: 'NV-0517', name: 'Nguyễn Thị Ngọc Diệp', dept: 'Kinh doanh miền Nam', start: '2023-02-13', leave: 7 },
    { code: 'NV-0533', name: 'Bùi Quang Huy', dept: 'Vận hành kho', start: '2016-09-05', leave: 0 },
  ];

  protected readonly rows = computed(() => {
    const { active, direction } = this.sort();
    if (!direction) return this.employees;
    const dir = direction === 'asc' ? 1 : -1;
    const key = active as SortKey;
    return [...this.employees].sort((a, b) => {
      if (key === 'leave') return (a.leave - b.leave) * dir;
      if (key === 'name') return byGivenName(a.name, b.name) * dir;
      return a[key].localeCompare(b[key], 'vi') * dir;
    });
  });

  protected readonly sortText = computed(() => {
    const { active, direction } = this.sort();
    if (!direction) return 'Chưa sắp xếp: thứ tự theo mã nhân viên.';
    const label = LABELS[active as SortKey];
    return `Đang sắp xếp theo ${label.column}, ${label[direction]}.`;
  });

  protected date(iso: string): string {
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  }
}
