import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { nxtFormatDate } from '@nxt/ui/calendar';
import { NxtDatePicker } from '@nxt/ui/date-picker';
import { NxtFormField } from '@nxt/ui/form-field';
import { NxtGrid, NxtSpan } from '@nxt/ui/layout';

/** Hợp đồng lao động: ngày hiệu lực không trước ngày ký (min), có nút "Hôm nay" */
@Component({
  selector: 'example-date-picker-contract',
  imports: [ReactiveFormsModule, NxtDatePicker, NxtFormField, NxtGrid, NxtSpan],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-grid gap="md" [formGroup]="form">
      <nxt-form-field label="Ngày ký hợp đồng" required [nxtSpan]="{ base: 12, md: 6 }">
        <nxt-date-picker formControlName="signedOn" today="2026-11-06" todayButton />
      </nxt-form-field>
      <nxt-form-field label="Ngày hiệu lực" required [hint]="effectiveHint()" [error]="effectiveError()" [nxtSpan]="{ base: 12, md: 6 }">
        <nxt-date-picker formControlName="effectiveFrom" today="2026-11-06" [min]="signedOn()" [startAt]="signedOn()" todayButton />
      </nxt-form-field>
    </nxt-grid>
  `,
})
export class DatePickerContractExample {
  protected readonly form = new FormGroup({
    signedOn: new FormControl<string | null>('2026-11-06'),
    effectiveFrom: new FormControl<string | null>('2026-12-01'),
  });
  private readonly events = toSignal(this.form.events);
  protected readonly signedOn = toSignal(this.form.controls.signedOn.valueChanges, { initialValue: this.form.controls.signedOn.value });

  protected readonly effectiveHint = computed(() => (this.signedOn() ? `Từ ${nxtFormatDate(this.signedOn())} trở đi.` : 'Không trước ngày ký hợp đồng.'));
  protected readonly effectiveError = computed(() => {
    this.events();
    const c = this.form.controls.effectiveFrom;
    // A later signing date can invalidate the effective date the user did not touch: show that one right away.
    if (c.errors?.['nxtDateMin']) return `Ngày hiệu lực phải từ ${nxtFormatDate(c.errors['nxtDateMin'].min)} trở đi. Hãy chọn lại.`;
    if (c.errors?.['nxtDateParse'] && c.touched) return 'Chưa đọc được ngày. Nhập theo dạng dd/mm/yyyy, ví dụ 01/12/2026.';
    return null;
  });
}
