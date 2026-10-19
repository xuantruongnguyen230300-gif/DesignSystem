import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { NxtButton } from '@nxt/ui/button';
import { NxtInline, NxtStack } from '@nxt/ui/layout';

/** Disabled có giải thích, và loading giữ nguyên kích thước */
@Component({
  selector: 'example-button-states',
  imports: [NxtButton, NxtInline, NxtStack],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-stack gap="lg">
      <nxt-stack gap="xs">
        <nxt-inline>
          <button nxtButton variant="primary" disabled aria-describedby="approve-reason">Phê duyệt</button>
        </nxt-inline>
        <p id="approve-reason" class="docs-demo-label">Chưa thể phê duyệt: hồ sơ còn thiếu 2 tài liệu bắt buộc.</p>
      </nxt-stack>

      <nxt-stack gap="xs">
        <nxt-inline>
          <button nxtButton variant="primary" [loading]="saving()" (click)="save()">Lưu hồ sơ</button>
          <button nxtButton [loading]="true">Đang xuất file</button>
        </nxt-inline>
        <p class="docs-demo-label" role="status">{{ message() }}</p>
      </nxt-stack>
    </nxt-stack>
  `,
})
export class ButtonStatesExample {
  protected readonly saving = signal(false);
  protected readonly message = signal('');
  private timer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
  }

  protected save() {
    this.saving.set(true);
    this.message.set('');
    this.timer = setTimeout(() => {
      this.saving.set(false);
      this.message.set('Đã lưu hồ sơ lúc ' + new Date().toLocaleTimeString('vi-VN'));
    }, 1500);
  }
}
