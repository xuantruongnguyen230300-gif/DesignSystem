import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NxtGrid, NxtSpan, NxtStack } from '@nxt/ui/layout';
import { NxtStepper } from '@nxt/ui/stepper';

/** Chỉnh một con số trong khoảng hẹp: bấm − / + hoặc gõ, mũi tên và Page Up / Page Down trên ô giá trị */
@Component({
  selector: 'example-stepper-basic',
  imports: [NxtGrid, NxtSpan, NxtStack, NxtStepper],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-stack gap="md" align="start">
      <nxt-grid gap="md">
        <nxt-stepper
          label="Số ngày nghỉ phép"
          hint="Tối đa 30 ngày mỗi năm."
          unit="ngày"
          [min]="0"
          [max]="30"
          [(value)]="days"
          [nxtSpan]="{ base: 12, md: 6 }"
        />
        <nxt-stepper
          label="Số lượng cần tuyển"
          required
          [min]="1"
          [max]="50"
          [(value)]="headcount"
          [nxtSpan]="{ base: 12, md: 6 }"
        />
      </nxt-grid>
      <p class="docs-demo-label">{{ summary() }}</p>
    </nxt-stack>
  `,
})
export class StepperBasicExample {
  protected readonly days = signal<number | null>(5);
  protected readonly headcount = signal<number | null>(3);
  protected readonly summary = computed(() => {
    const days = this.days();
    return days === null ? 'Chưa nhập số ngày nghỉ.' : `Nghỉ ${days} ngày, còn lại ${30 - days} ngày phép năm nay.`;
  });
}
