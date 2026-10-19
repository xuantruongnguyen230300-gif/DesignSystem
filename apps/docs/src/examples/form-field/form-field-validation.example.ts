import { ChangeDetectionStrategy, Component, ElementRef, Injector, afterNextRender, inject, signal } from '@angular/core';
import { NxtButton } from '@nxt/ui/button';
import { NxtFormField, NxtInput } from '@nxt/ui/form-field';
import { NxtGrid, NxtInline, NxtSpan, NxtStack } from '@nxt/ui/layout';

interface Errors {
  name?: string;
  email?: string;
  dept?: string;
  start?: string;
}

/** Kiểm tra khi gửi: lỗi hiện tại chỗ, focus về trường lỗi đầu tiên */
@Component({
  selector: 'example-form-field-validation',
  imports: [NxtButton, NxtFormField, NxtInput, NxtGrid, NxtInline, NxtSpan, NxtStack],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form novalidate (submit)="submit($event)">
      <nxt-stack gap="md">
        <p class="docs-demo-label">Các trường có dấu * là bắt buộc.</p>
        <nxt-grid gap="md">
          <nxt-form-field label="Họ và tên" required [error]="errors().name" [nxtSpan]="{ base: 12, md: 6 }">
            <input nxtInput autocomplete="off" [value]="name()" (input)="name.set(text($event)); revalidate()" />
          </nxt-form-field>
          <nxt-form-field label="Email công ty" required hint="Dùng để đăng nhập và nhận phiếu lương." [error]="errors().email" [nxtSpan]="{ base: 12, md: 6 }">
            <input nxtInput type="email" autocomplete="off" [value]="email()" (input)="email.set(text($event)); revalidate()" />
          </nxt-form-field>
          <nxt-form-field label="Phòng ban" required [error]="errors().dept" [nxtSpan]="{ base: 12, md: 6 }">
            <select nxtInput (change)="dept.set(text($event)); revalidate()">
              <option value="" [selected]="!dept()">Chọn phòng ban</option>
              @for (d of departments; track d) {
                <option [value]="d" [selected]="dept() === d">{{ d }}</option>
              }
            </select>
          </nxt-form-field>
          <nxt-form-field label="Ngày vào làm" required hint="Ngày bắt đầu tính thâm niên." [error]="errors().start" [nxtSpan]="{ base: 12, md: 6 }">
            <input nxtInput type="date" [value]="start()" (input)="start.set(text($event)); revalidate()" />
          </nxt-form-field>
        </nxt-grid>
        <nxt-inline>
          <button nxtButton variant="primary" type="submit">Lưu hồ sơ</button>
          <button nxtButton variant="ghost" type="button" (click)="reset()">Nhập lại</button>
        </nxt-inline>
        <p class="docs-demo-label" role="status">{{ message() }}</p>
      </nxt-stack>
    </form>
  `,
})
export class FormFieldValidationExample {
  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  private readonly injector = inject(Injector);

  protected readonly departments = ['Kế toán', 'Kinh doanh miền Bắc', 'Nhân sự', 'Vận hành kho'];
  protected readonly name = signal('');
  protected readonly email = signal('lan.pham@');
  protected readonly dept = signal('');
  protected readonly start = signal('');
  protected readonly errors = signal<Errors>({});
  protected readonly message = signal('');
  /** Validate on submit first; after that, re-validate as the user fixes each field. */
  private submitted = false;

  protected text(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  protected revalidate() {
    if (this.submitted) this.errors.set(this.validate());
  }

  protected submit(event: Event) {
    event.preventDefault();
    this.submitted = true;
    const errors = this.validate();
    this.errors.set(errors);
    const count = Object.keys(errors).length;
    if (count) {
      this.message.set(`Chưa lưu: còn ${count} trường cần sửa.`);
      // Zoneless: aria-invalid lands on the next render, so wait for it before moving focus.
      afterNextRender(() => this.host.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(), { injector: this.injector });
      return;
    }
    this.message.set(`Đã lưu hồ sơ ${this.name().trim()}.`);
  }

  protected reset() {
    this.submitted = false;
    this.name.set('');
    this.email.set('');
    this.dept.set('');
    this.start.set('');
    this.errors.set({});
    this.message.set('');
  }

  private validate(): Errors {
    const errors: Errors = {};
    const email = this.email().trim();
    if (!this.name().trim()) errors.name = 'Nhập họ và tên.';
    if (!email) errors.email = 'Nhập email công ty.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Email chưa đúng định dạng. Ví dụ: lan.pham@congty.vn';
    if (!this.dept()) errors.dept = 'Chọn phòng ban.';
    if (!this.start()) errors.start = 'Chọn ngày vào làm.';
    return errors;
  }
}
