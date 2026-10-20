import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NxtCard, NxtStat } from '@nxt/ui/card';

/** Chỉ số: hướng biến động bằng icon và chữ, tốt hay xấu do deltaTone quyết định */
@Component({
  selector: 'example-card-stat',
  imports: [NxtCard, NxtStat],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="canvas">
      <div class="stats">
        <!-- Tăng nhưng không tốt cũng không xấu: để tone mặc định (neutral). -->
        <nxt-card>
          <nxt-stat label="Tổng nhân sự" value="1.284" icon="users" delta="2,1%" trend="up" caption="so với tháng 9" />
        </nxt-card>
        <!-- Nghỉ việc giảm là tin tốt: mũi tên đi xuống nhưng tone positive. -->
        <nxt-card>
          <nxt-stat label="Tỷ lệ nghỉ việc" value="0,7" unit="%" icon="user-minus" delta="0,4 điểm" trend="down" deltaTone="positive" caption="so với tháng 9" />
        </nxt-card>
        <!-- Chi phí tăng ca tăng là tin xấu: mũi tên đi lên nhưng tone negative. -->
        <nxt-card>
          <nxt-stat label="Chi phí tăng ca" value="214" unit="triệu ₫" icon="cash" delta="18%" trend="up" deltaTone="negative" caption="so với tháng 9" />
        </nxt-card>
        <nxt-card>
          <nxt-stat label="Hồ sơ đã số hoá" value="92" unit="%" icon="file-check" delta="0 điểm" trend="flat" caption="so với tháng 9" />
        </nxt-card>
      </div>
    </div>
  `,
  styles: `
    .canvas {
      padding: var(--nxt-space-inset-lg);
      border-radius: var(--nxt-radius-container);
      background: var(--nxt-color-bg-canvas);
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, var(--nxt-layout-item-min-md)), 1fr));
      gap: var(--nxt-space-gap-md);
    }
  `,
})
export class CardStatExample {}
