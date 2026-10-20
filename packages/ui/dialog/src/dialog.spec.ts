import { DialogRef } from '@angular/cdk/dialog';
import { Component, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NxtConfirmConfig, NxtConfirmResult, NxtDialog, NxtDialogLayout } from './dialog';

@Component({
  imports: [NxtDialogLayout],
  template: `
    <nxt-dialog-layout title="Nhập lý do từ chối" description="Người gửi sẽ thấy lý do này.">
      <textarea aria-label="Lý do"></textarea>
      <button nxtDialogFooter type="button" (click)="ref.close('ok')">Từ chối đơn</button>
    </nxt-dialog-layout>
  `,
})
class Content {
  readonly ref = inject(DialogRef);
}

const tick = () => new Promise((r) => setTimeout(r));

describe('NxtDialog', () => {
  afterEach(() => document.querySelectorAll('.cdk-overlay-container').forEach((c) => (c.innerHTML = '')));

  async function open(disableClose = false) {
    const ref = TestBed.inject(NxtDialog).open<string>(Content, { size: 'sm', disableClose });
    await tick();
    const pane = document.querySelector<HTMLElement>('.nxt-dialog-pane')!;
    return { ref, pane, dialog: pane.querySelector<HTMLElement>('[role="dialog"]')! };
  }

  async function confirm(config: Partial<NxtConfirmConfig> = {}) {
    let result: NxtConfirmResult | undefined;
    TestBed.inject(NxtDialog)
      .confirm({ title: 'Rời trang khi chưa lưu?', message: 'Các thay đổi sẽ mất.', confirmLabel: 'Lưu nháp', ...config })
      .subscribe((r) => (result = r));
    await tick();
    await tick();
    const dialog = document.querySelector<HTMLElement>('.nxt-dialog-pane [role="alertdialog"]')!;
    const button = (text: string) => [...dialog.querySelectorAll('button')].find((b) => b.textContent!.trim() === text)!;
    return { dialog, button, result: () => result };
  }

  it('is a modal dialog named by its visible title', async () => {
    const { pane, dialog } = await open();
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    const title = document.getElementById(dialog.getAttribute('aria-labelledby')!)!;
    expect(title.tagName).toBe('H2');
    expect(title.textContent).toBe('Nhập lý do từ chối');
    expect(pane.classList).toContain('nxt-dialog-pane--sm');
    expect(pane.querySelector('header, footer')).toBeNull();
  });

  it('the close button closes, unless closing is disabled (e.g. while saving)', async () => {
    const locked = await open(true);
    let closed = false;
    locked.ref.closed.subscribe(() => (closed = true));
    locked.pane.querySelector<HTMLButtonElement>('button[aria-label="Đóng"]')!.click();
    expect(closed).toBe(false);
    locked.ref.disableClose = false;
    locked.pane.querySelector<HTMLButtonElement>('button[aria-label="Đóng"]')!.click();
    expect(closed).toBe(true);
  });

  it('confirm: an alert dialog described by its message, without a close button', async () => {
    const { dialog } = await confirm();
    expect(document.getElementById(dialog.getAttribute('aria-labelledby')!)!.textContent).toBe('Rời trang khi chưa lưu?');
    expect(document.getElementById(dialog.getAttribute('aria-describedby')!)!.textContent).toBe('Các thay đổi sẽ mất.');
    expect(dialog.querySelector('button[aria-label="Đóng"]')).toBeNull();
  });

  it('confirm: focus starts on the confirm button, or on the safe choice when the tone is danger', async () => {
    const normal = await confirm();
    expect(document.activeElement).toBe(normal.button('Lưu nháp'));
    normal.button('Huỷ').click();
    await tick();
    const danger = await confirm({ title: 'Xoá vĩnh viễn 3 hồ sơ?', confirmLabel: 'Xoá 3 hồ sơ', tone: 'danger' });
    expect(document.activeElement).toBe(danger.button('Huỷ'));
    expect(danger.button('Xoá 3 hồ sơ').getAttribute('data-variant')).toBe('danger');
  });

  it('confirm: answers confirm, alternate, or cancel (Escape)', async () => {
    const a = await confirm({ alternateLabel: 'Bỏ thay đổi', cancelLabel: 'Ở lại' });
    a.button('Lưu nháp').click();
    expect(a.result()).toBe('confirm');
    await tick();

    const b = await confirm({ alternateLabel: 'Bỏ thay đổi', cancelLabel: 'Ở lại' });
    b.button('Bỏ thay đổi').click();
    expect(b.result()).toBe('alternate');
    await tick();

    const c = await confirm({ cancelLabel: 'Ở lại' });
    c.button('Ở lại').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(c.result()).toBe('cancel');
  });
});
