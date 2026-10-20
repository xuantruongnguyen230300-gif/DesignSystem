import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NxtInline, NxtStack } from '@nxt/ui/layout';
import { NxtTag } from '@nxt/ui/tag';

/** Trạng thái quy trình: chấm hoặc icon đi kèm chữ, hai kích thước */
@Component({
  selector: 'example-tag-status',
  imports: [NxtInline, NxtStack, NxtTag],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-stack gap="lg">
      <nxt-stack gap="xs">
        <p class="docs-demo-label">dot: trạng thái của một quy trình (đơn từ, hợp đồng)</p>
        <nxt-inline>
          <nxt-tag tone="warning" dot>Chờ duyệt</nxt-tag>
          <nxt-tag tone="success" dot>Đã duyệt</nxt-tag>
          <nxt-tag tone="danger" dot>Từ chối</nxt-tag>
          <nxt-tag dot>Đã huỷ</nxt-tag>
        </nxt-inline>
      </nxt-stack>

      <nxt-stack gap="xs">
        <p class="docs-demo-label">icon: khi hình dạng giúp phân biệt nhanh hơn màu</p>
        <nxt-inline>
          <nxt-tag tone="info" icon="hourglass">Đang thử việc</nxt-tag>
          <nxt-tag tone="success" icon="circle-check">Đã ký hợp đồng</nxt-tag>
          <nxt-tag tone="warning" icon="alert-triangle">Sắp hết hạn</nxt-tag>
          <nxt-tag tone="danger" icon="circle-x">Đã nghỉ việc</nxt-tag>
        </nxt-inline>
      </nxt-stack>

      <nxt-stack gap="xs">
        <p class="docs-demo-label">sm: trong hàng bảng, danh sách dày</p>
        <nxt-inline>
          <nxt-tag size="sm" tone="warning" dot>Chờ duyệt</nxt-tag>
          <nxt-tag size="sm" tone="success" dot>Đã duyệt</nxt-tag>
          <nxt-tag size="sm" tone="brand">Toàn thời gian</nxt-tag>
          <nxt-tag size="sm">Bán thời gian</nxt-tag>
        </nxt-inline>
      </nxt-stack>
    </nxt-stack>
  `,
})
export class TagStatusExample {}
