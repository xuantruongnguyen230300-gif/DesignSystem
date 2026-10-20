import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input } from '@angular/core';
import { NXT_ICONS, NxtIconName, NxtIconPath } from './icons.generated';

export type NxtIconSize = 'sm' | 'md' | 'lg';

/**
 * Icon from the curated Tabler outline set (packages/ui/icon/icons.json).
 * Decorative by default (aria-hidden). Pass `label` only when the icon carries meaning on its own.
 * Size: `size` input, or inherited from the parent component through `--nxt-icon-size`.
 */
@Component({
  selector: 'nxt-icon',
  template: `
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      focusable="false"
      [attr.aria-hidden]="label() ? null : 'true'"
      [attr.role]="label() ? 'img' : null"
      [attr.aria-label]="label() || null"
    >
      @for (p of paths(); track $index) {
        @if (isString(p)) {
          <path [attr.d]="p" />
        } @else {
          <path [attr.d]="p.d" [attr.fill]="p.fill ?? null" [attr.opacity]="p.opacity ?? null" [attr.stroke]="p.stroke ?? null" />
        }
      }
    </svg>
  `,
  styleUrl: './icon.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'nxt-icon',
    '[attr.data-size]': 'size() ?? null',
  },
})
export class NxtIcon {
  /** Icon name — typed against the curated set, so a typo fails at compile time. */
  readonly name = input.required<NxtIconName>();
  /** sm 16 · md 20 · lg 24px. Omit to inherit --nxt-icon-size from the parent component. */
  readonly size = input<NxtIconSize>();
  /** Accessible name. Only for icons that convey meaning without adjacent text. */
  readonly label = input<string>();

  protected readonly paths = computed<readonly NxtIconPath[]>(() => NXT_ICONS[this.name()] ?? []);
  protected isString(p: NxtIconPath): p is string {
    return typeof p === 'string';
  }
}
