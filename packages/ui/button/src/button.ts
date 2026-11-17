import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  ViewEncapsulation,
  afterNextRender,
  booleanAttribute,
  computed,
  inject,
  input,
  isDevMode,
  model,
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
 * - `nxtIconButton` renders a square, icon-only button — it must have an `aria-label`.
 * - `pressed` (true/false) turns a secondary/ghost button into a toggle button (`aria-pressed`).
 */
@Component({
  selector: 'button[nxtButton], a[nxtButton], button[nxtIconButton], a[nxtIconButton]',
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
    '[attr.data-icon-only]': 'iconOnly || null',
    '[attr.aria-disabled]': 'inactive() || null',
    '[attr.aria-busy]': 'loading() || null',
    '[attr.type]': 'isNativeButton ? type() : null',
    '[attr.aria-pressed]': 'isToggle() ? pressed() : null',
    '[attr.data-pressed]': 'isToggle() && pressed() ? "" : null',
    '(click)': 'togglePressed()',
    // A static `disabled` attribute would stay on the DOM and make the native button unfocusable.
    '[attr.disabled]': 'null',
  },
})
export class NxtButton {
  private readonly host: HTMLButtonElement | HTMLAnchorElement = inject(ElementRef).nativeElement;
  protected readonly isNativeButton = this.host.tagName === 'BUTTON';
  protected readonly iconOnly = this.host.hasAttribute('nxticonbutton');

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
  /**
   * Toggle button: true/false makes it a toggle (aria-pressed) that flips on click; undefined = ordinary button.
   * Only secondary and ghost, only on `<button>`. Two-way: `[(pressed)]`.
   */
  readonly pressed = model<boolean | undefined>(undefined);

  /** True while the button must not activate. */
  protected readonly inactive = computed(() => this.disabled() || this.loading());
  /** A toggle button: `pressed` is set and the host is a native button (links cannot be pressed). */
  protected readonly isToggle = computed(() => this.isNativeButton && this.pressed() !== undefined);

  constructor() {
    // A capture listener on the target runs before the consumer's (click) listeners on the same element.
    const block = (event: Event) => {
      if (!this.inactive()) return;
      event.preventDefault();
      event.stopImmediatePropagation();
    };
    this.host.addEventListener('click', block, { capture: true });
    inject(DestroyRef).onDestroy(() => this.host.removeEventListener('click', block, { capture: true }));

    if (isDevMode()) {
      afterNextRender(() => {
        if (this.pressed() !== undefined && (this.variant() === 'primary' || this.variant() === 'danger')) {
          console.warn('[nxtButton] toggle buttons (pressed) are secondary or ghost only (SPEC §4).', this.host);
        }
      });
    }

    if (this.iconOnly && isDevMode()) {
      afterNextRender(() => {
        if (!this.host.getAttribute('aria-label') && !this.host.getAttribute('aria-labelledby')) {
          console.warn('[nxtIconButton] icon-only button needs aria-label (WCAG 4.1.2).', this.host);
        }
      });
    }
  }

  /** Runs after the capture blocker above, so a disabled/loading toggle never flips. */
  protected togglePressed() {
    if (this.isToggle() && !this.inactive()) this.pressed.set(!this.pressed());
  }
}
