import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NxtButton } from '@nxt/ui/button';
import { NxtIcon } from '@nxt/ui/icon';
import { NxtPopover, NxtPopoverTrigger } from '@nxt/ui/popover';

/** Xác nhận nhanh ngay cạnh nút, có footer: "Bỏ bản nháp này?" */
@Component({
  selector: 'example-popover-confirm',
  imports: [NxtButton, NxtIcon, NxtPopover, NxtPopoverTrigger],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="row">
      <span class="draft">Quy trình “Nghỉ phép · toàn công ty” · {{ hasDraft() ? 'bản nháp lưu lúc 10:24' : 'không có bản nháp' }}</span>
      <button nxtButton variant="ghost" type="button" [disabled]="!hasDraft()" [nxtPopoverTriggerFor]="discard">
        <nxt-icon name="trash" />Bỏ bản nháp
      </button>
    </div>
    <nxt-popover #discard title="Bỏ bản nháp này?">
      <p class="text">Các thay đổi từ 10:24 sẽ mất. Phiên bản 3 đang áp dụng không bị ảnh hưởng.</p>
      <button nxtPopoverFooter nxtButton size="sm" variant="ghost" type="button" cdkFocusInitial (click)="discard.close()">Huỷ</button>
      <button nxtPopoverFooter nxtButton size="sm" variant="danger" type="button" (click)="drop(); discard.close()">Bỏ bản nháp</button>
    </nxt-popover>
    <p class="docs-demo-label status" role="status">{{ message() }}</p>
  `,
  styles: `
    .row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--nxt-space-gap-sm);
    }
    .draft {
      font: var(--nxt-typography-body-md);
    }
    .text {
      max-inline-size: 36ch;
    }
    .status {
      margin-block-start: var(--nxt-space-gap-sm);
    }
  `,
})
export class PopoverConfirmExample {
  protected readonly hasDraft = signal(true);
  protected readonly message = signal('');

  protected drop() {
    this.hasDraft.set(false);
    this.message.set('Đã bỏ bản nháp.');
  }
}
