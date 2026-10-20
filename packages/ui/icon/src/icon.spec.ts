import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NxtIcon } from './icon';
import { NXT_ICONS } from './icons.generated';

@Component({
  imports: [NxtIcon],
  template: `
    <nxt-icon name="search" />
    <nxt-icon name="alert-circle" label="Lỗi" size="lg" />
  `,
})
class Host {}

describe('NxtIcon', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const icons = [...(fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('nxt-icon')];
    return { icons, svg: (i: number) => icons[i].querySelector('svg')! };
  }

  it('is decorative by default: hidden from assistive tech and not focusable', () => {
    const { svg, icons } = setup();
    expect(svg(0).getAttribute('aria-hidden')).toBe('true');
    expect(svg(0).hasAttribute('role')).toBe(false);
    expect(svg(0).getAttribute('focusable')).toBe('false');
    expect(icons[0].hasAttribute('data-size')).toBe(false);
  });

  it('becomes an image with a name when given a label', () => {
    const { svg, icons } = setup();
    expect(svg(1).getAttribute('role')).toBe('img');
    expect(svg(1).getAttribute('aria-label')).toBe('Lỗi');
    expect(svg(1).hasAttribute('aria-hidden')).toBe(false);
    expect(icons[1].dataset['size']).toBe('lg');
  });

  it('renders the paths of the curated set as elements (no innerHTML, CSP-safe)', () => {
    const { svg } = setup();
    expect(svg(0).querySelectorAll('path').length).toBe(NXT_ICONS['search'].length);
    expect(svg(0).getAttribute('stroke')).toBe('currentColor');
  });

  it('ships a non-empty curated set', () => {
    expect(Object.keys(NXT_ICONS).length).toBeGreaterThan(200);
    for (const [name, paths] of Object.entries(NXT_ICONS)) expect(paths.length, name).toBeGreaterThan(0);
  });
});
