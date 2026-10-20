import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NxtButton } from '@nxt/ui/button';
import { NxtCard } from '@nxt/ui/card';
import { NxtEmptyState } from '@nxt/ui/empty-state';
import { NxtIcon } from '@nxt/ui/icon';

/** Lần đầu dùng: nói danh mục để làm gì và mời tạo bản ghi đầu tiên */
@Component({
  selector: 'example-empty-state-first-use',
  imports: [NxtButton, NxtCard, NxtEmptyState, NxtIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-card padding="none">
      <nxt-empty-state
        icon="calendar-time"
        title="Chưa có ca làm việc nào"
        description="Ca làm việc quy định giờ vào, giờ ra và thời gian nghỉ để hệ thống tính công. Tạo ca đầu tiên hoặc nhập danh sách ca từ Excel."
        [headingLevel]="3"
      >
        <button nxtEmptyActions nxtButton variant="primary" (click)="message.set('Mở form tạo ca làm việc.')">
          <nxt-icon name="plus" />Tạo ca làm việc
        </button>
        <button nxtEmptyActions nxtButton (click)="message.set('Mở hộp thoại nhập từ Excel.')">
          <nxt-icon name="file-import" />Nhập từ Excel
        </button>
      </nxt-empty-state>
    </nxt-card>
    <p class="docs-demo-label status" role="status">{{ message() }}</p>
  `,
  styles: `
    .status {
      margin-block-start: var(--nxt-space-gap-sm);
    }
  `,
})
export class EmptyStateFirstUseExample {
  protected readonly message = signal('');
}
