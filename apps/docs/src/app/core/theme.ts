import { DOCUMENT, Injectable, effect, inject, signal } from '@angular/core';

export type ColorPref = 'light' | 'dark' | 'auto';
export type DensityPref = 'comfortable' | 'compact' | 'spacious';

const KEY = 'nxt-docs-theme';
const COLORS: ColorPref[] = ['light', 'dark', 'auto'];
const DENSITIES: DensityPref[] = ['comfortable', 'compact', 'spacious'];

/**
 * Page-level theme: writes data-nxt-color / data-nxt-density / data-nxt-brand on <html>.
 * Query params (?color=dark&density=compact&brand=sample) win over the saved preference,
 * so tests and shared links render deterministically.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly doc = inject(DOCUMENT);
  readonly color = signal<ColorPref>('auto');
  readonly density = signal<DensityPref>('comfortable');
  /** `''` = NXT core brand. */
  readonly brand = signal<string>('');

  constructor() {
    this.restore();
    effect(() => {
      const root = this.doc.documentElement;
      root.setAttribute('data-nxt-color', this.color());
      root.setAttribute('data-nxt-density', this.density());
      if (this.brand()) root.setAttribute('data-nxt-brand', this.brand());
      else root.removeAttribute('data-nxt-brand');
      try {
        localStorage.setItem(KEY, JSON.stringify({ color: this.color(), density: this.density(), brand: this.brand() }));
      } catch {
        /* storage unavailable (private mode) — preference just isn't remembered */
      }
    });
  }

  private restore() {
    let saved: Partial<{ color: ColorPref; density: DensityPref; brand: string }> = {};
    try {
      saved = JSON.parse(localStorage.getItem(KEY) ?? '{}');
    } catch {
      saved = {};
    }
    const q = new URLSearchParams(this.doc.location?.search ?? '');
    const color = (q.get('color') ?? saved.color) as ColorPref;
    const density = (q.get('density') ?? saved.density) as DensityPref;
    const brand = q.get('brand') ?? saved.brand ?? '';
    if (COLORS.includes(color)) this.color.set(color);
    if (DENSITIES.includes(density)) this.density.set(density);
    if (/^[a-z0-9-]*$/.test(brand)) this.brand.set(brand);
  }
}
