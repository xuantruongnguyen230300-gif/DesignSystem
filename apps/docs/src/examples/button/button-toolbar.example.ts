import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NxtButton } from '@nxt/ui/button';
import { NxtInline } from '@nxt/ui/layout';

/** Header trang danh sách: một primary duy nhất, link dạng nút để điều hướng */
@Component({
  selector: 'example-button-toolbar',
  imports: [NxtButton, NxtInline],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-inline justify="between" gap="md">
      <div>
        <p class="nxt-text-heading-md">Nhân viên</p>
        <p class="docs-demo-label nxt-tabular-nums">1.284 hồ sơ · cập nhật 5 phút trước</p>
      </div>
      <nxt-inline gap="sm">
        <a nxtButton variant="ghost" href="#huong-dan">Hướng dẫn</a>
        <button nxtButton>Nhập từ Excel</button>
        <button nxtButton variant="primary">Thêm nhân viên</button>
      </nxt-inline>
    </nxt-inline>
  `,
})
export class ButtonToolbarExample {}
