import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NxtTable } from '@nxt/ui/table';

interface PayRow {
  code: string;
  name: string;
  title: string;
  days: number;
  base: number;
  net: number;
}

const money = new Intl.NumberFormat('vi-VN');

/** Bảng cơ bản: caption, tiêu đề hàng và cột, số căn phải */
@Component({
  selector: 'example-table-basic',
  imports: [NxtTable],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="wrap" role="region" aria-label="Bảng lương tháng 9" tabindex="0">
      <table nxtTable>
        <caption class="caption">Bảng lương tháng 9/2026 · Phòng Kế toán (đơn vị: VNĐ)</caption>
        <thead>
          <tr>
            <th scope="col">Mã NV</th>
            <th scope="col">Họ và tên</th>
            <th scope="col">Chức danh</th>
            <th scope="col" class="nxt-table__num">Ngày công</th>
            <th scope="col" class="nxt-table__num">Lương cơ bản</th>
            <th scope="col" class="nxt-table__num">Thực lĩnh</th>
          </tr>
        </thead>
        <tbody>
          @for (r of rows; track r.code) {
            <tr>
              <td class="code">{{ r.code }}</td>
              <th scope="row" class="name">{{ r.name }}</th>
              <td>{{ r.title }}</td>
              <td class="nxt-table__num">{{ format(r.days) }}</td>
              <td class="nxt-table__num">{{ format(r.base) }}</td>
              <td class="nxt-table__num">{{ format(r.net) }}</td>
            </tr>
          }
        </tbody>
        <tfoot>
          <tr>
            <th scope="row" colspan="5" class="total">Tổng thực lĩnh</th>
            <td class="nxt-table__num total">{{ format(totalNet) }}</td>
          </tr>
        </tfoot>
      </table>
    </div>
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
    .caption {
      padding: var(--nxt-space-inset-sm) var(--nxt-space-inset-md);
      color: var(--nxt-color-text-subtle);
      font: var(--nxt-typography-body-sm);
      text-align: start;
    }
    .code {
      color: var(--nxt-color-text-subtle);
      font: var(--nxt-typography-code);
      white-space: nowrap;
    }
    .name {
      color: var(--nxt-color-text-strong);
      font: var(--nxt-typography-label-md);
      white-space: nowrap;
    }
    .total {
      color: var(--nxt-color-text-strong);
      font: var(--nxt-typography-label-md);
    }
    tfoot .total {
      border-block-start: var(--nxt-border-width-default) solid var(--nxt-color-border-default);
      border-block-end: 0;
      font-variant-numeric: tabular-nums;
    }
  `,
})
export class TableBasicExample {
  protected readonly rows: PayRow[] = [
    { code: 'NV-0112', name: 'Trần Văn Bình', title: 'Trưởng phòng Kế toán', days: 22, base: 28_000_000, net: 26_145_000 },
    { code: 'NV-0245', name: 'Phạm Thị Lan', title: 'Kế toán tổng hợp', days: 22, base: 16_500_000, net: 15_402_500 },
    { code: 'NV-0318', name: 'Lê Hoàng Nam', title: 'Kế toán thanh toán', days: 20.5, base: 12_000_000, net: 10_870_000 },
    { code: 'NV-0402', name: 'Đỗ Minh Thư', title: 'Kế toán thuế', days: 22, base: 13_800_000, net: 12_918_000 },
    { code: 'NV-0517', name: 'Vũ Quốc Khánh', title: 'Thực tập sinh', days: 18, base: 5_000_000, net: 4_090_900 },
  ];
  protected readonly totalNet = this.rows.reduce((sum, r) => sum + r.net, 0);

  protected format(value: number): string {
    return money.format(value);
  }
}
