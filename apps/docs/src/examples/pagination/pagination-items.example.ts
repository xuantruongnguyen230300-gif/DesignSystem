import { ChangeDetectionStrategy, Component } from '@angular/core';
import { nxtPageItems } from '@nxt/ui/pagination';

/** nxtPageItems: luôn 7 ô khi có hơn 7 trang */
@Component({
  selector: 'example-pagination-items',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <table class="cases">
      <caption class="nxt-visually-hidden">Kết quả nxtPageItems với 20 trang</caption>
      <thead>
        <tr>
          <th scope="col">Trang hiện tại</th>
          <th scope="col">nxtPageItems(trang, 20)</th>
        </tr>
      </thead>
      <tbody>
        @for (c of cases; track c.page) {
          <tr>
            <th scope="row" class="nxt-tabular-nums">{{ c.page }}</th>
            <td>
              <code class="slots">
                @for (s of c.items; track $index) {
                  <span class="slot" [class.slot--current]="s === c.page">{{ s }}</span>
                }
              </code>
            </td>
          </tr>
        }
      </tbody>
    </table>
  `,
  styles: `
    .cases {
      border-collapse: collapse;
      font: var(--nxt-typography-body-sm);
    }
    .cases th,
    .cases td {
      padding: var(--nxt-space-inset-xs) var(--nxt-space-inset-md) var(--nxt-space-inset-xs) 0;
      text-align: start;
      border-block-end: var(--nxt-border-width-default) solid var(--nxt-color-border-subtle);
    }
    .cases thead th {
      color: var(--nxt-color-text-subtle);
      font: var(--nxt-typography-label-sm);
    }
    .slots {
      display: inline-flex;
      gap: var(--nxt-space-1);
      font: var(--nxt-typography-code);
    }
    .slot {
      min-inline-size: var(--nxt-size-24);
      text-align: center;
    }
    .slot--current {
      border-radius: var(--nxt-radius-control);
      background: var(--nxt-color-bg-selected);
      color: var(--nxt-color-text-strong);
    }
  `,
})
export class PaginationItemsExample {
  protected readonly cases = [1, 4, 5, 10, 16, 17, 20].map((page) => ({ page, items: nxtPageItems(page, 20) }));
}
