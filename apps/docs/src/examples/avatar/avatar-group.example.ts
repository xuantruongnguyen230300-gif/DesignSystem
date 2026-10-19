import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NxtAvatar } from '@nxt/ui/avatar';
import { NxtInline } from '@nxt/ui/layout';

/** Nhóm xếp chồng: tối đa 4 avatar, phần còn lại gộp thành “+3” */
@Component({
  selector: 'example-avatar-group',
  imports: [NxtAvatar, NxtInline],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-inline gap="md">
      <ul class="avatars" role="list" aria-label="Người tham gia khoá Kỹ năng phỏng vấn">
        @for (p of shown; track p) {
          <li><nxt-avatar [name]="p" [label]="p" /></li>
        }
        <li class="more">
          <span aria-hidden="true">+{{ rest.length }}</span>
          <span class="nxt-visually-hidden">và {{ rest.length }} người khác</span>
        </li>
      </ul>
      <span class="docs-demo-label">{{ people.length }} người đã đăng ký</span>
    </nxt-inline>
  `,
  styles: `
    .avatars {
      display: flex;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .avatars > li {
      display: flex;
    }
    .avatars > li + li {
      margin-inline-start: calc(-1 * var(--nxt-space-2));
    }
    /* A ring in the surface color separates overlapping circles. */
    .avatars nxt-avatar,
    .more {
      box-shadow: 0 0 0 var(--nxt-border-width-strong) var(--nxt-color-bg-surface);
    }
    .more {
      display: inline-grid;
      place-items: center;
      inline-size: var(--nxt-avatar-size-md);
      block-size: var(--nxt-avatar-size-md);
      border-radius: var(--nxt-avatar-radius);
      background: var(--nxt-color-bg-muted);
      color: var(--nxt-color-text-default);
      font: var(--nxt-typography-label-sm);
      font-variant-numeric: tabular-nums;
    }
  `,
})
export class AvatarGroupExample {
  protected readonly people = ['Nguyễn Văn An', 'Trần Thị Bích', 'Lê Minh Châu', 'Phạm Quốc Dũng', 'Hoàng Thu Giang', 'Vũ Thanh Hà', 'Đặng Gia Khánh'];
  protected readonly shown = this.people.slice(0, 4);
  protected readonly rest = this.people.slice(4);
}
