import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NxtCheckbox } from '@nxt/ui/checkbox';
import { NxtStack } from '@nxt/ui/layout';

/** Nhóm lựa chọn: fieldset và legend đặt tên cho cả nhóm */
@Component({
  selector: 'example-checkbox-group',
  imports: [NxtCheckbox, NxtStack],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <fieldset class="group">
      <legend class="group__legend">Kênh nhận thông báo khi có đơn cần duyệt</legend>
      <nxt-stack gap="xs">
        <nxt-checkbox label="Email công ty" [(checked)]="email" />
        <nxt-checkbox label="Thông báo trên ứng dụng di động" [(checked)]="app" />
        <nxt-checkbox label="Tin nhắn SMS" [(checked)]="sms" />
        <nxt-checkbox label="Zalo (chưa kết nối, liên hệ quản trị viên)" disabled />
      </nxt-stack>
    </fieldset>
  `,
  styles: `
    .group {
      min-inline-size: 0;
      margin: 0;
      padding: 0;
      border: 0;
    }
    .group__legend {
      margin-block-end: var(--nxt-space-gap-sm);
      padding: 0;
      color: var(--nxt-color-text-strong);
      font: var(--nxt-typography-label-md);
    }
  `,
})
export class CheckboxGroupExample {
  protected readonly email = signal(true);
  protected readonly app = signal(true);
  protected readonly sms = signal(false);
}
