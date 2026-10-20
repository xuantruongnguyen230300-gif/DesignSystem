import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { ComponentType, Overlay } from '@angular/cdk/overlay';
import { ChangeDetectionStrategy, Component, Injectable, TemplateRef, ViewEncapsulation, inject, input } from '@angular/core';
import { NxtButton } from '@nxt/ui/button';
import { NxtIcon } from '@nxt/ui/icon';

export interface NxtDrawerConfig<D = unknown> {
  /** Accessible name of the dialog (usually the visible title). */
  title: string;
  /** sm 400 · md 560 (form) · lg 720px. */
  size?: 'sm' | 'md' | 'lg';
  data?: D;
  /** Block closing on Escape/backdrop (e.g. while saving). */
  disableClose?: boolean;
}

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
    return this.dialog.open<R, D, C>(content, {
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
    });
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

  /** The close button obeys `disableClose` too (e.g. set `ref.disableClose = true` while saving). */
  protected close() {
    if (this.ref && !this.ref.disableClose) this.ref.close();
  }
}
