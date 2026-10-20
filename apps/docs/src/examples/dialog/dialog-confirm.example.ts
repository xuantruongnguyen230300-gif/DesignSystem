import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NxtButton } from '@nxt/ui/button';
import { NxtConfirmResult, NxtDialog } from '@nxt/ui/dialog';
import { NxtInline } from '@nxt/ui/layout';

/** Xác nhận: hành động không hoàn tác được, và rời trang khi còn thay đổi chưa lưu */
@Component({
  selector: 'example-dialog-confirm',
  imports: [NxtButton, NxtInline],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-inline gap="sm">
      <button nxtButton variant="danger" type="button" (click)="purge()">Xoá vĩnh viễn 3 hồ sơ</button>
      <button nxtButton type="button" (click)="leave()">Quay lại danh sách</button>
    </nxt-inline>
    <p class="docs-demo-label status" role="status">{{ message() }}</p>
  `,
  styles: `
    .status {
      margin-block-start: var(--nxt-space-gap-sm);
    }
  `,
})
export class DialogConfirmExample {
  private readonly dialog = inject(NxtDialog);
  protected readonly message = signal('');

  /** Không hoàn tác được nên mới hỏi; focus ban đầu ở "Huỷ". */
  protected purge() {
    this.dialog
      .confirm({
        title: 'Xoá vĩnh viễn 3 hồ sơ?',
        message: 'Hồ sơ của Lê Minh Anh, Phạm Quốc Bảo và Nguyễn Thị Ngọc Diệp sẽ bị xoá khỏi hệ thống, kể cả lịch sử công tác. Không khôi phục được.',
        confirmLabel: 'Xoá 3 hồ sơ',
        tone: 'danger',
      })
      .subscribe((answer) => this.message.set(answer === 'confirm' ? 'Đã xoá vĩnh viễn 3 hồ sơ.' : 'Đã huỷ, chưa xoá hồ sơ nào.'));
  }

  /** Ba lựa chọn: lưu rồi rời, rời không lưu, ở lại. Escape = ở lại. */
  protected leave() {
    this.dialog
      .confirm({
        title: 'Rời trang khi chưa lưu?',
        message: 'Các thay đổi trong “Nghỉ phép · toàn công ty” sẽ mất. Lưu nháp để giữ lại mà chưa áp dụng.',
        confirmLabel: 'Lưu nháp',
        alternateLabel: 'Bỏ thay đổi',
        cancelLabel: 'Ở lại',
      })
      .subscribe((answer) => this.message.set(ANSWERS[answer]));
  }
}

const ANSWERS: Record<NxtConfirmResult, string> = {
  confirm: 'Đã lưu nháp và quay lại danh sách.',
  alternate: 'Đã bỏ thay đổi và quay lại danh sách.',
  cancel: 'Ở lại trang, thay đổi vẫn còn.',
};
