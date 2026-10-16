import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  inject,
  input,
} from '@angular/core';

/** Emphasis level — see packages/ui/button/SPEC.md §4. */
export type NxtButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
/** Block size follows the active density (semantic.size.control.*). */
export type NxtButtonSize = 'sm' | 'md' | 'lg';
export type NxtButtonType = 'button' | 'submit' | 'reset';

/**
 * Button — native `<button>` or `<a>` with NXT styling and safe defaults.
 *
 * - `disabled` uses `aria-disabled`, so the button stays focusable and can explain *why* it is disabled.
 * - `disabled` / `loading` block activation before any consumer `(click)` listener runs.
 * - `type` defaults to `button`, so it never submits a form by accident.
 */
@Component({
  selector: 'button[nxtButton], a[nxtButton]',
  exportAs: 'nxtButton',
  template: `
    @if (loading()) {
      <span class="nxt-button__spinner" aria-hidden="true"></span>
    }
    <span class="nxt-button__content"><ng-content /></span>
  `,
  styleUrl: './button.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'nxt-button',
    '[attr.data-variant]': 'variant()',
    '[attr.data-size]': 'size()',
    '[attr.data-loading]': 'loading() || null',
    '[attr.aria-disabled]': 'inactive() || null',
    '[attr.aria-busy]': 'loading() || null',
    '[attr.type]': 'isNativeButton ? type() : null',
  },
})
export class NxtButton {
  private readonly host: HTMLButtonElement | HTMLAnchorElement = inject(ElementRef).nativeElement;
  protected readonly isNativeButton = this.host.tagName === 'BUTTON';

  /** Emphasis: at most one `primary` per region. */
  readonly variant = input<NxtButtonVariant>('secondary');
  /** sm | md | lg — height comes from the density mode. */
  readonly size = input<NxtButtonSize>('md');
  /** Blocks activation but keeps focus (aria-disabled). Explain the reason next to the button. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Shows a spinner, sets aria-busy and blocks activation while keeping the width. */
  readonly loading = input(false, { transform: booleanAttribute });
  /** Native button type; ignored on anchors. */
  readonly type = input<NxtButtonType>('button');

  /** True while the button must not activate. */
  protected readonly inactive = computed(() => this.disabled() || this.loading());

  constructor() {
    // A capture listener on the target runs before the consumer's (click) listeners on the same element.
    const block = (event: Event) => {
      if (!this.inactive()) return;
      event.preventDefault();
      event.stopImmediatePropagation();
    };
    this.host.addEventListener('click', block, { capture: true });
    inject(DestroyRef).onDestroy(() => this.host.removeEventListener('click', block, { capture: true }));
  }
}
