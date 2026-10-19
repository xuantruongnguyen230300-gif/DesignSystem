import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { TokensData } from '../../app/core/tokens-data';

/** Pick dark or white label text by WCAG contrast (a fixed step threshold fails on some hues). */
function prefersInk(hex: string): boolean {
  const ch = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r, g, b] = ch.map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  const l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const onWhite = 1.05 / (l + 0.05);
  const onInk = (l + 0.05) / 0.053;
  return onInk >= onWhite;
}

interface Scale {
  name: string;
  steps: { step: string; hex: string; ink: boolean }[];
}

/** Thang màu primitive sinh từ seed OKLCH (độ sáng đều giữa các hue) */
@Component({
  selector: 'example-color-scales',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (scales().length) {
      <div class="docs-scales">
        @for (s of scales(); track s.name) {
          <div class="docs-scale" role="group" [attr.aria-label]="'Thang ' + s.name">
            <p class="docs-scale__name">{{ s.name }}</p>
            <ol class="docs-scale__steps" role="list">
              @for (c of s.steps; track c.step) {
                <li class="docs-scale__step" [style.background-color]="c.hex" [attr.data-ink]="c.ink ? '' : null">
                  <span>{{ c.step }}</span>
                  <span class="docs-scale__hex">{{ c.hex }}</span>
                </li>
              }
            </ol>
          </div>
        }
      </div>
    } @else {
      <p class="docs-demo-label">Đang tải thang màu…</p>
    }
  `,
})
export class ColorScalesExample {
  private readonly tokens = inject(TokensData);
  protected readonly scales = computed<Scale[]>(() => {
    const map = new Map<string, Scale>();
    for (const t of this.tokens.byPrefix('primitive.color')) {
      const [, , name, step] = t.path.split('.');
      if (!step || !/^\d+$/.test(step)) continue;
      if (!map.has(name)) map.set(name, { name, steps: [] });
      const hex = this.tokens.value(t);
      map.get(name)!.steps.push({ step, hex, ink: prefersInk(hex) });
    }
    return [...map.values()];
  });

  constructor() {
    void this.tokens.load();
  }
}
