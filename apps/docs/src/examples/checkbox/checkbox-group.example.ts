import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NxtCheckbox, NxtCheckboxGroup } from '@nxt/ui/checkbox';

/** Nhóm lựa chọn: nxt-checkbox-group đặt tên (legend) và gợi ý cho cả nhóm */
@Component({
  selector: 'example-checkbox-group',
  imports: [NxtCheckbox, NxtCheckboxGroup],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-checkbox-group label="Kênh nhận thông báo khi có đơn cần duyệt" hint="Áp dụng cho mọi loại đơn bạn là người duyệt.">
      <nxt-checkbox label="Email công ty" [(checked)]="email" />
      <nxt-checkbox label="Thông báo trên ứng dụng di động" [(checked)]="app" />
      <nxt-checkbox label="Tin nhắn SMS" [(checked)]="sms" />
      <nxt-checkbox label="Zalo" hint="Chưa kết nối. Liên hệ quản trị viên để bật kênh này." disabled />
    </nxt-checkbox-group>
  `,
})
export class CheckboxGroupExample {
  protected readonly email = signal(true);
  protected readonly app = signal(true);
  protected readonly sms = signal(false);
}
