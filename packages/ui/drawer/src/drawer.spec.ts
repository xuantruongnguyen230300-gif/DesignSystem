import { DialogRef } from '@angular/cdk/dialog';
import { Component, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NxtDrawer, NxtDrawerLayout } from './drawer';

@Component({
  imports: [NxtDrawerLayout],
  template: `
    <nxt-drawer-layout title="Thêm người phụ thuộc" description="Các trường có dấu * là bắt buộc.">
      <p>Nội dung</p>
      <button ngProjectAs="[nxtDrawerFooter]" type="button" (click)="ref.close('ok')">Lưu</button>
    </nxt-drawer-layout>
  `,
})
class Content {
  readonly ref = inject(DialogRef);
}

describe('NxtDrawer', () => {
  afterEach(() => document.querySelectorAll('.cdk-overlay-container').forEach((c) => (c.innerHTML = '')));

  async function open(disableClose = false) {
    const drawer = TestBed.inject(NxtDrawer);
    const ref = drawer.open<string>(Content, { title: 'Thêm người phụ thuộc', size: 'sm', disableClose });
    await new Promise((r) => setTimeout(r));
    const pane = document.querySelector<HTMLElement>('.nxt-drawer-pane')!;
    return { ref, pane, dialog: pane.querySelector<HTMLElement>('[role="dialog"]')! };
  }

  it('is a named modal dialog without nested banner/contentinfo landmarks', async () => {
    const { pane, dialog } = await open();
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(dialog.getAttribute('aria-label')).toBe('Thêm người phụ thuộc');
    expect(pane.classList).toContain('nxt-drawer-pane--sm');
    expect(pane.querySelector('header, footer')).toBeNull();
    expect(pane.querySelector('h2')!.textContent).toContain('Thêm người phụ thuộc');
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

  it('returns the result passed to close()', async () => {
    const { ref, pane } = await open();
    let result: string | undefined;
    ref.closed.subscribe((r) => (result = r));
    [...pane.querySelectorAll('button')].find((b) => b.textContent!.includes('Lưu'))!.click();
    expect(result).toBe('ok');
  });
});
