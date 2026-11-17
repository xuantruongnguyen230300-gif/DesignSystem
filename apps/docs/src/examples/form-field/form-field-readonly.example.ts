import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NxtFormField, NxtInput } from '@nxt/ui/form-field';
import { NxtGrid, NxtSpan } from '@nxt/ui/layout';

/** Form hỗn hợp: trường chỉ đọc vẫn focus và copy được, khác trường bị khoá */
@Component({
  selector: 'example-form-field-readonly',
  imports: [NxtFormField, NxtInput, NxtGrid, NxtSpan],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-grid gap="md">
      <nxt-form-field label="Mã nhân viên" readonly hint="Do hệ thống cấp, không đổi sau khi tạo hồ sơ." [nxtSpan]="{ base: 12, md: 6 }">
        <input nxtInput autocomplete="off" class="nxt-tabular-nums" value="NV-02417" />
      </nxt-form-field>
      <nxt-form-field label="Họ và tên" required [nxtSpan]="{ base: 12, md: 6 }">
        <input nxtInput autocomplete="off" [value]="name()" (input)="name.set(text($event))" />
      </nxt-form-field>
      <nxt-form-field label="Phòng ban" readonly hint="Đổi phòng ban qua quyết định điều chuyển." [nxtSpan]="{ base: 12, md: 6 }">
        <select nxtInput>
          <option>Kế toán tổng hợp</option>
          <option>Kinh doanh miền Bắc</option>
          <option>Nhân sự</option>
        </select>
      </nxt-form-field>
      <nxt-form-field label="Email công ty" hint="Mở khi tài khoản đăng nhập đã được kích hoạt." [nxtSpan]="{ base: 12, md: 6 }">
        <input nxtInput type="email" autocomplete="off" disabled />
      </nxt-form-field>
    </nxt-grid>
  `,
})
export class FormFieldReadonlyExample {
  protected readonly name = signal('Phạm Thị Lan');

  protected text(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }
}
