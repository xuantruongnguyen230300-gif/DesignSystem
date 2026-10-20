import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NxtAvatar } from '@nxt/ui/avatar';
import { NxtInline, NxtStack } from '@nxt/ui/layout';

/**
 * Stand-in for a real photo URL (the docs ship no portraits). System colors keep it theme-neutral;
 * in a product, pass the photo URL from the employee profile.
 */
const PHOTO =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" fill="GrayText"/>' +
      '<circle cx="20" cy="16" r="7" fill="Canvas"/><path d="M6 40c1-9 7-14 14-14s13 5 14 14z" fill="Canvas"/></svg>',
  );

/** Ba kích thước, ảnh đại diện, và tự về chữ cái khi ảnh lỗi */
@Component({
  selector: 'example-avatar-sizes',
  imports: [NxtAvatar, NxtInline, NxtStack],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-inline gap="xl" align="end">
      <nxt-stack gap="xs" align="center">
        <nxt-avatar name="Phạm Thu Hà" size="sm" label="Phạm Thu Hà" />
        <span class="docs-demo-label">sm</span>
      </nxt-stack>
      <nxt-stack gap="xs" align="center">
        <nxt-avatar name="Phạm Thu Hà" label="Phạm Thu Hà" />
        <span class="docs-demo-label">md</span>
      </nxt-stack>
      <nxt-stack gap="xs" align="center">
        <nxt-avatar name="Phạm Thu Hà" size="lg" label="Phạm Thu Hà" />
        <span class="docs-demo-label">lg</span>
      </nxt-stack>
      <nxt-stack gap="xs" align="center">
        <nxt-avatar name="Lý Hoàng Nam" size="lg" [src]="photo" label="Lý Hoàng Nam" />
        <span class="docs-demo-label">ảnh</span>
      </nxt-stack>
      <nxt-stack gap="xs" align="center">
        <nxt-avatar name="Vũ Thanh Tâm" size="lg" src="data:image/png;base64," label="Vũ Thanh Tâm" />
        <span class="docs-demo-label">ảnh lỗi → chữ cái</span>
      </nxt-stack>
    </nxt-inline>
  `,
})
export class AvatarSizesExample {
  protected readonly photo = PHOTO;
}
