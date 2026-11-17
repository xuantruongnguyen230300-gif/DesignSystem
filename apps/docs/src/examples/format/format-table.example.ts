import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NXT_FORMAT_PIPES } from '@nxt/ui/format';
import { NxtTable, NxtTableScroll } from '@nxt/ui/table';

interface PayRow {
  code: string;
  name: string;
  joined: string;
  days: number;
  base: number;
  allowance: number | null;
  kpi: number | null;
}

/** Định dạng trong bảng: đơn vị ở tiêu đề cột, ô chỉ có số, giá trị rỗng là "—" */
@Component({
  selector: 'example-format-table',
  imports: [NxtTable, NxtTableScroll, NXT_FORMAT_PIPES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-table-scroll label="Bảng lương tháng 10/2026, Phòng Kế toán">
      <table nxtTable>
        <thead>
          <tr>
            <th scope="col">Mã NV</th>
            <th scope="col">Họ và tên</th>
            <th scope="col">Ngày vào làm</th>
            <th scope="col" class="nxt-table__num">Ngày công (ngày)</th>
            <th scope="col" class="nxt-table__num">Lương cơ bản (₫)</th>
            <th scope="col" class="nxt-table__num">Phụ cấp (₫)</th>
            <th scope="col" class="nxt-table__num">Hoàn thành KPI</th>
          </tr>
        </thead>
        <tbody>
          @for (r of rows; track r.code) {
            <tr>
              <!-- Mã định danh: nguyên chuỗi, không phân cách nghìn. -->
              <td class="nxt-tabular-nums">{{ r.code }}</td>
              <th scope="row">{{ r.name | nxtText }}</th>
              <td class="nxt-tabular-nums">{{ r.joined | nxtDate }}</td>
              <td class="nxt-table__num">{{ r.days | nxtNumber: { fractionDigits: 1 } }}</td>
              <td class="nxt-table__num">{{ r.base | nxtMoney: { display: 'none' } }}</td>
              <td class="nxt-table__num">{{ r.allowance | nxtMoney: { display: 'none' } }}</td>
              <td class="nxt-table__num">{{ r.kpi | nxtPercent: { fractionDigits: 1 } }}</td>
            </tr>
          }
        </tbody>
        <tfoot>
          <tr>
            <th scope="row" colspan="4">Tổng</th>
            <td class="nxt-table__num">{{ totalBase | nxtMoney: { display: 'none' } }}</td>
            <td class="nxt-table__num">{{ totalAllowance | nxtMoney: { display: 'none' } }}</td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </nxt-table-scroll>
  `,
})
export class FormatTableExample {
  protected readonly rows: PayRow[] = [
    { code: '0012045', name: 'Nguyễn Thị Ngọc Diệp', joined: '2019-03-01', days: 22, base: 18_500_000, allowance: 1_200_000, kpi: 0.962 },
    { code: '0013112', name: '  Trần Quốc Huy ', joined: '2021-07-15', days: 21.5, base: 14_200_000, allowance: 800_000, kpi: 0.885 },
    { code: '0014503', name: 'Lê Minh Anh', joined: '2024-11-04', days: 19, base: 11_000_000, allowance: null, kpi: null },
    { code: '0015021', name: 'Phạm Quốc Bảo', joined: '2026-10-01', days: 22, base: 9_800_000, allowance: 500_000, kpi: 1.04 },
  ];
  protected readonly totalBase = this.rows.reduce((s, r) => s + r.base, 0);
  protected readonly totalAllowance = this.rows.reduce((s, r) => s + (r.allowance ?? 0), 0);
}
