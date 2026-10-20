import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NxtButton } from '@nxt/ui/button';
import { NxtIcon } from '@nxt/ui/icon';
import { NxtInline, NxtStack } from '@nxt/ui/layout';
import { NxtTooltip } from '@nxt/ui/tooltip';

/** Tooltip thêm thông tin phụ ngoài tên nút, được nối bằng aria-describedby */
@Component({
  selector: 'example-tooltip-description',
  imports: [NxtButton, NxtIcon, NxtInline, NxtStack, NxtTooltip],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-stack gap="sm">
      <nxt-inline>
        <button nxtButton nxtTooltip="Lần đồng bộ gần nhất: 08:00 hôm nay, 1.284 nhân viên">
          <nxt-icon name="refresh" />Đồng bộ chấm công
        </button>
        <button nxtIconButton variant="ghost" aria-label="Lịch sử chỉnh sửa" nxtTooltip="Lịch sử chỉnh sửa · 12 thay đổi trong 30 ngày">
          <nxt-icon name="history" />
        </button>
      </nxt-inline>
      <p class="docs-demo-label">Tab tới từng nút: screen reader đọc tên nút, sau đó đọc nội dung tooltip như phần mô tả.</p>
    </nxt-stack>
  `,
})
export class TooltipDescriptionExample {}
