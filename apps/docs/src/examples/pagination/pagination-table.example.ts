import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NxtStack } from '@nxt/ui/layout';
import { NxtPagination } from '@nxt/ui/pagination';
import { NxtSegmented, NxtSegmentedOption } from '@nxt/ui/segmented';
import { NxtTable } from '@nxt/ui/table';
import { NxtTag } from '@nxt/ui/tag';

type Filter = 'all' | 'probation';

interface Employee {
  code: string;
  name: string;
  dept: string;
  probation: boolean;
}

const FAMILY = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương'];
const GIVEN = ['Văn An', 'Thị Mai', 'Minh Khoa', 'Thu Hà', 'Quốc Huy', 'Ngọc Diệp', 'Thành Nam', 'Khánh Linh', 'Bảo Châu', 'Hoàng Long', 'Thị Hồng', 'Gia Bảo'];
const DEPTS = ['Phòng Kế toán', 'Phòng Nhân sự', 'Khối Kinh doanh', 'Khối Vận hành', 'Ban Pháp chế'];

/** 47 fictional employees; every 4th one is still on probation. */
const EMPLOYEES: Employee[] = Array.from({ length: 47 }, (_, i) => ({
  code: 'NV-' + String(1001 + i).padStart(4, '0'),
  name: `${FAMILY[i % FAMILY.length]} ${GIVEN[(i * 5 + Math.floor(i / FAMILY.length)) % GIVEN.length]}`,
  dept: DEPTS[i % DEPTS.length],
  probation: i % 4 === 0,
}));

/** Ghép với bảng: tổng giảm thì tự lùi về trang cuối */
@Component({
  selector: 'example-pagination-table',
  imports: [NxtPagination, NxtSegmented, NxtStack, NxtTable, NxtTag],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-stack gap="md">
      <nxt-segmented label="Lọc nhân viên" size="sm" [options]="filters" [(value)]="filter" />
      <table nxtTable>
        <caption class="nxt-visually-hidden">Danh sách nhân viên, trang {{ page() }}</caption>
        <thead>
          <tr>
            <th scope="col">Mã NV</th>
            <th scope="col">Họ tên</th>
            <th scope="col">Phòng ban</th>
            <th scope="col">Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          @for (e of pageRows(); track e.code) {
            <tr>
              <td class="nxt-tabular-nums">{{ e.code }}</td>
              <th scope="row">{{ e.name }}</th>
              <td>{{ e.dept }}</td>
              <td>
                <nxt-tag [tone]="e.probation ? 'info' : 'success'" dot size="sm">{{ e.probation ? 'Thử việc' : 'Chính thức' }}</nxt-tag>
              </td>
            </tr>
          }
        </tbody>
      </table>
      <nxt-pagination
        label="Phân trang bảng nhân viên"
        [total]="rows().length"
        [(page)]="page"
        [(pageSize)]="pageSize"
        [pageSizeOptions]="[5, 10, 20]"
        itemLabel="nhân viên"
      />
    </nxt-stack>
  `,
})
export class PaginationTableExample {
  protected readonly filters: NxtSegmentedOption<Filter>[] = [
    { value: 'all', label: 'Tất cả' },
    { value: 'probation', label: 'Đang thử việc' },
  ];
  protected readonly filter = signal<Filter>('all');
  /** Start on the last page: switching to "Đang thử việc" shrinks the total and the page moves back by itself. */
  protected readonly page = signal(10);
  protected readonly pageSize = signal(5);
  protected readonly rows = computed(() => (this.filter() === 'all' ? EMPLOYEES : EMPLOYEES.filter((e) => e.probation)));
  protected readonly pageRows = computed(() => {
    const start = (this.page() - 1) * this.pageSize();
    return this.rows().slice(start, start + this.pageSize());
  });
}
