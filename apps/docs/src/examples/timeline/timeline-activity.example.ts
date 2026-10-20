import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NxtButton } from '@nxt/ui/button';
import { NxtCard } from '@nxt/ui/card';
import type { NxtIconName } from '@nxt/ui/icon';
import { NxtInline } from '@nxt/ui/layout';
import { NxtTimeline, NxtTimelineItem } from '@nxt/ui/timeline';

interface Activity {
  title: string;
  time: string;
  icon?: NxtIconName;
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'brand';
  detail?: string;
}

const RECENT: Activity[] = [
  { title: 'Trần Thị Mai cập nhật tài khoản nhận lương', time: '14:32 · 15/10/2026', icon: 'pencil', detail: 'Ngân hàng TMCP Ngoại thương · số tài khoản kết thúc bằng 8812' },
  { title: 'Hợp đồng HĐ-2026-0412 có hiệu lực', time: '00:00 · 01/10/2026', icon: 'file-certificate', tone: 'success' },
  { title: 'Hệ thống nhắc: CCCD sắp hết hạn', time: '08:00 · 28/09/2026', icon: 'alert-triangle', tone: 'warning', detail: 'Hết hạn ngày 12/12/2026. Nhắc nhân viên cập nhật bản mới.' },
];

const OLDER: Activity[] = [
  { title: 'Nguyễn Thị Ngọc Diệp đổi số điện thoại', time: '17:05 · 02/09/2026', icon: 'phone' },
  { title: 'Chuyển sang Phòng Kế toán', time: '09:00 · 01/08/2026', icon: 'transfer', tone: 'brand', detail: 'Từ Phòng Hành chính · quyết định QĐ-2026-118' },
  { title: 'Tạo hồ sơ nhân viên', time: '10:20 · 15/03/2024', icon: 'user-plus' },
];

/** Nhật ký thay đổi hồ sơ trong card, xem thêm mục cũ hơn */
@Component({
  selector: 'example-timeline-activity',
  imports: [NxtButton, NxtCard, NxtInline, NxtTimeline, NxtTimelineItem],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-card title="Lịch sử thay đổi hồ sơ" subtitle="Nguyễn Thị Ngọc Diệp · NV-0318" [headingLevel]="3">
      <nxt-timeline aria-label="Lịch sử thay đổi hồ sơ">
        @for (a of items(); track a.title) {
          <nxt-timeline-item [title]="a.title" [time]="a.time" [icon]="a.icon" [tone]="a.tone ?? 'neutral'">
            @if (a.detail) {
              {{ a.detail }}
            }
          </nxt-timeline-item>
        }
      </nxt-timeline>
      <nxt-inline justify="between">
        <p class="docs-demo-label" role="status">{{ message() }}</p>
        <button nxtButton variant="ghost" size="sm" (click)="toggle()">
          {{ expanded() ? 'Thu gọn' : 'Xem ' + older.length + ' hoạt động cũ hơn' }}
        </button>
      </nxt-inline>
    </nxt-card>
  `,
})
export class TimelineActivityExample {
  protected readonly older = OLDER;
  protected readonly expanded = signal(false);
  protected readonly items = computed(() => (this.expanded() ? [...RECENT, ...OLDER] : RECENT));
  protected readonly message = signal('');

  protected toggle() {
    this.expanded.update((v) => !v);
    this.message.set(this.expanded() ? `Đã hiện thêm ${OLDER.length} hoạt động cũ hơn.` : `Đang hiện ${RECENT.length} hoạt động gần nhất.`);
  }
}
