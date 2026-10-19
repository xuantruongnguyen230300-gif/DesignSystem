import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NxtButton } from '@nxt/ui/button';
import { NxtCheckbox } from '@nxt/ui/checkbox';
import { NxtInline, NxtStack } from '@nxt/ui/layout';
import { NxtTooltip } from '@nxt/ui/tooltip';

/** Nút đang disabled vẫn hiện tooltip vì NXT dùng aria-disabled; tắt tooltip khi nút dùng được */
@Component({
  selector: 'example-tooltip-disabled',
  imports: [NxtButton, NxtCheckbox, NxtInline, NxtStack, NxtTooltip],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-stack gap="sm">
      <nxt-checkbox label="Chọn đơn nghỉ phép của Lê Minh Anh" [(checked)]="selected" />
      <nxt-inline>
        <button
          nxtButton
          variant="primary"
          [disabled]="!selected()"
          nxtTooltip="Chọn ít nhất một đơn để duyệt"
          [nxtTooltipDisabled]="selected()"
          (click)="approve()"
        >
          Duyệt đơn đã chọn
        </button>
      </nxt-inline>
      <p class="docs-demo-label" role="status">{{ message() }}</p>
    </nxt-stack>
  `,
})
export class TooltipDisabledExample {
  protected readonly selected = signal(false);
  protected readonly message = signal('');

  protected approve() {
    this.selected.set(false);
    this.message.set('Đã duyệt đơn nghỉ phép của Lê Minh Anh.');
  }
}
