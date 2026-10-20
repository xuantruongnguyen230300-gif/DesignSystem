import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NxtButton } from '@nxt/ui/button';
import { NxtIcon } from '@nxt/ui/icon';
import { NxtInline, NxtStack } from '@nxt/ui/layout';
import { NxtBadge } from '@nxt/ui/tag';

/** Badge trên nút icon: con số phải nằm trong tên của nút */
@Component({
  selector: 'example-tag-badge-icon-button',
  imports: [NxtBadge, NxtButton, NxtIcon, NxtInline, NxtStack],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-stack gap="sm">
      <nxt-inline gap="md">
        <button nxtIconButton variant="ghost" type="button" class="has-badge" [attr.aria-label]="bellLabel()" (click)="markRead()">
          <nxt-icon name="bell" />
          @if (unread()) {
            <nxt-badge [value]="unread()" />
          }
        </button>
        <button nxtIconButton variant="ghost" type="button" class="has-badge" aria-label="Hộp duyệt, 128 đơn mới">
          <nxt-icon name="inbox" />
          <nxt-badge [value]="128" />
        </button>
        <button nxtIconButton variant="ghost" type="button" class="has-badge" aria-label="Tin nhắn, có tin chưa đọc">
          <nxt-icon name="messages" />
          <nxt-badge dot />
        </button>
      </nxt-inline>
      <p class="docs-demo-label" role="status">{{ message() }}</p>
    </nxt-stack>
  `,
  styles: `
    .has-badge nxt-badge {
      position: absolute;
      inset-block-start: 0;
      inset-inline-end: 0;
      translate: 30% -30%;
    }
    .has-badge nxt-badge[data-dot] {
      translate: none;
      inset-block-start: var(--nxt-space-1);
      inset-inline-end: var(--nxt-space-1);
    }
  `,
})
export class TagBadgeIconButtonExample {
  protected readonly unread = signal(5);
  protected readonly message = signal('');
  protected readonly bellLabel = computed(() => (this.unread() ? `Thông báo, ${this.unread()} chưa đọc` : 'Thông báo, không có thông báo mới'));

  protected markRead() {
    if (!this.unread()) return;
    this.message.set(`Đã đánh dấu đã đọc ${this.unread()} thông báo.`);
    this.unread.set(0);
  }
}
