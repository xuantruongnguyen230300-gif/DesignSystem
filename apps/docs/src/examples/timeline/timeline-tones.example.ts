import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NxtTimeline, NxtTimelineItem } from '@nxt/ui/timeline';

/** Năm tông mốc trong quy trình nghỉ việc — tiêu đề luôn nói rõ trạng thái */
@Component({
  selector: 'example-timeline-tones',
  imports: [NxtTimeline, NxtTimelineItem],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-timeline aria-label="Quy trình nghỉ việc của Bùi Gia Huy">
      <nxt-timeline-item title="Bùi Gia Huy nộp đơn nghỉ việc" time="09:30 · 01/10/2026" icon="send" tone="brand">
        Ngày làm việc cuối cùng: 31/10/2026
      </nxt-timeline-item>
      <nxt-timeline-item title="Đã bàn giao tài sản" time="16:00 · 10/10/2026" icon="circle-check" tone="success">
        Máy tính xách tay, thẻ ra vào, 2 bộ hồ sơ khách hàng
      </nxt-timeline-item>
      <nxt-timeline-item title="Quyết toán thuế bị trả lại" time="11:15 · 14/10/2026" icon="x" tone="danger">
        Thiếu chứng từ khấu trừ thuế tháng 9. Cần bổ sung trước 25/10/2026.
      </nxt-timeline-item>
      <nxt-timeline-item title="Đang chờ ký quyết định nghỉ việc" time="Dự kiến 28/10/2026" icon="hourglass" tone="warning">
        Người ký: Giám đốc khối Kinh doanh
      </nxt-timeline-item>
      <nxt-timeline-item title="Khoá tài khoản hệ thống" time="Chưa bắt đầu · sau ngày làm việc cuối cùng" />
    </nxt-timeline>
  `,
})
export class TimelineTonesExample {}
