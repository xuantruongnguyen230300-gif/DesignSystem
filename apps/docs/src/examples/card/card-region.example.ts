import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NxtButton } from '@nxt/ui/button';
import { NxtCard } from '@nxt/ui/card';
import { NxtGrid, NxtSpan } from '@nxt/ui/layout';
import { NxtTag } from '@nxt/ui/tag';

/** region: hai khối chính của dashboard thành landmark có tên, để người dùng screen reader nhảy thẳng tới */
@Component({
  selector: 'example-card-region',
  imports: [NxtButton, NxtCard, NxtGrid, NxtSpan, NxtTag],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="canvas">
      <nxt-grid gap="md">
        <nxt-card title="Đơn chờ bạn duyệt" subtitle="3 đơn · cũ nhất gửi 2 ngày trước" [headingLevel]="3" region [nxtSpan]="{ base: 12, md: 6 }">
          <a nxtCardActions nxtButton variant="ghost" size="sm" href="#card-region-approvals">Xem tất cả</a>
          <ul class="list">
            @for (r of requests; track r.id) {
              <li class="item">
                <span class="item__text">
                  <span class="item__name">{{ r.name }}</span>
                  <span class="docs-demo-label">{{ r.id }} · {{ r.detail }}</span>
                </span>
                <nxt-tag size="sm" tone="warning" dot>Chờ duyệt</nxt-tag>
              </li>
            }
          </ul>
        </nxt-card>
        <nxt-card title="Sinh nhật trong tuần" subtitle="20/10 – 26/10/2026" [headingLevel]="3" region [nxtSpan]="{ base: 12, md: 6 }">
          <ul class="list">
            @for (b of birthdays; track b.name) {
              <li class="item">
                <span class="item__text">
                  <span class="item__name">{{ b.name }}</span>
                  <span class="docs-demo-label">{{ b.dept }}</span>
                </span>
                <span class="docs-demo-label nxt-tabular-nums">{{ b.date }}</span>
              </li>
            }
          </ul>
        </nxt-card>
      </nxt-grid>
    </div>
  `,
  styles: `
    .canvas {
      padding: var(--nxt-space-inset-lg);
      border-radius: var(--nxt-radius-container);
      background: var(--nxt-color-bg-canvas);
    }
    .list {
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .item {
      display: flex;
      align-items: center;
      gap: var(--nxt-space-gap-md);
      padding-block: var(--nxt-space-inset-xs);
    }
    .item + .item {
      border-block-start: var(--nxt-border-width-default) solid var(--nxt-color-border-subtle);
    }
    .item__text {
      display: grid;
      flex: 1;
      min-inline-size: 0;
    }
    .item__name {
      color: var(--nxt-color-text-strong);
      font: var(--nxt-typography-label-md);
    }
  `,
})
export class CardRegionExample {
  protected readonly requests = [
    { id: 'DNP-0421', name: 'Lý Thanh Trúc', detail: 'Nghỉ phép 21/10 – 23/10/2026' },
    { id: 'TC-0203', name: 'Mai Đức Thịnh', detail: 'Tăng ca 22/10/2026 · 18:00 – 21:00' },
    { id: 'CT-0081', name: 'Hồ Ngọc Hân', detail: 'Công tác Hải Phòng 27/10 – 28/10/2026' },
  ];
  protected readonly birthdays = [
    { name: 'Châu Minh Khang', dept: 'Phòng Kỹ thuật', date: '21/10' },
    { name: 'Tạ Thị Lan', dept: 'Phòng Kế toán', date: '24/10' },
  ];
}
