import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostAttributeToken,
  ViewEncapsulation,
  afterNextRender,
  booleanAttribute,
  computed,
  inject,
  input,
  isDevMode,
  numberAttribute,
} from '@angular/core';
import { Params, RouterLink } from '@angular/router';
import { nxtNumber } from '@nxt/ui/format';
import { NxtIcon, NxtIconName } from '@nxt/ui/icon';

let nextId = 0;

/** `ready` shows the body; the others replace it with a skeleton or a message. */
export type NxtCardState = 'ready' | 'loading' | 'empty' | 'error';

/** Interactive content that must not sit inside a `clickable` card (it would be nested in the card's link area). */
const INTERACTIVE = 'a[href]:not(.nxt-card__link), button, input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Surface that groups related content on the app canvas (dashboard widget, form section, list panel).
 * Optional header: title, status (`[nxtCardStatus]`), subtitle, counter, actions (`[nxtCardActions]`) and a numeric
 * header (`[nxtCardKpi]`). As an overview-page card it leads to a pre-filtered list: `link` adds a "Xem tất cả" footer
 * link, `clickable` makes the whole card one link. `state` shows loading / empty / error inside the card.
 * Do not nest cards in cards. The title has a stable id (`headingId`); `region` makes the card a named landmark.
 */
@Component({
  selector: 'nxt-card',
  imports: [NgTemplateOutlet, RouterLink, NxtIcon],
  template: `
    <ng-template #titleText>
      @if (isClickable()) {
        <a class="nxt-card__link" [routerLink]="link()" [queryParams]="queryParams() ?? null" [attr.aria-describedby]="describedBy()">{{
          title()
        }}</a>
      } @else {
        {{ title() }}
      }
    </ng-template>
    @if (title()) {
      <div class="nxt-card__header">
        <div class="nxt-card__titles">
          <div class="nxt-card__title-line">
            @switch (headingLevel()) {
              @case (3) {
                <h3 class="nxt-card__title" [id]="headingId"><ng-container [ngTemplateOutlet]="titleText" /></h3>
              }
              @case (4) {
                <h4 class="nxt-card__title" [id]="headingId"><ng-container [ngTemplateOutlet]="titleText" /></h4>
              }
              @default {
                <h2 class="nxt-card__title" [id]="headingId"><ng-container [ngTemplateOutlet]="titleText" /></h2>
              }
            }
            <span class="nxt-card__status" [id]="statusId"><ng-content select="[nxtCardStatus]" /></span>
          </div>
          @if (subtitle()) {
            <p class="nxt-card__subtitle" [id]="subtitleId">{{ subtitle() }}</p>
          }
        </div>
        @if (showCount()) {
          <span class="nxt-card__count">
            <span aria-hidden="true">{{ countText() }}</span>
            <span class="nxt-visually-hidden">{{ countA11yText() }}</span>
          </span>
        }
        <div class="nxt-card__actions"><ng-content select="[nxtCardActions]" /></div>
      </div>
      <div class="nxt-card__kpi" [id]="kpiId" [hidden]="!isReady()"><ng-content select="[nxtCardKpi]" /></div>
    }
    <div class="nxt-card__body" [hidden]="!isReady()"><ng-content /></div>
    @if (!isReady()) {
      <div class="nxt-card__state" [attr.data-state]="state()">
        @switch (state()) {
          @case ('loading') {
            <span class="nxt-card__skeleton" aria-hidden="true"><span></span><span></span><span></span></span>
            <span class="nxt-visually-hidden">{{ loadingText() }}</span>
          }
          @case ('error') {
            <p class="nxt-card__message"><nxt-icon class="nxt-card__state-icon" name="alert-circle" />{{ errorText() }}</p>
          }
          @default {
            <p class="nxt-card__message"><nxt-icon class="nxt-card__state-icon" name="inbox" />{{ emptyText() }}</p>
          }
        }
        @if (state() !== 'loading') {
          <div class="nxt-card__state-action"><ng-content select="[nxtCardStateAction]" /></div>
        }
      </div>
    }
    <ng-content select="[nxtCardFooter]" />
    @if (showViewAll()) {
      <div class="nxt-card__footer">
        <a class="nxt-card__view-all" [routerLink]="link()" [queryParams]="queryParams() ?? null" [attr.aria-labelledby]="viewAllLabelledBy()"
          ><span [id]="viewAllId">{{ viewAllLabel() }}</span><nxt-icon name="chevron-right"
        /></a>
      </div>
    }
  `,
  styleUrl: './card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'nxt-card',
    '[attr.data-padding]': 'padding()',
    '[attr.data-fill]': 'fill() || null',
    '[attr.data-clickable]': 'isClickable() || null',
    '[attr.data-state]': 'state()',
    '[attr.aria-busy]': 'state() === "loading" || null',
    '[attr.title]': 'null',
    // Keep a role / aria-labelledby the app wrote on the host itself when `region` is off.
    '[attr.role]': 'isRegion() ? "region" : hostRole',
    '[attr.aria-labelledby]': 'isRegion() ? headingId : hostLabelledBy',
  },
})
export class NxtCard {
  readonly title = input<string>();
  readonly subtitle = input<string>();
  /** Heading level of the title — keep the page outline correct (h1 = page title). */
  readonly headingLevel = input(2, { transform: numberAttribute });
  /** `none` for edge-to-edge content such as tables. */
  readonly padding = input<'none' | 'md' | 'lg'>('md');
  /** Take the free height of a flex-column parent (`nxtFill`); the body then stacks its children in a column. */
  readonly fill = input(false, { transform: booleanAttribute });
  /**
   * Named landmark (`role="region"`, labelled by the title) for the few key blocks screen-reader users jump to,
   * e.g. a dashboard widget. Needs `title`. The name must be unique on the page.
   */
  readonly region = input(false, { transform: booleanAttribute });
  /**
   * Where the card leads (router commands), usually the full list with the same filter. Without `clickable`
   * the card gets a "Xem tất cả" footer link.
   */
  readonly link = input<string | readonly unknown[]>();
  /** Filter of the destination list, e.g. `{ status: 'pending' }`. */
  readonly queryParams = input<Params>();
  /**
   * The whole card is one link to `link` (a single destination): the title link stretches over the card.
   * Needs `title` and `link`; the card must not contain other interactive elements.
   */
  readonly clickable = input(false, { transform: booleanAttribute });
  /** Text of the footer link. Name the count and the object when known: "Xem tất cả 12 đơn". */
  readonly viewAllLabel = input('Xem tất cả');
  /** Items shown on the card. With `total`, the header shows "count/total" while `count < total`. */
  readonly count = input<number>();
  /** Total items in the destination list. */
  readonly total = input<number>();
  /** Hidden text of the counter for screen readers; `{count}` and `{total}` are replaced with the formatted numbers. */
  readonly countLabel = input('Hiển thị {count} trên {total} mục');
  /** `loading` (skeleton), `empty`, `error` replace the body; the counter and KPI hide. */
  readonly state = input<NxtCardState>('ready');
  /** Hidden text while loading. */
  readonly loadingText = input('Đang tải dữ liệu');
  /** Message of the `empty` state — say what is missing: "Không có đơn chờ duyệt". */
  readonly emptyText = input('Chưa có dữ liệu');
  /** Message of the `error` state — what happened and what to do next. */
  readonly errorText = input('Không tải được dữ liệu. Hãy thử lại sau.');

  private readonly uid = nextId++;
  /**
   * Stable id of the title, for `aria-labelledby` on content inside the card:
   * `<nxt-card #card title="…">` → `[attr.aria-labelledby]="card.headingId"`.
   */
  readonly headingId = `nxt-card-${this.uid}-title`;
  protected readonly subtitleId = `nxt-card-${this.uid}-subtitle`;
  protected readonly statusId = `nxt-card-${this.uid}-status`;
  protected readonly kpiId = `nxt-card-${this.uid}-kpi`;
  protected readonly viewAllId = `nxt-card-${this.uid}-view-all`;

  protected readonly isRegion = computed(() => this.region() && !!this.title());
  protected readonly isReady = computed(() => this.state() === 'ready');
  protected readonly isClickable = computed(() => this.clickable() && this.link() !== undefined && !!this.title());
  protected readonly showViewAll = computed(() => this.link() !== undefined && !this.isClickable() && this.state() !== 'empty');
  protected readonly showCount = computed(() => {
    const count = this.count();
    const total = this.total();
    return this.isReady() && count !== undefined && total !== undefined && count < total;
  });
  protected readonly countText = computed(() => `${nxtNumber(this.count())}/${nxtNumber(this.total())}`);
  protected readonly countA11yText = computed(() =>
    this.countLabel().replace('{count}', nxtNumber(this.count())).replace('{total}', nxtNumber(this.total())),
  );
  /** The clickable title link is described by what a sighted user reads with it. */
  protected readonly describedBy = computed(() =>
    [this.subtitle() ? this.subtitleId : null, this.statusId, this.isReady() ? this.kpiId : null].filter(Boolean).join(' '),
  );
  protected readonly viewAllLabelledBy = computed(() => (this.title() ? `${this.viewAllId} ${this.headingId}` : this.viewAllId));

  protected readonly hostRole = inject(new HostAttributeToken('role'), { optional: true });
  protected readonly hostLabelledBy = inject(new HostAttributeToken('aria-labelledby'), { optional: true });
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    if (isDevMode()) {
      afterNextRender(() => {
        if (this.isClickable() && this.host.nativeElement.querySelector(INTERACTIVE)) {
          console.warn(
            `nxt-card "${this.title()}": a clickable card is one link — it must not contain other interactive elements. ` +
              'Remove `clickable` and use the "Xem tất cả" footer link instead.',
          );
        }
      });
    }
  }
}

/**
 * Key metric: label, value, trend vs. a previous period. Trend tone is explicit because "up" is not
 * always good (headcount up = neutral, turnover up = negative). Inside `[nxtCardKpi]` leave `label` out:
 * the card title names the metric.
 */
@Component({
  selector: 'nxt-stat',
  imports: [NxtIcon],
  template: `
    @if (icon(); as name) {
      <span class="nxt-stat__icon" aria-hidden="true"><nxt-icon [name]="name" /></span>
    }
    <div class="nxt-stat__body">
      @if (label()) {
        <p class="nxt-stat__label">{{ label() }}</p>
      }
      <p class="nxt-stat__value">
        {{ value() }}
        @if (unit()) {
          <span class="nxt-stat__unit">{{ unit() }}</span>
        }
      </p>
      @if (delta()) {
        <p class="nxt-stat__delta" [attr.data-tone]="deltaTone()">
          <nxt-icon [name]="trendIcon()" />
          <span class="nxt-visually-hidden">{{ trendText() }}</span>
          <span>{{ delta() }}</span>
          @if (caption()) {
            <span class="nxt-stat__caption">{{ caption() }}</span>
          }
        </p>
      }
    </div>
  `,
  styleUrl: './card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'nxt-stat' },
})
export class NxtStat {
  /** Name of the metric. Leave out when the stat is the numeric header of a card (`nxtCardKpi`). */
  readonly label = input<string>();
  /** Pre-formatted value (`@nxt/ui/format`), e.g. "1.284". */
  readonly value = input.required<string>();
  readonly unit = input<string>();
  readonly icon = input<NxtIconName>();
  /** Pre-formatted change, e.g. "2,1%". */
  readonly delta = input<string>();
  readonly trend = input<'up' | 'down' | 'flat'>('flat');
  readonly deltaTone = input<'positive' | 'negative' | 'neutral'>('neutral');
  /** e.g. "so với tháng trước". */
  readonly caption = input<string>();

  protected readonly trendIcon = computed<NxtIconName>(() =>
    this.trend() === 'up' ? 'trending-up' : this.trend() === 'down' ? 'trending-down' : 'minus',
  );
  protected readonly trendText = computed(() => (this.trend() === 'up' ? 'Tăng' : this.trend() === 'down' ? 'Giảm' : 'Không đổi'));
}
