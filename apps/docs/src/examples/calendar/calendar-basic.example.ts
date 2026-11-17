import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NxtCalendar, nxtFormatDate } from '@nxt/ui/calendar';
import { NxtStack } from '@nxt/ui/layout';

/** Chọn một ngày phỏng vấn trong 6 tuần tới, có nút "Hôm nay" */
@Component({
  selector: 'example-calendar-basic',
  imports: [NxtCalendar, NxtStack],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Docs example + a11y fixture: fixed "today", no random data.
  template: `
    <nxt-stack gap="sm">
      <div class="docs-demo-box calendar-demo">
        <nxt-calendar today="2026-11-06" min="2026-11-06" max="2026-12-18" [nonWorkingWeekdays]="[7]" showToday [(value)]="interview" />
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
export class CalendarBasicExample {
  protected readonly interview = signal<string | null>('2026-11-12');
  protected readonly summary = computed(() =>
    this.interview() ? `Lịch phỏng vấn ứng viên Trần Minh Khôi: ${nxtFormatDate(this.interview())}` : 'Chưa chọn ngày phỏng vấn.',
  );
}
