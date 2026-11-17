import { DOCUMENT } from '@angular/common';
import {
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  provideEnvironmentInitializer,
} from '@angular/core';
import { NxtPrimary, NxtTheme } from './theme/theme';

export type NxtColorMode = 'light' | 'dark' | 'auto';
export type NxtDensity = 'comfortable' | 'compact' | 'spacious';
export type NxtMotion = 'full' | 'reduced';

export interface NxtOptions {
  /** Product slug (the file loaded from `@nxt/tokens/css/brands/<slug>.css`). Omit for the NXT core brand. */
  brand?: string;
  /**
   * Your own brand color, with no brand file: a seed such as `'#0f766e'` (the 11-step scale is generated) or a full
   * scale `{ 50: '…', … 950: '…' }`. It wins over `brand`. Change it later with `NxtTheme.setPrimary()`.
   */
  primary?: NxtPrimary;
  /** `auto` follows the operating system. Omit to use the light default. */
  color?: NxtColorMode;
  /** Control and row size. Omit for `comfortable`. */
  density?: NxtDensity;
  /** Omit to follow `prefers-reduced-motion`. */
  motion?: NxtMotion;
}

const AXES = ['brand', 'color', 'density', 'motion'] as const;

/**
 * One-line setup for NXT: writes `data-nxt-brand | color | density | motion` on `<html>` when the app starts, and applies
 * `primary` as the brand color. Every option is optional; `provideNxt()` with no arguments is a valid, working default.
 *
 * ```ts
 * bootstrapApplication(App, { providers: [provideNxt({ primary: '#0f766e', color: 'auto', density: 'compact' })] });
 * ```
 */
export function provideNxt(options: NxtOptions = {}): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideEnvironmentInitializer(() => {
      const root = inject(DOCUMENT).documentElement;
      for (const axis of AXES) {
        const value = options[axis];
        if (value) root.setAttribute(`data-nxt-${axis}`, value);
      }
      if (options.primary) inject(NxtTheme).setPrimary(options.primary);
    }),
  ]);
}
