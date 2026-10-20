import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NxtAvatar } from '@nxt/ui/avatar';
import { NxtInline, NxtStack } from '@nxt/ui/layout';

/** Cạnh tên thì avatar chỉ để trang trí; đứng một mình thì cần label */
@Component({
  selector: 'example-avatar-with-name',
  imports: [NxtAvatar, NxtInline, NxtStack],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-stack gap="lg">
      <nxt-stack gap="xs">
        <p class="docs-demo-label">Có tên hiển thị: avatar trang trí, không truyền label</p>
        <div class="person">
          <nxt-avatar name="Trần Thu Hà" size="lg" />
          <span class="person__text">
            <span class="person__name">Trần Thu Hà</span>
            <span class="person__meta">Trưởng phòng Nhân sự · NV-0112</span>
          </span>
        </div>
      </nxt-stack>

      <nxt-stack gap="xs">
        <p class="docs-demo-label">Cột hẹp chỉ có avatar: truyền label để screen reader đọc được người</p>
        <nxt-inline gap="xs">
          <span class="field-label">Người duyệt</span>
          <nxt-avatar name="Bùi Quang Huy" size="sm" label="Bùi Quang Huy" />
          <nxt-avatar name="Đỗ Minh Thư" size="sm" label="Đỗ Minh Thư" />
        </nxt-inline>
      </nxt-stack>
    </nxt-stack>
  `,
  styles: `
    .person {
      display: flex;
      align-items: center;
      gap: var(--nxt-space-gap-md);
    }
    .person__text {
      display: grid;
      min-inline-size: 0;
    }
    .person__name {
      color: var(--nxt-color-text-strong);
      font: var(--nxt-typography-label-md);
    }
    .person__meta {
      color: var(--nxt-color-text-subtle);
      font: var(--nxt-typography-body-sm);
    }
    .field-label {
      margin-inline-end: var(--nxt-space-gap-xs);
      color: var(--nxt-color-text-subtle);
      font: var(--nxt-typography-label-sm);
    }
  `,
})
export class AvatarWithNameExample {}
