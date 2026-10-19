import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  afterNextRender,
  booleanAttribute,
  computed,
  inject,
  input,
  isDevMode,
  numberAttribute,
} from '@angular/core';
import { NxtIcon, NxtIconName } from '@nxt/ui/icon';

/** Status meaning is fixed across products: danger = error/destructive, success, warning, info. */
export type NxtTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'brand';

/**
 * Short status or category label. Status is never color-only: a dot or icon plus text.
 */
@Component({
  selector: 'nxt-tag',
  imports: [NxtIcon],
  template: `
    @if (icon(); as name) {
      <nxt-icon [name]="name" />
    } @else if (dot()) {
      <span class="nxt-tag__dot" aria-hidden="true"></span>
    }
    <span class="nxt-tag__label"><ng-content /></span>
  `,
  styleUrl: './tag.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'nxt-tag',
    '[attr.data-tone]': 'tone()',
    '[attr.data-size]': 'size()',
  },
})
export class NxtTag {
  readonly tone = input<NxtTone>('neutral');
  /** Leading status dot (use for workflow states: Chờ duyệt, Đã duyệt…). */
  readonly dot = input(false, { transform: booleanAttribute });
  /** Leading icon instead of a dot. */
  readonly icon = input<NxtIconName>();
  readonly size = input<'sm' | 'md'>('md');
}

/**
 * Count badge (notifications, pending items). Use `label` to give the number context for screen readers.
 */
@Component({
  selector: 'nxt-badge',
  template: `
    @if (!dot()) {
      <span [attr.aria-hidden]="label() ? 'true' : null">{{ display() }}</span>
    }
    @if (label()) {
      <span class="nxt-visually-hidden">{{ label() }}</span>
    }
  `,
  styleUrl: './tag.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'nxt-badge',
    '[attr.data-tone]': 'tone()',
    '[attr.data-dot]': 'dot() || null',
  },
})
export class NxtBadge {
  readonly value = input<number | string>();
  /** Numbers above this show as "99+". */
  readonly max = input(99, { transform: numberAttribute });
  readonly tone = input<'danger' | 'neutral' | 'brand'>('danger');
  /** Dot only, no number. */
  readonly dot = input(false, { transform: booleanAttribute });
  /** Screen-reader text, e.g. "12 đơn chờ duyệt". */
  readonly label = input<string>();
  protected readonly display = computed(() => {
    const v = this.value();
    return typeof v === 'number' && v > this.max() ? `${this.max()}+` : (v ?? '');
  });

  constructor() {
    const host: HTMLElement = inject(ElementRef).nativeElement;
    if (isDevMode()) {
      afterNextRender(() => {
        // Fine when a labelled parent already says it, e.g. a bell button named "Thông báo, 3 chưa đọc".
        if (this.dot() && !this.label() && !host.parentElement?.closest('[aria-label], [aria-labelledby]')) {
          console.warn('[nxt-badge] dot badge has no text for screen readers — add label="…" (WCAG 1.1.1).');
        }
      });
    }
  }
}
