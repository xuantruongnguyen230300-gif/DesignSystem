import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NxtGrid, NxtSpan } from '@nxt/ui/layout';
import { NxtSlider } from '@nxt/ui/slider';

/** Chỉ đọc, bị khoá, bước thập phân theo vi-VN và khoảng không bắt đầu từ 0 */
@Component({
  selector: 'example-slider-states',
  imports: [NxtGrid, NxtSpan, NxtSlider],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-grid gap="lg">
      <nxt-slider
        label="Tỉ lệ hoàn thành"
        readonly
        showValue
        unit="%"
        hint="Hệ thống tính từ các đầu việc đã xong, bạn chỉ xem được."
        [value]="65"
        [nxtSpan]="{ base: 12, md: 6 }"
      />
      <nxt-slider
        label="Ngưỡng tự động duyệt"
        disabled
        showValue
        unit="%"
        hint="Mở khi công ty bật duyệt tự động."
        [value]="40"
        [nxtSpan]="{ base: 12, md: 6 }"
      />
      <nxt-slider
        label="Hệ số thưởng"
        showValue
        hint="Từ 0,5 đến 2,0, mỗi lần 0,1."
        [min]="0.5"
        [max]="2"
        [step]="0.1"
        [value]="1.2"
        [nxtSpan]="{ base: 12, md: 6 }"
      />
    </nxt-grid>
  `,
})
export class SliderStatesExample {}
