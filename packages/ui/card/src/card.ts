import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input, numberAttribute } from '@angular/core';
import { NxtIcon, NxtIconName } from '@nxt/ui/icon';

/**
 * Surface that groups related content on the app canvas (dashboard widget, form section, list panel).
 * Optional header: title, subtitle and actions (`[nxtCardActions]`). Do not nest cards in cards.
 */
@Component({
  selector: 'nxt-card',
  template: `
    @if (title()) {
      <div class="nxt-card__header">
        <div class="nxt-card__titles">
          @switch (headingLevel()) {
            @case (3) {
              <h3 class="nxt-card__title">{{ title() }}</h3>
            }
            @case (4) {
              <h4 class="nxt-card__title">{{ title() }}</h4>
            }
            @default {
              <h2 class="nxt-card__title">{{ title() }}</h2>
            }
          }
          @if (subtitle()) {
            <p class="nxt-card__subtitle">{{ subtitle() }}</p>
          }
        </div>
        <div class="nxt-card__actions"><ng-content select="[nxtCardActions]" /></div>
      </div>
    }
    <div class="nxt-card__body"><ng-content /></div>
    <ng-content select="[nxtCardFooter]" />
  `,
  styleUrl: './card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'nxt-card',
    '[attr.data-padding]': 'padding()',
    '[attr.title]': 'null',
  },
})
export class NxtCard {
  readonly title = input<string>();
  readonly subtitle = input<string>();
  /** Heading level of the title — keep the page outline correct (h1 = page title). */
  readonly headingLevel = input(2, { transform: numberAttribute });
  /** `none` for edge-to-edge content such as tables. */
  readonly padding = input<'none' | 'md' | 'lg'>('md');
}

/**
 * Key metric: label, value, trend vs. a previous period. Trend tone is explicit because "up" is not
 * always good (headcount up = neutral, turnover up = negative).
 */
@Component({
  selector: 'nxt-stat',
  imports: [NxtIcon],
  template: `
    @if (icon(); as name) {
      <span class="nxt-stat__icon" aria-hidden="true"><nxt-icon [name]="name" /></span>
    }
    <div class="nxt-stat__body">
      <p class="nxt-stat__label">{{ label() }}</p>
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
  readonly label = input.required<string>();
  /** Pre-formatted value (vi-VN), e.g. "1.284". */
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
