import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export interface Choice<T extends string> {
  value: T;
  label: string;
}

let nextId = 0;

/** Segmented choice built on native radios (arrow keys, form semantics and screen readers for free). */
@Component({
  selector: 'docs-choice-group',
  template: `
    <fieldset class="docs-choice">
      <legend class="nxt-visually-hidden">{{ label() }}</legend>
      @for (o of options(); track o.value) {
        <label class="docs-choice__option">
          <input type="radio" [name]="name" [value]="o.value" [checked]="o.value === value()" (change)="valueChange.emit(o.value)" />
          <span>{{ o.label }}</span>
        </label>
      }
    </fieldset>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChoiceGroup<T extends string> {
  readonly label = input.required<string>();
  readonly options = input.required<Choice<T>[]>();
  readonly value = input.required<T>();
  readonly valueChange = output<T>();
  protected readonly name = `docs-choice-${nextId++}`;
}
