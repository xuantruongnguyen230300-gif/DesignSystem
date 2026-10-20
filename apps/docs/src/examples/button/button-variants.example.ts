import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NxtButton } from '@nxt/ui/button';
import { NxtInline } from '@nxt/ui/layout';

/** Bốn variant theo mức nhấn mạnh */
@Component({
  selector: 'example-button-variants',
  imports: [NxtButton, NxtInline],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-inline>
      <button nxtButton variant="primary">Gửi duyệt</button>
      <button nxtButton>Lưu nháp</button>
      <button nxtButton variant="ghost">Huỷ</button>
      <button nxtButton variant="danger">Xoá 3 nhân viên</button>
    </nxt-inline>
  `,
})
export class ButtonVariantsExample {}
