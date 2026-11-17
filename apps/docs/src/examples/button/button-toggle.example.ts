import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NxtButton } from '@nxt/ui/button';
import { NxtIcon } from '@nxt/ui/icon';
import { NxtTooltip } from '@nxt/ui/tooltip';

/** Toggle button trên thanh công cụ: bật/tắt chế độ xem (aria-pressed), nhãn giữ nguyên khi đổi trạng thái */
@Component({
  selector: 'example-button-toggle',
  imports: [NxtButton, NxtIcon, NxtTooltip],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="toolbar">
      <button nxtButton type="button" [(pressed)]="mine"><nxt-icon name="user-check" />Chỉ xem của tôi</button>
      <button nxtButton type="button" [(pressed)]="hidden">Hiện cột đã ẩn</button>
      <span class="spacer"></span>
      <button
        nxtIconButton
        variant="ghost"
        type="button"
        aria-label="Khung chi tiết"
        nxtTooltip="Khung chi tiết"
        [(pressed)]="detail"
      >
        <nxt-icon name="layout-sidebar-right" />
      </button>
    </div>
    <p class="docs-demo-label status">{{ summary() }}</p>
  `,
  styles: `
    .toolbar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--nxt-space-gap-sm);
    }
    .spacer {
      flex: 1;
    }
    .status {
      margin-block-start: var(--nxt-space-gap-sm);
    }
  `,
})
export class ButtonToggleExample {
  protected readonly mine = signal<boolean | undefined>(true);
  protected readonly hidden = signal<boolean | undefined>(false);
  protected readonly detail = signal<boolean | undefined>(false);
  protected readonly summary = computed(
    () =>
      `Đang xem: ${this.mine() ? 'đơn của tôi' : 'tất cả đơn'} · cột đã ẩn ${this.hidden() ? 'đang hiện' : 'đang ẩn'} · khung chi tiết ${this.detail() ? 'mở' : 'đóng'}`,
  );
}
