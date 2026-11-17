import { DialogRef } from '@angular/cdk/dialog';
import { Component, inject, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { NxtDrawer, NxtDrawerCanClose, NxtDrawerLayout } from './drawer';

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

  describe('canClose (unsaved changes)', () => {
    const tick = () => new Promise((r) => setTimeout(r));

    async function openGuarded(canClose: NxtDrawerCanClose, disableClose = false) {
      const ref = TestBed.inject(NxtDrawer).open<string>(Content, { title: 'Thêm người phụ thuộc', canClose, disableClose });
      await tick();
      let closed = false;
      let result: string | undefined;
      ref.closed.subscribe((r) => {
        closed = true;
        result = r;
      });
      const pane = document.querySelector<HTMLElement>('.nxt-drawer-pane')!;
      const escape = () => pane.querySelector('[role="dialog"]')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27, bubbles: true }));
      const closeButton = () => pane.querySelector<HTMLButtonElement>('button[aria-label="Đóng"]')!.click();
      const backdrop = () => document.querySelector<HTMLElement>('.nxt-drawer-backdrop')!.click();
      return { ref, pane, escape, closeButton, backdrop, closed: () => closed, result: () => result };
    }

    it('Escape, backdrop, the close button and ref.close() all ask; false keeps the drawer open', async () => {
      let asked = 0;
      const d = await openGuarded(() => (asked++, false));
      d.escape();
      d.backdrop();
      d.closeButton();
      d.ref.close();
      expect(asked).toBe(4);
      expect(d.closed()).toBe(false);
    });

    it('a synchronous true closes right away', async () => {
      const d = await openGuarded(() => true);
      d.escape();
      expect(d.closed()).toBe(true);
    });

    it('close(result) (e.g. Lưu) never asks', async () => {
      let asked = 0;
      const d = await openGuarded(() => (asked++, false));
      d.ref.close('ok');
      expect(asked).toBe(0);
      expect(d.closed()).toBe(true);
      expect(d.result()).toBe('ok');
    });

    it('an async answer (confirm dialog) keeps it open until it resolves; requests in between are ignored', async () => {
      const answer = new Subject<boolean>();
      let asked = 0;
      const d = await openGuarded(() => (asked++, answer));
      d.closeButton();
      d.escape();
      expect(asked).toBe(1);
      expect(d.closed()).toBe(false);
      answer.next(true);
      await tick();
      expect(d.closed()).toBe(true);
    });

    it('a Promise that answers false keeps it open, and the next request asks again', async () => {
      let asked = 0;
      const d = await openGuarded(() => (asked++, Promise.resolve(false)));
      d.closeButton();
      await tick();
      expect(d.closed()).toBe(false);
      d.closeButton();
      expect(asked).toBe(2);
    });

    it('disableClose blocks before canClose is asked (saving)', async () => {
      let asked = 0;
      const d = await openGuarded(() => (asked++, true), true);
      d.escape();
      d.closeButton();
      expect(asked).toBe(0);
      expect(d.closed()).toBe(false);
    });

    @Component({
      imports: [NxtDrawerLayout],
      template: `
        <nxt-drawer-layout title="Sửa hồ sơ" [canClose]="guard">
          <input aria-label="Họ và tên" (input)="dirty.set(true)" />
        </nxt-drawer-layout>
      `,
    })
    class GuardedContent {
      readonly dirty = signal(false);
      asked = 0;
      readonly guard: NxtDrawerCanClose = () => (this.asked++, !this.dirty());
    }

    it('the layout input canClose guards closing too', async () => {
      const ref = TestBed.inject(NxtDrawer).open<string, unknown, GuardedContent>(GuardedContent, { title: 'Sửa hồ sơ' });
      await tick();
      let closed = false;
      ref.closed.subscribe(() => (closed = true));
      const content = ref.componentInstance!;
      content.dirty.set(true);
      ref.close();
      expect(content.asked).toBe(1);
      expect(closed).toBe(false);
      content.dirty.set(false);
      ref.close();
      expect(closed).toBe(true);
    });
  });
});
