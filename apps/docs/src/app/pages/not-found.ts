import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NxtButton } from '@nxt/ui/button';
import { NxtInline, NxtStack } from '@nxt/ui/layout';

@Component({
  selector: 'docs-not-found',
  imports: [RouterLink, NxtButton, NxtStack, NxtInline],
  template: `
    <nxt-stack gap="lg" class="docs-empty">
      <nxt-stack gap="sm">
        <h1 class="nxt-text-heading-lg">Không tìm thấy trang</h1>
        <p class="nxt-text-subtle">Trang này chưa có hoặc đã được đổi tên. Bạn có thể quay về trang chủ hoặc tìm bằng <kbd>Ctrl</kbd> <kbd>K</kbd>.</p>
      </nxt-stack>
      <nxt-inline>
        <a nxtButton variant="primary" routerLink="/">Về trang chủ</a>
        <a nxtButton routerLink="/roadmap">Xem roadmap</a>
      </nxt-inline>
    </nxt-stack>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundPage {}
