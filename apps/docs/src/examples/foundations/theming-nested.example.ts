import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NxtButton } from '@nxt/ui/button';
import { NxtInline, NxtStack } from '@nxt/ui/layout';

/** Mode và brand lồng nhau tới từng vùng — token tự tính lại ở mỗi cấp */
@Component({
  selector: 'example-theming-nested',
  imports: [NxtButton, NxtInline, NxtStack],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="docs-nest" aria-label="Vùng theo trang">
      <nxt-stack gap="md">
        <nxt-inline justify="between">
          <span class="nxt-text-label-md">Theo trang</span>
          <button nxtButton variant="primary" size="sm">Lưu</button>
        </nxt-inline>
        <section class="docs-nest" data-nxt-color="dark" aria-label="Vùng tối">
          <nxt-stack gap="md">
            <nxt-inline justify="between">
              <span class="nxt-text-label-md">data-nxt-color="dark"</span>
              <button nxtButton variant="primary" size="sm">Lưu</button>
            </nxt-inline>
            <section class="docs-nest" data-nxt-brand="sample" data-nxt-density="compact" aria-label="Vùng brand sample, mật độ gọn">
              <nxt-inline justify="between">
                <span class="nxt-text-label-md">brand="sample" + density="compact"</span>
                <nxt-inline gap="xs">
                  <button nxtButton size="sm">Huỷ</button>
                  <button nxtButton variant="primary" size="sm">Lưu</button>
                </nxt-inline>
              </nxt-inline>
            </section>
          </nxt-stack>
        </section>
      </nxt-stack>
    </section>
  `,
})
export class ThemingNestedExample {}
