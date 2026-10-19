import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NxtPagination, nxtPageItems } from './pagination';

describe('nxtPageItems', () => {
  it('lists every page when there are 7 or fewer', () => {
    expect(nxtPageItems(1, 1)).toEqual([1]);
    expect(nxtPageItems(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('keeps first, last and the neighbours of the current page', () => {
    expect(nxtPageItems(1, 20)).toEqual([1, 2, 3, 4, 5, '…', 20]);
    expect(nxtPageItems(10, 20)).toEqual([1, '…', 9, 10, 11, '…', 20]);
    expect(nxtPageItems(20, 20)).toEqual([1, '…', 16, 17, 18, 19, 20]);
  });

  it('never hides a single page behind a gap', () => {
    expect(nxtPageItems(4, 20)).toEqual([1, 2, 3, 4, 5, '…', 20]);
    expect(nxtPageItems(17, 20)).toEqual([1, '…', 16, 17, 18, 19, 20]);
    for (let count = 8; count <= 30; count++) {
      for (let page = 1; page <= count; page++) {
        const items = nxtPageItems(page, count);
        items.forEach((item, i) => {
          if (item !== '…') return;
          const before = items[i - 1] as number;
          const after = items[i + 1] as number;
          expect(after - before).toBeGreaterThan(2);
        });
      }
    }
  });

  it('always uses 7 slots beyond 7 pages, so the control does not change width while paging', () => {
    for (let page = 1; page <= 50; page++) expect(nxtPageItems(page, 50)).toHaveLength(7);
  });
});

@Component({
  imports: [NxtPagination],
  template: `<nxt-pagination [total]="total()" [(page)]="page" [(pageSize)]="size" itemLabel="nhân viên" />`,
})
class Host {
  readonly total = signal(1284);
  readonly page = signal(1);
  readonly size = signal(20);
}

describe('NxtPagination', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const button = (name: string) => el.querySelector<HTMLButtonElement>(`button[aria-label="${name}"]`)!;
    const summary = () => el.querySelector('.nxt-pagination__summary')!.textContent!.replace(/\s+/g, ' ').trim();
    return { fixture, host: fixture.componentInstance, el, button, summary };
  }

  it('summarises the visible range with Vietnamese number formatting', () => {
    const { summary } = setup();
    expect(summary()).toBe('Hiển thị 1–20 trong 1.284 nhân viên');
  });

  it('marks the current page and disables previous on the first page', async () => {
    const { fixture, host, button, summary } = setup();
    expect(button('Trang trước').getAttribute('aria-disabled')).toBe('true');
    expect(button('Trang 1').getAttribute('aria-current')).toBe('page');
    button('Trang sau').click();
    await fixture.whenStable();
    expect(host.page()).toBe(2);
    expect(summary()).toBe('Hiển thị 21–40 trong 1.284 nhân viên');
    expect(button('Trang 2').getAttribute('aria-current')).toBe('page');
    expect(button('Trang 1').hasAttribute('aria-current')).toBe(false);
  });

  it('returns to page 1 when the page size changes', async () => {
    const { fixture, host, el } = setup();
    host.page.set(5);
    await fixture.whenStable();
    const select = el.querySelector('select')!;
    select.value = '50';
    select.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(host.size()).toBe(50);
    expect(host.page()).toBe(1);
  });

  it('moves back to the last existing page when the total shrinks (e.g. after filtering)', async () => {
    const { fixture, host, summary } = setup();
    host.page.set(10);
    await fixture.whenStable();
    host.total.set(45);
    await fixture.whenStable();
    expect(host.page()).toBe(3);
    expect(summary()).toBe('Hiển thị 41–45 trong 45 nhân viên');
  });

  it('keeps focus where it was: "Trang sau" stays focusable on the last page, page buttons are tracked by number', async () => {
    const { fixture, host, el, button } = setup();
    host.page.set(64);
    await fixture.whenStable();
    const next = button('Trang sau');
    next.focus();
    next.click();
    await fixture.whenStable();
    expect(host.page()).toBe(65);
    expect(document.activeElement).toBe(next);
    expect(next.getAttribute('aria-disabled')).toBe('true');
    next.click();
    await fixture.whenStable();
    expect(host.page()).toBe(65);

    host.page.set(5);
    await fixture.whenStable();
    const six = button('Trang 6');
    six.focus();
    six.click();
    await fixture.whenStable();
    expect(document.activeElement).toBe(el.querySelector('button[aria-label="Trang 6"]'));
  });

  it('says there is nothing to show when the total is 0', async () => {
    const { fixture, host, button, summary } = setup();
    host.total.set(0);
    await fixture.whenStable();
    expect(summary()).toBe('Không có nhân viên');
    expect(button('Trang sau').getAttribute('aria-disabled')).toBe('true');
  });
});
