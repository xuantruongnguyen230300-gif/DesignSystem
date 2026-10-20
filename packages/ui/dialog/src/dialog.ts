import { DIALOG_DATA, Dialog, DialogConfig, DialogRef } from '@angular/cdk/dialog';
import { ComponentType } from '@angular/cdk/overlay';
import { ChangeDetectionStrategy, Component, Injectable, TemplateRef, ViewEncapsulation, booleanAttribute, inject, input } from '@angular/core';
import { NxtButton } from '@nxt/ui/button';
import { NxtIcon } from '@nxt/ui/icon';
import { Observable, map } from 'rxjs';

export interface NxtDialogConfig<D = unknown> {
  /** sm 400 (confirm) · md 560 (short form) · lg 720px. */
  size?: 'sm' | 'md' | 'lg';
  data?: D;
  /** Block closing on Escape, backdrop and the close button (e.g. while saving). */
  disableClose?: boolean;
  /** `alertdialog` when the content is a warning that needs an answer. */
  role?: 'dialog' | 'alertdialog';
}

export interface NxtConfirmConfig {
  /** The question: "Xoá vĩnh viễn 3 hồ sơ?". Also the dialog's accessible name. */
  title: string;
  /** Consequence and how to avoid it; the dialog's accessible description. */
  message: string;
  /** Verb + object: "Xoá 3 hồ sơ", "Lưu nháp". */
  confirmLabel: string;
  /** The safe choice. Default "Huỷ". */
  cancelLabel?: string;
  /** Optional third choice, placed at the start of the footer: "Bỏ thay đổi". */
  alternateLabel?: string;
  /** `danger`: red confirm button, and focus starts on the safe choice. */
  tone?: 'default' | 'danger';
}

/** Escape and the cancel button both answer `'cancel'`. */
export type NxtConfirmResult = 'confirm' | 'alternate' | 'cancel';

let nextId = 0;

type BaseConfig = { id: string } & Pick<DialogConfig, 'role' | 'ariaModal' | 'ariaLabelledBy' | 'panelClass' | 'backdropClass' | 'maxWidth' | 'restoreFocus'>;

/**
 * Modal dialog in the middle of the screen, on CDK Dialog: focus trapped, Escape closes, focus returns to the
 * trigger. `open()` takes content built with `<nxt-dialog-layout>` (its title names the dialog); `confirm()` is
 * the ready-made question with two or three answers.
 */
@Injectable({ providedIn: 'root' })
export class NxtDialog {
  private readonly dialog = inject(Dialog);

  open<R = unknown, D = unknown, C = unknown>(content: ComponentType<C> | TemplateRef<C>, config: NxtDialogConfig<D> = {}): DialogRef<R, C> {
    return this.dialog.open<R, D, C>(content, {
      ...this.base(config.size ?? 'md', config.role ?? 'dialog'),
      data: config.data,
      disableClose: config.disableClose,
      autoFocus: 'first-tabbable',
    });
  }

  /** Opens right away; emits the answer once when the dialog closes. */
  confirm(config: NxtConfirmConfig): Observable<NxtConfirmResult> {
    const base = this.base('sm', 'alertdialog');
    const ref = this.dialog.open<NxtConfirmResult, NxtConfirmConfig, NxtConfirmDialog>(NxtConfirmDialog, {
      ...base,
      data: config,
      ariaDescribedBy: `${base.id}-description`,
      // The backdrop does not answer for the user; Escape does ("cancel"), handled by the dialog itself.
      disableClose: true,
      autoFocus: '[data-autofocus]',
    });
    return ref.closed.pipe(map((result) => result ?? 'cancel'));
  }

  private base(size: 'sm' | 'md' | 'lg', role: 'dialog' | 'alertdialog'): BaseConfig {
    const id = `nxt-dialog-${nextId++}`;
    return {
      id,
      role,
      ariaModal: true,
      // Named by the visible title of <nxt-dialog-layout>, which uses this id.
      ariaLabelledBy: `${id}-title`,
      panelClass: ['nxt-dialog-pane', `nxt-dialog-pane--${size}`],
      backdropClass: 'nxt-dialog-backdrop',
      maxWidth: '100vw',
      restoreFocus: true,
    };
  }
}

/** Dialog frame: title (names the dialog), description, close button, scrolling body, footer (`[nxtDialogFooter]`). */
@Component({
  selector: 'nxt-dialog-layout',
  imports: [NxtButton, NxtIcon],
  template: `
    <div class="nxt-dialog__header">
      <div class="nxt-dialog__titles">
        <h2 class="nxt-dialog__title" [id]="titleId">{{ title() }}</h2>
        @if (description()) {
          <p class="nxt-dialog__description" [id]="descriptionId">{{ description() }}</p>
        }
      </div>
      @if (closable()) {
        <button nxtIconButton variant="ghost" type="button" aria-label="Đóng" (click)="close()">
          <nxt-icon name="x" />
        </button>
      }
    </div>
    <div class="nxt-dialog__body"><ng-content /></div>
    <div class="nxt-dialog__footer"><ng-content select="[nxtDialogFooter]" /></div>
  `,
  styleUrl: './dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  // The title input must not leave a native title attribute (browser tooltip over the whole dialog).
  host: { class: 'nxt-dialog', '[attr.title]': 'null' },
})
export class NxtDialogLayout {
  protected readonly ref = inject(DialogRef, { optional: true });
  readonly title = input.required<string>();
  readonly description = input<string>();
  /** Show the close button in the header. */
  readonly closable = input(true, { transform: booleanAttribute });

  protected readonly titleId = `${this.ref?.id ?? 'nxt-dialog'}-title`;
  protected readonly descriptionId = `${this.ref?.id ?? 'nxt-dialog'}-description`;

  /** The close button obeys `disableClose` too (e.g. set `ref.disableClose = true` while saving). */
  protected close() {
    if (this.ref && !this.ref.disableClose) this.ref.close();
  }
}

/** Content of `NxtDialog.confirm()`. */
@Component({
  selector: 'nxt-confirm-dialog',
  imports: [NxtButton, NxtDialogLayout],
  template: `
    <nxt-dialog-layout [title]="config.title" [description]="config.message" [closable]="false">
      <ng-container ngProjectAs="[nxtDialogFooter]">
        @if (config.alternateLabel) {
          <button nxtButton nxtDialogStart type="button" (click)="ref.close('alternate')">{{ config.alternateLabel }}</button>
        }
        <button nxtButton type="button" [attr.data-autofocus]="danger ? '' : null" (click)="ref.close('cancel')">{{ config.cancelLabel ?? 'Huỷ' }}</button>
        <button nxtButton [variant]="danger ? 'danger' : 'primary'" type="button" [attr.data-autofocus]="danger ? null : ''" (click)="ref.close('confirm')">
          {{ config.confirmLabel }}
        </button>
      </ng-container>
    </nxt-dialog-layout>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'nxt-confirm-dialog', '(keydown.escape)': 'ref.close("cancel")' },
})
export class NxtConfirmDialog {
  protected readonly ref = inject<DialogRef<NxtConfirmResult>>(DialogRef);
  protected readonly config = inject<NxtConfirmConfig>(DIALOG_DATA);
  protected readonly danger = this.config.tone === 'danger';
}
