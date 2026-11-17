import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NxtProgress, NxtProgressSize, NxtProgressTone } from '@nxt/ui/progress';

interface Ring {
  name: string;
  note: string;
  value: number;
  /** Số liệu ngắn đặt giữa vòng (rỗng ở cỡ sm). */
  centre: string;
  spoken: string;
  size: NxtProgressSize;
  tone: NxtProgressTone;
}

/** Dạng vòng: ba cỡ, tông theo ý nghĩa, nhãn giữa vòng và chữ giải thích bên ngoài */
@Component({
  selector: 'example-progress-circle',
  imports: [NxtProgress],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ul class="rings" role="list">
      @for (r of rings; track r.name) {
        <li class="ring">
          <nxt-progress shape="circle" [size]="r.size" [value]="r.value" [tone]="r.tone" [label]="r.name" [valueText]="r.spoken">{{ r.centre }}</nxt-progress>
          <span class="ring__name">{{ r.name }}</span>
          <span class="ring__note nxt-tabular-nums">{{ r.note }}</span>
        </li>
      }
      <li class="ring">
        <nxt-progress shape="circle" size="lg" label="Đang tính lương tháng 10" valueText="Đang xử lý" indeterminate />
        <span class="ring__name">Tính lương tháng 10</span>
        <span class="ring__note">Đang xử lý…</span>
      </li>
    </ul>
  `,
  styles: `
    .rings {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(var(--nxt-layout-item-min-sm), 1fr));
      gap: var(--nxt-space-gap-xl) var(--nxt-space-gap-lg);
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .ring {
      display: grid;
      justify-items: center;
      align-content: start;
      gap: var(--nxt-space-1);
      text-align: center;
    }
    .ring__name {
      margin-block-start: var(--nxt-space-1);
      color: var(--nxt-color-text-strong);
      font: var(--nxt-typography-label-md);
    }
    .ring__note {
      color: var(--nxt-color-text-subtle);
      font: var(--nxt-typography-body-sm);
    }
  `,
})
export class ProgressCircleExample {
  protected readonly rings: Ring[] = [
    { name: 'Hồ sơ đã nộp', note: '10/40 hồ sơ', value: 25, centre: '', spoken: '10 trên 40 hồ sơ', size: 'sm', tone: 'brand' },
    { name: 'Đánh giá năng lực', note: '36/50 người', value: 72, centre: '72%', spoken: '36 trên 50 người', size: 'md', tone: 'brand' },
    { name: 'Giờ tăng ca tháng 10', note: '34/40 giờ · sắp chạm hạn mức', value: 85, centre: '85%', spoken: '34 trên 40 giờ, sắp chạm hạn mức', size: 'lg', tone: 'warning' },
    { name: 'Ngân sách đào tạo', note: 'Còn 12 triệu đồng', value: 98, centre: '98%', spoken: 'Đã dùng 98%, còn 12 triệu đồng', size: 'lg', tone: 'danger' },
    { name: 'Đánh giá quý III', note: 'Hoàn thành · 48/48 người', value: 100, centre: '100%', spoken: 'Hoàn thành, 48 trên 48 người', size: 'lg', tone: 'success' },
  ];
}
