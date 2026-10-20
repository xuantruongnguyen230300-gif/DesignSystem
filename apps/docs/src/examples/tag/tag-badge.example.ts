import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NxtInline } from '@nxt/ui/layout';
import { NxtBadge } from '@nxt/ui/tag';

/** Badge đếm: tối đa 99+, ba tông, nhãn cho screen reader */
@Component({
  selector: 'example-tag-badge',
  imports: [NxtBadge, NxtInline],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-inline gap="lg">
      <span class="queue">Chờ tôi duyệt <nxt-badge [value]="12" label="12 đơn mới" /></span>
      <span class="queue">Đã duyệt trong tháng <nxt-badge tone="neutral" [value]="128" label="128 đơn" /></span>
      <span class="queue">Bản nháp <nxt-badge tone="brand" [value]="3" label="3 bản nháp" /></span>
    </nxt-inline>
  `,
  styles: `
    .queue {
      display: inline-flex;
      align-items: center;
      gap: var(--nxt-space-gap-xs);
      color: var(--nxt-color-text-default);
      font: var(--nxt-typography-label-md);
    }
  `,
})
export class TagBadgeExample {}
