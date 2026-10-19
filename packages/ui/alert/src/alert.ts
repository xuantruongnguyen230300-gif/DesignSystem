import { ChangeDetectionStrategy, Component, Directive, ViewEncapsulation, booleanAttribute, computed, input, output } from '@angular/core';
import { NxtButton } from '@nxt/ui/button';
import { NxtIcon } from '@nxt/ui/icon';

export type NxtAlertTone = 'info' | 'success' | 'warning' | 'danger';

const ICONS = { info: 'info-circle', success: 'circle-check', warning: 'alert-triangle', danger: 'alert-circle' } as const;

/**
 * In-page message: the result of an action ("Đã xoá 3 chức danh." + "Hoàn tác"), a page-level error, or a standing
 * note. Has no role of its own: messages that appear after an action go inside a `[nxtLiveRegion]` that is
 * already on the page, so screen readers announce them.
 */
@Component({
  selector: 'nxt-alert',
  imports: [NxtButton, NxtIcon],
  template: `
    <nxt-icon class="nxt-alert__icon" [name]="icon()" />
    <div class="nxt-alert__content">
      @if (title()) {
        <p class="nxt-alert__title">{{ title() }}</p>
      }
      <div class="nxt-alert__message"><ng-content /></div>
    </div>
    <div class="nxt-alert__actions"><ng-content select="[nxtAlertActions]" /></div>
    @if (dismissible()) {
      <button class="nxt-alert__close" nxtIconButton size="sm" variant="ghost" type="button" aria-label="Đóng thông báo" (click)="dismissed.emit()">
        <nxt-icon name="x" />
      </button>
    }
  `,
  styleUrl: './alert.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  // The title input must not leave a native title attribute (browser tooltip over the whole alert).
  host: { class: 'nxt-alert', '[attr.data-tone]': 'tone()', '[attr.title]': 'null' },
})
export class NxtAlert {
  readonly tone = input<NxtAlertTone>('info');
  readonly title = input<string>();
  /** Show a close button; remove the alert on `dismissed`. */
  readonly dismissible = input(false, { transform: booleanAttribute });
  readonly dismissed = output<void>();

  protected readonly icon = computed(() => ICONS[this.tone()]);
}

/**
 * A region that is always on the page, so messages inserted into it later are announced:
 * `polite` (default) → `role="status"`, `assertive` → `role="alert"` (errors that need attention now).
 * When empty it takes no room but stays in the accessibility tree (styles in `styles/nxt.css`).
 */
@Directive({
  selector: '[nxtLiveRegion]',
  host: { class: 'nxt-live-region', '[attr.role]': "nxtLiveRegion() === 'assertive' ? 'alert' : 'status'" },
})
export class NxtLiveRegion {
  readonly nxtLiveRegion = input<'polite' | 'assertive' | ''>('polite');
}
