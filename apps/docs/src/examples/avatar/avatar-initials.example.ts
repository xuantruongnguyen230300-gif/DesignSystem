import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NxtAvatar, nxtInitials } from '@nxt/ui/avatar';

/** Chữ cái đầu theo Họ + Tên, màu nền cố định theo tên */
@Component({
  selector: 'example-avatar-initials',
  imports: [NxtAvatar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ul class="people" role="list">
      @for (n of names; track n) {
        <li class="person">
          <nxt-avatar [name]="n" />
          <span class="person__name">{{ n }}</span>
          <span class="docs-demo-label">nxtInitials → <code>{{ initials(n) }}</code></span>
        </li>
      }
    </ul>
  `,
  styles: `
    .people {
      display: grid;
      gap: var(--nxt-space-gap-sm);
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .person {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--nxt-space-gap-md);
    }
    .person__name {
      min-inline-size: var(--nxt-size-240);
      color: var(--nxt-color-text-strong);
      font: var(--nxt-typography-label-md);
    }
  `,
})
export class AvatarInitialsExample {
  protected readonly names = ['Nguyễn Thị Ngọc Diệp', 'Đặng Anh', 'Trần Minh Quân', 'Lê Văn Đức Huy', 'Phạm Thu Hà', 'Hoàng'];
  protected readonly initials = nxtInitials;
}
