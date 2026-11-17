import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NxtButton } from '@nxt/ui/button';
import { NxtCard, NxtCardState } from '@nxt/ui/card';
import { NxtIcon } from '@nxt/ui/icon';

/** Trạng thái trong thẻ: đang tải (skeleton giữ chỗ), rỗng (nói rõ không có gì), lỗi (nguyên nhân + "Thử lại") */
@Component({
  selector: 'example-card-states',
  imports: [NxtButton, NxtCard, NxtIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="canvas">
      <div class="cards">
        <nxt-card title="Hợp đồng sắp hết hạn" subtitle="Trong 30 ngày tới" [headingLevel]="3" state="loading" link="/templates/dashboard">
          <p>Danh sách hợp đồng</p>
        </nxt-card>

        <nxt-card
          title="Hồ sơ thiếu giấy tờ"
          subtitle="Nhân viên mới trong tháng"
          [headingLevel]="3"
          state="empty"
          emptyText="Không có hồ sơ nào thiếu giấy tờ."
          link="/templates/dashboard"
        >
          <p>Danh sách hồ sơ</p>
        </nxt-card>

        <nxt-card
          title="Chấm công hôm nay"
          subtitle="Theo máy chấm công"
          [headingLevel]="3"
          [state]="attendance()"
          errorText="Không kết nối được máy chấm công. Hãy thử lại hoặc báo bộ phận IT nếu lỗi kéo dài."
          link="/templates/dashboard"
        >
          <p class="ok">1.196 người đã vào ca, 23 người đi muộn.</p>
          <button nxtCardStateAction nxtButton size="sm" (click)="attendance.set('ready')"><nxt-icon name="refresh" />Thử lại</button>
        </nxt-card>
      </div>
    </div>
  `,
  styles: `
    .canvas {
      padding: var(--nxt-space-inset-lg);
      border-radius: var(--nxt-radius-container);
      background: var(--nxt-color-bg-canvas);
    }
    .cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(min(100%, var(--nxt-layout-item-min-md)), 1fr));
      gap: var(--nxt-space-gap-md);
    }
    .ok {
      color: var(--nxt-color-text-default);
      font: var(--nxt-typography-body-sm);
    }
  `,
})
export class CardStatesExample {
  protected readonly attendance = signal<NxtCardState>('error');
}
