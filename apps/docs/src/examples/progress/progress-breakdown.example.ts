import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NxtProgress } from '@nxt/ui/progress';

const number = new Intl.NumberFormat('vi-VN');

/** Cơ cấu theo khối: mỗi thanh là tỉ lệ trên tổng nhân sự */
@Component({
  selector: 'example-progress-breakdown',
  imports: [NxtProgress],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="panel">
      <p class="panel__title">Cơ cấu theo khối</p>
      <p class="panel__subtitle nxt-tabular-nums">Tổng {{ format(total) }} nhân sự</p>
      <ul class="bars" role="list">
        @for (d of departments; track d.name) {
          <li class="bars__row">
            <span class="bars__name">{{ d.name }}</span>
            <span class="bars__count nxt-tabular-nums">{{ format(d.count) }}</span>
            <nxt-progress class="bars__meter" [value]="share(d.count)" [label]="d.name" [valueText]="format(d.count) + ' người, ' + share(d.count) + '%'" />
          </li>
        }
      </ul>
    </div>
  `,
  styles: `
    .panel {
      display: grid;
      gap: var(--nxt-space-1);
      max-inline-size: var(--nxt-layout-content-narrow);
      padding: var(--nxt-space-inset-md);
      border: var(--nxt-border-width-default) solid var(--nxt-color-border-default);
      border-radius: var(--nxt-radius-container);
      background: var(--nxt-color-bg-surface);
    }
    .panel__title {
      color: var(--nxt-color-text-strong);
      font: var(--nxt-typography-heading-sm);
    }
    .panel__subtitle {
      margin-block-end: var(--nxt-space-gap-sm);
      color: var(--nxt-color-text-subtle);
      font: var(--nxt-typography-body-sm);
    }
    .bars {
      display: grid;
      gap: var(--nxt-space-gap-xs);
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .bars__row {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: var(--nxt-space-1) var(--nxt-space-gap-md);
      padding-block: var(--nxt-space-1);
    }
    .bars__name {
      color: var(--nxt-color-text-default);
      font: var(--nxt-typography-body-sm);
    }
    .bars__count {
      color: var(--nxt-color-text-strong);
      font: var(--nxt-typography-label-sm);
    }
    .bars__meter {
      grid-column: 1 / -1;
    }
  `,
})
export class ProgressBreakdownExample {
  protected readonly departments = [
    { name: 'Khối Công nghệ', count: 412 },
    { name: 'Khối Kinh doanh', count: 356 },
    { name: 'Khối Vận hành', count: 214 },
    { name: 'Hành chính', count: 121 },
    { name: 'Marketing', count: 71 },
    { name: 'Tài chính – Kế toán', count: 62 },
    { name: 'Nhân sự', count: 48 },
  ];
  protected readonly total = this.departments.reduce((sum, d) => sum + d.count, 0);

  protected share(count: number): number {
    return Math.round((count / this.total) * 100);
  }

  protected format(value: number): string {
    return number.format(value);
  }
}
