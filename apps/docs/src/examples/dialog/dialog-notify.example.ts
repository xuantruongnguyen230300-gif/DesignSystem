import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NxtButton } from '@nxt/ui/button';
import { NxtDialog } from '@nxt/ui/dialog';
import { NxtInline } from '@nxt/ui/layout';

/** Hộp thông báo một nút "Đóng": lỗi hệ thống có "Xem chi tiết", và kết quả có số cần chép lại */
@Component({
  selector: 'example-dialog-notify',
  imports: [NxtButton, NxtInline],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-inline gap="sm">
      <button nxtButton variant="primary" type="button" (click)="saveFailed()">Lưu hồ sơ (mô phỏng mất kết nối)</button>
      <button nxtButton type="button" (click)="issued()">Ban hành quyết định</button>
    </nxt-inline>
    <p class="docs-demo-label status" role="status">{{ message() }}</p>
  `,
  styles: `
    .status {
      margin-block-start: var(--nxt-space-gap-sm);
    }
  `,
})
export class DialogNotifyExample {
  private readonly dialog = inject(NxtDialog);
  protected readonly message = signal('');

  /** Not tied to a field, and the page has no room for an alert while saving: a message box. */
  protected saveFailed() {
    this.dialog
      .notify({
        tone: 'danger',
        title: 'Không lưu được hồ sơ',
        message: 'Mất kết nối tới máy chủ. Kiểm tra mạng rồi bấm Lưu lại; dữ liệu đang nhập vẫn còn trên màn hình.',
        details: 'Mã lỗi: HR-503\nThời điểm: 06/11/2026 09:42\nMã yêu cầu: 7f3c-21a9-4b0e\nGửi mã yêu cầu cho bộ phận hỗ trợ nếu lỗi lặp lại.',
      })
      .subscribe(() => this.message.set('Đã đóng thông báo lỗi; hồ sơ vẫn chưa được lưu.'));
  }

  /** Success that must be written down: not a toast (it would disappear). */
  protected issued() {
    this.dialog
      .notify({
        tone: 'success',
        title: 'Đã ban hành quyết định QĐ-2026/118',
        message: 'Quyết định điều chuyển Lê Minh Anh sang Phòng Tài chính – Kế toán có hiệu lực từ 01/12/2026. Dùng số quyết định để tra cứu và đính kèm hồ sơ.',
      })
      .subscribe(() => this.message.set('Đã đóng thông báo.'));
  }
}
