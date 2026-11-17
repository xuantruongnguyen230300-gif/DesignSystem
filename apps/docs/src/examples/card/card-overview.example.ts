import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NxtAvatar } from '@nxt/ui/avatar';
import { NxtCard } from '@nxt/ui/card';
import { NXT_FORMAT_PIPES } from '@nxt/ui/format';

interface Request {
  id: string;
  name: string;
  kind: string;
  start: string;
  end: string;
  sent: Date;
}

/** Thẻ danh sách: bộ đếm "5/12", tối đa 5 mục, liên kết "Xem tất cả" tới danh sách đã lọc sẵn */
@Component({
  selector: 'example-card-overview',
  imports: [NxtAvatar, NxtCard, NXT_FORMAT_PIPES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="canvas">
      <nxt-card
        title="Đơn chờ duyệt"
        subtitle="Cũ nhất trước"
        [headingLevel]="3"
        [count]="requests.length"
        [total]="12"
        link="/templates/approval"
        [queryParams]="{ status: 'pending' }"
        viewAllLabel="Xem tất cả 12 đơn"
      >
        <ul class="list" role="list">
          @for (r of requests; track r.id) {
            <li class="item">
              <nxt-avatar [name]="r.name" size="sm" />
              <span class="item__text">
                <span class="item__title">{{ r.name }}</span>
                <span class="item__meta">{{ r.kind }} · {{ r.start | nxtDateRange: r.end }}</span>
              </span>
              <time class="item__time" [attr.datetime]="r.sent.toISOString()" [title]="r.sent | nxtDate: { time: true }">{{
                r.sent | nxtRelative: { now: now }
              }}</time>
            </li>
          }
        </ul>
      </nxt-card>
    </div>
  `,
  styles: `
    .canvas {
      padding: var(--nxt-space-inset-lg);
      border-radius: var(--nxt-radius-container);
      background: var(--nxt-color-bg-canvas);
    }
    nxt-card {
      max-inline-size: calc(var(--nxt-layout-item-min-lg) * 1.5);
    }
    .list {
      display: grid;
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
    .item__text {
      display: grid;
      flex: 1;
      min-inline-size: 0;
    }
    .item__title {
      color: var(--nxt-color-text-strong);
      font: var(--nxt-typography-label-md);
    }
    .item__meta,
    .item__time {
      color: var(--nxt-color-text-subtle);
      font: var(--nxt-typography-body-sm);
    }
    .item__time {
      flex: none;
      font-variant-numeric: tabular-nums;
    }
  `,
})
export class CardOverviewExample {
  /** Fixed "now" (06/11/2026 09:30) so the example never changes. */
  protected readonly now = new Date(2026, 10, 6, 9, 30);
  protected readonly requests: Request[] = [
    { id: 'NP-0301', name: 'Hoàng Văn Đức', kind: 'Nghỉ phép', start: '2026-11-09', end: '2026-11-10', sent: new Date(2026, 10, 2, 16, 40) },
    { id: 'TC-0112', name: 'Phan Bích Ngọc', kind: 'Tăng ca', start: '2026-11-07', end: '2026-11-07', sent: new Date(2026, 10, 5, 8, 15) },
    { id: 'NP-0318', name: 'Lê Minh Anh', kind: 'Nghỉ phép', start: '2026-11-10', end: '2026-11-12', sent: new Date(2026, 10, 6, 7, 5) },
    { id: 'CT-0044', name: 'Lý Hoàng Nam', kind: 'Công tác', start: '2026-11-16', end: '2026-11-20', sent: new Date(2026, 10, 6, 9, 2) },
    { id: 'NP-0320', name: 'Nguyễn Thị Ngọc Diệp', kind: 'Nghỉ phép', start: '2026-11-13', end: '2026-11-13', sent: new Date(2026, 10, 6, 9, 29) },
  ];
}
