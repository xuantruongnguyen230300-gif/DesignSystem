import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NxtStack } from '@nxt/ui/layout';
import { NxtTab, NxtTabs } from '@nxt/ui/tabs';

/** Icon, số đếm và tab bị khoá (phím mũi tên bỏ qua tab khoá) */
@Component({
  selector: 'example-tabs-states',
  imports: [NxtStack, NxtTab, NxtTabs],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-stack gap="sm">
      <nxt-tabs label="Phân hệ chấm công" [(value)]="tab">
        <nxt-tab value="timesheet" label="Bảng công" icon="calendar-stats">
          <p>Bảng công tháng 10/2026 · 22 ngày công chuẩn · đã chốt đến 18/10.</p>
        </nxt-tab>
        <nxt-tab value="leave" label="Đơn nghỉ phép" icon="beach" [count]="5">
          <p>5 đơn nghỉ phép đang chờ bạn duyệt.</p>
        </nxt-tab>
        <nxt-tab value="overtime" label="Tăng ca" icon="clock-hour-4" [count]="2">
          <p>2 đề nghị tăng ca cuối tuần cho Khối Vận hành.</p>
        </nxt-tab>
        <nxt-tab value="payroll" label="Khoá công" icon="lock" disabled>
          <p>Khoá công tháng 10/2026.</p>
        </nxt-tab>
      </nxt-tabs>
      <p class="docs-demo-label">“Khoá công” chỉ mở sau ngày 25 hằng tháng.</p>
    </nxt-stack>
  `,
})
export class TabsStatesExample {
  protected readonly tab = signal('leave');
}
