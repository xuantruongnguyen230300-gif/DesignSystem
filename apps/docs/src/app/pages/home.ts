import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NxtButton } from '@nxt/ui/button';
import { NxtGrid, NxtInline, NxtSpan, NxtStack } from '@nxt/ui/layout';
import { PAGES } from '../../generated/content';

interface Pillar {
  title: string;
  text: string;
  link: string;
  linkLabel: string;
}

@Component({
  selector: 'docs-home',
  imports: [RouterLink, NxtButton, NxtStack, NxtInline, NxtGrid, NxtSpan],
  template: `
    <div class="docs-home">
      <section class="docs-hero" aria-labelledby="docs-hero-title">
        <nxt-stack gap="lg">
          <p class="docs-hero__kicker">NXT Design · v0.1</p>
          <h1 id="docs-hero-title" class="docs-hero__title">Design system cho phần mềm nghiệp vụ dày dữ liệu</h1>
          <p class="docs-hero__lead">
            Một bộ token, component Angular và pattern dùng chung cho mọi sản phẩm. Ưu tiên tốc độ thao tác, bàn phím,
            trạng thái đầy đủ và tiếng Việt chuẩn.
          </p>
          <nxt-inline gap="sm">
            <a nxtButton variant="primary" size="lg" routerLink="/getting-started/introduction">Bắt đầu</a>
            <a nxtButton size="lg" routerLink="/foundations/layout">Layout &amp; Grid</a>
            <a nxtButton variant="ghost" size="lg" routerLink="/roadmap">Roadmap</a>
          </nxt-inline>
        </nxt-stack>
      </section>

      <section aria-labelledby="docs-pillars-title" class="docs-home__section">
        <h2 id="docs-pillars-title" class="docs-home__heading">Điểm khác biệt</h2>
        <nxt-grid>
          @for (p of pillars; track p.title) {
            <div class="docs-pillar" [nxtSpan]="{ base: 12, md: 6, xl: 3 }">
              <h3 class="nxt-text-heading-sm">{{ p.title }}</h3>
              <p class="nxt-text-subtle">{{ p.text }}</p>
              <a [routerLink]="p.link">{{ p.linkLabel }}</a>
            </div>
          }
        </nxt-grid>
      </section>

      <section aria-labelledby="docs-status-title" class="docs-home__section">
        <h2 id="docs-status-title" class="docs-home__heading">Hiện trạng</h2>
        <dl class="docs-stats">
          <div><dt>Trang tài liệu</dt><dd class="nxt-tabular-nums">{{ pageCount }}</dd></div>
          <div><dt>Component đã phát hành (beta)</dt><dd class="nxt-tabular-nums">{{ betaCount }}</dd></div>
          <div><dt>Token</dt><dd class="nxt-tabular-nums">~390</dd></div>
          <div><dt>Cặp tương phản được kiểm tự động</dt><dd class="nxt-tabular-nums">400</dd></div>
        </dl>
      </section>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
  protected readonly pageCount = PAGES.length;
  protected readonly betaCount = PAGES.filter((p) => p.section === 'components' && p.status === 'beta').length;
  protected readonly pillars: Pillar[] = [
    {
      title: 'Token đúng ở mọi ngữ cảnh',
      text: 'Sáng/tối, ba mức mật độ và brand từng sản phẩm hoạt động lồng nhau tới từng phần tử. Mọi cặp màu được kiểm tương phản WCAG tự động.',
      link: '/getting-started/theming',
      linkLabel: 'Theming cho sản phẩm',
    },
    {
      title: 'Lưới theo không gian thật',
      text: 'Grid phản hồi theo chiều rộng của chính nó (container query), nên form trong drawer hẹp vẫn tự về một cột.',
      link: '/foundations/layout',
      linkLabel: 'Layout & Grid',
    },
    {
      title: 'Accessibility là điều kiện tối thiểu',
      text: 'WCAG 2.2 AA, keyboard map theo WAI-ARIA APG có test, focus luôn nhìn thấy, vùng chạm tối thiểu 24px ở mọi mật độ.',
      link: '/components/button',
      linkLabel: 'Ví dụ: Button',
    },
    {
      title: 'Làm việc cùng AI agent',
      text: 'Bộ skill nxt-* cho Claude Code, llms.txt và validator chặn giá trị hard-code, nên agent tạo UI đúng chuẩn ngay từ đầu.',
      link: '/getting-started/ai-agents',
      linkLabel: 'Dùng với AI agent',
    },
  ];
}
