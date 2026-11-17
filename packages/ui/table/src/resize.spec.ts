import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NxtColumnsState } from './columns';
import { NxtColumnResize, NxtResizable } from './resize';
import { NxtSort, NxtSortHeader, NxtSortState, NxtTable } from './table';

/**
 * jsdom has no layout: every header cell answers `getBoundingClientRect` from its `data-natural` width, or from the
 * width NxtResizable wrote (`--_col-w`); the table is as wide as its header cells.
 */
function fakeLayout(el: HTMLElement): DOMRect {
  let width = 0;
  if (el.tagName === 'TH') width = Number(el.style.getPropertyValue('--_col-w')) || Number(el.dataset['natural']) || 0;
  else if (el.tagName === 'TABLE') width = [...el.querySelectorAll<HTMLElement>('thead th')].reduce((sum, th) => sum + th.getBoundingClientRect().width, 0);
  return { width, height: 36, x: 0, y: 0, left: 0, top: 0, right: width, bottom: 36, toJSON: () => ({}) } as DOMRect;
}

@Component({
  imports: [NxtTable, NxtSort, NxtSortHeader, NxtResizable],
  template: `
    <div [attr.dir]="dir()">
      <table nxtTable aria-label="Nhân viên" [(nxtSort)]="sort">
        <thead>
          <tr>
            <th scope="col" nxtResizable="name" [nxtResizeColumns]="columns" data-natural="120">Họ và tên</th>
            <th
              scope="col"
              nxtSortHeader="dept"
              nxtResizable="dept"
              [nxtResizeColumns]="columns"
              [nxtResizeMin]="deptMin()"
              [nxtResizeMax]="300"
              data-natural="160"
              (nxtResized)="log($event)"
            >
              Phòng ban
            </th>
            <th scope="col" nxtResizable data-natural="140" (nxtResized)="log($event)">Chức danh</th>
            <th scope="col" data-natural="100">Ghi chú</th>
          </tr>
        </thead>
        <tbody>
          <tr><th scope="row">Lê Minh Anh</th><td>Kế toán</td><td>Kế toán thuế</td><td>—</td></tr>
        </tbody>
      </table>
    </div>
  `,
})
class Host {
  readonly columns = new NxtColumnsState([
    { key: 'name', label: 'Họ và tên', locked: true },
    { key: 'dept', label: 'Phòng ban' },
    { key: 'title', label: 'Chức danh' },
  ]);
  readonly sort = signal<NxtSortState>({ active: '', direction: '' });
  readonly dir = signal<'ltr' | 'rtl'>('ltr');
  readonly deptMin = signal(80);
  readonly events: NxtColumnResize[] = [];

  log(event: NxtColumnResize) {
    this.events.push(event);
  }
}

const tick = () => new Promise((resolve) => setTimeout(resolve));

describe('NxtResizable', () => {
  afterEach(() => vi.restoreAllMocks());

  async function setup() {
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
      return fakeLayout(this as HTMLElement);
    });
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await fixture.whenStable();
    await tick();
    const el: HTMLElement = fixture.nativeElement;
    const table = el.querySelector<HTMLElement>('table')!;
    const th = (key: string) => el.querySelector<HTMLElement>(`th[data-natural]:nth-child(${['name', 'dept', 'title', 'note'].indexOf(key) + 1})`)!;
    const handle = (key: string) => th(key).querySelector<HTMLElement>('.nxt-resize-handle')!;
    /** The width NxtResizable wrote for a column, or null while it has none. */
    const width = (key: string) => {
      const value = th(key).style.getPropertyValue('--_col-w');
      return value ? Number(value) : null;
    };
    const key = async (key: string, eventKey: string, init: KeyboardEventInit = {}) => {
      handle(key).dispatchEvent(new KeyboardEvent('keydown', { key: eventKey, bubbles: true, cancelable: true, ...init }));
      await fixture.whenStable();
      await tick();
    };
    const pointer = (target: HTMLElement, type: string, x: number) =>
      target.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, pointerId: 1, button: 0, clientX: x }));
    /** pointerdown at x = 100, then the moves; the pointer is released only when asked (`up`). */
    const drag = async (key: string, moves: number[], up = true) => {
      const h = handle(key);
      pointer(h, 'pointerdown', 100);
      for (const x of moves) pointer(h, 'pointermove', x);
      if (up) pointer(h, 'pointerup', moves[moves.length - 1] ?? 100);
      await fixture.whenStable();
      await tick();
    };
    const release = async (key: string, x: number) => {
      pointer(handle(key), 'pointerup', x);
      await fixture.whenStable();
      await tick();
    };
    return { fixture, host: fixture.componentInstance, el, table, th, handle, width, key, pointer, drag, release };
  }

  it('only the columns that opt in get a handle: a focusable vertical separator named after the column', async () => {
    const { el, handle } = await setup();
    expect(el.querySelectorAll('.nxt-resize-handle').length).toBe(3);
    expect(el.querySelector('th[data-natural="100"] .nxt-resize-handle')).toBeNull();
    const h = handle('dept');
    expect(h.getAttribute('role')).toBe('separator');
    expect(h.getAttribute('aria-orientation')).toBe('vertical');
    expect(h.tabIndex).toBe(0);
    expect(h.getAttribute('aria-label')).toBe('Đổi độ rộng cột Phòng ban');
    expect(handle('title').getAttribute('aria-label')).toBe('Đổi độ rộng cột Chức danh');
  });

  it('aria-valuenow / min / max are the width and its bounds (inputs, else the stylesheet or its fallback)', async () => {
    const { handle } = await setup();
    const dept = handle('dept');
    expect([dept.getAttribute('aria-valuenow'), dept.getAttribute('aria-valuemin'), dept.getAttribute('aria-valuemax')]).toEqual(['160', '80', '300']);
    const name = handle('name');
    expect(name.getAttribute('aria-valuenow')).toBe('120');
    // No input and no stylesheet in jsdom: the fallbacks, kept around the current width.
    expect(Number(name.getAttribute('aria-valuemin'))).toBeLessThanOrEqual(120);
    expect(Number(name.getAttribute('aria-valuemax'))).toBeGreaterThanOrEqual(120);
  });

  it('is additive: nothing changes until a column gets a width; the handle follows the sort button in the Tab order', async () => {
    const { table, th, handle, key } = await setup();
    expect(table.hasAttribute('data-sized')).toBe(false);
    expect(table.style.getPropertyValue('--_table-w')).toBe('');
    expect([...th('dept').children].map((c) => c.className)).toEqual(['nxt-sort-header', 'nxt-resize-handle']);
    // Sorting still works, and the handle does not sort.
    handle('dept').click();
    expect(th('dept').hasAttribute('aria-sort')).toBe(false);
    await key('dept', 'ArrowRight');
    expect(table.hasAttribute('data-sized')).toBe(true);
  });

  it('arrow keys change the width by 8 (Shift: 32); Home / End go to the minimum / maximum; every change is reported', async () => {
    const { host, table, th, width, key } = await setup();
    await key('dept', 'ArrowRight');
    expect(width('dept')).toBe(168);
    await key('dept', 'ArrowRight', { shiftKey: true });
    expect(width('dept')).toBe(200);
    await key('dept', 'ArrowLeft');
    expect(width('dept')).toBe(192);
    await key('dept', 'End');
    expect(width('dept')).toBe(300);
    await key('dept', 'ArrowRight');
    expect(width('dept')).toBe(300);
    await key('dept', 'Home');
    expect(width('dept')).toBe(80);
    expect(host.events.map((e) => e.width)).toEqual([168, 200, 192, 300, 80]);
    expect(host.events.every((e) => e.key === 'dept')).toBe(true);
    // Every other column keeps the width it had; the table is exactly as wide as its columns.
    expect(width('name')).toBe(120);
    expect(width('title')).toBe(140);
    expect(th('note').style.getPropertyValue('--_col-w')).toBe('100');
    expect(table.style.getPropertyValue('--_table-w')).toBe(String(120 + 80 + 140 + 100));
    expect(table.hasAttribute('data-sized')).toBe(true);
  });

  it('a drag sets the width from where it started, clamps it to the bounds and reports once, at the end', async () => {
    const { host, el, th, width, drag, release } = await setup();
    await drag('dept', [110, 140], false);
    expect(width('dept')).toBe(200);
    expect(th('dept').hasAttribute('data-resizing')).toBe(true);
    expect(host.events).toEqual([]);
    await release('dept', 140);
    expect(host.events).toEqual([{ key: 'dept', width: 200 }]);
    expect(th('dept').hasAttribute('data-resizing')).toBe(false);
    expect(el.querySelector('th[data-natural="100"]')!.getAttribute('data-sized')).toBe('');
    await drag('dept', [900]);
    expect(width('dept')).toBe(300);
    await drag('dept', [-900]);
    expect(width('dept')).toBe(80);
  });

  it('a column narrower than its minimum is not pushed up to it by the first move; it can still grow', async () => {
    const { host, fixture, table, handle, width, drag, key } = await setup();
    host.deptMin.set(200);
    fixture.detectChanges();
    await fixture.whenStable();
    await key('dept', 'ArrowLeft');
    await drag('dept', [70]);
    expect(width('dept')).toBeNull();
    expect(table.hasAttribute('data-sized')).toBe(false);
    expect(host.events).toEqual([]);
    expect(handle('dept').getAttribute('aria-valuemin')).toBe('160');
    await key('dept', 'ArrowRight');
    expect(width('dept')).toBe(168);
    // The bound still includes the width the column has (168 < 200): Home does not jump up either.
    await key('dept', 'Home');
    expect(width('dept')).toBe(168);
  });

  it('a click without movement changes and reports nothing', async () => {
    const { host, table, drag } = await setup();
    await drag('dept', []);
    expect(host.events).toEqual([]);
    expect(table.hasAttribute('data-sized')).toBe(false);
  });

  it('Escape cancels a drag: the column gets back the width it had, nothing is reported', async () => {
    const { host, table, th, width, drag, key } = await setup();
    await key('dept', 'ArrowRight', { shiftKey: true });
    host.events.length = 0;
    await drag('dept', [150], false);
    expect(width('dept')).toBe(242);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    expect(width('dept')).toBe(192);
    expect(th('dept').hasAttribute('data-resizing')).toBe(false);
    expect(host.events).toEqual([]);
    // Cancelling the very first drag leaves the table as it was: natural layout.
    await key('dept', 'Enter');
    await drag('dept', [150], false);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    await tick();
    expect(table.hasAttribute('data-sized')).toBe(false);
  });

  it('pointercancel drops the drag too', async () => {
    const { host, th, width, drag, pointer, handle, key } = await setup();
    await key('title', 'ArrowRight');
    host.events.length = 0;
    await drag('title', [160], false);
    expect(width('title')).toBe(208);
    pointer(handle('title'), 'pointercancel', 160);
    expect(width('title')).toBe(148);
    expect(th('title').hasAttribute('data-resizing')).toBe(false);
    expect(host.events).toEqual([]);
  });

  it('Enter and double click go back to the default (natural) width', async () => {
    const { host, table, width, key, handle } = await setup();
    await key('dept', 'End');
    await key('title', 'Home');
    host.events.length = 0;
    await key('dept', 'Enter');
    // dept is natural again (the layout is measured anew); title keeps the width it was given.
    expect(width('dept')).toBe(160);
    expect(width('title')).toBe(48);
    expect(host.events).toEqual([{ key: 'dept', width: null }]);
    handle('title').dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    await tick();
    expect(host.events.at(-1)).toEqual({ key: '', width: null });
    // No column has a width any more: the table goes back to laying out by content.
    expect(table.hasAttribute('data-sized')).toBe(false);
    expect(table.style.getPropertyValue('--_table-w')).toBe('');
    // Nothing to reset, nothing reported.
    const count = host.events.length;
    handle('title').dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    expect(host.events.length).toBe(count);
  });

  it('a column without a key or a state still reports its width', async () => {
    const { host, key } = await setup();
    await key('title', 'ArrowLeft');
    expect(host.events).toEqual([{ key: '', width: 132 }]);
    expect(host.columns.widths()).toEqual({});
  });

  it('in right-to-left text the border moves the other way: the arrows and the drag are mirrored', async () => {
    const { host, fixture, width, key, drag } = await setup();
    host.dir.set('rtl');
    fixture.detectChanges();
    await key('dept', 'ArrowLeft');
    expect(width('dept')).toBe(168);
    await key('dept', 'ArrowRight');
    expect(width('dept')).toBe(160);
    await drag('dept', [60]);
    expect(width('dept')).toBe(200);
  });

  describe('widths kept in the columns state', () => {
    it('a width the user sets is saved in state.value().widths, which is what a view saves', async () => {
      const { host, key } = await setup();
      await key('dept', 'ArrowRight', { shiftKey: true });
      await key('name', 'End');
      expect(host.columns.width('dept')).toBe(192);
      expect(host.columns.value().widths).toEqual({ dept: 192, name: 640 });
      expect(host.columns.modified()).toBe(true);
    });

    it('a width applied from outside (a saved view) becomes the width of the column; clearing it goes back to natural', async () => {
      const { host, table, th, fixture, width } = await setup();
      host.columns.set({ widths: { dept: 220, name: 150 } });
      fixture.detectChanges();
      await fixture.whenStable();
      await tick();
      expect(width('dept')).toBe(220);
      expect(width('name')).toBe(150);
      expect(width('title')).toBe(140);
      expect(th('note').style.getPropertyValue('--_col-w')).toBe('100');
      expect(table.style.getPropertyValue('--_table-w')).toBe(String(150 + 220 + 140 + 100));
      host.columns.reset();
      fixture.detectChanges();
      await fixture.whenStable();
      await tick();
      expect(table.hasAttribute('data-sized')).toBe(false);
      expect(width('dept')).toBeNull();
    });

    it('moving the border is not undone when the state changes for another column', async () => {
      const { host, fixture, width, key } = await setup();
      await key('dept', 'ArrowRight');
      host.columns.setWidth('name', 130);
      fixture.detectChanges();
      await fixture.whenStable();
      await tick();
      expect(width('dept')).toBe(168);
      expect(width('name')).toBe(130);
    });
  });
});
