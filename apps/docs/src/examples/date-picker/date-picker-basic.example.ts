import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NxtDatePicker } from '@nxt/ui/date-picker';
import { NxtFormField } from '@nxt/ui/form-field';
import { NxtGrid, NxtSpan } from '@nxt/ui/layout';

/** Ngày sinh: gõ hoặc chọn trên lịch, không sau hôm nay */
@Component({
  selector: 'example-date-picker-basic',
  imports: [ReactiveFormsModule, NxtDatePicker, NxtFormField, NxtGrid, NxtSpan],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Docs example + a11y fixture: "today" is fixed at 06/11/2026.
  template: `
    <nxt-grid gap="md">
      <nxt-form-field label="Ngày sinh" required hint="Gõ 18031994 hoặc 18/3/1994, hoặc chọn trên lịch." [error]="error()" [nxtSpan]="{ base: 12, md: 6 }">
        <nxt-date-picker [formControl]="birthday" today="2026-11-06" max="2026-11-06" />
      </nxt-form-field>
      <p class="docs-demo-label" [nxtSpan]="{ base: 12, md: 6 }">Giá trị gửi lên máy chủ: {{ birthday.value ?? 'null' }}</p>
    </nxt-grid>
  `,
})
export class DatePickerBasicExample {
  protected readonly birthday = new FormControl<string | null>('1994-03-18');
  private readonly events = toSignal(this.birthday.events);

  protected readonly error = computed(() => {
    this.events();
    const e = this.birthday.errors;
    if (!e || !this.birthday.touched) return null;
    if (e['nxtDateParse']) return `Chưa đọc được ngày "${e['nxtDateParse'].text}". Nhập theo dạng dd/mm/yyyy, ví dụ 18/03/1994.`;
    if (e['nxtDateMax']) return 'Ngày sinh không được sau hôm nay (06/11/2026).';
    return null;
  });
}
