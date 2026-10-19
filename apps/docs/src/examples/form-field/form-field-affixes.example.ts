import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NxtButton } from '@nxt/ui/button';
import { NxtFormField, NxtInput } from '@nxt/ui/form-field';
import { NxtIcon } from '@nxt/ui/icon';
import { NxtGrid, NxtSpan } from '@nxt/ui/layout';

/** Tiền tố và hậu tố: icon, đơn vị, nút hiện mật khẩu */
@Component({
  selector: 'example-form-field-affixes',
  imports: [NxtButton, NxtFormField, NxtInput, NxtIcon, NxtGrid, NxtSpan],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-grid gap="md">
      <nxt-form-field label="Tìm nhân viên" [nxtSpan]="{ base: 12, md: 6 }">
        <nxt-icon nxtPrefix name="search" />
        <input nxtInput type="search" placeholder="Tên, mã hoặc email" />
      </nxt-form-field>

      <nxt-form-field label="Lương cơ bản" hint="Đơn vị: VNĐ/tháng, trước thuế." [nxtSpan]="{ base: 12, md: 6 }">
        <input nxtInput inputmode="numeric" autocomplete="off" class="amount" value="15.000.000" />
        <span nxtSuffix class="unit">VNĐ</span>
      </nxt-form-field>

      <nxt-form-field label="Mật khẩu mới" hint="Tối thiểu 8 ký tự, có cả chữ và số." [nxtSpan]="{ base: 12, md: 6 }">
        <input nxtInput autocomplete="new-password" [type]="visible() ? 'text' : 'password'" />
        <button
          nxtIconButton
          nxtSuffix
          variant="ghost"
          size="sm"
          type="button"
          aria-label="Hiện mật khẩu"
          [attr.aria-pressed]="visible()"
          (click)="visible.set(!visible())"
        >
          <nxt-icon [name]="visible() ? 'eye-off' : 'eye'" />
        </button>
      </nxt-form-field>
    </nxt-grid>
  `,
  styles: `
    .amount {
      font-variant-numeric: tabular-nums;
      text-align: end;
    }
    .unit {
      color: var(--nxt-color-text-subtle);
      font: var(--nxt-typography-label-sm);
    }
  `,
})
export class FormFieldAffixesExample {
  protected readonly visible = signal(false);
}
