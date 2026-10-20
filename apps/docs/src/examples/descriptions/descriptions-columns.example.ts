import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NxtDescription, NxtDescriptions } from '@nxt/ui/descriptions';

/** Cố định 2 cột cho phần tóm tắt; cặp từ – đến gộp một mục */
@Component({
  selector: 'example-descriptions-columns',
  imports: [NxtDescriptions, NxtDescription],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <dl nxtDescriptions [columns]="2">
      <div nxtDescription label="Loại đơn">Nghỉ phép năm</div>
      <div nxtDescription label="Thời gian"><span class="nxt-tabular-nums">20/10/2026 – 22/10/2026</span> (3 ngày)</div>
      <div nxtDescription label="Người thay thế">Trần Thị Mai</div>
      <div nxtDescription label="Số ngày phép còn lại"><span class="nxt-tabular-nums">9,5 ngày</span></div>
      <div nxtDescription label="Lý do" full>Về quê dự đám cưới em gái tại Nam Định.</div>
    </dl>
  `,
})
export class DescriptionsColumnsExample {}
