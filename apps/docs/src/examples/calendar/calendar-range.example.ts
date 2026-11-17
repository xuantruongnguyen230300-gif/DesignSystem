import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NxtCalendar, NxtCalendarSpecialDay, NxtDateRange, nxtFormatDateRange } from '@nxt/ui/calendar';
import { NxtStack } from '@nxt/ui/layout';

/**
 * Lịch làm việc của công ty (dữ liệu sản phẩm truyền vào, NXT không có sẵn ngày lễ).
 * Hư cấu cho ví dụ; sản phẩm thật lấy từ cấu hình lịch làm việc.
 */
const WORK_CALENDAR: NxtCalendarSpecialDay[] = [
  { date: '2026-11-20', kind: 'event', label: 'Hạn chốt công tháng 11' },
  { date: '2026-11-28', kind: 'non-working', label: 'Nghỉ bù hội thao' },
  { date: '2026-12-22', kind: 'event', label: 'Tất niên khối văn phòng' },
  { date: '2027-01-01', kind: 'holiday', label: 'Tết Dương lịch' },
];

/** Chọn kỳ nghỉ: khoảng ngày, ngày nghỉ cuối tuần, ngày đặc biệt và chú giải */
@Component({
  selector: 'example-calendar-range',
  imports: [NxtCalendar, NxtStack],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-stack gap="sm">
      <div class="docs-demo-box calendar-demo">
        <nxt-calendar mode="range" today="2026-11-06" min="2026-11-06" [nonWorkingWeekdays]="[6, 7]" [specialDays]="workCalendar" [(range)]="leave" />
      </div>
      <p class="docs-demo-label" role="status">{{ summary() }}</p>
    </nxt-stack>
  `,
  styles: `
    .calendar-demo {
      inline-size: fit-content;
    }
  `,
})
export class CalendarRangeExample {
  protected readonly workCalendar = WORK_CALENDAR;
  protected readonly leave = signal<NxtDateRange | null>({ start: '2026-11-16', end: '2026-11-19' });
  protected readonly summary = computed(() => {
    const r = this.leave();
    return r ? `Kỳ nghỉ đã chọn: ${nxtFormatDateRange(r)} (tính cả ngày cuối).` : 'Chưa chọn kỳ nghỉ.';
  });
}
