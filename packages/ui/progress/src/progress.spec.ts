import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NxtProgress, NxtProgressShape, NxtProgressSize } from './progress';

@Component({
  imports: [NxtProgress],
  template: `
    <nxt-progress
      [label]="label()"
      [value]="value()"
      [valueText]="valueText()"
      [tone]="tone()"
      [indeterminate]="indeterminate()"
      [shape]="shape()"
      [size]="size()"
    >
      72%
    </nxt-progress>
  `,
})
class Host {
  readonly label = signal('Nhập hồ sơ');
  readonly value = signal<number | string>(30);
  readonly valueText = signal<string | undefined>(undefined);
  readonly tone = signal<'brand' | 'success' | 'warning' | 'danger'>('brand');
  readonly indeterminate = signal(false);
  readonly shape = signal<NxtProgressShape>('bar');
  readonly size = signal<NxtProgressSize>('md');
}

@Component({
  imports: [NxtProgress],
  template: `<nxt-progress label="Tỉ lệ nộp hồ sơ" value="42" />`,
})
class DefaultsHost {}

describe('NxtProgress', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement.querySelector('nxt-progress');
    const update = () => fixture.detectChanges();
    return { fixture, el, host: fixture.componentInstance, update };
  }

  describe('determinate bar (default)', () => {
    it('is a progressbar with a name, a range and the rounded value', () => {
      const { el, host, update } = setup();
      expect(el.getAttribute('role')).toBe('progressbar');
      expect(el.getAttribute('aria-label')).toBe('Nhập hồ sơ');
      expect(el.getAttribute('aria-valuemin')).toBe('0');
      expect(el.getAttribute('aria-valuemax')).toBe('100');
      expect(el.getAttribute('aria-valuenow')).toBe('30');
      host.value.set(33.6);
      update();
      expect(el.getAttribute('aria-valuenow')).toBe('34');
    });

    it('clamps the value to 0–100 and accepts a numeric string', () => {
      const { el, host, update } = setup();
      host.value.set(250);
      update();
      expect(el.getAttribute('aria-valuenow')).toBe('100');
      host.value.set(-5);
      update();
      expect(el.getAttribute('aria-valuenow')).toBe('0');
      host.value.set('64');
      update();
      expect(el.getAttribute('aria-valuenow')).toBe('64');
    });

    it('sets the fill width to the percentage and mirrors tone and shape as data attributes', () => {
      const { el, host, update } = setup();
      const fill = el.querySelector<HTMLElement>('.nxt-progress__fill')!;
      expect(fill.style.inlineSize).toBe('30%');
      expect(el.getAttribute('data-shape')).toBe('bar');
      expect(el.getAttribute('data-tone')).toBe('brand');
      host.tone.set('warning');
      update();
      expect(el.getAttribute('data-tone')).toBe('warning');
    });

    it('reads aria-valuetext only when valueText is given', () => {
      const { el, host, update } = setup();
      expect(el.hasAttribute('aria-valuetext')).toBe(false);
      host.valueText.set('12 trên 40 hồ sơ');
      update();
      expect(el.getAttribute('aria-valuetext')).toBe('12 trên 40 hồ sơ');
    });

    it('keeps size and the centre label for the circle only', () => {
      const { el } = setup();
      expect(el.hasAttribute('data-size')).toBe(false);
      expect(el.hasAttribute('data-indeterminate')).toBe(false);
      expect(el.querySelector('svg')).toBeNull();
      expect(el.querySelector('.nxt-progress__label')).toBeNull();
      expect(el.textContent).not.toContain('72%');
    });
  });

  describe('indeterminate', () => {
    it('drops aria-valuenow (the ARIA signal for "unknown") but keeps role, name and range', () => {
      const { el, host, update } = setup();
      host.indeterminate.set(true);
      update();
      expect(el.getAttribute('role')).toBe('progressbar');
      expect(el.getAttribute('aria-label')).toBe('Nhập hồ sơ');
      expect(el.hasAttribute('aria-valuenow')).toBe(false);
      expect(el.getAttribute('aria-valuemin')).toBe('0');
      expect(el.getAttribute('aria-valuemax')).toBe('100');
      expect(el.getAttribute('data-indeterminate')).toBe('true');
    });

    it('ignores value: the bar segment has no inline width of its own', () => {
      const { el, host, update } = setup();
      host.indeterminate.set(true);
      update();
      const fill = el.querySelector<HTMLElement>('.nxt-progress__fill')!;
      expect(fill.style.inlineSize).toBe('');
    });

    it('can still be given a spoken status', () => {
      const { el, host, update } = setup();
      host.indeterminate.set(true);
      host.valueText.set('Đang xử lý');
      update();
      expect(el.getAttribute('aria-valuetext')).toBe('Đang xử lý');
    });

    it('returns to a determinate value when the task becomes measurable', () => {
      const { el, host, update } = setup();
      host.indeterminate.set(true);
      update();
      host.indeterminate.set(false);
      update();
      expect(el.getAttribute('aria-valuenow')).toBe('30');
      expect(el.hasAttribute('data-indeterminate')).toBe(false);
    });
  });

  describe('circle', () => {
    function circle() {
      const ctx = setup();
      ctx.host.shape.set('circle');
      ctx.update();
      return ctx;
    }

    it('draws a decorative SVG ring and keeps the same progressbar semantics', () => {
      const { el } = circle();
      const svg = el.querySelector('svg')!;
      expect(svg.getAttribute('aria-hidden')).toBe('true');
      expect(svg.getAttribute('focusable')).toBe('false');
      expect(svg.querySelectorAll('circle').length).toBe(2);
      expect(el.getAttribute('data-shape')).toBe('circle');
      expect(el.getAttribute('role')).toBe('progressbar');
      expect(el.getAttribute('aria-valuenow')).toBe('30');
      expect(el.querySelector('.nxt-progress__fill')).toBeNull();
    });

    it('sets the arc to the percentage of the ring (pathLength 100)', () => {
      const { el, host, update } = circle();
      const fill = el.querySelector('.nxt-progress__ring-fill')!;
      expect(fill.getAttribute('pathLength')).toBe('100');
      expect(fill.getAttribute('stroke-dasharray')).toBe('30 100');
      host.value.set(100);
      update();
      expect(fill.getAttribute('stroke-dasharray')).toBe('100 100');
      host.value.set(0);
      update();
      expect(fill.getAttribute('stroke-dasharray')).toBe('0 100');
    });

    it('reflects size (md by default) as data-size', () => {
      const { el, host, update } = circle();
      expect(el.getAttribute('data-size')).toBe('md');
      host.size.set('lg');
      update();
      expect(el.getAttribute('data-size')).toBe('lg');
      host.size.set('sm');
      update();
      expect(el.getAttribute('data-size')).toBe('sm');
    });

    it('projects the centre label into the ring', () => {
      const { el } = circle();
      expect(el.querySelector('.nxt-progress__label')!.textContent!.trim()).toBe('72%');
    });

    it('indeterminate: no aria-valuenow and no fixed arc (CSS draws a spinning arc)', () => {
      const { el, host, update } = circle();
      host.indeterminate.set(true);
      update();
      expect(el.hasAttribute('aria-valuenow')).toBe(false);
      expect(el.getAttribute('data-indeterminate')).toBe('true');
      const fill = el.querySelector('.nxt-progress__ring-fill')!;
      expect(fill.hasAttribute('stroke-dasharray')).toBe(false);
    });
  });

  it('works as before when only label and value are given', () => {
    const fixture = TestBed.createComponent(DefaultsHost);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement.querySelector('nxt-progress');
    expect(el.getAttribute('aria-label')).toBe('Tỉ lệ nộp hồ sơ');
    expect(el.getAttribute('aria-valuenow')).toBe('42');
    expect(el.getAttribute('data-shape')).toBe('bar');
    expect(el.getAttribute('data-tone')).toBe('brand');
    expect(el.querySelector<HTMLElement>('.nxt-progress__fill')!.style.inlineSize).toBe('42%');
  });
});
