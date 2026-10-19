import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  forwardRef,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * Native checkbox with NXT styling (accent-color) and a label that enlarges the hit area to ≥ 24px.
 * Works with `[(checked)]` or Angular forms. `hideLabel` for table row selection (label still announced).
 */
@Component({
  selector: 'nxt-checkbox',
  template: `
    <label class="nxt-checkbox__label" (pointerdown)="rememberModifiers($event)" (keydown)="rememberModifiers($event)">
      <input
        type="checkbox"
        class="nxt-checkbox__input"
        [checked]="checked()"
        [indeterminate]="indeterminate()"
        [disabled]="isDisabled()"
        (change)="onChange($event)"
        (blur)="onTouched()"
      />
      <span class="nxt-checkbox__text" [class.nxt-visually-hidden]="hideLabel()">{{ label() }}</span>
    </label>
  `,
  styleUrl: './checkbox.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => NxtCheckbox), multi: true }],
  host: { class: 'nxt-checkbox' },
})
export class NxtCheckbox implements ControlValueAccessor {
  readonly checked = model(false);
  /** Mixed state ("some rows selected"). */
  readonly indeterminate = input(false, { transform: booleanAttribute });
  readonly label = input.required<string>();
  readonly hideLabel = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });

  /**
   * User toggled the box, with whether Shift was held — for range selection in tables
   * (`NxtSelection.select(key, checked, { range: shiftKey })`, the Gmail / Windows Explorer convention).
   */
  readonly toggled = output<{ checked: boolean; shiftKey: boolean }>();

  private readonly formDisabled = signal(false);
  protected isDisabled = () => this.disabled() || this.formDisabled();
  private onChangeFn: (v: boolean) => void = () => {};
  protected onTouched: () => void = () => {};
  /** Taken from the real pointer/key event: `change` itself carries no modifier keys. */
  private shiftKey = false;

  protected rememberModifiers(event: PointerEvent | KeyboardEvent) {
    this.shiftKey = event.shiftKey;
  }

  protected onChange(event: Event) {
    const value = (event.target as HTMLInputElement).checked;
    this.checked.set(value);
    this.onChangeFn(value);
    this.toggled.emit({ checked: value, shiftKey: this.shiftKey });
    this.shiftKey = false;
  }

  writeValue(value: boolean): void {
    this.checked.set(!!value);
  }
  registerOnChange(fn: (v: boolean) => void): void {
    this.onChangeFn = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(disabled: boolean): void {
    this.formDisabled.set(disabled);
  }
}
