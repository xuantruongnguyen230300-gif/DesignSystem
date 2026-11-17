import { DOCUMENT } from '@angular/common';
import { Injectable, inject, isDevMode, signal } from '@angular/core';
import { NxtScale, NxtScaleStep, NXT_SCALE_STEPS, checkNxtScale, createNxtScale, isNxtScale } from './scale';

/** What a product passes to recolor NXT: one seed color, or a full 11-step scale made by a designer. */
export type NxtPrimary = string | NxtScale;

const property = (step: NxtScaleStep) => `--nxt-color-brand-${step}`;

/**
 * Changes the brand (primary) color at run time, with no rebuild and no extra CSS.
 *
 * It writes the 11 `--nxt-color-brand-*` variables on `<html>` through the CSSOM (`style.setProperty`), so it works under a
 * strict Content-Security-Policy and beats every stylesheet. Buttons, links, selection, focus ring, sliders and so on follow,
 * in light and dark mode. Status colors (danger, success, warning, info) never change.
 *
 * ```ts
 * inject(NxtTheme).setPrimary('#0f766e');   // a seed color: the scale is generated
 * inject(NxtTheme).setPrimary(myScale);     // or a full scale: { 50: '…', 100: '…', … 950: '…' }
 * inject(NxtTheme).resetPrimary();          // back to the product's CSS (core.css or data-nxt-brand)
 * ```
 */
@Injectable({ providedIn: 'root' })
export class NxtTheme {
  private readonly root = inject(DOCUMENT).documentElement;
  private readonly current = signal<NxtPrimary | null>(null);

  /** What was last passed to `setPrimary`, or `null` while the CSS default is in effect. */
  readonly primary = this.current.asReadonly();

  /**
   * Applies a new brand color. Returns `false` and leaves the theme as it was when the color cannot be used
   * (the reason is logged in development).
   */
  setPrimary(value: NxtPrimary): boolean {
    let scale: NxtScale;
    try {
      if (typeof value === 'string') scale = createNxtScale(value);
      else if (isNxtScale(value)) scale = value;
      else throw new Error('A scale needs a color for each of the steps 50, 100, 200 … 950.');
    } catch (error) {
      if (isDevMode()) console.warn('[nxt-theme] primary was not applied.', error instanceof Error ? error.message : error);
      return false;
    }
    if (isDevMode()) {
      const darkSurface = getComputedStyle(this.root).getPropertyValue('--nxt-color-neutral-900').trim();
      for (const issue of checkNxtScale(scale, darkSurface || undefined)) console.warn(`[nxt-theme] contrast (WCAG 2.2 AA) — ${issue}`);
    }
    for (const step of NXT_SCALE_STEPS) this.root.style.setProperty(property(step), scale[step]);
    this.current.set(value);
    return true;
  }

  /** Removes what `setPrimary` wrote, so the brand from the stylesheets applies again. */
  resetPrimary(): void {
    for (const step of NXT_SCALE_STEPS) this.root.style.removeProperty(property(step));
    this.current.set(null);
  }
}
