import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NxtBadge, NxtTag } from './tag';

@Component({
  imports: [NxtTag, NxtBadge],
  template: `
    <nxt-tag tone="warning" dot>Chờ duyệt</nxt-tag>
    <nxt-tag tone="success" icon="circle-check" size="sm">Đã ký hợp đồng</nxt-tag>
    <nxt-tag>Khối Vận hành · Trung tâm Chăm sóc khách hàng miền Nam</nxt-tag>
    <nxt-tag wrap>Khối Vận hành · Trung tâm Chăm sóc khách hàng miền Nam</nxt-tag>
    <nxt-badge [value]="128" label="128 đơn chờ duyệt" />
  `,
})
class Host {}

/** jsdom has no layout: make the label report that its text is (or is not) wider than its box. */
function fakeWidths(label: HTMLElement, scroll: number, client: number) {
  Object.defineProperty(label, 'scrollWidth', { configurable: true, value: scroll });
  Object.defineProperty(label, 'clientWidth', { configurable: true, value: client });
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('NxtTag', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const tags = [...el.querySelectorAll<HTMLElement>('nxt-tag')];
    const label = (i: number) => tags[i].querySelector<HTMLElement>('.nxt-tag__label')!;
    return { fixture, el, tags, label };
  }

  afterEach(() => document.querySelectorAll('.cdk-overlay-container').forEach((c) => (c.innerHTML = '')));

  it('reflects tone, size and wrap; dot and icon are decorative', () => {
    const { tags } = setup();
    expect(tags[0].dataset['tone']).toBe('warning');
    expect(tags[0].querySelector('.nxt-tag__dot')!.getAttribute('aria-hidden')).toBe('true');
    expect(tags[1].dataset['size']).toBe('sm');
    expect(tags[1].querySelector('.nxt-tag__dot')).toBeNull();
    expect(tags[1].querySelector('nxt-icon svg')!.getAttribute('aria-hidden')).toBe('true');
    expect(tags[2].hasAttribute('data-wrap')).toBe(false);
    expect(tags[3].hasAttribute('data-wrap')).toBe(true);
  });

  it('is never a tab stop and keeps the full text in the DOM', () => {
    const { tags, label } = setup();
    for (const tag of tags) {
      expect(tag.hasAttribute('tabindex')).toBe(false);
      expect(tag.querySelector('[tabindex]')).toBeNull();
    }
    expect(label(2).textContent).toBe('Khối Vận hành · Trung tâm Chăm sóc khách hàng miền Nam');
  });

  it('shows the full text in a tooltip on hover when the label is cut off, without a second reading', async () => {
    const { fixture, label } = setup();
    fakeWidths(label(2), 320, 140);
    label(2).dispatchEvent(new MouseEvent('mouseenter'));
    await fixture.whenStable();
    await wait(350);
    const tooltip = document.querySelector('[role="tooltip"]');
    expect(tooltip!.textContent).toContain('Khối Vận hành · Trung tâm Chăm sóc khách hàng miền Nam');
    // Same text as the label's own: no aria-describedby, so screen readers read it once.
    expect(label(2).hasAttribute('aria-describedby')).toBe(false);
    label(2).dispatchEvent(new MouseEvent('mouseleave'));
    await wait(150);
    expect(document.querySelector('[role="tooltip"]')).toBeNull();
  });

  it('shows no tooltip when the label fits', async () => {
    const { fixture, label } = setup();
    fakeWidths(label(0), 64, 64);
    label(0).dispatchEvent(new MouseEvent('mouseenter'));
    await fixture.whenStable();
    await wait(350);
    expect(document.querySelector('[role="tooltip"]')).toBeNull();
  });

  it('a wrapping tag is never cut off, so it has no tooltip', async () => {
    const { fixture, label } = setup();
    fakeWidths(label(3), 320, 140);
    label(3).dispatchEvent(new MouseEvent('mouseenter'));
    await fixture.whenStable();
    await wait(350);
    expect(document.querySelector('[role="tooltip"]')).toBeNull();
  });
});

describe('NxtBadge', () => {
  it('reads its label instead of the shortened number', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const badge = (fixture.nativeElement as HTMLElement).querySelector('nxt-badge')!;
    const [shown, spoken] = [...badge.querySelectorAll('span')];
    expect(shown.textContent).toBe('99+');
    expect(shown.getAttribute('aria-hidden')).toBe('true');
    expect(spoken.classList).toContain('nxt-visually-hidden');
    expect(spoken.textContent).toBe('128 đơn chờ duyệt');
  });
});
