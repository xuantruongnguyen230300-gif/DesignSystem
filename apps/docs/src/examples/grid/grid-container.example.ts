import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NxtGrid, NxtSpan, NxtStack } from '@nxt/ui/layout';

/** Cùng một lưới, đặt trong vùng hẹp (như drawer) và vùng rộng */
@Component({
  selector: 'example-grid-container',
  imports: [NgTemplateOutlet, NxtGrid, NxtSpan, NxtStack],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-stack gap="lg">
      <nxt-stack gap="xs">
        <p class="docs-demo-label">Vùng hẹp ~480px (drawer): mỗi field một hàng</p>
        <div class="docs-demo-box" style="max-inline-size: var(--nxt-size-480)">
          <ng-container *ngTemplateOutlet="form" />
        </div>
      </nxt-stack>
      <nxt-stack gap="xs">
        <p class="docs-demo-label">Vùng rộng: hai cột — cùng code, không cần media query</p>
        <div class="docs-demo-box">
          <ng-container *ngTemplateOutlet="form" />
        </div>
      </nxt-stack>
    </nxt-stack>

    <ng-template #form>
      <nxt-grid>
        <div class="docs-demo-cell" [nxtSpan]="{ base: 12, md: 6 }">Loại hợp đồng</div>
        <div class="docs-demo-cell" [nxtSpan]="{ base: 12, md: 6 }">Số hợp đồng</div>
        <div class="docs-demo-cell" [nxtSpan]="{ base: 12, md: 6 }">Ngày hiệu lực</div>
        <div class="docs-demo-cell" [nxtSpan]="{ base: 12, md: 6 }">Ngày hết hạn</div>
      </nxt-grid>
    </ng-template>
  `,
})
export class GridContainerExample {}
