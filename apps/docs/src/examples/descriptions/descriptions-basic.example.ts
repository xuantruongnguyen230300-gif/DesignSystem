import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NxtDescription, NxtDescriptions } from '@nxt/ui/descriptions';
import { NxtTag } from '@nxt/ui/tag';

/** Thông tin một hồ sơ: số cột tự co theo bề rộng, mục dài chiếm cả hàng */
@Component({
  selector: 'example-descriptions-basic',
  imports: [NxtDescriptions, NxtDescription, NxtTag],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <dl nxtDescriptions>
      <div nxtDescription label="Mã nhân viên"><span class="nxt-tabular-nums">NV-00218</span></div>
      <div nxtDescription label="Họ và tên">Nguyễn Thị Ngọc Diệp</div>
      <div nxtDescription label="Chức danh">Nhân viên kinh doanh</div>
      <div nxtDescription label="Phòng ban">Kinh doanh miền Nam</div>
      <div nxtDescription label="Ngày vào làm"><span class="nxt-tabular-nums">03/03/2023</span></div>
      <div nxtDescription label="Loại hợp đồng">Xác định thời hạn 36 tháng</div>
      <div nxtDescription label="Trạng thái"><nxt-tag tone="success" dot>Đang làm việc</nxt-tag></div>
      <div nxtDescription label="Quản lý trực tiếp">Võ Thành Nam</div>
      <div nxtDescription label="Ghi chú" full>Đang tham gia chương trình đào tạo quản lý cấp trung, dự kiến hoàn thành tháng 12/2026.</div>
    </dl>
  `,
})
export class DescriptionsBasicExample {}
