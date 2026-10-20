import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NxtTimeline, NxtTimelineItem } from '@nxt/ui/timeline';

/** Các bước duyệt đơn nghỉ phép: trạng thái nằm trong chữ, màu chỉ bổ trợ */
@Component({
  selector: 'example-timeline-approval',
  imports: [NxtTimeline, NxtTimelineItem],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-timeline aria-label="Quy trình duyệt đơn nghỉ phép của Lê Minh Anh">
      <nxt-timeline-item title="Lê Minh Anh gửi đơn" time="08:15 · 14/10/2026" icon="send" tone="brand">
        Nghỉ phép năm 3 ngày, từ 20/10 đến 22/10/2026
      </nxt-timeline-item>
      <nxt-timeline-item title="Trưởng phòng Kế toán đã duyệt" time="10:42 · 14/10/2026" icon="check" tone="success">
        Hoàng Văn Đức · “Đồng ý, đã sắp xếp người trực thay.”
      </nxt-timeline-item>
      <nxt-timeline-item title="Đang chờ Phòng Nhân sự ghi nhận" time="Hạn xử lý: 16/10/2026" icon="hourglass" tone="warning">
        Người xử lý: Phan Bích Ngọc
      </nxt-timeline-item>
      <nxt-timeline-item title="Cập nhật bảng công" time="Tự động sau khi Nhân sự ghi nhận" />
    </nxt-timeline>
  `,
})
export class TimelineApprovalExample {}
