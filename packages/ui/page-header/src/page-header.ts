import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  TemplateRef,
  ViewEncapsulation,
  afterNextRender,
  afterRenderEffect,
  computed,
  effect,
  inject,
  input,
  numberAttribute,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { NxtShellState, nxtShellStateOf } from '@nxt/ui/app-shell';
import { NxtIcon } from '@nxt/ui/icon';

export interface NxtBreadcrumbItem {
  label: string;
  /** Router path; the last item is the current page and is never a link. */
  link?: string;
  /**
   * No router (the app swaps views itself): rendered as a link-styled button that emits `navigate` with this item.
   * Ignored when `link` is set, and on the last item.
   */
  navigable?: boolean;
}

/** Location in the hierarchy (pages two levels deep or more). */
@Component({
  selector: 'nxt-breadcrumb',
  imports: [RouterLink, NxtIcon],
  template: `
    <nav [attr.aria-label]="label()">
      <ol class="nxt-breadcrumb__list">
        @for (item of items(); track $index; let last = $last) {
          <li class="nxt-breadcrumb__item">
            @if (last) {
              <span class="nxt-breadcrumb__current" aria-current="page">{{ item.label }}</span>
            } @else if (item.link) {
              <a class="nxt-breadcrumb__link" [routerLink]="item.link">{{ item.label }}</a>
            } @else if (item.navigable) {
              <button type="button" class="nxt-breadcrumb__link" (click)="navigate.emit(item)">{{ item.label }}</button>
            } @else {
              <span class="nxt-breadcrumb__text">{{ item.label }}</span>
            }
            @if (!last) {
              <nxt-icon class="nxt-breadcrumb__sep" name="chevron-right" />
            }
          </li>
        }
      </ol>
    </nav>
  `,
  styleUrl: './page-header.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'nxt-breadcrumb' },
})
export class NxtBreadcrumb {
  readonly items = input.required<NxtBreadcrumbItem[]>();
  readonly label = input('Đường dẫn trang');
  /** The user activated a `navigable` item (one without `link`): swap to that view. Items with `link` are left to the router. */
  readonly navigate = output<NxtBreadcrumbItem>();
}

/**
 * Page title area: breadcrumb, back button (`[nxtPageBack]`), title (h1), description, meta (`[nxtPageMeta]`,
 * e.g. status tag) and the page's primary actions (`[nxtPageActions]`, one primary at most). Default content goes below (tabs).
 * The title takes programmatic focus (`focusTitle()`) when the app swaps views without a route change.
 *
 * `placement="topbar"`: inside an `nxt-app-shell` at 1024px and up, breadcrumb, title, meta and actions render
 * in the shell's top bar (one row with the account menu) and the description is not shown; default content (tabs)
 * stays in the page. Below 1024px, or outside a shell, it renders in the page as usual.
 */
@Component({
  selector: 'nxt-page-header',
  imports: [NgTemplateOutlet, NxtBreadcrumb],
  template: `
    <ng-template #head>
      <div class="nxt-page-header__head" [attr.data-placement]="inTopbar() ? 'topbar' : null">
        @if (breadcrumb().length) {
          <nxt-breadcrumb [items]="breadcrumb()" (navigate)="navigate.emit($event)" />
        }
        <div class="nxt-page-header__row">
          <div class="nxt-page-header__titles">
            <div class="nxt-page-header__title-line">
              <ng-content select="[nxtPageBack]" />
              <div class="nxt-page-header__title-group">
                @switch (headingLevel()) {
                  @case (2) {
                    <h2 #heading class="nxt-page-header__title" tabindex="-1">{{ title() }}</h2>
                  }
                  @default {
                    <h1 #heading class="nxt-page-header__title" tabindex="-1">{{ title() }}</h1>
                  }
                }
                <ng-content select="[nxtPageMeta]" />
              </div>
            </div>
            @if (description() && !inTopbar()) {
              <p class="nxt-page-header__description">{{ description() }}</p>
            }
          </div>
          <div class="nxt-page-header__actions"><ng-content select="[nxtPageActions]" /></div>
        </div>
      </div>
    </ng-template>
    <!-- Rendered once, here or in the top bar; until the shell is known (first render) nowhere, so it never jumps. -->
    @if (where() === 'content') {
      <ng-container [ngTemplateOutlet]="head" />
    }
    <ng-content />
  `,
  styleUrl: './page-header.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'nxt-page-header',
    '[attr.title]': 'null',
    '[attr.data-placement]': 'inTopbar() ? "topbar" : null',
  },
})
export class NxtPageHeader {
  readonly title = input.required<string>();
  /** One sentence on the page's scope. Not shown when the header is in the top bar. */
  readonly description = input<string>();
  readonly breadcrumb = input<NxtBreadcrumbItem[]>([]);
  readonly headingLevel = input(1, { transform: numberAttribute });
  /**
   * `content` (default): at the top of the page. `topbar`: in the app shell's top bar from 1024px up
   * (falls back to `content` outside a shell and below 1024px).
   */
  readonly placement = input<'content' | 'topbar'>('content');
  /** Forwarded from the breadcrumb: the user activated a `navigable` item. */
  readonly navigate = output<NxtBreadcrumbItem>();

  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
  private readonly head = viewChild.required<TemplateRef<unknown>>('head');
  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  /** The shell this header sits in, found through the DOM after the first render (`undefined` until then). */
  private readonly shell = signal<NxtShellState | null | undefined>(undefined);
  /** `focusTitle()` was called before the title rendered. */
  private readonly focusRequest = signal<FocusOptions | null>(null);

  protected readonly inTopbar = computed(() => this.placement() === 'topbar' && !!this.shell() && !this.shell()!.mobile());
  /** `pending`: placement topbar, shell not looked up yet. */
  protected readonly where = computed(() =>
    this.inTopbar() ? 'topbar' : this.placement() === 'topbar' && this.shell() === undefined ? 'pending' : 'content',
  );

  constructor() {
    afterNextRender(() => this.shell.set(nxtShellStateOf(this.host)));
    effect((onCleanup) => {
      const shell = this.shell();
      if (!this.inTopbar() || !shell) return;
      const head = this.head();
      shell.pageHeader.set(head);
      // Leaving the top bar (destroyed, below 1024px, placement changed): clear it, unless another header took it.
      onCleanup(() => {
        if (untracked(shell.pageHeader) === head) shell.pageHeader.set(null);
      });
    });
    afterRenderEffect(() => {
      const heading = this.heading()?.nativeElement;
      const request = this.focusRequest();
      if (!heading || !request) return;
      heading.focus(request);
      this.focusRequest.set(null);
    });
  }

  /**
   * Move focus to the title (it has `tabindex="-1"`, so Tab never stops there). Call after swapping views
   * without a route change (list → editor), inside `afterNextRender` so the new header is rendered.
   * A header on its way to the top bar renders one pass later: the focus then lands as soon as the title is there.
   */
  focusTitle(options?: FocusOptions): void {
    const heading = this.heading()?.nativeElement;
    if (heading) heading.focus(options);
    else this.focusRequest.set(options ?? {});
  }
}
