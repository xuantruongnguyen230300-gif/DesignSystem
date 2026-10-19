import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NxtButton } from '@nxt/ui/button';
import { NxtIcon } from '@nxt/ui/icon';
import { NxtInline } from '@nxt/ui/layout';
import { NxtTooltip } from '@nxt/ui/tooltip';

/** Header trang danh sách: một primary "Thêm mới", nhập/xuất Excel là hai nút icon, link dạng nút để điều hướng */
@Component({
  selector: 'example-button-toolbar',
  imports: [NxtButton, NxtIcon, NxtInline, NxtTooltip],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-inline justify="between" gap="md">
      <div>
        <p class="nxt-text-heading-md">Nhân viên</p>
        <p class="docs-demo-label nxt-tabular-nums">1.284 hồ sơ · cập nhật 5 phút trước</p>
      </div>
      <nxt-inline gap="sm">
        <a nxtButton variant="ghost" href="#huong-dan">Hướng dẫn</a>
        <button nxtIconButton type="button" aria-label="Nhập nhân viên từ Excel" nxtTooltip="Nhập nhân viên từ Excel">
          <nxt-icon name="file-upload" />
        </button>
        <button nxtIconButton type="button" aria-label="Xuất 1.284 nhân viên ra Excel" nxtTooltip="Xuất 1.284 nhân viên ra Excel">
          <nxt-icon name="file-download" />
        </button>
        <button nxtButton variant="primary" type="button" aria-label="Thêm mới nhân viên"><nxt-icon name="plus" />Thêm mới</button>
      </nxt-inline>
    </nxt-inline>
  `,
})
export class ButtonToolbarExample {}
