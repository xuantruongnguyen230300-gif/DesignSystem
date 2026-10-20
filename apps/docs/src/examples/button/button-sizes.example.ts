import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NxtButton } from '@nxt/ui/button';
import { NxtInline } from '@nxt/ui/layout';

/** Ba kích thước — chiều cao lấy theo mật độ hiện hành */
@Component({
  selector: 'example-button-sizes',
  imports: [NxtButton, NxtInline],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-inline>
      <button nxtButton variant="primary" size="sm">Nhỏ (sm)</button>
      <button nxtButton variant="primary">Vừa (md)</button>
      <button nxtButton variant="primary" size="lg">Lớn (lg)</button>
    </nxt-inline>
  `,
})
export class ButtonSizesExample {}
