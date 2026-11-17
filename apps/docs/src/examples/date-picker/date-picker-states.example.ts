import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NxtDatePicker, NxtDateRangePicker } from '@nxt/ui/date-picker';
import { NxtFormField } from '@nxt/ui/form-field';
import { NxtGrid, NxtSpan } from '@nxt/ui/layout';

/** Chỉ đọc và vô hiệu: readonly vẫn focus, copy được; disabled nói rõ vì sao */
@Component({
  selector: 'example-date-picker-states',
  imports: [ReactiveFormsModule, NxtDatePicker, NxtDateRangePicker, NxtFormField, NxtGrid, NxtSpan],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-grid gap="md">
      <nxt-form-field label="Ngày vào làm" hint="Lấy từ hồ sơ tuyển dụng, không sửa ở đây." [nxtSpan]="{ base: 12, md: 6 }">
        <nxt-date-picker [formControl]="joined" today="2026-11-06" readonly />
      </nxt-form-field>
      <nxt-form-field label="Ngày nghỉ việc" hint="Chỉ nhập khi đơn nghỉ việc đã được duyệt." [nxtSpan]="{ base: 12, md: 6 }">
        <nxt-date-picker [formControl]="left" today="2026-11-06" />
      </nxt-form-field>
      <nxt-form-field label="Kỳ chấm công" hint="Kỳ đã khoá sổ, không đổi được." [nxtSpan]="{ base: 12, md: 6 }">
        <nxt-date-range-picker [formControl]="cycle" today="2026-11-06" />
      </nxt-form-field>
    </nxt-grid>
  `,
})
export class DatePickerStatesExample {
  protected readonly joined = new FormControl<string | null>('2021-04-12');
  protected readonly left = new FormControl<string | null>({ value: null, disabled: true });
  protected readonly cycle = new FormControl({ value: { start: '2026-10-01', end: '2026-10-31' }, disabled: true });
}
