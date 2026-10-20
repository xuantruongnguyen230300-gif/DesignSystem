import { ChangeDetectionStrategy, Component, ViewEncapsulation, booleanAttribute, input } from '@angular/core';

/** Keep in sync with packages/ui/{{name}}/SPEC.md → "Variants". */
export type Nxt{{Name}}Variant = 'default';
/** Sizes follow the density scale; `md` maps to --nxt-control-height. */
export type Nxt{{Name}}Size = 'sm' | 'md' | 'lg';

/**
 * {{title}} — see packages/ui/{{name}}/SPEC.md for anatomy, states and keyboard map.
 */
@Component({
  selector: '{{selector}}',
  template: `<ng-content />`,
  styleUrl: './{{name}}.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'nxt-{{name}}',
    '[attr.data-variant]': 'variant()',
    '[attr.data-size]': 'size()',
    '[attr.aria-disabled]': 'disabled() || null',
  },
})
export class Nxt{{Name}} {
  readonly variant = input<Nxt{{Name}}Variant>('default');
  readonly size = input<Nxt{{Name}}Size>('md');
  readonly disabled = input(false, { transform: booleanAttribute });
}
