import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NxtSearch, nxtFold, nxtMatches } from './search';

describe('nxtFold / nxtMatches', () => {
  it('folds Vietnamese diacritics and case', () => {
    expect(nxtFold('Nguyễn Đức Thắng')).toBe('nguyen duc thang');
  });

  it('matches every word in any field, in any order, with or without diacritics', () => {
    expect(nxtMatches('ke toan tong', 'KT-TH', 'Kế toán tổng hợp')).toBe(true);
    expect(nxtMatches('hợp tổng', 'Kế toán tổng hợp')).toBe(true);
    expect(nxtMatches('kt-th', 'KT-TH', 'Kế toán tổng hợp')).toBe(true);
    expect(nxtMatches('ke toan thue', 'KT-TH', 'Kế toán tổng hợp')).toBe(false);
    expect(nxtMatches('   ', 'bất kỳ')).toBe(true);
    expect(nxtMatches('12', 'Nhân viên', 12, null)).toBe(true);
  });
});

@Component({
  imports: [NxtSearch],
  template: `
    <div (keydown)="outerKeys = outerKeys + 1">
      <nxt-search label="Tìm chức danh" placeholder="Mã hoặc tên" [debounce]="debounce()" [(value)]="query" (submitted)="submitted = $event" />
    </div>
  `,
})
class Host {
  readonly query = signal('');
  readonly debounce = signal(0);
  submitted = '';
  outerKeys = 0;
}

describe('NxtSearch', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const input = el.querySelector('input')!;
    const type = async (text: string) => {
      input.value = text;
      input.dispatchEvent(new Event('input'));
      await fixture.whenStable();
    };
    const key = async (k: string) => {
      input.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
      await fixture.whenStable();
    };
    return { fixture, host: fixture.componentInstance, el, input, type, key };
  }

  it('is a labelled native search box', () => {
    const { el, input } = setup();
    expect(input.type).toBe('search');
    expect(el.querySelector('label')!.htmlFor).toBe(input.id);
    expect(el.querySelector('label')!.textContent).toContain('Tìm chức danh');
    expect(input.placeholder).toBe('Mã hoặc tên');
  });

  it('updates the value as you type and shows a clear button that is not a Tab stop', async () => {
    const { host, el, type } = setup();
    expect(el.querySelector('.nxt-search__clear')).toBeNull();
    await type('ke toan');
    expect(host.query()).toBe('ke toan');
    const clear = el.querySelector<HTMLButtonElement>('.nxt-search__clear')!;
    expect(clear.getAttribute('aria-label')).toBe('Xoá nội dung tìm kiếm');
    expect(clear.tabIndex).toBe(-1);
    clear.click();
    await new Promise((r) => setTimeout(r));
    expect(host.query()).toBe('');
  });

  it('Escape clears and is consumed; on an empty box it passes through (e.g. to close a drawer)', async () => {
    const { host, input, type, key } = setup();
    await type('ke toan');
    await key('Escape');
    expect(host.query()).toBe('');
    expect(input.value).toBe('');
    expect(host.outerKeys).toBe(0);
    await key('Escape');
    expect(host.outerKeys).toBe(1);
  });

  it('follows the value when it is cleared from outside', async () => {
    const { fixture, host, input, type } = setup();
    await type('lap trinh');
    host.query.set('');
    await fixture.whenStable();
    expect(input.value).toBe('');
  });

  it('debounces, and Enter commits immediately and emits submitted', async () => {
    const { fixture, host, type, key } = setup();
    host.debounce.set(200);
    await fixture.whenStable();
    await type('kho');
    expect(host.query()).toBe('');
    await key('Enter');
    expect(host.query()).toBe('kho');
    expect(host.submitted).toBe('kho');
  });
});

describe('NxtSearch debounce + outside changes', () => {
  it('a value cleared from outside during the debounce is not overwritten by the old text', async () => {
    const fixture = TestBed.createComponent(Host);
    const host = fixture.componentInstance;
    host.debounce.set(50);
    fixture.detectChanges();
    await fixture.whenStable();
    const input = (fixture.nativeElement as HTMLElement).querySelector('input')!;
    host.query.set('ke toan');
    await fixture.whenStable();
    input.value = 'ke toan tong';
    input.dispatchEvent(new Event('input'));
    host.query.set('');
    fixture.detectChanges();
    await new Promise((r) => setTimeout(r, 80));
    await fixture.whenStable();
    expect(host.query()).toBe('');
    expect(input.value).toBe('');
  });
});
