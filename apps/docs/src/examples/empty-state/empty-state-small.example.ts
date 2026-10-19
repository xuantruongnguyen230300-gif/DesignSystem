import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NxtCard } from '@nxt/ui/card';
import { NxtEmptyState } from '@nxt/ui/empty-state';
import { NxtGrid, NxtSpan } from '@nxt/ui/layout';

/** Size sm trong widget dashboard: ngắn, không cần hành động */
@Component({
  selector: 'example-empty-state-small',
  imports: [NxtCard, NxtEmptyState, NxtGrid, NxtSpan],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="canvas">
      <!-- Mô phỏng trang tổng quan: h1 là tiêu đề trang, tiêu đề card là h2, empty state trong card là h3. -->
      <nxt-grid gap="md">
        <nxt-card title="Đơn chờ bạn duyệt" subtitle="Nghỉ phép, tăng ca, công tác" [nxtSpan]="{ base: 12, md: 6 }">
          <nxt-empty-state size="sm" icon="circle-check" title="Không còn đơn nào chờ duyệt" description="Đơn mới sẽ tự xuất hiện ở đây." [headingLevel]="3" />
        </nxt-card>
        <nxt-card title="Sinh nhật trong tuần" subtitle="17/10 – 23/10/2026" [nxtSpan]="{ base: 12, md: 6 }">
          <nxt-empty-state size="sm" icon="cake" title="Tuần này không có sinh nhật nào" [headingLevel]="3" />
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
  `,
})
export class EmptyStateSmallExample {}
