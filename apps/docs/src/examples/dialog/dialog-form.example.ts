import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, ElementRef, Injector, afterNextRender, inject, signal } from '@angular/core';
import { NxtButton } from '@nxt/ui/button';
import { NxtDialog, NxtDialogLayout } from '@nxt/ui/dialog';
import { NxtFormField, NxtInput } from '@nxt/ui/form-field';

/** Form rất ngắn cần trả lời ngay: lý do từ chối đơn */
@Component({
  selector: 'example-dialog-form',
  imports: [NxtButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button nxtButton type="button" (click)="reject()">Từ chối đơn của Lê Minh Anh</button>
    <p class="docs-demo-label status" role="status">{{ message() }}</p>
  `,
  styles: `
    .status {
      margin-block-start: var(--nxt-space-gap-sm);
    }
  `,
})
export class DialogFormExample {
  private readonly dialog = inject(NxtDialog);
  protected readonly message = signal('');

  protected reject() {
    const ref = this.dialog.open<string, string>(RejectReason, { data: 'Lê Minh Anh' });
    // Escape, nút Đóng, nút Huỷ đều trả undefined; focus tự về nút đã mở dialog.
    ref.closed.subscribe((reason) => this.message.set(reason ? `Đã từ chối đơn. Lý do: ${reason}` : ''));
  }
}

/** Nội dung dialog: một trường bắt buộc, kiểm tra khi bấm nút chính. */
@Component({
  selector: 'example-dialog-reject-reason',
  imports: [NxtButton, NxtDialogLayout, NxtFormField, NxtInput],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-dialog-layout title="Từ chối đơn nghỉ phép" [description]="employee + ' sẽ nhận được lý do này cùng thông báo từ chối.'">
      <form id="reject-form" (submit)="submit($event)">
        <nxt-form-field label="Lý do từ chối" required [error]="error()">
          <textarea nxtInput rows="3" cdkFocusInitial [value]="reason()" (input)="reason.set(text($event))"></textarea>
        </nxt-form-field>
      </form>
      <ng-container ngProjectAs="[nxtDialogFooter]">
        <button nxtButton type="button" (click)="ref.close()">Huỷ</button>
        <button nxtButton variant="danger" type="submit" form="reject-form">Từ chối đơn</button>
      </ng-container>
    </nxt-dialog-layout>
  `,
})
export class RejectReason {
  protected readonly ref = inject<DialogRef<string>>(DialogRef);
  protected readonly employee = inject<string>(DIALOG_DATA);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly injector = inject(Injector);
  protected readonly reason = signal('');
  protected readonly error = signal('');

  protected submit(event: Event) {
    event.preventDefault();
    const reason = this.reason().trim();
    if (!reason) {
      this.error.set(`Nhập lý do để ${this.employee} biết cần sửa gì.`);
      afterNextRender(() => this.host.querySelector('textarea')?.focus(), { injector: this.injector });
      return;
    }
    this.ref.close(reason);
  }

  protected text(event: Event): string {
    return (event.target as HTMLTextAreaElement).value;
  }
}
