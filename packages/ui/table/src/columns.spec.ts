import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NxtColumnDef, NxtColumnsState, NxtTableColumns, NxtTableColumnsTrigger } from './columns';

const DEFS: NxtColumnDef[] = [
  { key: 'dept', label: 'Phòng ban' },
  { key: 'code', label: 'Mã nhân viên', locked: true },
  { key: 'name', label: 'Họ và tên', locked: true },
  { key: 'title', label: 'Chức danh' },
  { key: 'phone', label: 'Điện thoại', hidden: true },
  { key: 'joined', label: 'Ngày vào làm' },
];

const tick = () => new Promise((r) => setTimeout(r));

describe('NxtColumnsState', () => {
  it('locked columns come first and are always shown; hidden ones start hidden', () => {
    const c = new NxtColumnsState(DEFS);
    expect(c.visibleKeys()).toEqual(['code', 'name', 'dept', 'title', 'joined']);
    expect(c.defaults.hidden).toEqual(['phone']);
    expect(c.isVisible('phone')).toBe(false);
    expect(c.modified()).toBe(false);
  });

  it('the draft changes nothing until apply; resetDraft goes back to the default layout', () => {
    const c = new NxtColumnsState(DEFS);
    c.edit();
    c.toggle('phone', true);
    c.toggle('dept', false);
    expect(c.isVisible('phone')).toBe(false);
    c.apply();
    expect(c.visibleKeys()).toEqual(['code', 'name', 'title', 'phone', 'joined']);
    expect(c.modified()).toBe(true);
    c.edit();
    c.resetDraft();
    c.apply();
    expect(c.modified()).toBe(false);
  });

  it('locked columns cannot be hidden or moved; others cannot move past them or past the end', () => {
    const c = new NxtColumnsState(DEFS);
    c.edit();
    c.toggle('name', false);
    c.setAll(false);
    expect(c.draftColumns().filter((i) => i.visible).map((i) => i.def.key)).toEqual(['code', 'name']);
    expect(c.move('name', 1)).toBe(false);
    expect(c.move('dept', -1)).toBe(false);
    expect(c.move('joined', 1)).toBe(false);
    expect(c.move('dept', 1)).toBe(true);
    expect(c.draft().order).toEqual(['code', 'name', 'title', 'dept', 'phone', 'joined']);
  });

  it('set() normalises a saved layout: unknown keys dropped, new columns at their default place, locked first', () => {
    const c = new NxtColumnsState(DEFS);
    c.set({ order: ['joined', 'gone', 'name', 'dept'], hidden: ['dept', 'name', 'gone'] });
    expect(c.value().order).toEqual(['code', 'name', 'joined', 'dept', 'title', 'phone']);
    expect(c.value().hidden).toEqual(['dept', 'phone']);
    expect(c.visibleKeys()).toEqual(['code', 'name', 'joined', 'title']);
    c.set(null);
    expect(c.modified()).toBe(false);
  });
});

describe('NxtColumnsState widths (resizable columns)', () => {
  it('a layout without widths keeps the shape saved views already have: no widths key at all', () => {
    const c = new NxtColumnsState(DEFS);
    expect(c.widths()).toEqual({});
    expect(c.width('dept')).toBeUndefined();
    expect(Object.keys(c.value())).toEqual(['order', 'hidden']);
    c.setWidth('dept', 200);
    c.setWidth('dept', null);
    expect(Object.keys(c.value())).toEqual(['order', 'hidden']);
    expect(c.modified()).toBe(false);
  });

  it('setWidth applies at once (no draft), rounds, and ignores unknown keys and unusable numbers', () => {
    const c = new NxtColumnsState(DEFS);
    c.setWidth('dept', 180.4);
    c.setWidth('code', 96);
    expect(c.width('dept')).toBe(180);
    expect(c.value().widths).toEqual({ dept: 180, code: 96 });
    expect(c.modified()).toBe(true);
    c.setWidth('gone', 100);
    c.setWidth('title', 0);
    c.setWidth('title', -5);
    c.setWidth('title', Number.NaN);
    expect(c.value().widths).toEqual({ dept: 180, code: 96 });
    c.setWidth('code', null);
    expect(c.value().widths).toEqual({ dept: 180 });
  });

  it('widths are part of the saved value: set() restores them and drops what it cannot use', () => {
    const c = new NxtColumnsState(DEFS);
    c.set({ order: ['joined', 'dept'], hidden: [], widths: { dept: 210, gone: 80, title: 0, name: 140.6 } });
    expect(c.value().widths).toEqual({ dept: 210, name: 141 });
    c.set({ order: c.value().order, hidden: c.value().hidden });
    expect(c.widths()).toEqual({});
    c.setWidth('dept', 210);
    c.set(null);
    expect(c.widths()).toEqual({});
    expect(c.modified()).toBe(false);
  });

  it('resetWidths clears only the widths; reset() and "Khôi phục mặc định" clear them with the rest', () => {
    const c = new NxtColumnsState(DEFS);
    c.set({ order: ['joined'], hidden: ['title'] });
    c.setWidth('dept', 200);
    c.resetWidths();
    expect(c.widths()).toEqual({});
    expect(c.value().hidden).toEqual(['title', 'phone']);
    c.setWidth('dept', 200);
    c.reset();
    expect(c.modified()).toBe(false);
    c.setWidth('dept', 200);
    c.edit();
    c.toggle('title', false);
    c.apply();
    expect(c.width('dept')).toBe(200);
    c.edit();
    c.resetDraft();
    c.apply();
    expect(c.widths()).toEqual({});
  });
});

@Component({
  imports: [NxtTableColumns],
  template: `<nxt-table-columns [state]="columns" />`,
})
class PanelHost {
  readonly columns = new NxtColumnsState(DEFS);
  constructor() {
    this.columns.edit();
  }
}

describe('NxtTableColumns', () => {
  async function setup() {
    const fixture = TestBed.createComponent(PanelHost);
    fixture.detectChanges();
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    const state = fixture.componentInstance.columns;
    const item = (key: string) => el.querySelector<HTMLElement>(`li[data-key="${key}"]`)!;
    const box = (key: string) => item(key).querySelector<HTMLInputElement>('input[type="checkbox"]')!;
    const button = (text: string) => [...el.querySelectorAll<HTMLButtonElement>('button')].find((b) => b.textContent!.trim() === text)!;
    const keys = () => [...el.querySelectorAll<HTMLElement>('li[data-key]')].map((li) => li.dataset['key']);
    const status = () => el.querySelector('[role="status"]')!.textContent!.trim();
    return { fixture, el, state, item, box, button, keys, status };
  }

  it('lists every column in order in a named list; locked ones are checked, disabled and say why', async () => {
    const { el, box, item, keys } = await setup();
    expect(el.querySelector('ul')!.getAttribute('aria-label')).toBe('Cột của bảng');
    expect(keys()).toEqual(['code', 'name', 'dept', 'title', 'phone', 'joined']);
    expect(box('code').checked).toBe(true);
    expect(box('code').disabled).toBe(true);
    expect(item('code').textContent).toContain('Luôn hiện');
    expect(box('phone').checked).toBe(false);
  });

  it('Space on a column checkbox shows / hides it in the draft', async () => {
    const { fixture, box, state } = await setup();
    box('phone').click();
    await fixture.whenStable();
    expect(state.draft().hidden).not.toContain('phone');
    expect(state.isVisible('phone')).toBe(false);
  });

  it('Alt+↓ moves the focused column, keeps focus on it and announces its position', async () => {
    const { fixture, box, keys, status } = await setup();
    box('dept').focus();
    box('dept').dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', altKey: true, bubbles: true }));
    await fixture.whenStable();
    await tick();
    expect(keys()).toEqual(['code', 'name', 'title', 'dept', 'phone', 'joined']);
    expect(document.activeElement).toBe(box('dept'));
    expect(status()).toBe('Phòng ban: vị trí 4 trên 6');
    box('dept').dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', altKey: true, bubbles: true }));
    await fixture.whenStable();
    expect(keys()).toEqual(['code', 'name', 'dept', 'title', 'phone', 'joined']);
  });

  it('Up / Down act on the last focused column, are named after it, and are disabled where it cannot move', async () => {
    const { fixture, el, box, keys } = await setup();
    const [up, down] = [...el.querySelectorAll<HTMLButtonElement>('.nxt-table-columns__tools button')];
    expect(up.getAttribute('aria-disabled')).toBe('true');
    box('dept').focus();
    await fixture.whenStable();
    expect(up.getAttribute('aria-label')).toBe('Đưa cột Phòng ban lên');
    expect(up.getAttribute('aria-disabled')).toBe('true');
    expect(down.getAttribute('aria-disabled')).toBeNull();
    down.click();
    await fixture.whenStable();
    expect(keys()).toEqual(['code', 'name', 'title', 'dept', 'phone', 'joined']);
  });

  it('search filters the list as you type, without diacritics', async () => {
    const { fixture, el, keys } = await setup();
    const input = el.querySelector<HTMLInputElement>('nxt-search input')!;
    input.value = 'phong';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(keys()).toEqual(['dept']);
    input.value = 'khong co';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(el.querySelector('.nxt-table-columns__empty')!.textContent).toContain('Không có cột phù hợp');
  });

  it('"Hiện tất cả" and "Khôi phục mặc định" change the draft only', async () => {
    const { fixture, el, state, button, status } = await setup();
    el.querySelector<HTMLInputElement>('.nxt-table-columns__tools input[type="checkbox"]')!.click();
    await fixture.whenStable();
    expect(state.draft().hidden).toEqual([]);
    button('Khôi phục mặc định').click();
    await fixture.whenStable();
    expect(state.draft().hidden).toEqual(['phone']);
    expect(status()).toBe('Đã khôi phục cột mặc định');
    expect(state.modified()).toBe(false);
  });
});

@Component({
  imports: [NxtTableColumnsTrigger],
  template: `<button type="button" [nxtTableColumnsFor]="columns" (nxtTableColumnsApplied)="applied = applied + 1">Cài đặt bảng</button>`,
})
class TriggerHost {
  readonly columns = new NxtColumnsState(DEFS);
  applied = 0;
}

describe('NxtTableColumnsTrigger', () => {
  afterEach(() => document.querySelectorAll('.cdk-overlay-container').forEach((c) => (c.innerHTML = '')));

  async function open() {
    const fixture = TestBed.createComponent(TriggerHost);
    fixture.detectChanges();
    const trigger = (fixture.nativeElement as HTMLElement).querySelector('button')!;
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
    trigger.click();
    await tick();
    fixture.detectChanges();
    const dialog = document.querySelector<HTMLElement>('.nxt-dialog-pane [role="dialog"]')!;
    const button = (text: string) => [...dialog.querySelectorAll<HTMLButtonElement>('button')].find((b) => b.textContent!.trim() === text)!;
    return { fixture, dialog, button, host: fixture.componentInstance };
  }

  it('opens a dialog named "Cài đặt bảng"; "Áp dụng" applies the draft', async () => {
    const { fixture, dialog, button, host } = await open();
    expect(document.getElementById(dialog.getAttribute('aria-labelledby')!)!.textContent).toBe('Cài đặt bảng');
    dialog.querySelector<HTMLInputElement>('li[data-key="phone"] input')!.click();
    button('Áp dụng').click();
    await tick();
    fixture.detectChanges();
    expect(host.columns.isVisible('phone')).toBe(true);
    expect(host.applied).toBe(1);
  });

  it('"Huỷ" closes without applying', async () => {
    const { fixture, dialog, button, host } = await open();
    dialog.querySelector<HTMLInputElement>('li[data-key="dept"] input')!.click();
    button('Huỷ').click();
    await tick();
    fixture.detectChanges();
    expect(host.columns.isVisible('dept')).toBe(true);
    expect(host.applied).toBe(0);
  });
});
