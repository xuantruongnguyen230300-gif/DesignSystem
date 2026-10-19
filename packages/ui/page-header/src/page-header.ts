import { ChangeDetectionStrategy, Component, ViewEncapsulation, input, numberAttribute } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NxtIcon } from '@nxt/ui/icon';

export interface NxtBreadcrumbItem {
  label: string;
  /** Router path; the last item is the current page and is never a link. */
  link?: string;
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
            @if (item.link && !last) {
              <a class="nxt-breadcrumb__link" [routerLink]="item.link">{{ item.label }}</a>
            } @else {
              <span class="nxt-breadcrumb__current" [attr.aria-current]="last ? 'page' : null">{{ item.label }}</span>
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
}

/**
 * Page title area: breadcrumb, title (h1), description, meta (`[nxtPageMeta]`, e.g. status tag)
 * and the page's primary actions (`[nxtPageActions]`, one primary at most). Default content goes below (tabs).
 */
@Component({
  selector: 'nxt-page-header',
  imports: [NxtBreadcrumb],
  template: `
    @if (breadcrumb().length) {
      <nxt-breadcrumb [items]="breadcrumb()" />
    }
    <div class="nxt-page-header__row">
      <div class="nxt-page-header__titles">
        <div class="nxt-page-header__title-line">
          @switch (headingLevel()) {
            @case (2) {
              <h2 class="nxt-page-header__title">{{ title() }}</h2>
            }
            @default {
              <h1 class="nxt-page-header__title">{{ title() }}</h1>
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
}
