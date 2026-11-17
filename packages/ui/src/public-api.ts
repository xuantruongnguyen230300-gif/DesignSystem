/*
 * @nxt/ui — components are published as secondary entry points so apps only ship what they import:
 *   import { NxtButton } from '@nxt/ui/button';
 *   import { NxtStack, NxtInline, NxtGrid, NxtSpan } from '@nxt/ui/layout';
 * Global styles (layer order, reset, base, utilities): @nxt/ui/styles/nxt.css
 */
export const NXT_UI_VERSION = '0.1.2';
export { provideNxt } from './provide-nxt';
export type { NxtColorMode, NxtDensity, NxtMotion, NxtOptions } from './provide-nxt';
export { NxtTheme } from './theme/theme';
export type { NxtPrimary } from './theme/theme';
export { NXT_SCALE_STEPS, checkNxtScale, createNxtScale } from './theme/scale';
export type { NxtScale, NxtScaleStep } from './theme/scale';
