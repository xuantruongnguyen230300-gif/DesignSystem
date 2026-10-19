import { ChangeDetectionStrategy, Component, ViewEncapsulation, input } from '@angular/core';
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
      @if (icon(); as name) {
        <nxt-icon [name]="name" />
      }
    </span>
    <div class="nxt-timeline__content">
      <p class="nxt-timeline__title">{{ title() }}</p>
      @if (time()) {
        <p class="nxt-timeline__time">{{ time() }}</p>
      }
      <div class="nxt-timeline__body"><ng-content /></div>
    </div>
  `,
  styleUrl: './timeline.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'nxt-timeline__item', role: 'listitem', '[attr.data-tone]': 'tone()', '[attr.title]': 'null' },
})
export class NxtTimelineItem {
  readonly title = input.required<string>();
  /** Pre-formatted time, e.g. "14:32 · 15/10/2026". */
  readonly time = input<string>();
  readonly icon = input<NxtIconName>();
  readonly tone = input<'neutral' | 'success' | 'warning' | 'danger' | 'brand'>('neutral');
}
