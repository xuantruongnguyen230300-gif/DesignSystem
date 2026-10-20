import { ViewportScroller } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  resource,
  untracked,
} from '@angular/core';
import { DomSanitizer, SafeHtml, Title } from '@angular/platform-browser';
import { Router, RouterLink } from '@angular/router';
import { PAGE_CONTENT, PAGES } from '../../generated/content';
import { READING_ORDER } from '../core/nav';
import { ApiTable } from '../doc/api-table';
import { ExampleFrame } from '../doc/example-frame';
import { TokenTable } from '../doc/token-table';
import { NxtIcon } from '@nxt/ui/icon';
import { StatusBadge } from '../shell/status-badge';
import { NotFoundPage } from './not-found';

@Component({
  selector: 'docs-doc-page',
  imports: [RouterLink, ExampleFrame, TokenTable, ApiTable, NxtIcon, StatusBadge, NotFoundPage],
  template: `
    @if (page(); as p) {
      <div class="docs-page">
        <article class="docs-article" (click)="onContentClick($event)">
          <header class="docs-page-header">
            <p class="docs-page-header__section">{{ p.sectionTitle }}</p>
            <div class="docs-page-header__title">
              <h1>{{ p.title }}</h1>
              @if (p.status) {
                <docs-status [status]="p.status" />
              }
            </div>
            @if (p.description) {
              <p class="docs-page-header__lead">{{ p.description }}</p>
            }
          </header>

          @if (content.error()) {
            <p class="docs-prose" role="alert">Không tải được nội dung trang. Kiểm tra kết nối mạng rồi tải lại trang.</p>
          }
          @for (seg of content.value() ?? []; track $index) {
            @switch (seg.kind) {
              @case ('html') {
                <div class="docs-prose" [innerHTML]="html(seg.html)"></div>
              }
              @case ('example') {
                <docs-example [id]="seg.id" />
              }
              @case ('tokens') {
                <docs-token-table [prefix]="seg.prefix" />
              }
              @case ('api') {
                <docs-api-table [entry]="seg.entry" />
              }
            }
          }

          <nav class="docs-pager" aria-label="Trang trước và trang sau">
            @if (prev(); as pv) {
              <a class="docs-pager__link" [routerLink]="pv.path" rel="prev">
                <span class="docs-pager__dir"><nxt-icon name="arrow-left" /> Trang trước</span>
                <span class="docs-pager__title">{{ pv.title }}</span>
              </a>
            }
            @if (next(); as nx) {
              <a class="docs-pager__link docs-pager__link--next" [routerLink]="nx.path" rel="next">
                <span class="docs-pager__dir">Trang sau <nxt-icon name="arrow-right" /></span>
                <span class="docs-pager__title">{{ nx.title }}</span>
              </a>
            }
          </nav>
        </article>

        @if (p.toc.length > 1) {
          <aside class="docs-toc" aria-labelledby="docs-toc-title">
            <h2 id="docs-toc-title" class="docs-toc__title">Trên trang này</h2>
            <ul role="list">
              @for (t of p.toc; track t.id) {
                <li><a [routerLink]="[]" [fragment]="t.id">{{ t.text }}</a></li>
              }
            </ul>
          </aside>
        }
      </div>
    } @else {
      <docs-not-found />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocPageView {
  readonly section = input<string>();
  readonly slug = input<string>();

  private readonly sanitizer = inject(DomSanitizer);
  private readonly router = inject(Router);
  private readonly title = inject(Title);
  private readonly scroller = inject(ViewportScroller);
  private readonly injector = inject(Injector);

  protected readonly page = computed(() => PAGES.find((p) => p.section === this.section() && p.slug === this.slug()));
  /** Page bodies are lazy chunks (see tools/docs/generate.mjs) — only metadata ships in the initial bundle. */
  protected readonly content = resource({
    params: () => this.page()?.path,
    loader: ({ params }) => PAGE_CONTENT[params](),
  });
  private readonly index = computed(() => READING_ORDER.findIndex((i) => i.path === this.page()?.path));
  protected readonly prev = computed(() => (this.index() > 0 ? READING_ORDER[this.index() - 1] : null));
  protected readonly next = computed(() => (this.index() >= 0 && this.index() < READING_ORDER.length - 1 ? READING_ORDER[this.index() + 1] : null));

  constructor() {
    effect(() => {
      const p = this.page();
      this.title.setTitle(p ? `${p.title} · NXT Design` : 'Không tìm thấy · NXT Design');
    });
    // The router scrolls to #fragment on navigation, before a lazy body exists — scroll again once it has rendered.
    effect(() => {
      if (!this.content.hasValue()) return;
      const fragment = untracked(() => this.router.parseUrl(this.router.url).fragment);
      if (fragment) afterNextRender(() => this.scroller.scrollToAnchor(fragment), { injector: this.injector });
    });
  }

  /** Markdown is rendered at build time from our own repo content (tools/docs/generate.mjs) — trusted. */
  protected html(source: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(source);
  }

  /** Route internal links inside rendered markdown through the router (no full page reload). */
  protected onContentClick(event: MouseEvent) {
    const link = (event.target as HTMLElement).closest('a');
    if (!link || link.target || event.ctrlKey || event.metaKey || event.shiftKey || event.button !== 0) return;
    const href = link.getAttribute('href') ?? '';
    if (!link.closest('.docs-prose')) return;
    // Static files (llms.txt, raw .md) are served as assets — let the browser open them.
    if (/\.[a-z0-9]+$/i.test(href.split(/[?#]/)[0])) return;
    if (href.startsWith('#')) {
      event.preventDefault();
      void this.router.navigate([], { fragment: href.slice(1) });
    } else if (href.startsWith('/') && !href.startsWith('//')) {
      event.preventDefault();
      void this.router.navigateByUrl(href);
    }
  }
}
