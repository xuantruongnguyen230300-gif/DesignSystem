import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NxtButton } from '@nxt/ui/button';
import { NxtStack } from '@nxt/ui/layout';

/** Chuyển động chỉ để giải thích thay đổi; bật "giảm chuyển động" trong hệ điều hành để thấy khác biệt */
@Component({
  selector: 'example-motion-durations',
  imports: [NxtButton, NxtStack],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-stack gap="md" align="start">
      <button nxtButton (click)="open.set(!open())" [attr.aria-expanded]="open()" aria-controls="motion-panel">
        {{ open() ? 'Thu gọn chi tiết' : 'Xem chi tiết' }}
      </button>
      <div id="motion-panel" class="docs-motion" [attr.data-open]="open() ? '' : null">
        <div class="docs-demo-box">
          <p class="nxt-text-label-md">Chi tiết đơn nghỉ phép</p>
          <p class="docs-demo-label">Từ 20/10/2026 đến 22/10/2026 · 3 ngày · Đã được trưởng phòng duyệt</p>
        </div>
      </div>
    </nxt-stack>
  `,
})
export class MotionDurationsExample {
  protected readonly open = signal(false);
}
