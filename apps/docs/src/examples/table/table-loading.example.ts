import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NxtSegmented, NxtSegmentedOption } from '@nxt/ui/segmented';
import { NxtTable, NxtTablePlaceholder, NxtTableScroll } from '@nxt/ui/table';

type Phase = 'first' | 'reload' | 'done';

const ROWS = [
  { code: 'KT-TH', name: 'Kế toán tổng hợp', dept: 'Phòng Kế toán', headcount: 4 },
  { code: 'KT-TT', name: 'Kế toán thanh toán', dept: 'Phòng Kế toán', headcount: 3 },
  { code: 'NS-CB', name: 'Chuyên viên C&B', dept: 'Phòng Nhân sự', headcount: 2 },
  { code: 'KD-TN', name: 'Trưởng nhóm kinh doanh', dept: 'Kinh doanh miền Bắc', headcount: 6 },
];

/** Đang tải: lần đầu là hàng giữ chỗ; tải lại (đổi trang, sắp xếp, lọc) giữ hàng cũ mờ đi, không nhảy bố cục */
@Component({
  selector: 'example-table-loading',
  imports: [NxtSegmented, NxtTable, NxtTablePlaceholder, NxtTableScroll],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-segmented class="phase" label="Trạng thái của bảng" showLabel [options]="phases" [(value)]="phase" />
    <p class="nxt-visually-hidden" role="status">{{ phase() === 'done' ? 'Đã tải ' + rows.length + ' chức danh' : 'Đang tải chức danh…' }}</p>
    <nxt-table-scroll label="Chức danh">
      <table nxtTable [loading]="phase() !== 'done'">
        <caption class="nxt-visually-hidden">Chức danh</caption>
        <thead>
          <tr>
            <th scope="col">Mã</th>
            <th scope="col">Tên chức danh</th>
            <th scope="col">Phòng ban</th>
            <th scope="col" class="nxt-table__num">Nhân sự</th>
          </tr>
        </thead>
        @if (phase() === 'first') {
          <tbody nxtTablePlaceholder [columns]="4" [rows]="rows.length"></tbody>
        } @else {
          <tbody>
            @for (r of rows; track r.code) {
              <tr>
                <td class="code">{{ r.code }}</td>
                <th scope="row">{{ r.name }}</th>
                <td>{{ r.dept }}</td>
                <td class="nxt-table__num">{{ r.headcount }}</td>
              </tr>
            }
          </tbody>
        }
      </table>
    </nxt-table-scroll>
  `,
  styles: `
    .phase {
      margin-block-end: var(--nxt-space-gap-md);
    }
    .code {
      font: var(--nxt-typography-code);
    }
  `,
})
export class TableLoadingExample {
  protected readonly rows = ROWS;
  protected readonly phase = signal<Phase>('first');
  protected readonly phases: NxtSegmentedOption<Phase>[] = [
    { value: 'first', label: 'Tải lần đầu' },
    { value: 'reload', label: 'Tải lại' },
    { value: 'done', label: 'Đã tải xong' },
  ];
}
