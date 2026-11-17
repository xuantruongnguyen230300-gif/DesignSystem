import { FocusTrap, FocusTrapFactory } from '@angular/cdk/a11y';
import { ConnectedPosition, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Directive,
  ElementRef,
  TemplateRef,
  ViewContainerRef,
  ViewEncapsulation,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { Subscription } from 'rxjs';

/** Preferred side of the trigger; the panel flips to the opposite side when there is no room. */
export type NxtPopoverPosition = 'bottom' | 'top' | 'start' | 'end';

export interface NxtPopoverCloseOptions {
  /** Move focus back to the trigger (default). `false` when the content moves focus elsewhere (e.g. to a field). */
  restoreFocus?: boolean;
}

const below = (x: 'start' | 'end'): ConnectedPosition => ({ originX: x, originY: 'bottom', overlayX: x, overlayY: 'top', panelClass: 'nxt-popover-pane--below' });
const above = (x: 'start' | 'end'): ConnectedPosition => ({ originX: x, originY: 'top', overlayX: x, overlayY: 'bottom', panelClass: 'nxt-popover-pane--above' });
const after: ConnectedPosition = { originX: 'end', originY: 'top', overlayX: 'start', overlayY: 'top', panelClass: 'nxt-popover-pane--end' };
const before: ConnectedPosition = { originX: 'start', originY: 'top', overlayX: 'end', overlayY: 'top', panelClass: 'nxt-popover-pane--start' };

const POSITIONS: Record<NxtPopoverPosition, ConnectedPosition[]> = {
  bottom: [below('start'), below('end'), above('start'), above('end')],
  top: [above('start'), above('end'), below('start'), below('end')],
  end: [after, before, below('start'), above('start')],
  start: [before, after, below('end'), above('end')],
};

let nextId = 0;

/**
 * Panel content of a popover: optional title (names the dialog), body, optional footer (`[nxtPopoverFooter]`).
 * Opened next to a button by `[nxtPopoverTriggerFor]`; nothing renders in place.
 *
 *   <button nxtButton [nxtPopoverTriggerFor]="card">Nguyễn Thị Ngọc Diệp</button>
 *   <nxt-popover #card title="Nguyễn Thị Ngọc Diệp">…</nxt-popover>
 */
@Component({
  selector: 'nxt-popover',
  exportAs: 'nxtPopover',
  template: `
    <ng-template #panel>
      <div
        class="nxt-popover"
        role="dialog"
        tabindex="-1"
        [id]="id"
        [attr.aria-labelledby]="title() ? titleId : null"
        [attr.aria-label]="title() ? null : label() || null"
      >
        @if (title()) {
          <div class="nxt-popover__header">
            <h2 class="nxt-popover__title" [id]="titleId">{{ title() }}</h2>
          </div>
        }
        <div class="nxt-popover__body"><ng-content /></div>
        <div class="nxt-popover__footer"><ng-content select="[nxtPopoverFooter]" /></div>
      </div>
    </ng-template>
  `,
  styleUrl: './popover.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  // The title input must not leave a native title attribute on the (empty) host.
  host: { class: 'nxt-popover-host', '[attr.title]': 'null' },
})
export class NxtPopover {
  /** Visible title (`h2`); also the accessible name of the panel. */
  readonly title = input<string>();
  /** Accessible name when there is no title (required then). */
  readonly label = input<string>();
  /** The panel has opened. */
  readonly opened = output<void>();
  /** The panel has closed, by any means. */
  readonly closed = output<void>();

  readonly id = `nxt-popover-${nextId++}`;
  protected readonly titleId = `${this.id}-title`;
  /** @internal */
  readonly template = viewChild.required<TemplateRef<unknown>>('panel');
  /** @internal The trigger that currently shows this popover. */
  trigger: NxtPopoverTrigger | null = null;

  /** Close from inside, e.g. after choosing an item. */
  close(options?: NxtPopoverCloseOptions) {
    this.trigger?.close(options);
  }
}

/**
 * Opens an `nxt-popover` next to a native button (WAI-ARIA dialog, non-modal): click / Enter / Space toggle it,
 * focus moves to the first focusable element and Tab cycles inside; Escape, a click outside or the trigger
 * close it and focus returns to the trigger.
 */
@Directive({
  selector: '[nxtPopoverTriggerFor]',
  exportAs: 'nxtPopoverTrigger',
  host: {
    'aria-haspopup': 'dialog',
    '[attr.aria-expanded]': 'isOpen()',
    '[attr.aria-controls]': 'isOpen() ? nxtPopoverTriggerFor().id : null',
    '(click)': 'toggle()',
  },
})
export class NxtPopoverTrigger {
  private readonly overlay = inject(Overlay);
  private readonly focusTrapFactory = inject(FocusTrapFactory);
  private readonly vcr = inject(ViewContainerRef);
  private readonly host: HTMLElement = inject(ElementRef).nativeElement;

  /** The popover to open. */
  readonly nxtPopoverTriggerFor = input.required<NxtPopover>();
  /** Preferred side; flips when there is no room. `top` for triggers near the bottom of the screen. */
  readonly nxtPopoverPosition = input<NxtPopoverPosition>('bottom');

  /** The panel is open. */
  readonly isOpen = signal(false);

  private overlayRef: OverlayRef | null = null;
  private focusTrap: FocusTrap | null = null;
  private subscriptions = new Subscription();

  constructor() {
    inject(DestroyRef).onDestroy(() => this.close({ restoreFocus: false }));
  }

  toggle() {
    if (this.isOpen()) this.close();
    else this.open();
  }

  open() {
    if (this.isOpen()) return;
    const popover = this.nxtPopoverTriggerFor();
    popover.trigger?.close({ restoreFocus: false });
    const ref = this.overlay.create({
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(this.host)
        .withPush(true)
        .withPositions(POSITIONS[this.nxtPopoverPosition()]),
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      panelClass: 'nxt-popover-pane',
    });
    this.overlayRef = ref;
    popover.trigger = this;
    const view = ref.attach(new TemplatePortal(popover.template(), this.vcr));
    // Render now: ids, title and aria-* must be in place before focus moves into the panel.
    view.detectChanges();
    this.isOpen.set(true);

    const panel = ref.overlayElement.querySelector<HTMLElement>('.nxt-popover')!;
    this.focusTrap = this.focusTrapFactory.create(panel);
    if (!this.focusTrap.focusInitialElement()) panel.focus();

    // The CDK sends keydown to the top-most overlay only: Escape in a popover inside a drawer closes the popover.
    this.subscriptions.add(
      ref.keydownEvents().subscribe((event) => {
        if (event.key !== 'Escape' || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
        event.preventDefault();
        this.close();
      }),
    );
    this.subscriptions.add(
      ref.outsidePointerEvents().subscribe((event) => {
        // The trigger toggles on its own click.
        if (this.host.contains(event.target as Node)) return;
        // Focus moved to the control that was clicked: leave it there. Otherwise give it back to the trigger.
        const active = document.activeElement;
        this.close({ restoreFocus: !active || active === document.body || panel.contains(active) });
      }),
    );
    popover.opened.emit();
  }

  close(options: NxtPopoverCloseOptions = {}) {
    const ref = this.overlayRef;
    if (!ref) return;
    const popover = this.nxtPopoverTriggerFor();
    this.subscriptions.unsubscribe();
    this.subscriptions = new Subscription();
    this.focusTrap?.destroy();
    this.focusTrap = null;
    ref.dispose();
    this.overlayRef = null;
    if (popover.trigger === this) popover.trigger = null;
    this.isOpen.set(false);
    if (options.restoreFocus !== false) this.host.focus();
    popover.closed.emit();
  }
}
