import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NxtGap, NxtGrid, NxtGridColumns, NxtInline, NxtResponsiveSpan, NxtSpan, NxtSpanValue, NxtStack } from './layout';

@Component({
  imports: [NxtStack, NxtInline, NxtGrid, NxtSpan],
  template: `
    <nxt-stack [gap]="gap()" align="start"><span>A</span><span>B</span></nxt-stack>
    <nxt-inline justify="between" [wrap]="false"><span>A</span></nxt-inline>
    <nxt-grid [columns]="columns()" minItem="lg">
      <div id="item" [nxtSpan]="span()">Họ và tên</div>
    </nxt-grid>
  `,
})
class Host {
  readonly gap = signal<NxtGap>('md');
  readonly columns = signal<NxtGridColumns>(12);
  readonly span = signal<NxtSpanValue | NxtResponsiveSpan>(6);
}

describe('layout primitives', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const q = (s: string) => fixture.nativeElement.querySelector(s) as HTMLElement;
    const update = (fn: (h: Host) => void) => {
      fn(fixture.componentInstance);
      fixture.detectChanges();
    };
    return { q, update };
  }

  it('nxt-stack reflects gap and align', () => {
    const { q, update } = setup();
    const stack = q('nxt-stack');
    expect(stack.classList).toContain('nxt-stack');
    expect(stack.dataset['gap']).toBe('md');
    expect(stack.dataset['align']).toBe('start');
    update((h) => h.gap.set('xl'));
    expect(stack.dataset['gap']).toBe('xl');
  });

  it('nxt-inline reflects justify and nowrap', () => {
    const { q } = setup();
    const inline = q('nxt-inline');
    expect(inline.dataset['justify']).toBe('between');
    expect(inline.hasAttribute('data-nowrap')).toBe(true);
    expect(inline.dataset['gap']).toBe('sm');
  });

  it('nxt-grid projects content into the track and exposes the column count', () => {
    const { q } = setup();
    const grid = q('nxt-grid');
    expect(grid.dataset['gap']).toBe('gutter');
    expect(grid.style.getPropertyValue('--_columns')).toBe('12');
    expect(grid.hasAttribute('data-min-item')).toBe(false);
    expect(q('.nxt-grid__track > #item')).toBeTruthy();
  });

  it('nxt-grid auto mode drops the column count and sets min item width', () => {
    const { q, update } = setup();
    update((h) => h.columns.set('auto'));
    const grid = q('nxt-grid');
    expect(grid.dataset['columns']).toBe('auto');
    expect(grid.dataset['minItem']).toBe('lg');
    expect(grid.style.getPropertyValue('--_columns')).toBe('');
  });

  it('nxtSpan accepts a number, full, or a responsive object', () => {
    const { q, update } = setup();
    const item = q('#item');
    expect(item.dataset['span']).toBe('6');
    update((h) => h.span.set('full'));
    expect(item.dataset['span']).toBe('full');
    update((h) => h.span.set({ base: 12, md: 6, xl: 4 }));
    expect(item.dataset['span']).toBe('12');
    expect(item.dataset['spanMd']).toBe('6');
    expect(item.dataset['spanXl']).toBe('4');
    expect(item.hasAttribute('data-span-sm')).toBe(false);
  });
});
