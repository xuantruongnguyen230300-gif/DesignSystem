import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NxtButton } from '@nxt/ui/button';
import { NxtInline, NxtStack } from '@nxt/ui/layout';

/** Stack lồng nhau: khoảng cách theo cấp, không dùng margin tay */
@Component({
  selector: 'example-stack-sections',
  imports: [NxtStack, NxtInline, NxtButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-stack gap="xl">
      <nxt-stack gap="xs">
        <p class="nxt-text-heading-md">Thông tin công việc</p>
        <p class="docs-demo-label">Áp dụng từ kỳ lương tháng 11/2026.</p>
      </nxt-stack>
      <nxt-stack gap="sm">
        <div class="docs-demo-cell">Phòng ban</div>
        <div class="docs-demo-cell">Chức danh</div>
        <div class="docs-demo-cell">Quản lý trực tiếp</div>
      </nxt-stack>
      <nxt-inline justify="end">
        <button nxtButton variant="ghost">Huỷ</button>
        <button nxtButton variant="primary">Lưu thay đổi</button>
      </nxt-inline>
    </nxt-stack>
  `,
})
export class StackSectionsExample {}
