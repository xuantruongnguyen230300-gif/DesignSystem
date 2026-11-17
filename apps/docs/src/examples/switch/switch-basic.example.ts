import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NxtStack } from '@nxt/ui/layout';
import { NxtSwitch } from '@nxt/ui/switch';

/** Thiết lập có hiệu lực ngay: nhãn đứng trước switch, kết quả báo qua live region */
@Component({
  selector: 'example-switch-basic',
  imports: [NxtStack, NxtSwitch],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-stack gap="md" align="start">
      <nxt-switch
        label="Nhận thông báo qua email khi có đơn cần duyệt"
        hint="Áp dụng ngay cho mọi đơn đang chờ bạn duyệt."
        [checked]="email()"
        (checkedChange)="setEmail($event)"
      />
      <nxt-switch
        label="Tự chuyển sang đơn kế tiếp sau khi duyệt"
        [checked]="next()"
        (checkedChange)="setNext($event)"
      />
      <p class="docs-demo-label" role="status">{{ message() }}</p>
    </nxt-stack>
  `,
})
export class SwitchBasicExample {
  protected readonly email = signal(true);
  protected readonly next = signal(false);
  protected readonly message = signal('');

  protected setEmail(on: boolean) {
    this.email.set(on);
    this.message.set(on ? 'Đã bật thông báo qua email.' : 'Đã tắt thông báo qua email.');
  }

  protected setNext(on: boolean) {
    this.next.set(on);
    this.message.set(on ? 'Đã bật tự chuyển sang đơn kế tiếp.' : 'Đã tắt tự chuyển sang đơn kế tiếp.');
  }
}
