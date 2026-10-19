import { ChangeDetectionStrategy, Component, ElementRef, ViewEncapsulation, input, numberAttribute, output, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
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
 * Page title area: breadcrumb, title (h1), description, meta (`[nxtPageMeta]`, e.g. status tag)
 * and the page's primary actions (`[nxtPageActions]`, one primary at most). Default content goes below (tabs).
 * The title takes programmatic focus (`focusTitle()`) when the app swaps views without a route change.
 */
@Component({
  selector: 'nxt-page-header',
  imports: [NxtBreadcrumb],
  template: `
    @if (breadcrumb().length) {
      <nxt-breadcrumb [items]="breadcrumb()" (navigate)="navigate.emit($event)" />
    }
    <div class="nxt-page-header__row">
      <div class="nxt-page-header__titles">
        <div class="nxt-page-header__title-line">
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
        @if (description()) {
          <p class="nxt-page-header__description">{{ description() }}</p>
        }
      </div>
      <div class="nxt-page-header__actions"><ng-content select="[nxtPageActions]" /></div>
    </div>
    <ng-content />
  `,
  styleUrl: './page-header.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'nxt-page-header', '[attr.title]': 'null' },
})
export class NxtPageHeader {
  readonly title = input.required<string>();
  readonly description = input<string>();
  readonly breadcrumb = input<NxtBreadcrumbItem[]>([]);
  readonly headingLevel = input(1, { transform: numberAttribute });
  /** Forwarded from the breadcrumb: the user activated a `navigable` item. */
  readonly navigate = output<NxtBreadcrumbItem>();

  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');

  /**
   * Move focus to the title (it has `tabindex="-1"`, so Tab never stops there). Call after swapping views
   * without a route change (list → editor), inside `afterNextRender` so the new header is rendered.
   */
  focusTitle(options?: FocusOptions): void {
    this.heading()?.nativeElement.focus(options);
  }
}
