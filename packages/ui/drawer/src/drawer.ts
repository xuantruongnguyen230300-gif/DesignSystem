import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { ComponentType, Overlay } from '@angular/cdk/overlay';
import { ChangeDetectionStrategy, Component, Injectable, TemplateRef, ViewEncapsulation, inject, input } from '@angular/core';
import { NxtButton } from '@nxt/ui/button';
import { NxtIcon } from '@nxt/ui/icon';
import { Observable, firstValueFrom, isObservable } from 'rxjs';

/**
 * Asked before the drawer closes without a result (Escape, backdrop, the close button, `ref.close()` of "Huỷ").
 * `false` keeps it open. Async answers (a confirm dialog) keep it open until they resolve.
 */
export type NxtDrawerCanClose = () => boolean | Promise<boolean> | Observable<boolean>;

export interface NxtDrawerConfig<D = unknown> {
  /** Accessible name of the dialog (usually the visible title). */
  title: string;
  /** sm 400 · md 560 (form) · lg 720px. */
  size?: 'sm' | 'md' | 'lg';
  data?: D;
  /** Block closing on Escape/backdrop (e.g. while saving). */
  disableClose?: boolean;
  /** Guard for unsaved changes; see `NxtDrawerCanClose`. Takes precedence over the layout's `canClose`. */
  canClose?: NxtDrawerCanClose;
}

/** Close state of one open drawer. */
interface CloseGuard {
  config?: NxtDrawerCanClose;
  /** Waiting for an async answer: further close requests are ignored. */
  pending: boolean;
  /** The guard said yes: let the next close through. */
  allow: boolean;
}

/**
 * `canClose` registered by the `nxt-drawer-layout` inside a drawer. Keyed by the DialogRef the layout injects:
 * the layout is created during `Dialog.open()`, before `open()` returns the ref to the service.
 */
const LAYOUT_GUARDS = new WeakMap<object, () => NxtDrawerCanClose | undefined>();

/**
 * Side panel from the end edge for create/edit forms and quick details without leaving the list.
 * Built on CDK Dialog: modal, focus trapped, Escape closes, focus returns to the trigger.
 * Put `<nxt-drawer-layout>` at the root of the content.
 */
@Injectable({ providedIn: 'root' })
export class NxtDrawer {
  private readonly dialog = inject(Dialog);
  private readonly overlay = inject(Overlay);

  open<R = unknown, D = unknown, C = unknown>(content: ComponentType<C> | TemplateRef<C>, config: NxtDrawerConfig<D>): DialogRef<R, C> {
    const guard: CloseGuard = { config: config.canClose, pending: false, allow: false };
    // Assigned right below; the predicate only runs after open() has returned.
    let ref!: DialogRef<R, C>;
    ref = this.dialog.open<R, D, C>(content, {
      data: config.data,
      ariaLabel: config.title,
      ariaModal: true,
      disableClose: config.disableClose,
      panelClass: ['nxt-drawer-pane', `nxt-drawer-pane--${config.size ?? 'md'}`],
      backdropClass: 'nxt-drawer-backdrop',
      positionStrategy: this.overlay.position().global().right('0').top('0'),
      height: '100%',
      maxHeight: '100%',
      maxWidth: '100vw',
      autoFocus: 'first-tabbable',
      restoreFocus: true,
      // CDK asks this before every close, including Escape and backdrop clicks.
      closePredicate: (result) => this.mayClose(guard, ref, result),
    });
    return ref;
  }

  private mayClose(guard: CloseGuard, ref: { close(): void }, result: unknown): boolean {
    // A result (e.g. the saved record) is a deliberate close: never ask.
    if (guard.allow || result !== undefined) return true;
    const canClose = guard.config ?? LAYOUT_GUARDS.get(ref)?.();
    if (!canClose || guard.pending) return !canClose;
    const answer = canClose();
    if (typeof answer === 'boolean') return answer;
    guard.pending = true;
    (isObservable(answer) ? firstValueFrom(answer, { defaultValue: false }) : answer)
      .catch(() => false)
      .then((yes) => {
        guard.pending = false;
        if (!yes) return;
        guard.allow = true;
        ref.close();
        guard.allow = false;
      });
    return false;
  }
}

/** Drawer frame: title, close button, scrolling body, sticky footer (`[nxtDrawerFooter]`). */
@Component({
  selector: 'nxt-drawer-layout',
  imports: [NxtButton, NxtIcon],
  template: `
    <div class="nxt-drawer__header">
      <div class="nxt-drawer__titles">
        <h2 class="nxt-drawer__title">{{ title() }}</h2>
        @if (description()) {
          <p class="nxt-drawer__description">{{ description() }}</p>
        }
      </div>
      <button nxtIconButton variant="ghost" type="button" aria-label="Đóng" (click)="close()">
        <nxt-icon name="x" />
      </button>
    </div>
    <div class="nxt-drawer__body"><ng-content /></div>
    <div class="nxt-drawer__footer"><ng-content select="[nxtDrawerFooter]" /></div>
  `,
  styleUrl: './drawer.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  // The title input must not leave a native title attribute (browser tooltip over the whole drawer).
  host: { class: 'nxt-drawer', '[attr.title]': 'null' },
})
export class NxtDrawerLayout {
  protected readonly ref = inject(DialogRef, { optional: true });
  readonly title = input.required<string>();
  readonly description = input<string>();
  /**
   * Asked before closing without a result (Escape, backdrop, "Đóng", `ref.close()`), e.g. to confirm
   * leaving unsaved changes. The `canClose` of the drawer config wins when both are set.
   */
  readonly canClose = input<NxtDrawerCanClose>();

  constructor() {
    if (this.ref) LAYOUT_GUARDS.set(this.ref, () => this.canClose());
  }

  /** The close button obeys `disableClose` too (e.g. set `ref.disableClose = true` while saving), then `canClose`. */
  protected close() {
    if (this.ref && !this.ref.disableClose) this.ref.close();
  }
}
