import { ChangeDetectionStrategy, Component, ViewEncapsulation, booleanAttribute, computed, input } from '@angular/core';
import { NxtIcon, NxtIconName } from '@nxt/ui/icon';

/** Chronological list: approval history, record changes, activity feed. */
@Component({
  selector: 'nxt-timeline',
  template: '<ng-content />',
  styleUrl: './timeline.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'nxt-timeline', role: 'list' },
})
export class NxtTimeline {}

@Component({
  selector: 'nxt-timeline-item',
  imports: [NxtIcon],
  template: `
    <span class="nxt-timeline__marker" aria-hidden="true">
      @if (markerIcon(); as name) {
        <nxt-icon [name]="name" />
      }
    </span>
    <div class="nxt-timeline__content">
      <!-- The marker is decorative: a skipped step says so in visible text, before its title. -->
      <p class="nxt-timeline__title">@if (skipped()) {<span class="nxt-timeline__skipped">Bỏ qua: </span>}{{ title() }}</p>
      @if (time()) {
        <p class="nxt-timeline__time">{{ time() }}</p>
      }
      <div class="nxt-timeline__body"><ng-content /></div>
    </div>
  `,
  styleUrl: './timeline.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'nxt-timeline__item',
    role: 'listitem',
    '[attr.data-tone]': 'tone()',
    '[attr.data-skipped]': 'skipped() || null',
    '[attr.title]': 'null',
  },
})
export class NxtTimelineItem {
  readonly title = input.required<string>();
  /** Pre-formatted time, e.g. "14:32 · 15/10/2026". */
  readonly time = input<string>();
  /** Marker icon. A skipped step without one shows `player-skip-forward`. */
  readonly icon = input<NxtIconName>();
  readonly tone = input<'neutral' | 'success' | 'warning' | 'danger' | 'brand'>('neutral');
  /**
   * Step that was bypassed (condition not met, not applicable): dashed marker with a skip icon, muted text,
   * and "Bỏ qua: " read before the title. Overrides `tone`. Put the reason in `time` or the body.
   */
  readonly skipped = input(false, { transform: booleanAttribute });

  protected readonly markerIcon = computed<NxtIconName | undefined>(() => this.icon() ?? (this.skipped() ? 'player-skip-forward' : undefined));
}
