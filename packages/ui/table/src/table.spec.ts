import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NxtSort, NxtSortHeader, NxtSortState, NxtTable } from './table';

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
