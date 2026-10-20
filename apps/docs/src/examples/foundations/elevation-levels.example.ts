import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NxtGrid, NxtSpan } from '@nxt/ui/layout';

/** Ba mức nổi và bốn góc bo theo vai trò */
@Component({
  selector: 'example-elevation-levels',
  imports: [NxtGrid, NxtSpan],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-grid gap="lg">
      @for (e of levels; track e.token) {
        <div class="docs-elevation" [nxtSpan]="{ base: 12, md: 4 }" [style.box-shadow]="'var(--nxt-elevation-' + e.token + ')'">
          <code>elevation.{{ e.token }}</code>
          <span class="docs-demo-label">{{ e.use }}</span>
        </div>
      }
      @for (r of radii; track r.token) {
        <div class="docs-radius" [nxtSpan]="{ base: 6, md: 3 }" [style.border-radius]="'var(--nxt-radius-' + r.token + ')'">
          <code>radius.{{ r.token }}</code>
          <span class="docs-demo-label">{{ r.use }}</span>
        </div>
      }
    </nxt-grid>
  `,
})
export class ElevationLevelsExample {
  protected readonly levels = [
    { token: 'raised', use: 'Header sticky, thẻ kéo được' },
    { token: 'overlay', use: 'Dropdown, popover, menu' },
    { token: 'modal', use: 'Dialog, drawer' },
  ];
  protected readonly radii = [
    { token: 'control', use: 'Button, input' },
    { token: 'container', use: 'Card, bảng' },
    { token: 'overlay', use: 'Dialog, popover' },
    { token: 'pill', use: 'Badge, avatar' },
  ];
}
