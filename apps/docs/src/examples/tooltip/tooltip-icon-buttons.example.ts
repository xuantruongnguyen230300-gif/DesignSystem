import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NxtButton } from '@nxt/ui/button';
import { NxtIcon } from '@nxt/ui/icon';
import { NxtTooltip } from '@nxt/ui/tooltip';

/** Nút chỉ có icon: aria-label là tên, tooltip nhắc lại cho người dùng chuột */
@Component({
  selector: 'example-tooltip-icon-buttons',
  imports: [NxtButton, NxtIcon, NxtTooltip],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="tools" role="group" aria-label="Thao tác với bảng chấm công">
      <button nxtIconButton variant="ghost" aria-label="Làm mới" nxtTooltip="Làm mới"><nxt-icon name="refresh" /></button>
      <button nxtIconButton variant="ghost" aria-label="Xuất Excel" nxtTooltip="Xuất Excel"><nxt-icon name="download" /></button>
      <button nxtIconButton variant="ghost" aria-label="In bảng công" nxtTooltip="In bảng công"><nxt-icon name="printer" /></button>
      <button nxtIconButton variant="ghost" aria-label="Chọn cột hiển thị" nxtTooltip="Chọn cột hiển thị"><nxt-icon name="columns-3" /></button>
    </div>
  `,
  styles: `
    .tools {
      display: flex;
      flex-wrap: wrap;
      gap: var(--nxt-space-gap-xs);
    }
  `,
})
export class TooltipIconButtonsExample {}
