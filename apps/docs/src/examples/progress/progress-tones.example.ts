import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NxtProgress } from '@nxt/ui/progress';

interface Meter {
  label: string;
  value: number;
  shown: string;
  spoken: string;
  tone: 'brand' | 'success' | 'warning' | 'danger';
}

/** Tông theo ý nghĩa, luôn kèm chữ giải thích */
@Component({
  selector: 'example-progress-tones',
  imports: [NxtProgress],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ul class="meters" role="list">
      @for (m of meters; track m.label) {
        <li class="meter">
          <span class="meter__label">{{ m.label }}</span>
          <span class="meter__value nxt-tabular-nums">{{ m.shown }}</span>
          <nxt-progress class="meter__bar" [value]="m.value" [label]="m.label" [valueText]="m.spoken" [tone]="m.tone" />
        </li>
      }
    </ul>
  `,
  styles: `
    .meters {
      display: grid;
      gap: var(--nxt-space-gap-md);
      max-inline-size: var(--nxt-layout-content-narrow);
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .meter {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: var(--nxt-space-1) var(--nxt-space-gap-md);
    }
    .meter__label {
      color: var(--nxt-color-text-default);
      font: var(--nxt-typography-body-sm);
    }
    .meter__value {
      color: var(--nxt-color-text-strong);
      font: var(--nxt-typography-label-sm);
    }
    .meter__bar {
      grid-column: 1 / -1;
    }
  `,
})
export class ProgressTonesExample {
  protected readonly meters: Meter[] = [
    { label: 'Ngày phép năm đã dùng', value: 50, shown: '6/12 ngày', spoken: '6 trên 12 ngày', tone: 'brand' },
    { label: 'Đánh giá năng lực quý III', value: 100, shown: 'Hoàn thành · 48/48 người', spoken: 'Hoàn thành, 48 trên 48 người', tone: 'success' },
    { label: 'Giờ tăng ca tháng 10', value: 85, shown: '34/40 giờ · sắp chạm hạn mức', spoken: '34 trên 40 giờ, sắp chạm hạn mức', tone: 'warning' },
    { label: 'Ngân sách đào tạo năm 2026', value: 98, shown: '98% · còn 12 triệu đồng', spoken: 'Đã dùng 98%, còn 12 triệu đồng', tone: 'danger' },
  ];
}
