import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NxtButton } from '@nxt/ui/button';
import { NxtIcon } from '@nxt/ui/icon';
import { NxtInline } from '@nxt/ui/layout';
import { NxtToast } from '@nxt/ui/toast';

/** Xác nhận thành công: hiện ở đáy giữa vùng nội dung, tự ẩn sau 3–5 giây, một toast một lúc */
@Component({
  selector: 'example-toast-basic',
  imports: [NxtButton, NxtIcon, NxtInline],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-inline gap="sm">
      <button nxtButton variant="primary" type="button" (click)="save()"><nxt-icon name="device-floppy" />Lưu hồ sơ</button>
      <button nxtButton type="button" (click)="copy()"><nxt-icon name="copy" />Sao chép mã nhân viên</button>
      <button nxtButton type="button" (click)="sendAll()"><nxt-icon name="send" />Gửi duyệt 2 đơn</button>
    </nxt-inline>
  `,
})
export class ToastBasicExample {
  private readonly toast = inject(NxtToast);

  protected save() {
    this.toast.show('Đã lưu hồ sơ Nguyễn Văn An.');
  }

  protected copy() {
    this.toast.show('Đã sao chép mã nhân viên NV-00241.');
  }

  /** Two results in a row: the second waits until the first has gone. */
  protected sendAll() {
    this.toast.show('Đã gửi duyệt đơn nghỉ phép của Lê Minh Anh.');
    this.toast.show('Đã gửi duyệt đơn tăng ca của Phạm Quốc Bảo.');
  }
}
