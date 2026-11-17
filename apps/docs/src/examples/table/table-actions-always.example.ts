import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NxtButton } from '@nxt/ui/button';
import { NxtIcon } from '@nxt/ui/icon';
import { NxtRowActions, NxtTable, NxtTableScroll } from '@nxt/ui/table';
import { NxtTag, NxtTone } from '@nxt/ui/tag';
import { NxtTooltip } from '@nxt/ui/tooltip';

interface Contract {
  code: string;
  name: string;
  type: string;
  start: string;
  end: string;
  salary: number;
  allowance: number;
  status: { label: string; tone: NxtTone };
}

const CONTRACTS: Contract[] = [
  {
    code: 'HĐ-2025-118',
    name: 'Nguyễn Thu Giang',
    type: 'Xác định thời hạn 12 tháng',
    start: '01/11/2025',
    end: '31/10/2026',
    salary: 18500000,
    allowance: 1200000,
    status: { label: 'Hết hạn trong 30 ngày', tone: 'warning' },
  },
  {
    code: 'HĐ-2024-121',
    name: 'Bùi Hoàng Nam',
    type: 'Xác định thời hạn 24 tháng',
    start: '15/11/2024',
    end: '14/11/2026',
    salary: 22000000,
    allowance: 1500000,
    status: { label: 'Hết hạn trong 30 ngày', tone: 'warning' },
  },
  {
    code: 'HĐ-2023-130',
    name: 'Đỗ Kim Oanh',
    type: 'Không xác định thời hạn',
    start: '01/03/2023',
    end: '—',
    salary: 26000000,
    allowance: 2000000,
    status: { label: 'Đang hiệu lực', tone: 'success' },
  },
];

const money = new Intl.NumberFormat('vi-VN');

/** Thao tác luôn hiện: cột ghim ở mép phải vùng cuộn (reveal="always"), khi thao tác là việc chính của bảng */
@Component({
  selector: 'example-table-actions-always',
  imports: [NxtButton, NxtIcon, NxtRowActions, NxtTable, NxtTableScroll, NxtTag, NxtTooltip],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-table-scroll class="wrap" label="Hợp đồng cần xử lý">
      <table nxtTable>
        <caption class="nxt-visually-hidden">Hợp đồng cần xử lý, {{ rows.length }} hợp đồng</caption>
        <thead>
          <tr>
            <th scope="col">Số hợp đồng</th>
            <th scope="col">Nhân viên</th>
            <th scope="col">Loại hợp đồng</th>
            <th scope="col">Ngày bắt đầu</th>
            <th scope="col">Ngày kết thúc</th>
            <th scope="col" class="nxt-table__num">Lương cơ bản (₫)</th>
            <th scope="col" class="nxt-table__num">Phụ cấp (₫)</th>
            <th scope="col">Trạng thái</th>
            <th scope="col" nxtRowActions reveal="always"></th>
          </tr>
        </thead>
        <tbody>
          @for (r of rows; track r.code) {
            <tr>
              <td class="nxt-tabular-nums">{{ r.code }}</td>
              <th scope="row">{{ r.name }}</th>
              <td>{{ r.type }}</td>
              <td class="nxt-tabular-nums">{{ r.start }}</td>
              <td class="nxt-tabular-nums">{{ r.end }}</td>
              <td class="nxt-table__num">{{ format(r.salary) }}</td>
              <td class="nxt-table__num">{{ format(r.allowance) }}</td>
              <td><nxt-tag size="sm" dot [tone]="r.status.tone">{{ r.status.label }}</nxt-tag></td>
              <td nxtRowActions reveal="always">
                <button nxtButton size="sm" type="button" [attr.aria-label]="'Gia hạn hợp đồng của ' + r.name" (click)="renew(r)">Gia hạn</button>
                <button nxtIconButton size="sm" variant="ghost" type="button" [attr.aria-label]="'Tải PDF hợp đồng của ' + r.name" nxtTooltip="Tải PDF" (click)="download(r)">
                  <nxt-icon name="file-download" />
                </button>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </nxt-table-scroll>
    <p class="docs-demo-label status" role="status">{{ message() }}</p>
  `,
  styles: `
    .wrap {
      border: var(--nxt-border-width-default) solid var(--nxt-color-border-default);
      border-radius: var(--nxt-radius-container);
    }
    .status {
      margin-block-start: var(--nxt-space-gap-sm);
    }
  `,
})
export class TableActionsAlwaysExample {
  protected readonly rows = CONTRACTS;
  protected readonly message = signal('');

  protected format(value: number): string {
    return money.format(value);
  }

  protected renew(r: Contract) {
    this.message.set(`Mở form gia hạn hợp đồng ${r.code} của ${r.name}.`);
  }

  protected download(r: Contract) {
    this.message.set(`Đang tải PDF hợp đồng ${r.code}.`);
  }
}
