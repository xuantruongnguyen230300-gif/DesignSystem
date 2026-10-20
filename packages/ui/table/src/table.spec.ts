import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NxtSelection, NxtSort, NxtSortHeader, NxtSortState, NxtTable, NxtTableScroll } from './table';

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
