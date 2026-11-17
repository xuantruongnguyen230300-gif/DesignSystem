import { ChangeDetectionStrategy, Component, ElementRef, Injector, afterNextRender, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NxtButton } from '@nxt/ui/button';
import { NxtCheckbox } from '@nxt/ui/checkbox';
import { NxtInline, NxtStack } from '@nxt/ui/layout';

/** Dùng với Reactive Forms: ô xác nhận bắt buộc báo lỗi tại chỗ, khoá cả form sau khi gửi */
@Component({
  selector: 'example-checkbox-forms',
  imports: [ReactiveFormsModule, NxtButton, NxtCheckbox, NxtInline, NxtStack],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()">
      <nxt-stack gap="md">
        <nxt-stack gap="xs">
          <nxt-checkbox formControlName="sendCopy" label="Gửi bản sao cho quản lý trực tiếp" />
          <nxt-checkbox
            formControlName="confirmed"
            label="Tôi xác nhận bảng công tháng 9 là chính xác"
            required
            [error]="showError() ? 'Đánh dấu ô xác nhận để gửi bảng công.' : null"
          />
        </nxt-stack>
        <nxt-inline>
          @if (sent()) {
            <button nxtButton type="button" (click)="reopen()">Mở lại để sửa</button>
          } @else {
            <button nxtButton variant="primary" type="submit">Gửi bảng công</button>
          }
        </nxt-inline>
        <p class="docs-demo-label" role="status">{{ message() }}</p>
      </nxt-stack>
    </form>
  `,
})
export class CheckboxFormsExample {
  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  private readonly injector = inject(Injector);

  protected readonly form = new FormGroup({
    sendCopy: new FormControl(true, { nonNullable: true }),
    confirmed: new FormControl(false, { nonNullable: true, validators: Validators.requiredTrue }),
  });

  private readonly confirmed = toSignal(this.form.controls.confirmed.valueChanges, { initialValue: false });
  private readonly attempted = signal(false);
  protected readonly showError = computed(() => this.attempted() && !this.confirmed());
  protected readonly sent = signal(false);
  protected readonly message = signal('');

  protected submit() {
    this.attempted.set(true);
    if (this.form.invalid) {
      this.message.set('Chưa gửi: cần đánh dấu ô xác nhận bảng công.');
      // Zoneless: aria-invalid lands on the next render, so wait for it before moving focus.
      afterNextRender(() => this.host.querySelector<HTMLInputElement>('input[aria-invalid="true"]')?.focus(), { injector: this.injector });
      return;
    }
    const { sendCopy } = this.form.getRawValue();
    this.form.disable();
    this.sent.set(true);
    this.message.set(sendCopy ? 'Đã gửi bảng công và bản sao cho quản lý. Biểu mẫu đã khoá.' : 'Đã gửi bảng công. Biểu mẫu đã khoá.');
  }

  protected reopen() {
    this.form.enable();
    this.form.controls.confirmed.setValue(false);
    this.attempted.set(false);
    this.sent.set(false);
    this.message.set('Đã mở lại biểu mẫu. Xác nhận lại trước khi gửi.');
  }
}
