import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { NxtButton } from '@nxt/ui/button';
import { NxtCard } from '@nxt/ui/card';
import { NxtEmptyState } from '@nxt/ui/empty-state';
import { NxtIcon } from '@nxt/ui/icon';
import { NxtGrid, NxtSpan } from '@nxt/ui/layout';

/** Lỗi tải dữ liệu và thiếu quyền: nói chuyện gì xảy ra và người dùng cần làm gì */
@Component({
  selector: 'example-empty-state-error',
  imports: [NxtButton, NxtCard, NxtEmptyState, NxtIcon, NxtGrid, NxtSpan],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-grid gap="md">
      <nxt-card padding="none" [nxtSpan]="{ base: 12, md: 6 }">
        <nxt-empty-state
          icon="alert-triangle"
          title="Không tải được bảng công tháng 10"
          description="Máy chủ chấm công không phản hồi. Dữ liệu đã nhập không bị mất. Thử lại sau ít phút; nếu vẫn lỗi, báo bộ phận IT kèm mã lỗi TC-504."
          [headingLevel]="3"
        >
          <button nxtEmptyActions nxtButton [loading]="retrying()" (click)="retry()"><nxt-icon name="refresh" />Thử lại</button>
        </nxt-empty-state>
        <p class="docs-demo-label status" role="status">{{ retryMessage() }}</p>
      </nxt-card>

      <nxt-card padding="none" [nxtSpan]="{ base: 12, md: 6 }">
        <nxt-empty-state
          icon="lock"
          title="Bạn chưa có quyền xem bảng lương"
          description="Bảng lương chỉ dành cho Phòng Nhân sự và Phòng Kế toán. Nếu công việc cần dữ liệu này, gửi yêu cầu để quản trị viên cấp quyền."
          [headingLevel]="3"
        >
          <button nxtEmptyActions nxtButton [disabled]="requested()" (click)="request()"><nxt-icon name="send" />{{ requested() ? 'Đã gửi yêu cầu' : 'Gửi yêu cầu cấp quyền' }}</button>
        </nxt-empty-state>
        <p class="docs-demo-label status" role="status">{{ requested() ? 'Đã gửi yêu cầu tới quản trị viên Trần Thị Mai. Bạn sẽ nhận email khi được cấp quyền.' : '' }}</p>
      </nxt-card>
    </nxt-grid>
  `,
  styles: `
    .status {
      padding: 0 var(--nxt-space-inset-lg) var(--nxt-space-inset-lg);
      text-align: center;
    }
    .status:empty {
      padding: 0;
    }
  `,
})
export class EmptyStateErrorExample {
  protected readonly retrying = signal(false);
  protected readonly retryMessage = signal('');
  protected readonly requested = signal(false);
  private timer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
  }

  protected retry() {
    this.retrying.set(true);
    this.retryMessage.set('');
    this.timer = setTimeout(() => {
      this.retrying.set(false);
      const time = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      this.retryMessage.set(`Vẫn chưa kết nối được lúc ${time}. Hệ thống sẽ tự thử lại sau 1 phút.`);
    }, 1200);
  }

  protected request() {
    this.requested.set(true);
  }
}
