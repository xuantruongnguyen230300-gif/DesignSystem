import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NxtInline } from '@nxt/ui/layout';
import { NxtTag } from '@nxt/ui/tag';

/** Sáu tông: chữ mang nghĩa, màu chỉ hỗ trợ */
@Component({
  selector: 'example-tag-tones',
  imports: [NxtInline, NxtTag],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-inline>
      <nxt-tag>Bản nháp</nxt-tag>
      <nxt-tag tone="info">Đang xử lý</nxt-tag>
      <nxt-tag tone="success">Đã duyệt</nxt-tag>
      <nxt-tag tone="warning">Chờ bổ sung hồ sơ</nxt-tag>
      <nxt-tag tone="danger">Bị từ chối</nxt-tag>
      <nxt-tag tone="brand">Nhân viên mới</nxt-tag>
    </nxt-inline>
  `,
})
export class TagTonesExample {}
