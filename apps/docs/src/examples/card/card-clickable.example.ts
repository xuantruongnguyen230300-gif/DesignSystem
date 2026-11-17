import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NxtCard, NxtStat } from '@nxt/ui/card';
import { nxtNumber, nxtPercent } from '@nxt/ui/format';
import { NxtProgress } from '@nxt/ui/progress';
import { NxtTag } from '@nxt/ui/tag';

/** Cả thẻ bấm được (một đích): header số với đơn vị ở phụ đề, xu hướng, trạng thái; không có phần tử tương tác bên trong */
@Component({
  selector: 'example-card-clickable',
  imports: [NxtCard, NxtStat, NxtProgress, NxtTag],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="canvas">
      <div class="cards">
        <nxt-card title="Nhân sự" subtitle="Đến 31/10/2026 | người" [headingLevel]="3" link="/templates/dashboard" [queryParams]="{ view: 'headcount' }" clickable>
          <nxt-stat nxtCardKpi [value]="headcount" delta="2,1%" trend="up" caption="so với tháng 9" />
        </nxt-card>

        <nxt-card title="Quỹ lương" subtitle="Tháng 10/2026 | tỷ ₫" [headingLevel]="3" link="/templates/dashboard" [queryParams]="{ view: 'payroll' }" clickable>
          <nxt-tag nxtCardStatus tone="warning" size="sm" dot>Vượt kế hoạch</nxt-tag>
          <nxt-stat nxtCardKpi [value]="payroll" delta="4,3%" trend="up" deltaTone="negative" caption="so với tháng 9" />
        </nxt-card>

        <nxt-card title="Tuyển dụng" subtitle="Quý IV/2026 | người" [headingLevel]="3" link="/templates/dashboard" [queryParams]="{ view: 'hiring' }" clickable>
          <nxt-stat nxtCardKpi value="32" />
          <nxt-progress label="Tiến độ tuyển dụng quý IV" [value]="80" [valueText]="hiringText" />
          <p class="note">Kế hoạch: {{ plan }} người</p>
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
    .cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(min(100%, var(--nxt-layout-item-min-md)), 1fr));
      gap: var(--nxt-space-gap-md);
    }
    .note {
      margin-block-start: var(--nxt-space-gap-xs);
      color: var(--nxt-color-text-subtle);
      font: var(--nxt-typography-caption);
    }
  `,
})
export class CardClickableExample {
  protected readonly headcount = nxtNumber(1284);
  // The unit (tỷ ₫) is in the subtitle, so the value is the number only.
  protected readonly payroll = nxtNumber(18_640_000_000 / 1e9, { maximumFractionDigits: 1 });
  protected readonly plan = nxtNumber(40);
  protected readonly hiringText = `${nxtNumber(32)} trên ${nxtNumber(40)} người, đạt ${nxtPercent(0.8)}`;
}
