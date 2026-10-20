import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NxtGrid, NxtSpan, NxtSpanValue, NxtStack } from '@nxt/ui/layout';

/** Lưới 12 cột và các cách chia thường gặp */
@Component({
  selector: 'example-grid-columns',
  imports: [NxtGrid, NxtSpan, NxtStack],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-stack gap="md">
      @for (row of rows; track $index) {
        <nxt-grid>
          @for (span of row; track $index) {
            <div class="docs-demo-cell" [nxtSpan]="span">{{ span }}</div>
          }
        </nxt-grid>
      }
    </nxt-stack>
  `,
})
export class GridColumnsExample {
  protected readonly rows: NxtSpanValue[][] = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [6, 6],
    [4, 4, 4],
    [3, 3, 3, 3],
    [8, 4],
    ['full'],
  ];
}
