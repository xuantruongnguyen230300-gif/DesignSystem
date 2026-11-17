import { ChangeDetectionStrategy, Component, ElementRef, Injector, afterNextRender, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NxtButton } from '@nxt/ui/button';
import { NxtInline, NxtStack } from '@nxt/ui/layout';
import { NxtRadio, NxtRadioGroup } from '@nxt/ui/radio-group';

/** Không chọn sẵn khi chọn sẵn gây giả định sai; bắt buộc thì báo lỗi dưới nhóm khi gửi */
@Component({
  selector: 'example-radio-group-validation',
  imports: [ReactiveFormsModule, NxtButton, NxtInline, NxtRadio, NxtRadioGroup, NxtStack],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form novalidate [formGroup]="form" (ngSubmit)="submit()">
      <nxt-stack gap="lg">
        <nxt-radio-group label="Giới tính" required formControlName="gender" [error]="genderError()">
          <nxt-radio value="female" label="Nữ" />
          <nxt-radio value="male" label="Nam" />
          <nxt-radio value="other" label="Khác" />
        </nxt-radio-group>
        <nxt-radio-group
          label="Người phụ thuộc giảm trừ gia cảnh"
          hint="Khai báo người phụ thuộc chi tiết ở mục Thuế thu nhập cá nhân."
          formControlName="dependants"
        >
          <nxt-radio value="none" label="Không áp dụng" />
          <nxt-radio value="one" label="1 người" />
          <nxt-radio value="many" label="Từ 2 người trở lên" />
        </nxt-radio-group>
        <nxt-inline>
          <button nxtButton variant="primary" type="submit">Lưu hồ sơ</button>
        </nxt-inline>
        <p class="docs-demo-label" role="status">{{ message() }}</p>
      </nxt-stack>
    </form>
  `,
})
export class RadioGroupValidationExample {
  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  private readonly injector = inject(Injector);

  protected readonly form = new FormGroup({
    // No default: pre-selecting a gender would assume something about the person.
    gender: new FormControl<string | null>(null, Validators.required),
    // A safe default exists, so it is pre-selected.
    dependants: new FormControl('none', { nonNullable: true }),
  });

  private readonly gender = toSignal(this.form.controls.gender.valueChanges, { initialValue: null });
  private readonly submitted = signal(false);
  protected readonly genderError = computed(() => (this.submitted() && !this.gender() ? 'Chọn giới tính.' : null));
  protected readonly message = signal('');

  protected submit() {
    this.submitted.set(true);
    if (this.form.invalid) {
      this.message.set('Chưa lưu: còn 1 trường cần sửa.');
      // Native radio group: Tab lands on the first radio when none is checked, so focus that one.
      afterNextRender(() => this.host.querySelector<HTMLElement>('[aria-invalid="true"] input[type="radio"]')?.focus(), {
        injector: this.injector,
      });
      return;
    }
    this.message.set('Đã lưu thông tin cá nhân.');
  }
}
