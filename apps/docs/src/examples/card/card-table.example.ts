import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NxtButton } from '@nxt/ui/button';
import { NxtCard } from '@nxt/ui/card';
import { NxtTable } from '@nxt/ui/table';

/** padding="none": bảng chạy sát mép card, header vẫn giữ khoảng đệm; vùng cuộn lấy tên từ tiêu đề card (headingId) */
@Component({
  selector: 'example-card-table',
  imports: [NxtButton, NxtCard, NxtTable],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="canvas">
      <nxt-card #card title="Hợp đồng sắp hết hạn" subtitle="Trong 30 ngày tới · 4 hợp đồng" [headingLevel]="3" padding="none">
        <a nxtCardActions nxtButton variant="ghost" size="sm" href="#card-table-all">Xem tất cả</a>
        <!-- Named by the card title: rename the card and the scroll region follows. -->
        <div class="table-wrap" role="region" [attr.aria-labelledby]="card.headingId" tabindex="0">
          <table nxtTable>
            <thead>
              <tr>
                <th scope="col">Nhân viên</th>
                <th scope="col">Loại hợp đồng</th>
                <th scope="col">Ngày hết hạn</th>
                <th scope="col" class="nxt-table__num">Còn lại</th>
              </tr>
            </thead>
            <tbody>
              @for (c of contracts; track c.name) {
                <tr>
                  <th scope="row">{{ c.name }}</th>
                  <td>{{ c.type }}</td>
                  <td class="nxt-tabular-nums">{{ c.end }}</td>
                  <td class="nxt-table__num">{{ c.days }} ngày</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </nxt-card>
    </div>
  `,
  styles: `
    .canvas {
      padding: var(--nxt-space-inset-lg);
      border-radius: var(--nxt-radius-container);
      background: var(--nxt-color-bg-canvas);
    }
    .table-wrap {
      overflow-x: auto;
      border-end-start-radius: var(--nxt-card-radius);
      border-end-end-radius: var(--nxt-card-radius);
    }
    .table-wrap:focus-visible {
      outline: var(--nxt-focus-ring-width) solid var(--nxt-focus-ring-color);
      outline-offset: calc(-1 * var(--nxt-focus-ring-width));
    }
  `,
})
export class CardTableExample {
  protected readonly contracts = [
    { name: 'Võ Thành Nam', type: 'Xác định thời hạn 12 tháng', end: '22/10/2026', days: 3 },
    { name: 'Đỗ Thu Hà', type: 'Thử việc', end: '28/10/2026', days: 9 },
    { name: 'Bùi Gia Huy', type: 'Xác định thời hạn 24 tháng', end: '05/11/2026', days: 17 },
    { name: 'Ngô Thanh Tâm', type: 'Thời vụ', end: '14/11/2026', days: 26 },
  ];
}
