import { ConnectedPosition, FlexibleConnectedPositionStrategy, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import {
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  DestroyRef,
  Directive,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  inject,
  input,
  numberAttribute,
  signal,
} from '@angular/core';

export type NxtTooltipPosition = 'top' | 'bottom' | 'start' | 'end';

let nextId = 0;

const POSITIONS: Record<NxtTooltipPosition, ConnectedPosition[]> = {
  top: [
    { originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom', offsetY: -6 },
    { originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top', offsetY: 6 },
  ],
  bottom: [
    { originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top', offsetY: 6 },
    { originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom', offsetY: -6 },
  ],
  end: [
    { originX: 'end', originY: 'center', overlayX: 'start', overlayY: 'center', offsetX: 8 },
    { originX: 'start', originY: 'center', overlayX: 'end', overlayY: 'center', offsetX: -8 },
  ],
  start: [
    { originX: 'start', originY: 'center', overlayX: 'end', overlayY: 'center', offsetX: -8 },
    { originX: 'end', originY: 'center', overlayX: 'start', overlayY: 'center', offsetX: 8 },
  ],
};

@Component({
  selector: 'nxt-tooltip-panel',
  template: `{{ text() }}`,
  styleUrl: './tooltip.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'nxt-tooltip', role: 'tooltip', '[id]': 'id' },
})
export class NxtTooltipPanel {
  readonly text = signal('');
  id = '';
}

/**
 * Short hint on hover and keyboard focus (WAI-ARIA tooltip pattern, WCAG 1.4.13):
 * stays while the pointer moves onto it, closes with Escape, never contains interactive content.
 * Adds aria-describedby only when the text adds information beyond the host's accessible name.
 */
@Directive({
  selector: '[nxtTooltip]',
  host: {
    '(mouseenter)': 'scheduleShow()',
    '(mouseleave)': 'scheduleHide()',
    // Focus shows synchronously, so aria-describedby is in place when the screen reader announces the control.
    '(focusin)': 'show()',
    '(focusout)': 'hide()',
    '(keydown.escape)': 'hide()',
    '(click)': 'hide()',
  },
})
export class NxtTooltip {
  private readonly overlay = inject(Overlay);
  private readonly host: HTMLElement = inject(ElementRef).nativeElement;

  /** Tooltip text. Empty string disables it. */
  readonly nxtTooltip = input('');
  readonly nxtTooltipPosition = input<NxtTooltipPosition>('top');
  readonly nxtTooltipDisabled = input(false, { transform: booleanAttribute });
  /** Delay before showing on hover, in ms (focus shows immediately). */
  readonly nxtTooltipDelay = input(300, { transform: numberAttribute });

  private overlayRef: OverlayRef | null = null;
  private positionStrategy: FlexibleConnectedPositionStrategy | null = null;
  private panelRef: ComponentRef<NxtTooltipPanel> | null = null;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private readonly id = `nxt-tooltip-${nextId++}`;
  /**
   * Escape dismisses the tooltip only (WCAG 1.4.13): the event is consumed, so it does not also close
   * the drawer, dialog or menu that contains the control.
   */
  private readonly onDocKey = (e: KeyboardEvent) => {
    if (e.key !== 'Escape' || !this.overlayRef?.hasAttached()) return;
    e.stopPropagation();
    this.hide();
  };

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      clearTimeout(this.timer);
      this.hide();
      this.overlayRef?.dispose();
    });
  }

  protected scheduleShow(delay = this.nxtTooltipDelay()) {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.show(), delay);
  }

  protected scheduleHide() {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.hide(), 100);
  }

  show() {
    const text = this.nxtTooltip().trim();
    if (!text || this.nxtTooltipDisabled()) return;
    if (!this.overlayRef) {
      this.positionStrategy = this.overlay.position().flexibleConnectedTo(this.host).withPush(true);
      this.overlayRef = this.overlay.create({
        positionStrategy: this.positionStrategy,
        scrollStrategy: this.overlay.scrollStrategies.close(),
        panelClass: 'nxt-tooltip-pane',
      });
      // Hoverable (WCAG 1.4.13): moving the pointer onto the tooltip keeps it open.
      this.overlayRef.overlayElement.addEventListener('mouseenter', () => clearTimeout(this.timer));
      this.overlayRef.overlayElement.addEventListener('mouseleave', () => this.scheduleHide());
    }
    this.positionStrategy!.withPositions(POSITIONS[this.nxtTooltipPosition()]);
    if (!this.overlayRef.hasAttached()) {
      this.panelRef = this.overlayRef.attach(new ComponentPortal(NxtTooltipPanel));
      document.addEventListener('keydown', this.onDocKey, true);
    }
    const panel = this.panelRef!;
    panel.instance.id = this.id;
    panel.instance.text.set(text);
    // Render now: the id and text must exist before aria-describedby points at them.
    panel.changeDetectorRef.detectChanges();
    if (text !== this.accessibleName()) this.addDescribedBy();
    this.overlayRef.updatePosition();
  }

  hide() {
    clearTimeout(this.timer);
    if (this.overlayRef?.hasAttached()) this.overlayRef.detach();
    document.removeEventListener('keydown', this.onDocKey, true);
    this.removeDescribedBy();
  }

  private accessibleName(): string {
    return (this.host.getAttribute('aria-label') ?? this.host.textContent ?? '').replace(/\s+/g, ' ').trim();
  }

  private addDescribedBy() {
    const ids = (this.host.getAttribute('aria-describedby') ?? '').split(' ').filter(Boolean);
    if (!ids.includes(this.id)) this.host.setAttribute('aria-describedby', [...ids, this.id].join(' '));
  }

  private removeDescribedBy() {
    const ids = (this.host.getAttribute('aria-describedby') ?? '').split(' ').filter((x) => x && x !== this.id);
    if (ids.length) this.host.setAttribute('aria-describedby', ids.join(' '));
    else this.host.removeAttribute('aria-describedby');
  }
}
