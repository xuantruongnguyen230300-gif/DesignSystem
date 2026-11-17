import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NxtSkeleton, NxtSkeletonVariant, nxtDeferredLoading } from './skeleton';

@Component({
  imports: [NxtSkeleton],
  template: `<nxt-skeleton [variant]="variant()" [lines]="lines()" size="lg" width="medium" />`,
})
class Host {
  readonly variant = signal<NxtSkeletonVariant>('text');
  readonly lines = signal(1);
}

@Component({ template: '' })
class TimingHost {
  readonly loading = signal(false);
  readonly shown = nxtDeferredLoading(this.loading, { delay: 1000, minDuration: 500 });
}

describe('NxtSkeleton', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement.querySelector('nxt-skeleton');
    return { fixture, el, host: fixture.componentInstance };
  }

  it('is hidden from assistive tech and not focusable', () => {
    const { el } = setup();
    expect(el.getAttribute('aria-hidden')).toBe('true');
    expect(el.querySelector('[tabindex], a, button, input')).toBeNull();
  });

  it('renders one bar per text line and marks several lines so the last one is shorter', () => {
    const { fixture, el, host } = setup();
    expect(el.querySelectorAll('.nxt-skeleton__line').length).toBe(1);
    expect(el.getAttribute('data-lines')).toBeNull();
    host.lines.set(3);
    fixture.detectChanges();
    expect(el.querySelectorAll('.nxt-skeleton__line').length).toBe(3);
    expect(el.getAttribute('data-lines')).toBe('multi');
  });

  it('treats an invalid line count as one line', () => {
    const { fixture, el, host } = setup();
    host.lines.set(0);
    fixture.detectChanges();
    expect(el.querySelectorAll('.nxt-skeleton__line').length).toBe(1);
  });

  it('reflects variant, width and (for circles) size as data attributes', () => {
    const { fixture, el, host } = setup();
    expect(el.getAttribute('data-variant')).toBe('text');
    expect(el.getAttribute('data-width')).toBe('medium');
    expect(el.getAttribute('data-size')).toBeNull();
    host.variant.set('circle');
    fixture.detectChanges();
    expect(el.getAttribute('data-variant')).toBe('circle');
    expect(el.getAttribute('data-size')).toBe('lg');
    expect(el.getAttribute('data-width')).toBeNull();
    expect(el.querySelector('.nxt-skeleton__line')).toBeNull();
  });
});

describe('nxtDeferredLoading', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  function setup() {
    const fixture = TestBed.createComponent(TimingHost);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    const set = (value: boolean) => {
      host.loading.set(value);
      TestBed.tick();
    };
    return { fixture, host, set };
  }

  it('shows nothing for loads that finish before the delay', () => {
    const { host, set } = setup();
    set(true);
    vi.advanceTimersByTime(900);
    expect(host.shown()).toBe(false);
    set(false);
    vi.advanceTimersByTime(2000);
    expect(host.shown()).toBe(false);
  });

  it('shows after the delay and keeps showing for the minimum duration', () => {
    const { host, set } = setup();
    set(true);
    vi.advanceTimersByTime(1000);
    expect(host.shown()).toBe(true);
    // Loaded 300 ms after it appeared: stays until 500 ms have passed.
    vi.advanceTimersByTime(300);
    set(false);
    expect(host.shown()).toBe(true);
    vi.advanceTimersByTime(199);
    expect(host.shown()).toBe(true);
    vi.advanceTimersByTime(1);
    expect(host.shown()).toBe(false);
  });

  it('hides at once when it has already been shown long enough', () => {
    const { host, set } = setup();
    set(true);
    vi.advanceTimersByTime(1000 + 800);
    set(false);
    expect(host.shown()).toBe(false);
  });

  it('stays shown when loading starts again during the minimum duration', () => {
    const { host, set } = setup();
    set(true);
    vi.advanceTimersByTime(1100);
    set(false);
    set(true);
    vi.advanceTimersByTime(1000);
    expect(host.shown()).toBe(true);
  });
});
