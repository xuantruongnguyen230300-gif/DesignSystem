import { describe, expect, it } from 'vitest';
// The build-time implementation (plain ESM, no types): the runtime port must produce the same colors.
// @ts-expect-error TS7016: tools/lib is JavaScript without declarations
import { generateScale } from '../../../../tools/lib/palette.mjs';
import { contrastRatio, parseColor } from './color';
import { NXT_SCALE_STEPS, checkNxtScale, createNxtScale, isNxtScale } from './scale';

// The dark surface used by the tokens (neutral.900); the dark link color sits on it.
const DARK_SURFACE = '#15171B';

describe('createNxtScale', () => {
  const seeds = ['#E11D48', '#0F766E', '#006CE0', '#7C3AED', '#F59E0B', '#FACC15', '#64748B', '#000000', '#FFFFFF', '#0B1F4B', 'oklch(0.55 0.2 257)', 'rgb(225 29 72)'];

  it.each(seeds)('gives the same 11 colors as `ds:palette` for %s', (seed) => {
    const expected = Object.fromEntries(generateScale(seed).steps.map((s: { step: number; hex: string }) => [s.step, s.hex]));
    expect(createNxtScale(seed)).toEqual(expected);
  });

  it('has one color for each of the 11 steps', () => {
    const scale = createNxtScale('#0F766E');
    expect(Object.keys(scale).map(Number)).toEqual([...NXT_SCALE_STEPS]);
    expect(isNxtScale(scale)).toBe(true);
  });

  it('puts the seed exactly on its nearest step', () => {
    expect(Object.values(createNxtScale('#E11D48'))).toContain('#E11D48');
  });

  it('gets lighter from step 50 to 950 never the other way round', () => {
    for (const seed of seeds) {
      const lightness = NXT_SCALE_STEPS.map((step) => {
        const c = parseColor(createNxtScale(seed)[step])!;
        return 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
      });
      expect([...lightness].sort((a, b) => b - a), seed).toEqual(lightness);
    }
  });

  it('rejects a color it cannot read', () => {
    expect(() => createNxtScale('not-a-color')).toThrowError(/Cannot parse the color "not-a-color"/);
    expect(() => createNxtScale('#12')).toThrowError();
  });

  // The promise made to products: whatever seed they pick, the scale meets WCAG 2.2 AA for the roles NXT puts on it.
  it('meets the NXT contrast roles for any hue, chroma and lightness (seed sweep)', () => {
    const failures: string[] = [];
    let count = 0;
    for (let hue = 0; hue < 360; hue += 10) {
      for (const chroma of [0.02, 0.06, 0.12, 0.2, 0.3]) {
        for (const lightness of [0.3, 0.45, 0.55, 0.6, 0.65, 0.75, 0.9]) {
          const seed = `oklch(${lightness} ${chroma} ${hue})`;
          count++;
          const issues = checkNxtScale(createNxtScale(seed), DARK_SURFACE);
          if (issues.length) failures.push(`${seed}: ${issues.join('; ')}`);
        }
      }
    }
    expect(count).toBeGreaterThan(1000);
    expect(failures.slice(0, 10)).toEqual([]);
  });
});

describe('checkNxtScale', () => {
  const scale = createNxtScale('#0F766E');

  it('finds nothing wrong with a generated scale', () => {
    expect(checkNxtScale(scale, DARK_SURFACE)).toEqual([]);
  });

  it('reports a scale whose filled-button step is too light for white text', () => {
    const pale = { ...scale, 600: '#FACC15' };
    expect(checkNxtScale(pale).join('\n')).toMatch(/white text on brand-600/);
  });

  it('skips colors it cannot parse and the dark check when no surface is given', () => {
    expect(checkNxtScale({ ...scale, 600: 'var(--x)', 400: '#FFFFFF' })).toEqual([]);
  });
});

describe('contrastRatio', () => {
  it('is 21 for black on white and 1 for the same color', () => {
    const black = parseColor('#000')!;
    const white = parseColor('#fff')!;
    expect(contrastRatio(black, white)).toBeCloseTo(21, 5);
    expect(contrastRatio(white, white)).toBe(1);
  });
});

describe('parseColor', () => {
  it('reads hex, rgb and oklch', () => {
    expect(parseColor('#0f0')).toEqual({ r: 0, g: 1, b: 0 });
    expect(parseColor('#00FF0080')).toEqual({ r: 0, g: 1, b: 0 });
    expect(parseColor('rgb(255, 0, 0)')).toEqual({ r: 1, g: 0, b: 0 });
    expect(parseColor('rgb(100% 0% 0% / 50%)')).toEqual({ r: 1, g: 0, b: 0 });
    const blue = parseColor('oklch(0.55 0.2 257)')!;
    expect(blue.b).toBeGreaterThan(blue.r);
  });

  it('returns null for what it does not know', () => {
    for (const bad of ['', 'red', '#12', '#ggg', 'rgb(1 2)', 'oklch(a b c)', 'var(--x)']) expect(parseColor(bad), bad).toBeNull();
  });
});
