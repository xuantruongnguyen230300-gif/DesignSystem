import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NxtStack } from '@nxt/ui/layout';
import { NxtStepper } from '@nxt/ui/stepper';

/** Bước thập phân theo vi-VN (dấu phẩy), nhãn đứng trước cho danh sách thiết lập, số âm */
@Component({
  selector: 'example-stepper-decimal',
  imports: [NxtStack, NxtStepper],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-stack gap="md" align="start">
      <nxt-stepper
        label="Hệ số lương"
        hint="Từ 1,0 đến 10,0, mỗi lần 0,1. Gõ 2,5 hoặc 2.5 đều được."
        [min]="1"
        [max]="10"
        [step]="0.1"
        [(value)]="factor"
      />
      <nxt-stepper
        label="Giờ làm thêm mỗi ngày"
        labelPosition="start"
        unit="giờ"
        [min]="0"
        [max]="4"
        [step]="0.5"
        [(value)]="overtime"
      />
      <nxt-stepper label="Điều chỉnh số ngày phép" hint="Âm là trừ bớt, dương là cộng thêm." unit="ngày" [min]="-5" [max]="5" [(value)]="adjust" />
    </nxt-stack>
  `,
})
export class StepperDecimalExample {
  protected readonly factor = signal<number | null>(2.5);
  protected readonly overtime = signal<number | null>(1.5);
  protected readonly adjust = signal<number | null>(0);
}
