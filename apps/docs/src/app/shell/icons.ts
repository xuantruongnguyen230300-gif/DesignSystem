import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type DocsIconName = 'menu' | 'search' | 'copy' | 'check' | 'external' | 'arrow-left' | 'arrow-right' | 'close';

// Simple 24×24 stroke icons drawn for the docs (no third-party icon set yet — see ADR-003).
const PATHS: Record<DocsIconName, string> = {
  menu: 'M4 6h16M4 12h16M4 18h16',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4',
  copy: 'M9 9h10v11H9zM5 15V4h10',
  check: 'M5 12.5l4.5 4.5L19 7',
  external: 'M14 4h6v6M20 4l-9 9M18 14v6H4V6h6',
  'arrow-left': 'M19 12H5M11 6l-6 6 6 6',
  'arrow-right': 'M5 12h14M13 6l6 6-6 6',
  close: 'M6 6l12 12M18 6L6 18',
};

/** Decorative icon — always aria-hidden; the control around it carries the accessible name. */
@Component({
  selector: 'docs-icon',
  template: `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path [attr.d]="d()" /></svg>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'docs-icon' },
})
export class DocsIcon {
  readonly name = input.required<DocsIconName>();
  protected d = () => PATHS[this.name()];
}
