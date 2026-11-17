import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NxtStack } from '@nxt/ui/layout';
import { NxtSlider } from '@nxt/ui/slider';

/** Chọn một giá trị trong khoảng bằng cách kéo hoặc bấm lên thanh; mũi tên, Page Up / Page Down, Home / End trên thanh */
@Component({
  selector: 'example-slider-basic',
  imports: [NxtStack, NxtSlider],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-stack gap="lg">
      <nxt-slider
        label="Ngưỡng cảnh báo quá hạn"
        hint="Cảnh báo khi một đơn đã dùng bằng ngần này thời gian xử lý cho phép."
        showValue
        unit="%"
        [(value)]="overdue"
      />
      <nxt-slider label="Tỉ trọng KPI" showValue unit="%" [min]="10" [max]="50" [step]="5" [(value)]="weight" />
    </nxt-stack>
  `,
})
export class SliderBasicExample {
  protected readonly overdue = signal(80);
  protected readonly weight = signal(30);
}
