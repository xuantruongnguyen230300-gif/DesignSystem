import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NxtFilterState } from '@nxt/ui/filter';
import { NxtColumnsState, NxtSortState } from '@nxt/ui/table';
import { NxtViewManager } from './view-manager';
import { NxtMemoryViewStore, NxtViewState, NxtViews, nxtViewEqual, nxtViewTargets } from './views';

type Filters = { status: string; groups: string[] };
const tick = () => new Promise((r) => setTimeout(r));

const state = (over: Partial<NxtViewState<Filters>> = {}): NxtViewState<Filters> => ({
  query: '',
  filters: { status: 'all', groups: [] },
  sort: { active: 'code', direction: 'asc' },
  ...over,
});

/** A list page in miniature: search, filters, sort, columns, rows per page. */
function page(store?: NxtMemoryViewStore<Filters>) {
  const query = signal('');
  const filters = new NxtFilterState<Filters>({ status: 'all', groups: [] });
  const sort = signal<NxtSortState>({ active: 'code', direction: 'asc' });
  const columns = new NxtColumnsState([
    { key: 'name', label: 'Tên', locked: true },
    { key: 'group', label: 'Nhóm' },
    { key: 'updated', label: 'Cập nhật' },
  ]);
  const pageNo = signal(3);
  const pageSize = signal(10);
  const views = new NxtViews<Filters>({ ...nxtViewTargets({ query, filters, sort, columns, pageSize, page: pageNo }), store });
  return { query, filters, sort, columns, pageNo, pageSize, views };
}

describe('nxtViewEqual', () => {
  it('column widths count as a change; no widths and an empty record are equal', () => {
    const cols = (widths?: Record<string, number>) => ({ order: ['a', 'b'], hidden: [], ...(widths ? { widths } : {}) });
    expect(nxtViewEqual(state({ columns: cols() }), state({ columns: cols({}) }))).toBe(true);
    expect(nxtViewEqual(state({ columns: cols({ a: 120 }) }), state({ columns: cols({ a: 120 }) }))).toBe(true);
    expect(nxtViewEqual(state({ columns: cols({ a: 120 }) }), state({ columns: cols({ a: 140 }) }))).toBe(false);
    expect(nxtViewEqual(state({ columns: cols({ a: 120 }) }), state({ columns: cols() }))).toBe(false);
  });

  it('filter arrays compare as sets; the query ignores outer spaces; no sort ignores the key', () => {
    expect(nxtViewEqual(state({ filters: { status: 'all', groups: ['A', 'B'] } }), state({ filters: { status: 'all', groups: ['B', 'A'] } }))).toBe(true);
    expect(nxtViewEqual(state({ query: ' ke toan ' }), state({ query: 'ke toan' }))).toBe(true);
    expect(nxtViewEqual(state({ sort: { active: 'name', direction: '' } }), state({ sort: { active: '', direction: '' } }))).toBe(true);
    expect(nxtViewEqual(state({ filters: { status: 'active', groups: [] } }), state())).toBe(false);
  });

  it('column order counts; columns and pageSize are compared only when both sides have them', () => {
    const a = state({ columns: { order: ['name', 'group', 'updated'], hidden: [] } });
    expect(nxtViewEqual(a, state({ columns: { order: ['name', 'updated', 'group'], hidden: [] } }))).toBe(false);
    expect(nxtViewEqual(a, state())).toBe(true);
    expect(nxtViewEqual(state({ pageSize: 10 }), state({ pageSize: 20 }))).toBe(false);
  });
});

describe('NxtViews', () => {
  it('starts on a standard "Tiêu chuẩn" view made from the screen; modified follows the screen', () => {
    const { views, filters } = page();
    expect(views.views().map((v) => [v.name, v.standard])).toEqual([['Tiêu chuẩn', true]]);
    expect(views.modified()).toBe(false);
    filters.set('status', 'active');
    filters.apply();
    expect(views.modified()).toBe(true);
  });

  it('saveAs keeps the screen under a name, selects it, can make it the default, and persists it', async () => {
    const store = new NxtMemoryViewStore<Filters>();
    const { views, query, sort } = page(store);
    await views.ready;
    query.set('ke toan');
    sort.set({ active: 'name', direction: 'desc' });
    const saved = await views.saveAs('  Kế toán   theo tên ', { makeDefault: true });
    expect(saved.name).toBe('Kế toán theo tên');
    expect(views.selectedId()).toBe(saved.id);
    expect(views.defaultId()).toBe(saved.id);
    expect(views.modified()).toBe(false);
    expect(store.load()!.views.map((v) => v.name)).toEqual(['Kế toán theo tên']);
    expect(store.load()!.defaultId).toBe(saved.id);
    expect(views.nameTaken('kế toán THEO tên')).toBe(true);
  });

  it('select applies a view (search, filters, sort, columns, rows per page) and goes back to page 1', async () => {
    const { views, query, filters, sort, columns, pageNo, pageSize } = page();
    query.set('lai xe');
    filters.set('groups', ['Hỗ trợ']);
    filters.apply();
    columns.set({ order: ['name', 'updated', 'group'], hidden: ['group'] });
    pageSize.set(50);
    const mine = await views.saveAs('Hỗ trợ');
    views.select('standard');
    expect(query()).toBe('');
    expect(filters.applied()).toEqual({ status: 'all', groups: [] });
    expect(columns.visibleKeys()).toEqual(['name', 'group', 'updated']);
    views.select(mine.id);
    expect(query()).toBe('lai xe');
    expect(filters.draft().groups).toEqual(['Hỗ trợ']);
    expect(columns.visibleKeys()).toEqual(['name', 'updated']);
    expect(pageSize()).toBe(50);
    expect(pageNo()).toBe(1);
    expect(sort()).toEqual({ active: 'code', direction: 'asc' });
  });

  it('save overwrites the selected view; a standard view refuses', async () => {
    const { views, query } = page();
    await expect(views.save()).rejects.toThrow();
    const mine = await views.saveAs('Của tôi');
    query.set('bao ve');
    expect(views.modified()).toBe(true);
    await views.save();
    expect(views.modified()).toBe(false);
    expect(views.views().find((v) => v.id === mine.id)!.state.query).toBe('bao ve');
  });

  it('manage renames, deletes and sets the default; deleting the selected view falls back to the default', async () => {
    const { views, query } = page();
    const a = await views.saveAs('A');
    query.set('x');
    const b = await views.saveAs('B');
    await views.manage({ names: { [a.id]: 'Khối Kinh doanh', standard: 'Đổi tên chuẩn' }, removed: [b.id], defaultId: a.id });
    expect(views.views().map((v) => v.name)).toEqual(['Tiêu chuẩn', 'Khối Kinh doanh']);
    expect(views.defaultId()).toBe(a.id);
    expect(views.selectedId()).toBe(a.id);
    expect(query()).toBe('');
  });

  it('loads the user views from the store and opens the default one', async () => {
    const store = new NxtMemoryViewStore<Filters>({
      views: [{ id: 'mine', name: 'Đang sử dụng', state: state({ filters: { status: 'active', groups: [] } }) }],
      defaultId: 'mine',
    });
    const { views, filters } = page(store);
    await views.ready;
    expect(views.selected().name).toBe('Đang sử dụng');
    expect(filters.applied().status).toBe('active');
    expect(views.modified()).toBe(false);
  });
});

@Component({
  imports: [NxtViewManager],
  template: `<nxt-view-manager [views]="p.views" [count]="1284" itemLabel="nhân viên" />`,
})
class Host {
  readonly p = page(new NxtMemoryViewStore<Filters>());
}

describe('NxtViewManager', () => {
  afterEach(() => document.querySelectorAll('.cdk-overlay-container').forEach((c) => (c.innerHTML = '')));

  async function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await fixture.componentInstance.p.views.ready;
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    const trigger = el.querySelector<HTMLButtonElement>('.nxt-view-manager__trigger')!;
    const overlay = () => document.querySelector<HTMLElement>('.cdk-overlay-container')!;
    const menuItem = (text: string) =>
      [...overlay().querySelectorAll<HTMLElement>('[role^="menuitem"]')].find((b) => b.textContent!.replace(/\s+/g, ' ').trim().startsWith(text))!;
    const openMenu = async () => {
      trigger.click();
      await fixture.whenStable();
    };
    const dialog = () => document.querySelector<HTMLElement>('.nxt-dialog-pane [role="dialog"]')!;
    const dialogButton = (text: string) => [...dialog().querySelectorAll<HTMLButtonElement>('button')].find((b) => b.textContent!.trim() === text)!;
    const status = () => el.querySelector('[role="status"]')!.textContent!.trim();
    const settle = async () => {
      await tick();
      await fixture.whenStable();
      await tick();
    };
    return { fixture, el, p: fixture.componentInstance.p, trigger, menuItem, openMenu, dialog, dialogButton, status, settle };
  }

  it('the button is named "Chế độ xem: <view>"; the count is formatted; "Đã sửa" appears when the screen differs', async () => {
    const { fixture, el, p, trigger } = await setup();
    expect(trigger.textContent!.replace(/\s+/g, ' ').trim()).toBe('Chế độ xem: Tiêu chuẩn');
    expect(el.querySelector('.nxt-view-manager__count')!.textContent).toBe('1.284 nhân viên');
    p.query.set('ke toan');
    await fixture.whenStable();
    expect(trigger.textContent!.replace(/\s+/g, ' ').trim()).toBe('Chế độ xem: Tiêu chuẩn, Đã sửa');
    expect(el.querySelector('nxt-view-manager')!.hasAttribute('data-modified')).toBe(true);
  });

  it('Enter / click opens the menu: views as menuitemradio in a named group; "Lưu" is disabled on a standard view, with the reason', async () => {
    const { trigger, openMenu, menuItem } = await setup();
    await openMenu();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    const view = menuItem('Tiêu chuẩn');
    expect(view.getAttribute('role')).toBe('menuitemradio');
    expect(view.getAttribute('aria-checked')).toBe('true');
    expect(view.textContent).toContain('Mặc định');
    expect(view.closest('[role="group"]')!.getAttribute('aria-label')).toBe('Chế độ xem');
    const save = menuItem('Lưu');
    expect(save.getAttribute('aria-disabled')).toBe('true');
    expect(save.textContent).toContain('chế độ xem chuẩn không ghi đè được');
  });

  it('choosing a view applies it right away and announces it', async () => {
    const { fixture, p, openMenu, menuItem, status } = await setup();
    await p.views.saveAs('Kế toán');
    p.views.select('standard');
    await fixture.whenStable();
    await openMenu();
    menuItem('Kế toán').click();
    await fixture.whenStable();
    expect(p.views.selected().name).toBe('Kế toán');
    expect(status()).toBe('Đang xem: Kế toán.');
  });

  it('"Lưu thành…": an empty or taken name is reported at the field; a good name saves and selects the view', async () => {
    const { fixture, p, openMenu, menuItem, dialog, dialogButton, settle, status, trigger } = await setup();
    p.query.set('ke toan');
    await fixture.whenStable();
    await openMenu();
    menuItem('Lưu thành chế độ xem mới').click();
    await settle();
    expect(document.getElementById(dialog().getAttribute('aria-labelledby')!)!.textContent).toBe('Lưu chế độ xem');
    const input = dialog().querySelector<HTMLInputElement>('input[type="text"]')!;
    dialogButton('Lưu').click();
    await settle();
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(dialog().textContent).toContain('Nhập tên chế độ xem.');
    expect(document.activeElement).toBe(input);
    input.value = 'tiêu chuẩn';
    input.dispatchEvent(new Event('input'));
    dialogButton('Lưu').click();
    await settle();
    expect(dialog().textContent).toContain('Đã có chế độ xem tên này');
    input.value = 'Kế toán';
    input.dispatchEvent(new Event('input'));
    dialog().querySelector<HTMLInputElement>('input[type="checkbox"]')!.click();
    dialogButton('Lưu').click();
    await settle();
    expect(document.querySelector('.nxt-dialog-pane')).toBeNull();
    expect(p.views.selected().name).toBe('Kế toán');
    expect(p.views.defaultId()).toBe(p.views.selectedId());
    expect(status()).toBe('Đã lưu chế độ xem Kế toán.');
    expect(trigger.textContent).not.toContain('Đã sửa');
  });

  it('"Lưu" overwrites a user view once something changed', async () => {
    const { fixture, p, openMenu, menuItem, status } = await setup();
    await p.views.saveAs('Của tôi');
    p.query.set('lai xe');
    await fixture.whenStable();
    await openMenu();
    const save = menuItem('Lưu');
    expect(save.getAttribute('aria-disabled')).toBeNull();
    save.click();
    await tick();
    await fixture.whenStable();
    expect(p.views.modified()).toBe(false);
    expect(status()).toBe('Đã lưu chế độ xem Của tôi.');
  });

  it('"Quản lý…": rename, delete, choose the default, then "Lưu"; the standard view has no name field and no delete', async () => {
    const { p, openMenu, menuItem, dialog, dialogButton, settle } = await setup();
    const a = await p.views.saveAs('A');
    const b = await p.views.saveAs('B');
    await openMenu();
    menuItem('Quản lý chế độ xem').click();
    await settle();
    const row = (id: string) => dialog().querySelector<HTMLElement>(`tr[data-id="${id}"]`)!;
    expect(row('standard').querySelector('input[type="text"]')).toBeNull();
    expect(row('standard').querySelector('button')).toBeNull();
    expect(row('standard').textContent).toContain('Chuẩn');
    const name = row(a.id).querySelector<HTMLInputElement>('input[type="text"]')!;
    name.value = 'Khối Kinh doanh';
    name.dispatchEvent(new Event('input'));
    row(a.id).querySelector<HTMLInputElement>('input[type="radio"]')!.click();
    row(b.id).querySelector<HTMLButtonElement>('button')!.click();
    await settle();
    expect(row(b.id)).toBeNull();
    dialogButton('Lưu').click();
    await settle();
    expect(p.views.views().map((v) => v.name)).toEqual(['Tiêu chuẩn', 'Khối Kinh doanh']);
    expect(p.views.defaultId()).toBe(a.id);
  });

  it('"Huỷ" in "Quản lý…" changes nothing', async () => {
    const { p, openMenu, menuItem, dialog, dialogButton, settle } = await setup();
    const a = await p.views.saveAs('A');
    await openMenu();
    menuItem('Quản lý chế độ xem').click();
    await settle();
    dialog().querySelector<HTMLElement>(`tr[data-id="${a.id}"] button`)!.click();
    dialogButton('Huỷ').click();
    await settle();
    expect(p.views.views().map((v) => v.name)).toEqual(['Tiêu chuẩn', 'A']);
  });
});
