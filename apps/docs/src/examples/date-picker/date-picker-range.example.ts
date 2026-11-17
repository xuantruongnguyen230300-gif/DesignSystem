import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NxtCalendarSpecialDay, nxtAddDays, nxtIsoWeekday } from '@nxt/ui/calendar';
import { NxtDateRange, NxtDateRangePicker } from '@nxt/ui/date-picker';
import { NxtFormField } from '@nxt/ui/form-field';
import { NxtGrid, NxtSpan } from '@nxt/ui/layout';

/** Ngày lễ, nghỉ bù: dữ liệu lịch làm việc của sản phẩm (hư cấu cho ví dụ). */
const WORK_CALENDAR: NxtCalendarSpecialDay[] = [
  { date: '2026-11-20', kind: 'event', label: 'Hạn chốt công tháng 11' },
  { date: '2026-12-31', kind: 'non-working', label: 'Nghỉ bù Tết Dương lịch' },
  { date: '2027-01-01', kind: 'holiday', label: 'Tết Dương lịch' },
];

/** Kỳ nghỉ phép: một ô khoảng ngày, lịch có ngày lễ, đếm ngày làm việc */
@Component({
  selector: 'example-date-picker-range',
  imports: [ReactiveFormsModule, NxtDateRangePicker, NxtFormField, NxtGrid, NxtSpan],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-grid gap="md">
      <nxt-form-field label="Thời gian nghỉ" required [hint]="hint()" [error]="error()" [nxtSpan]="{ base: 12, md: 8 }">
        <nxt-date-range-picker
          [formControl]="leave"
          today="2026-11-06"
          min="2026-11-06"
          [nonWorkingWeekdays]="[6, 7]"
          [specialDays]="workCalendar"
        />
      </nxt-form-field>
    </nxt-grid>
  `,
})
export class DatePickerRangeExample {
  protected readonly workCalendar = WORK_CALENDAR;
  protected readonly leave = new FormControl<NxtDateRange | null>({ start: '2026-12-28', end: '2027-01-04' });
  private readonly events = toSignal(this.leave.events);

  /** Working days in the range (inclusive): weekends and days off in the work calendar are not counted. */
  protected readonly hint = computed(() => {
    this.events();
    const r = this.leave.value;
    if (!r) return 'Tính cả ngày cuối; ngày lễ, ngày nghỉ không trừ phép.';
    const off = new Set(WORK_CALENDAR.filter((d) => d.kind !== 'event').map((d) => d.date));
    let days = 0;
    for (let d = r.start; d <= r.end; d = nxtAddDays(d, 1)) if (nxtIsoWeekday(d) < 6 && !off.has(d)) days++;
    return `Trừ ${days} ngày phép (tính cả ngày cuối; ngày lễ, ngày nghỉ không trừ).`;
  });

  protected readonly error = computed(() => {
    this.events();
    const e = this.leave.errors;
    if (!e || !this.leave.touched) return null;
    if (e['nxtDateParse']) return 'Chưa đọc được khoảng ngày. Nhập hai ngày dạng dd/mm/yyyy, ví dụ 28/12/2026 – 04/01/2027.';
    if (e['nxtDateMin']) return 'Không đăng ký nghỉ cho ngày đã qua. Chọn ngày bắt đầu từ hôm nay (06/11/2026).';
    return null;
  });
}
