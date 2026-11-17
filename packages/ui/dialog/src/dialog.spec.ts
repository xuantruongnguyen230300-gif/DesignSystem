import { DialogRef } from '@angular/cdk/dialog';
import { Component, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NxtConfirmConfig, NxtConfirmResult, NxtDialog, NxtDialogLayout, NxtNotifyConfig } from './dialog';

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

  it('confirm: alternateTone danger renders the third choice as a red ghost button', async () => {
    await confirm({ alternateLabel: 'Bỏ thay đổi', alternateTone: 'danger' });
    const alt = document.querySelector('[nxtDialogStart]') as HTMLElement;
    expect(alt.getAttribute('data-tone')).toBe('danger');
    expect(alt.getAttribute('data-variant')).toBe('ghost');
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

  describe('notify (message box)', () => {
    async function notify(config: Partial<NxtNotifyConfig> = {}) {
      let closed = 0;
      TestBed.inject(NxtDialog)
        .notify({ title: 'Không lưu được hồ sơ', message: 'Mất kết nối tới máy chủ. Kiểm tra mạng rồi bấm Lưu lại.', ...config })
        .subscribe(() => closed++);
      await tick();
      await tick();
      const dialog = document.querySelector<HTMLElement>('.nxt-dialog-pane [role="alertdialog"]')!;
      const button = (text: string) => [...dialog.querySelectorAll('button')].find((b) => b.textContent!.trim() === text)!;
      return { dialog, button, closed: () => closed };
    }

    it('is an alert dialog named by its title, described by its message, with one secondary "Đóng" that has focus', async () => {
      const { dialog, button } = await notify();
      expect(document.getElementById(dialog.getAttribute('aria-labelledby')!)!.textContent).toBe('Không lưu được hồ sơ');
      expect(document.getElementById(dialog.getAttribute('aria-describedby')!)!.textContent).toContain('Mất kết nối');
      const buttons = dialog.querySelectorAll('button');
      expect(buttons.length).toBe(1);
      expect(button('Đóng').getAttribute('data-variant')).toBe('secondary');
      expect(document.activeElement).toBe(button('Đóng'));
      expect(dialog.querySelector('button[aria-label="Đóng"]')).toBeNull();
    });

    it('shows a decorative icon for the tone (default info)', async () => {
      const info = await notify();
      expect(info.dialog.querySelector('.nxt-dialog__icon')!.getAttribute('data-tone')).toBe('info');
      info.button('Đóng').click();
      await tick();
      const danger = await notify({ tone: 'danger', closeLabel: 'Đã hiểu' });
      expect(danger.dialog.querySelector('.nxt-dialog__icon')!.getAttribute('data-tone')).toBe('danger');
      expect(danger.button('Đã hiểu')).toBeTruthy();
    });

    it('"Xem chi tiết" is a disclosure: collapsed, then expanded on Enter/click', async () => {
      const { dialog, button } = await notify({ details: 'Mã lỗi: HR-503 · 06/11/2026 09:42' });
      const toggle = button('Xem chi tiết');
      const region = document.getElementById(toggle.getAttribute('aria-controls')!)!;
      expect(toggle.getAttribute('aria-expanded')).toBe('false');
      expect(region.hidden).toBe(true);
      toggle.click();
      await tick();
      expect(toggle.getAttribute('aria-expanded')).toBe('true');
      expect(region.hidden).toBe(false);
      expect(region.textContent).toContain('HR-503');
      expect(dialog.contains(region)).toBe(true);
    });

    it('no details: no disclosure', async () => {
      const { dialog } = await notify();
      expect(dialog.querySelector('[aria-expanded]')).toBeNull();
    });

    it('closes with the button and with Escape, emitting once', async () => {
      const a = await notify();
      a.button('Đóng').click();
      expect(a.closed()).toBe(1);
      await tick();
      const b = await notify();
      b.button('Đóng').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      expect(b.closed()).toBe(1);
    });
  });
});
