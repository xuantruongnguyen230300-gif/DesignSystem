import { ChangeDetectionStrategy, Component, ViewEncapsulation, booleanAttribute, input, model } from '@angular/core';
import { NxtIcon, NxtIconName } from '@nxt/ui/icon';
import { NxtTooltip } from '@nxt/ui/tooltip';

export interface NxtSegmentedOption<T extends string = string> {
  value: T;
  label: string;
  icon?: NxtIconName;
}

let nextId = 0;

/**
 * Pick one of 2–5 visible options (view switch, theme, period). Built on native radios:
 * arrow keys, form semantics and screen-reader support come from the browser.
 * `iconOnly` hides labels visually (still announced) and shows them as tooltips.
 */
@Component({
  selector: 'nxt-segmented',
  imports: [NxtIcon, NxtTooltip],
  template: `
    <fieldset class="nxt-segmented__group">
      <legend class="nxt-visually-hidden">{{ label() }}</legend>
      @for (o of options(); track o.value) {
        <label class="nxt-segmented__option" [nxtTooltip]="iconOnly() ? o.label : ''" nxtTooltipPosition="bottom">
          <input type="radio" [name]="name" [value]="o.value" [checked]="o.value === value()" (change)="value.set(o.value)" />
          <span class="nxt-segmented__face">
            @if (o.icon) {
              <nxt-icon [name]="o.icon" />
            }
            <span [class.nxt-visually-hidden]="iconOnly() && o.icon">{{ o.label }}</span>
          </span>
        </label>
      }
    </fieldset>
  `,
  styleUrl: './segmented.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'nxt-segmented',
    '[attr.data-size]': 'size()',
    '[attr.data-icon-only]': 'iconOnly() || null',
  },
})
export class NxtSegmented<T extends string = string> {
  /** Group name announced by screen readers (legend). */
  readonly label = input.required<string>();
  readonly options = input.required<NxtSegmentedOption<T>[]>();
  /** Selected value (two-way). */
  readonly value = model<T>();
  readonly size = input<'sm' | 'md'>('md');
  /** Show icons only; labels become tooltips and stay available to assistive tech. */
  readonly iconOnly = input(false, { transform: booleanAttribute });
  protected readonly name = `nxt-segmented-${nextId++}`;
}
