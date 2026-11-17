import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NxtStack } from '@nxt/ui/layout';
import { NxtSlider } from '@nxt/ui/slider';

const PRIORITIES = ['Rất thấp', 'Thấp', 'Trung bình', 'Cao', 'Rất cao'];

/** Nhãn chữ hoặc icon ở hai đầu, và giá trị bằng lời cho thang rời rạc */
@Component({
  selector: 'example-slider-ends',
  imports: [NxtStack, NxtSlider],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-stack gap="lg">
      <nxt-slider
        label="Mức ưu tiên"
        hint="Đơn có mức ưu tiên cao được xếp lên đầu danh sách duyệt."
        showValue
        minLabel="Thấp"
        maxLabel="Cao"
        [min]="1"
        [max]="5"
        [formatValue]="priorityText"
        [(value)]="priority"
      />
      <nxt-slider label="Độ sáng giao diện" minIcon="moon" maxIcon="sun" [(value)]="brightness" />
    </nxt-stack>
  `,
})
export class SliderEndsExample {
  protected readonly priority = signal(3);
  protected readonly brightness = signal(60);
  protected readonly priorityText = (value: number) => PRIORITIES[value - 1] ?? String(value);
}
