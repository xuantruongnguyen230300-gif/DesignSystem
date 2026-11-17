import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, Injectable, ViewEncapsulation, inject, signal } from '@angular/core';
import { NxtButton } from '@nxt/ui/button';
import { NxtIcon } from '@nxt/ui/icon';
import { Observable, Subject } from 'rxjs';

export interface NxtToastOptions {
  /** Label of the one action, e.g. "Hoàn tác". Only when the action is also available elsewhere. */
  action?: string;
  /** How long it stays, in ms. Default: by text length (3–5 s), 10 s with an action. Never below 3000. */
  duration?: number;
  /** What screen readers hear, when it should differ from the visible message. Default: the message. */
  announcement?: string;
}

/** `timeout`: time ran out · `action`: the action was used · `dismiss`: closed by code, Escape, or dropped from the queue. */
export type NxtToastDismissReason = 'timeout' | 'action' | 'dismiss';

const MIN_DURATION = 3000;
const MAX_DURATION = 5000;
const ACTION_DURATION = 10000;
/** After the pointer or focus leaves, the toast stays at least this long. */
const RESUME_MIN = 1000;

/**
 * Default display time: about one second to notice plus 60 ms per character (≈ reading speed),
 * kept between 3 and 5 seconds; 10 seconds when the toast has an action.
 */
export function nxtToastDuration(message: string, hasAction = false): number {
  if (hasAction) return ACTION_DURATION;
  return Math.min(MAX_DURATION, Math.max(MIN_DURATION, 1000 + 60 * message.length));
}

/** Handle of one toast, returned by `NxtToast.show()`. */
export class NxtToastRef {
  private readonly dismissed$ = new Subject<NxtToastDismissReason>();
  private readonly action$ = new Subject<void>();
  /** Emits once when the toast goes away (or is dropped from the queue), then completes. */
  readonly afterDismissed: Observable<NxtToastDismissReason> = this.dismissed$.asObservable();
  /** Emits when the action is used. */
  readonly onAction: Observable<void> = this.action$.asObservable();

  constructor(
    readonly message: string,
    readonly options: NxtToastOptions,
    private readonly service: NxtToast,
  ) {}

  /** Hide this toast, or drop it from the queue if it has not shown yet. */
  dismiss() {
    this.service.dismissRef(this, 'dismiss');
  }

  /** @internal */
  finish(reason: NxtToastDismissReason) {
    if (reason === 'action') {
      this.action$.next();
      this.action$.complete();
    }
    this.dismissed$.next(reason);
    this.dismissed$.complete();
    this.action$.complete();
  }
}

/** The visible toast, attached by `NxtToast` to a CDK overlay at the bottom centre of the content area. */
@Component({
  selector: 'nxt-toast-host',
  imports: [NxtButton, NxtIcon],
  template: `
    @if (ref(); as r) {
      <div
        class="nxt-toast"
        (mouseenter)="service.pause()"
        (mouseleave)="service.resume()"
        (focusin)="onFocusIn($event)"
        (focusout)="onFocusOut($event)"
        (keydown.escape)="service.dismissRef(r, 'dismiss')"
      >
        <nxt-icon class="nxt-toast__icon" name="circle-check" />
        <p class="nxt-toast__message">{{ r.message }}</p>
        @if (r.options.action) {
          <button nxtButton variant="ghost" size="sm" type="button" class="nxt-toast__action" (click)="act()">{{ r.options.action }}</button>
        }
      </div>
    }
  `,
  styleUrl: './toast.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'nxt-toast-host' },
})
export class NxtToastHost {
  protected readonly service = inject(NxtToast);
  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  /** @internal */
  readonly ref = signal<NxtToastRef | null>(null);

  protected act() {
    this.service.dismissRef(this.ref(), 'action');
  }

  protected onFocusIn(event: FocusEvent) {
    // Remember where focus came from, to give it back when the toast goes away.
    const from = event.relatedTarget as HTMLElement | null;
    if (from && !this.host.contains(from)) this.service.returnFocus = from;
    this.service.pause();
  }

  protected onFocusOut(event: FocusEvent) {
    if (this.host.contains(event.relatedTarget as Node | null)) return;
    this.service.resume();
  }
}

/**
 * Short success confirmation that does not interrupt (one at a time, queued), read by screen readers through a
 * polite live region, hidden after a few seconds unless the pointer or focus is on it. Never for errors.
 *
 *   this.toast.show('Đã lưu hồ sơ Nguyễn Văn An.');
 *   this.toast.show('Đã ngừng sử dụng 3 chức danh.', { action: 'Hoàn tác' }).onAction.subscribe(() => this.undo());
 */
@Injectable({ providedIn: 'root' })
export class NxtToast {
  private readonly overlay = inject(Overlay);
  private readonly announcer = inject(LiveAnnouncer);
  private readonly queue: NxtToastRef[] = [];
  private current: NxtToastRef | null = null;
  private overlayRef: OverlayRef | null = null;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private deadline = 0;
  private remaining = 0;
  private paused = false;
  /** @internal Element to focus when the toast hides while it has focus. */
  returnFocus: HTMLElement | null = null;
  private readonly onResize = () => this.position();

  constructor() {
    inject(DestroyRef).onDestroy(() => this.clear());
  }

  /** Queue a success message; it shows right away when no other toast is visible. */
  show(message: string, options: NxtToastOptions = {}): NxtToastRef {
    const ref = new NxtToastRef(message, options, this);
    this.queue.push(ref);
    if (!this.current) this.next();
    return ref;
  }

  /** Hide the visible toast; the next one in the queue follows. */
  dismiss() {
    if (this.current) this.dismissRef(this.current, 'dismiss');
  }

  /** Hide the visible toast and drop the queue (e.g. when leaving the page). */
  clear() {
    for (const ref of this.queue.splice(0)) ref.finish('dismiss');
    this.dismiss();
  }

  /** @internal */
  dismissRef(ref: NxtToastRef | null, reason: NxtToastDismissReason) {
    if (!ref) return;
    const queued = this.queue.indexOf(ref);
    if (queued >= 0) {
      this.queue.splice(queued, 1);
      ref.finish(reason);
      return;
    }
    if (ref !== this.current) return;
    clearTimeout(this.timer);
    const hadFocus = !!this.overlayRef?.overlayElement.contains(document.activeElement);
    // Clear first: removing the focused toast may fire focusout → resume(), which must find nothing to resume.
    this.current = null;
    this.detach();
    if (hadFocus) this.restoreFocus();
    this.returnFocus = null;
    ref.finish(reason);
    this.next();
  }

  /** @internal Pointer or focus on the toast: stop the clock. */
  pause() {
    if (!this.current || this.paused) return;
    this.paused = true;
    clearTimeout(this.timer);
    this.remaining = Math.max(0, this.deadline - Date.now());
  }

  /** @internal */
  resume() {
    if (!this.current || !this.paused) return;
    this.paused = false;
    this.start(Math.max(this.remaining, RESUME_MIN));
  }

  private next() {
    const ref = this.queue.shift();
    if (!ref) return;
    this.current = ref;
    this.attach(ref);
    this.announcer.announce(ref.options.announcement ?? ref.message, 'polite');
    const duration = ref.options.duration ?? nxtToastDuration(ref.message, !!ref.options.action);
    this.start(Math.max(MIN_DURATION, duration));
  }

  private start(ms: number) {
    clearTimeout(this.timer);
    const ref = this.current;
    this.deadline = Date.now() + ms;
    this.timer = setTimeout(() => this.dismissRef(ref, 'timeout'), ms);
  }

  private attach(ref: NxtToastRef) {
    this.overlayRef = this.overlay.create({
      positionStrategy: this.overlay.position().global(),
      scrollStrategy: this.overlay.scrollStrategies.noop(),
      panelClass: 'nxt-toast-pane',
    });
    // The pane spans the content area: only the toast itself takes the pointer.
    this.overlayRef.overlayElement.style.pointerEvents = 'none';
    const component = this.overlayRef.attach(new ComponentPortal(NxtToastHost));
    component.instance.ref.set(ref);
    component.changeDetectorRef.detectChanges();
    this.paused = false;
    this.position();
    window.addEventListener('resize', this.onResize);
  }

  private detach() {
    window.removeEventListener('resize', this.onResize);
    this.overlayRef?.dispose();
    this.overlayRef = null;
    this.paused = false;
  }

  /**
   * Bottom centre of the content area: the `main` landmark (the content region of the app shell), above a
   * visible `nxt-action-bar`; the viewport when there is no main landmark.
   */
  private position() {
    const ref = this.overlayRef;
    if (!ref) return;
    const strategy = this.overlay.position().global();
    const area = [...document.querySelectorAll<HTMLElement>('main, [role="main"]')].find((el) => el.getClientRects().length > 0);
    if (area) {
      const box = area.getBoundingClientRect();
      let bottom = Math.min(box.bottom, window.innerHeight);
      // Only a bar stuck to the bottom edge of the area counts, not one that sits in the middle of the content.
      const bar = [...area.querySelectorAll<HTMLElement>('.nxt-action-bar')]
        .map((el) => el.getBoundingClientRect())
        .find((r) => r.height > 0 && r.top < bottom && r.bottom >= bottom - 1);
      if (bar) bottom = bar.top;
      strategy.left(`${Math.max(0, box.left)}px`).bottom(`${Math.max(0, window.innerHeight - bottom)}px`);
      ref.updateSize({ width: `${box.width}px` });
    } else {
      strategy.centerHorizontally().bottom('0');
      ref.updateSize({ width: '100%' });
    }
    ref.updatePositionStrategy(strategy);
  }

  private restoreFocus() {
    const target = this.returnFocus?.isConnected ? this.returnFocus : document.querySelector<HTMLElement>('main, [role="main"]');
    target?.focus();
  }
}
