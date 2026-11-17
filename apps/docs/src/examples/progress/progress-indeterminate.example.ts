import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NxtButton } from '@nxt/ui/button';
import { NxtInline, NxtStack } from '@nxt/ui/layout';
import { NxtProgress } from '@nxt/ui/progress';

/** Chưa biết tiến độ: thanh chạy cho đến khi xong, kèm câu trạng thái */
@Component({
  selector: 'example-progress-indeterminate',
  imports: [NxtButton, NxtInline, NxtProgress, NxtStack],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-stack gap="lg" class="sync">
      <nxt-stack gap="xs">
        <nxt-inline justify="between">
          <span class="sync__title">Đồng bộ dữ liệu chấm công</span>
          <span class="sync__state">{{ running() ? 'Đang chạy' : 'Đã xong' }}</span>
        </nxt-inline>
        @if (running()) {
          <nxt-progress label="Đang đồng bộ dữ liệu chấm công" valueText="Đang xử lý" indeterminate />
        } @else {
          <nxt-progress label="Đồng bộ dữ liệu chấm công" valueText="Hoàn tất" [value]="100" tone="success" />
        }
      </nxt-stack>

      <nxt-inline gap="sm" align="center">
        <nxt-progress label="Đang tính lương tháng 10" shape="circle" size="sm" indeterminate />
        <span class="sync__title">Đang tính lương tháng 10…</span>
      </nxt-inline>

      <nxt-inline>
        <button nxtButton type="button" (click)="toggle()">{{ running() ? 'Dừng đồng bộ' : 'Đồng bộ lại' }}</button>
      </nxt-inline>
      <!-- Announce start and end only: the progressbar itself is not a live region. -->
      <p class="docs-demo-label" role="status">{{ message() }}</p>
    </nxt-stack>
  `,
  styles: `
    .sync {
      max-inline-size: var(--nxt-layout-content-narrow);
    }
    .sync__title {
      color: var(--nxt-color-text-strong);
      font: var(--nxt-typography-label-md);
    }
    .sync__state {
      color: var(--nxt-color-text-subtle);
      font: var(--nxt-typography-body-sm);
    }
  `,
})
export class ProgressIndeterminateExample {
  protected readonly running = signal(true);
  protected readonly message = signal('');

  protected toggle() {
    const next = !this.running();
    this.running.set(next);
    this.message.set(next ? 'Đang đồng bộ dữ liệu chấm công…' : 'Đã dừng đồng bộ dữ liệu chấm công.');
  }
}
