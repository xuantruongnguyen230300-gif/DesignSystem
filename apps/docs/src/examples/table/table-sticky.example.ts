import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NxtTable, NxtTableScroll } from '@nxt/ui/table';

interface Attendance {
  code: string;
  name: string;
  dept: string;
  checkIn: string;
  hours: number;
  late: number;
}

const FAMILY = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Vũ', 'Đặng', 'Bùi', 'Đỗ', 'Phan'];
const GIVEN = [
  'Văn An', 'Thị Bích', 'Minh Châu', 'Quốc Dũng', 'Thu Giang', 'Thanh Hà', 'Gia Khánh', 'Thùy Linh', 'Hoàng Nam', 'Kim Oanh',
  'Hữu Phúc', 'Minh Quân', 'Văn Sơn', 'Thu Trang', 'Phương Uyên', 'Quốc Việt', 'Thị Xuân', 'Hải Yến', 'Đức Hải', 'Phương Thảo',
];
const DEPTS = ['Kế toán', 'Nhân sự', 'Khối Công nghệ', 'Vận hành kho'];

const decimal = new Intl.NumberFormat('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** Header dính khi cuộn, trong vùng cuộn có tên và focus được bằng bàn phím */
@Component({
  selector: 'example-table-sticky',
  imports: [NxtTable, NxtTableScroll],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-table-scroll class="wrap" label="Chấm công tuần 42">
      <table nxtTable stickyHeader>
        <caption class="nxt-visually-hidden">Chấm công tuần 42, {{ rows.length }} nhân viên</caption>
        <thead>
          <tr>
            <th scope="col">Mã NV</th>
            <th scope="col">Họ và tên</th>
            <th scope="col">Phòng ban</th>
            <th scope="col" class="nxt-table__num">Giờ vào TB</th>
            <th scope="col" class="nxt-table__num">Giờ làm (giờ)</th>
            <th scope="col" class="nxt-table__num">Đi muộn (lần)</th>
          </tr>
        </thead>
        <tbody>
          @for (r of rows; track r.code) {
            <tr>
              <td class="nxt-tabular-nums">{{ r.code }}</td>
              <th scope="row">{{ r.name }}</th>
              <td>{{ r.dept }}</td>
              <td class="nxt-table__num">{{ r.checkIn }}</td>
              <td class="nxt-table__num">{{ hours(r.hours) }}</td>
              <td class="nxt-table__num">{{ r.late }}</td>
            </tr>
          }
        </tbody>
      </table>
    </nxt-table-scroll>
    <p class="docs-demo-label hint">Cuộn trong bảng (hoặc Tab vào bảng rồi dùng phím mũi tên): hàng tiêu đề luôn ở trên cùng.</p>
  `,
  styles: `
    .wrap {
      max-block-size: calc(var(--nxt-size-row-md) * 8);
      border: var(--nxt-border-width-default) solid var(--nxt-color-border-default);
      border-radius: var(--nxt-radius-container);
    }
    .hint {
      margin-block-start: var(--nxt-space-gap-sm);
    }
  `,
})
export class TableStickyExample {
  protected readonly rows: Attendance[] = Array.from({ length: 20 }, (_, i) => ({
    code: `NV-${String(1100 + i * 7).padStart(4, '0')}`,
    name: `${FAMILY[i % FAMILY.length]} ${GIVEN[i]}`,
    dept: DEPTS[i % DEPTS.length],
    checkIn: `07:${String(42 + ((i * 7) % 18)).padStart(2, '0')}`,
    hours: 38 + ((i * 13) % 50) / 10,
    late: (i * 5) % 4 === 0 ? 0 : (i * 5) % 4,
  }));

  protected hours(value: number): string {
    return decimal.format(value);
  }
}
