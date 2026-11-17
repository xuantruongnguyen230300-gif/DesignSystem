import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NxtGrid, NxtSpan } from '@nxt/ui/layout';
import { NxtStepper } from '@nxt/ui/stepper';

/** Bắt buộc, trống, chỉ đọc, bị khoá, lỗi do nơi dùng báo và giá trị ngoài khoảng đặt từ ngoài */
@Component({
  selector: 'example-stepper-states',
  imports: [NxtGrid, NxtSpan, NxtStepper],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-grid gap="md">
      <nxt-stepper
        label="Số người phụ thuộc"
        required
        hint="Để trống nếu chưa khai báo."
        [min]="0"
        [max]="10"
        [(value)]="dependants"
        [nxtSpan]="{ base: 12, md: 6 }"
      />
      <nxt-stepper
        label="Số ngày phép đã dùng"
        readonly
        unit="ngày"
        hint="Hệ thống tính, bạn chỉ xem được."
        [min]="0"
        [max]="30"
        [value]="8"
        [nxtSpan]="{ base: 12, md: 6 }"
      />
      <nxt-stepper
        label="Số ngày phép còn lại"
        disabled
        unit="ngày"
        hint="Mở khi hồ sơ được duyệt."
        [min]="0"
        [max]="30"
        [value]="12"
        [nxtSpan]="{ base: 12, md: 6 }"
      />
      <nxt-stepper
        label="Số ngày nghỉ đề nghị"
        unit="ngày"
        error="Số ngày nghỉ vượt quá số ngày còn lại. Hãy nhập tối đa 5 ngày."
        [min]="0"
        [max]="30"
        [(value)]="requested"
        [nxtSpan]="{ base: 12, md: 6 }"
      />
      <nxt-stepper
        label="Số ngày nghỉ đã nhập từ hệ thống cũ"
        unit="ngày"
        hint="Bấm − để đưa về trong khoảng cho phép."
        [min]="0"
        [max]="30"
        [(value)]="imported"
        [nxtSpan]="{ base: 12, md: 6 }"
      />
    </nxt-grid>
  `,
})
export class StepperStatesExample {
  protected readonly dependants = signal<number | null>(null);
  protected readonly requested = signal<number | null>(8);
  protected readonly imported = signal<number | null>(45);
}
