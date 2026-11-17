import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { provideNxt } from './provide-nxt';
import { NXT_SCALE_STEPS, createNxtScale } from './theme/scale';
import { NxtTheme } from './theme/theme';

const attrs = ['brand', 'color', 'density', 'motion'].map((a) => `data-nxt-${a}`);

function setup(options?: Parameters<typeof provideNxt>[0]): HTMLElement {
  TestBed.configureTestingModule({ providers: [provideNxt(options)] });
  return TestBed.inject(DOCUMENT).documentElement;
}

describe('provideNxt', () => {
  afterEach(() => {
    const root = document.documentElement;
    for (const a of attrs) root.removeAttribute(a);
    root.removeAttribute('style');
    vi.restoreAllMocks();
  });

  it('is a working default: writes nothing when called without options', () => {
    const root = setup();
    for (const a of attrs) expect(root.hasAttribute(a)).toBe(false);
  });

  it('writes the given axes on <html>', () => {
    const root = setup({ brand: 'sample', color: 'auto', density: 'compact', motion: 'reduced' });
    expect(root.getAttribute('data-nxt-brand')).toBe('sample');
    expect(root.getAttribute('data-nxt-color')).toBe('auto');
    expect(root.getAttribute('data-nxt-density')).toBe('compact');
    expect(root.getAttribute('data-nxt-motion')).toBe('reduced');
  });

  it('only writes the axes that were given', () => {
    const root = setup({ density: 'spacious' });
    expect(root.getAttribute('data-nxt-density')).toBe('spacious');
    expect(root.hasAttribute('data-nxt-color')).toBe(false);
    expect(root.hasAttribute('data-nxt-brand')).toBe(false);
  });

  describe('primary', () => {
    const brand = (root: HTMLElement) => NXT_SCALE_STEPS.map((step) => root.style.getPropertyValue(`--nxt-color-brand-${step}`));
    const warn = () => vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    it('turns a seed color into the 11 brand variables on <html>', () => {
      const root = setup({ primary: '#0f766e' });
      expect(brand(root)).toEqual(Object.values(createNxtScale('#0f766e')));
    });

    it('writes a hand-made scale as it is', () => {
      const own = Object.fromEntries(NXT_SCALE_STEPS.map((step) => [step, `rgb(${step % 256} 0 0)`]));
      warn();
      const root = setup({ primary: own as never });
      expect(brand(root)).toEqual(Object.values(own));
    });

    it('does not touch the brand variables when primary is omitted', () => {
      expect(brand(setup({ density: 'compact' }))).toEqual(NXT_SCALE_STEPS.map(() => ''));
    });

    it('works together with brand, density and color', () => {
      const root = setup({ primary: '#0f766e', brand: 'sample', density: 'compact' });
      expect(root.getAttribute('data-nxt-brand')).toBe('sample');
      expect(root.getAttribute('data-nxt-density')).toBe('compact');
      expect(brand(root)[6]).toBe(createNxtScale('#0f766e')[600]);
    });

    it('leaves the default theme and warns when the color cannot be read', () => {
      const spy = warn();
      const root = setup({ primary: 'not-a-color' });
      expect(brand(root)).toEqual(NXT_SCALE_STEPS.map(() => ''));
      expect(spy).toHaveBeenCalledWith(expect.stringContaining('[nxt-theme]'), expect.stringContaining('Cannot parse'));
    });

    it('warns about low contrast but still applies the scale', () => {
      const spy = warn();
      const pale = { ...createNxtScale('#0f766e'), 600: '#FACC15' };
      const root = setup({ primary: pale });
      expect(brand(root)[6]).toBe('#FACC15');
      expect(spy).toHaveBeenCalledWith(expect.stringMatching(/contrast.*white text on brand-600/));
    });
  });

  describe('NxtTheme', () => {
    it('changes the primary color at run time and resets it', () => {
      const root = setup({ primary: '#0f766e' });
      const theme = TestBed.inject(NxtTheme);
      expect(theme.primary()).toBe('#0f766e');

      expect(theme.setPrimary('#e11d48')).toBe(true);
      expect(root.style.getPropertyValue('--nxt-color-brand-500')).toBe('#E11D48');
      expect(theme.primary()).toBe('#e11d48');

      theme.resetPrimary();
      expect(theme.primary()).toBeNull();
      for (const step of NXT_SCALE_STEPS) expect(root.style.getPropertyValue(`--nxt-color-brand-${step}`)).toBe('');
    });

    it('returns false and keeps the current color when the new one is unusable', () => {
      vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const root = setup({ primary: '#0f766e' });
      const theme = TestBed.inject(NxtTheme);
      expect(theme.setPrimary('nope')).toBe(false);
      expect(theme.setPrimary({ 50: '#fff' } as never)).toBe(false);
      expect(theme.primary()).toBe('#0f766e');
      expect(root.style.getPropertyValue('--nxt-color-brand-600')).toBe(createNxtScale('#0f766e')[600]);
    });
  });
});
