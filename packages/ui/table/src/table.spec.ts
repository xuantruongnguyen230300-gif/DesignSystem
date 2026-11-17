import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NxtRowActions, NxtSelection, NxtSort, NxtSortHeader, NxtSortState, NxtTable, NxtTablePlaceholder, NxtTableScroll } from './table';

@Component({
  imports: [NxtTable, NxtSort, NxtSortHeader],
  template: `
    <table nxtTable stickyHeader [(nxtSort)]="sort">
      <thead>
        <tr>
          <th nxtSortHeader="name">Họ và tên</th>
          <th nxtSortHeader="salary">Lương</th>
          <th>Phòng ban</th>
        </tr>
      </thead>
      <tbody>
        <tr><th scope="row">Lê Minh Anh</th><td class="nxt-table__num">18.000.000</td><td>Kế toán</td></tr>
      </tbody>
    </table>
  `,
})
class Host {
  readonly sort = signal<NxtSortState>({ active: '', direction: '' });
}

describe('NxtTable + NxtSort', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const headers = [...el.querySelectorAll<HTMLElement>('th[nxtSortHeader]')];
    const click = async (i: number) => {
      headers[i].querySelector('button')!.click();
      await fixture.whenStable();
    };
    return { fixture, host: fixture.componentInstance, el, headers, click };
  }

  it('keeps native table semantics and the sticky flag', () => {
    const { el } = setup();
    const table = el.querySelector('table')!;
    expect(table.classList).toContain('nxt-table');
    expect(table.hasAttribute('data-sticky')).toBe(true);
    expect(table.hasAttribute('role')).toBe(false);
  });

  it('sortable headers are buttons inside the th; aria-sort only on the sorted column', async () => {
    const { headers, click } = setup();
    expect(headers[0].querySelector('button')!.textContent).toContain('Họ và tên');
    expect(headers.every((h) => !h.hasAttribute('aria-sort'))).toBe(true);
    await click(0);
    expect(headers[0].getAttribute('aria-sort')).toBe('ascending');
    expect(headers[1].hasAttribute('aria-sort')).toBe(false);
  });

  it('cycles none → ascending → descending → none', async () => {
    const { host, headers, click } = setup();
    await click(1);
    expect(host.sort()).toEqual({ active: 'salary', direction: 'asc' });
    await click(1);
    expect(host.sort()).toEqual({ active: 'salary', direction: 'desc' });
    expect(headers[1].getAttribute('aria-sort')).toBe('descending');
    await click(1);
    expect(host.sort()).toEqual({ active: '', direction: '' });
    expect(headers[1].hasAttribute('aria-sort')).toBe(false);
  });

  it('starts ascending when switching to another column', async () => {
    const { host, click } = setup();
    await click(0);
    await click(0);
    await click(1);
    expect(host.sort()).toEqual({ active: 'salary', direction: 'asc' });
  });

  it('the sort button is the header cell\'s own control and keeps its aria-sort semantics when the cell is as tall as the header', () => {
    const { headers } = setup();
    for (const th of headers) {
      expect([...th.children].map((c) => c.tagName)).toEqual(['BUTTON']);
      expect(th.querySelector('button')!.getAttribute('type')).toBe('button');
      expect(th.hasAttribute('aria-sort')).toBe(false);
    }
  });

  it('the sort button fills the header cell height without changing the header size (stylesheet contract)', () => {
    setup();
    // The component stylesheet is attached to the document while the table is in use.
    const css = [...document.querySelectorAll('style')].map((s) => s.textContent ?? '').join('\n');
    const button = /\.nxt-sort-header\s*\{([^}]*)\}/.exec(css)?.[1] ?? '';
    // Header height as the minimum, minus the cell's block padding as a negative margin: the cell does not grow.
    expect(button).toMatch(/min-block-size:\s*var\(--nxt-table-header-height\)/);
    expect(button).toMatch(/margin-block:\s*calc\(-1\s*\*\s*var\(--nxt-space-inset-xs\)\)/);
  });
});

describe('NxtSelection', () => {
  const page = ['GD-KD', 'GD-CN', 'TP-NS', 'TP-KT', 'TP-KD'];

  it('selects single rows and reports page state', () => {
    const s = new NxtSelection<string>();
    s.select('TP-NS', true);
    expect(s.has('TP-NS')).toBe(true);
    expect(s.count()).toBe(1);
    expect(s.someSelected(page)).toBe(true);
    expect(s.allSelected(page)).toBe(false);
    s.setMany(page, true);
    expect(s.allSelected(page)).toBe(true);
    s.setMany(page, false);
    expect(s.count()).toBe(0);
  });

  it('Shift applies the new state to the range from the last toggled row (Gmail / Explorer)', () => {
    const s = new NxtSelection<string>();
    s.select('GD-CN', true, { order: page });
    s.select('TP-KD', true, { range: true, order: page });
    expect([...s.selected()]).toEqual(['GD-CN', 'TP-NS', 'TP-KT', 'TP-KD']);
    s.select('TP-NS', false, { order: page });
    s.select('GD-CN', false, { range: true, order: page });
    expect([...s.selected()].sort()).toEqual(['TP-KD', 'TP-KT']);
  });

  it('retain drops rows that no longer exist; clear resets the range anchor', () => {
    const s = new NxtSelection<string>();
    s.setMany(['GD-KD', 'TP-KT'], true);
    s.retain(['TP-KT', 'TP-KD']);
    expect([...s.selected()]).toEqual(['TP-KT']);
    s.clear();
    s.select('TP-KD', true, { range: true, order: page });
    expect([...s.selected()]).toEqual(['TP-KD']);
  });
});

@Component({
  imports: [NxtTableScroll, NxtTable],
  template: `
    <nxt-table-scroll label="Bảng chức danh" [fill]="fill()">
      <table nxtTable stickyHeader><thead><tr><th scope="col">Mã</th></tr></thead><tbody><tr><td>KT-TH</td></tr></tbody></table>
    </nxt-table-scroll>
  `,
})
class ScrollHost {
  readonly fill = signal(true);
}

describe('NxtTableScroll', () => {
  it('is a named, focusable scrolling region (keyboard users can scroll it)', async () => {
    const fixture = TestBed.createComponent(ScrollHost);
    fixture.detectChanges();
    const region = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('nxt-table-scroll')!;
    expect(region.getAttribute('role')).toBe('region');
    expect(region.getAttribute('aria-label')).toBe('Bảng chức danh');
    expect(region.tabIndex).toBe(0);
    expect(region.hasAttribute('data-fill')).toBe(true);
    fixture.componentInstance.fill.set(false);
    await fixture.whenStable();
    expect(region.hasAttribute('data-fill')).toBe(false);
  });
});

@Component({
  imports: [NxtTable, NxtRowActions],
  template: `
    <table nxtTable aria-label="Chức danh">
      <thead>
        <tr>
          <th scope="col">Tên</th>
          <th scope="col" nxtRowActions [reveal]="reveal()"></th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row">Kế toán thuế</th>
          <td nxtRowActions [reveal]="reveal()">
            <button type="button" aria-label="Sửa Kế toán thuế">S</button>
            <button type="button" aria-label="Xoá Kế toán thuế">X</button>
          </td>
        </tr>
        <tr>
          <th scope="row">Lái xe</th>
          <td nxtRowActions><button type="button" aria-label="Sửa Lái xe">S</button></td>
        </tr>
      </tbody>
    </table>
    <button type="button" class="outside">Ngoài bảng</button>
  `,
})
class RowActionsHost {
  readonly reveal = signal<'hover' | 'always'>('hover');
}

describe('NxtRowActions', () => {
  async function setup() {
    const fixture = TestBed.createComponent(RowActionsHost);
    fixture.detectChanges();
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    const cells = [...el.querySelectorAll<HTMLElement>('td[nxtRowActions]')];
    const rows = [...el.querySelectorAll<HTMLElement>('tbody tr')];
    const escape = async () => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await fixture.whenStable();
    };
    const hover = async (row: HTMLElement, on: boolean) => {
      row.dispatchEvent(new MouseEvent(on ? 'mouseenter' : 'mouseleave'));
      await fixture.whenStable();
    };
    return { fixture, host: fixture.componentInstance, el, cells, rows, escape, hover };
  }

  it('the header cell is a real column header with a hidden name', async () => {
    const { el } = await setup();
    const th = el.querySelector<HTMLElement>('th[nxtRowActions]')!;
    expect(th.getAttribute('scope')).toBe('col');
    expect(th.querySelector('.nxt-visually-hidden')!.textContent).toBe('Thao tác');
    expect(th.querySelector('.nxt-row-actions__bar')).toBeNull();
  });

  it('each row cell keeps its buttons, in DOM order, inside the bar', async () => {
    const { cells } = await setup();
    const bar = cells[0].querySelector('.nxt-row-actions__bar')!;
    expect([...bar.querySelectorAll('button')].map((b) => b.getAttribute('aria-label'))).toEqual(['Sửa Kế toán thuế', 'Xoá Kế toán thuế']);
    expect(cells[0].classList).toContain('nxt-row-actions');
  });

  it('reflects reveal (default hover)', async () => {
    const { fixture, host, cells } = await setup();
    expect(cells[0].getAttribute('data-reveal')).toBe('hover');
    host.reveal.set('always');
    await fixture.whenStable();
    expect(cells[0].getAttribute('data-reveal')).toBe('always');
  });

  it('Escape hides what hover revealed until the pointer leaves the row; other rows are untouched', async () => {
    const { cells, rows, escape, hover } = await setup();
    await hover(rows[0], true);
    await escape();
    expect(cells[0].hasAttribute('data-dismissed')).toBe(true);
    expect(cells[1].hasAttribute('data-dismissed')).toBe(false);
    await hover(rows[0], false);
    expect(cells[0].hasAttribute('data-dismissed')).toBe(false);
  });

  it('Escape does nothing when the row is not hovered', async () => {
    const { cells, escape } = await setup();
    await escape();
    expect(cells[0].hasAttribute('data-dismissed')).toBe(false);
  });

  it('Escape never hides the bar while focus is inside it', async () => {
    const { cells, rows, escape, hover } = await setup();
    await hover(rows[0], true);
    cells[0].querySelector('button')!.focus();
    await escape();
    expect(cells[0].hasAttribute('data-dismissed')).toBe(false);
  });
});

describe('NxtSelection.retain after the results change', () => {
  it('returns how many selected keys were dropped (rows filtered out of view)', () => {
    const s = new NxtSelection<string>();
    s.setMany(['GD-KD', 'TP-KT', 'TP-NS'], true);
    const before = s.selected();
    expect(s.retain(['GD-KD', 'TP-KT', 'TP-NS', 'TP-KD'])).toBe(0);
    expect(s.selected()).toBe(before);
    expect(s.retain(['TP-KT'])).toBe(2);
    expect([...s.selected()]).toEqual(['TP-KT']);
  });
});

@Component({
  imports: [NxtTable, NxtTablePlaceholder],
  template: `
    <table nxtTable aria-label="Nhân viên" [loading]="loading()">
      <thead><tr><th scope="col">Họ và tên</th><th scope="col">Phòng ban</th><th scope="col">Lương</th></tr></thead>
      @if (first()) {
        <tbody nxtTablePlaceholder [columns]="3" [rows]="4"></tbody>
      } @else {
        <tbody><tr data-highlight="warning" aria-current="true"><th scope="row">Lê Minh Anh</th><td>Kế toán</td><td>18.000.000</td></tr></tbody>
      }
    </table>
  `,
})
class LoadingHost {
  readonly loading = signal(true);
  readonly first = signal(true);
}

describe('NxtTable loading', () => {
  it('loading sets aria-busy and data-loading; off removes both', async () => {
    const fixture = TestBed.createComponent(LoadingHost);
    fixture.detectChanges();
    const table = (fixture.nativeElement as HTMLElement).querySelector('table')!;
    expect(table.getAttribute('aria-busy')).toBe('true');
    expect(table.hasAttribute('data-loading')).toBe(true);
    fixture.componentInstance.loading.set(false);
    fixture.componentInstance.first.set(false);
    await fixture.whenStable();
    expect(table.hasAttribute('aria-busy')).toBe(false);
    expect(table.hasAttribute('data-loading')).toBe(false);
    // Row states are plain attributes the page sets; the table keeps them as they are.
    const row = table.querySelector('tbody tr')!;
    expect(row.getAttribute('data-highlight')).toBe('warning');
    expect(row.getAttribute('aria-current')).toBe('true');
  });

  it('placeholder rows: rows × columns cells with a bar, hidden from screen readers', () => {
    const fixture = TestBed.createComponent(LoadingHost);
    fixture.detectChanges();
    const body = (fixture.nativeElement as HTMLElement).querySelector('tbody')!;
    expect(body.classList).toContain('nxt-table-placeholder');
    expect(body.getAttribute('aria-hidden')).toBe('true');
    const rows = body.querySelectorAll('tr');
    expect(rows.length).toBe(4);
    expect(rows[0].querySelectorAll('td .nxt-table__placeholder-bar').length).toBe(3);
  });
});

describe('NxtTableScroll scrolled sideways', () => {
  it('reflects data-scrolled once the region leaves its start edge', async () => {
    const fixture = TestBed.createComponent(ScrollHost);
    fixture.detectChanges();
    await fixture.whenStable();
    const region = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('nxt-table-scroll')!;
    expect(region.hasAttribute('data-scrolled')).toBe(false);
    Object.defineProperty(region, 'scrollLeft', { configurable: true, get: () => 120 });
    region.dispatchEvent(new Event('scroll'));
    await fixture.whenStable();
    expect(region.hasAttribute('data-scrolled')).toBe(true);
    Object.defineProperty(region, 'scrollLeft', { configurable: true, get: () => 0 });
    region.dispatchEvent(new Event('scroll'));
    await fixture.whenStable();
    expect(region.hasAttribute('data-scrolled')).toBe(false);
  });
});
