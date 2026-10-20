import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NxtTimeline, NxtTimelineItem } from '@nxt/ui/timeline';

/** Bước bị bỏ qua: marker nét đứt, icon bỏ qua, chữ nhạt; chữ "Bỏ qua:" trước tên bước */
@Component({
  selector: 'example-timeline-skipped',
  imports: [NxtTimeline, NxtTimelineItem],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-timeline aria-label="Quy trình duyệt đơn nghỉ phép DNP-0418 của Đặng Quốc Bảo">
      <nxt-timeline-item title="Đặng Quốc Bảo gửi đơn" time="09:05 · 16/10/2026" icon="send" tone="brand">
        Nghỉ phép năm 2 ngày, từ 26/10 đến 27/10/2026
      </nxt-timeline-item>
      <nxt-timeline-item title="Bước 1 · Trưởng phòng Kinh doanh đã duyệt" time="11:20 · 16/10/2026" icon="check" tone="success">
        Trịnh Văn Khoa · “Đồng ý.”
      </nxt-timeline-item>
      <nxt-timeline-item title="Bước 2 · Giám đốc khối Kinh doanh" time="Chỉ áp dụng khi số ngày nghỉ > 3" skipped>
        Đơn này nghỉ 2 ngày, nên đi thẳng sang bước sau.
      </nxt-timeline-item>
      <nxt-timeline-item title="Bước 3 · Đang chờ Phòng Nhân sự ghi nhận" time="Hạn xử lý: 17/10/2026" icon="hourglass" tone="warning">
        Người xử lý: Phan Bích Ngọc
      </nxt-timeline-item>
      <nxt-timeline-item title="Bước 4 · Kế toán trưởng" time="Chỉ áp dụng cho nghỉ không lương" skipped />
    </nxt-timeline>
  `,
})
export class TimelineSkippedExample {}
