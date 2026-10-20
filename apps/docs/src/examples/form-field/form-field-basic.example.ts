import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NxtFormField, NxtInput } from '@nxt/ui/form-field';
import { NxtGrid, NxtSpan } from '@nxt/ui/layout';

/** Nhãn luôn hiển thị, dấu * đánh dấu trường bắt buộc */
@Component({
  selector: 'example-form-field-basic',
  imports: [NxtFormField, NxtInput, NxtGrid, NxtSpan],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-grid gap="md">
      <nxt-form-field label="Họ và tên" required [nxtSpan]="{ base: 12, md: 6 }">
        <input nxtInput autocomplete="off" value="Nguyễn Thị Ngọc Diệp" />
      </nxt-form-field>
      <nxt-form-field label="Email công ty" required [nxtSpan]="{ base: 12, md: 6 }">
        <input nxtInput type="email" autocomplete="off" placeholder="diep.nguyen@congty.vn" />
      </nxt-form-field>
      <nxt-form-field label="Số điện thoại" [nxtSpan]="{ base: 12, md: 6 }">
        <input nxtInput type="tel" inputmode="tel" autocomplete="off" placeholder="0912 345 678" />
      </nxt-form-field>
      <nxt-form-field label="Ngày sinh" [nxtSpan]="{ base: 12, md: 6 }">
        <input nxtInput type="date" value="1994-03-18" />
      </nxt-form-field>
    </nxt-grid>
  `,
})
export class FormFieldBasicExample {}
