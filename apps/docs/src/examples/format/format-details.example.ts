import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NxtCard } from '@nxt/ui/card';
import { NxtDescription, NxtDescriptions } from '@nxt/ui/descriptions';
import { NXT_FORMAT_PIPES } from '@nxt/ui/format';

/** Định dạng ngoài bảng: tiền có ký hiệu, ngày giờ, khoảng ngày, thời gian tương đối kèm ngày tuyệt đối, danh sách */
@Component({
  selector: 'example-format-details',
  imports: [NxtCard, NxtDescriptions, NxtDescription, NXT_FORMAT_PIPES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="canvas">
      <nxt-card title="Đơn nghỉ phép NP-2026-0318" subtitle="Lê Minh Anh, Phòng Kế toán" [headingLevel]="3">
        <dl nxtDescriptions>
          <div nxtDescription label="Thời gian nghỉ">{{ leave.start | nxtDateRange: leave.end }}</div>
          <div nxtDescription label="Số ngày nghỉ">{{ leave.days | nxtUnit: 'ngày' }}</div>
          <div nxtDescription label="Ca làm">{{ shift.start | nxtTimeRange: shift.end }}</div>
          <div nxtDescription label="Thời lượng làm việc">{{ shift.minutes | nxtDuration }}</div>
          <div nxtDescription label="Gửi lúc">
            <time [attr.datetime]="leave.sentIso" [title]="leave.sent | nxtDate: { time: true }">{{ leave.sent | nxtRelative: { now: now } }}</time>
          </div>
          <div nxtDescription label="Hiệu lực hợp đồng">{{ contract | nxtDate: { style: 'text' } }}</div>
          <div nxtDescription label="Lương cơ bản">{{ 18500000 | nxtMoney }}</div>
          <div nxtDescription label="Quỹ lương phòng">{{ 2140000000 | nxtMoney: { compact: true } }}</div>
          <div nxtDescription label="Người duyệt">{{ approvers | nxtList }}</div>
          <div nxtDescription label="Tệp đính kèm">Giấy khám bệnh.pdf ({{ 1258291 | nxtFileSize }})</div>
          <div nxtDescription label="Người thay thế">{{ substitute | nxtText }}</div>
          <div nxtDescription label="Ghi chú" full>{{ note | nxtText }}</div>
        </dl>
      </nxt-card>
    </div>
  `,
  styles: `
    .canvas {
      padding: var(--nxt-space-inset-lg);
      border-radius: var(--nxt-radius-container);
      background: var(--nxt-color-bg-canvas);
    }
  `,
})
export class FormatDetailsExample {
  /** Fixed "now" (06/11/2026 09:30) so the example never changes. */
  protected readonly now = new Date(2026, 10, 6, 9, 30);
  protected readonly leave = {
    start: '2026-11-10',
    end: '2026-11-12',
    days: 3,
    sent: new Date(2026, 10, 6, 9, 18),
    sentIso: '2026-11-06T09:18',
  };
  protected readonly shift = { start: new Date(2026, 10, 10, 8, 0), end: new Date(2026, 10, 10, 17, 30), minutes: 510 };
  protected readonly contract = '2026-12-01';
  protected readonly approvers = ['Trần Thị Mai', 'Võ Thành Nam', 'Phan Bích Ngọc'];
  protected readonly substitute = '   ';
  protected readonly note = '  Nghỉ theo chỉ định của bác sĩ, đã bàn giao sổ sách cho Trần Quốc Huy.  ';
}
