import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  forwardRef,
  input,
  model,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

let nextId = 0;

/**
 * On/off for one setting that takes effect immediately (no Save button). A native `button` with
 * role="switch" + aria-checked, named by its visible label (before or above it). No text inside the track;
 * an optional one-word state ("Bật"/"Tắt") after it. In forms that are saved later, use `nxt-checkbox`.
 */
@Component({
  selector: 'nxt-switch',
  template: `
    <label class="nxt-switch__label" [for]="id" [class.nxt-visually-hidden]="hideLabel()">{{ label() }}</label>
    <button
      type="button"
      role="switch"
      class="nxt-switch__control"
      [id]="id"
      [disabled]="isDisabled()"
      [attr.aria-checked]="checked()"
      [attr.aria-readonly]="readonly() || null"
      [attr.aria-describedby]="hint() ? hintId : null"
      (click)="toggle()"
      (blur)="onTouched()"
    >
      <span class="nxt-switch__track" aria-hidden="true"><span class="nxt-switch__thumb"></span></span>
    </button>
    @if (showState()) {
      <!-- aria-checked already says on/off: hidden so it is not read twice. -->
      <span class="nxt-switch__state" aria-hidden="true">{{ checked() ? onText() : offText() }}</span>
    }
    @if (hint()) {
      <p class="nxt-switch__hint" [id]="hintId">{{ hint() }}</p>
    }
  `,
  styleUrl: './switch.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => NxtSwitch), multi: true }],
  host: {
    class: 'nxt-switch',
    '[attr.data-label-position]': 'labelPosition()',
    '[attr.data-checked]': 'checked() || null',
    '[attr.data-readonly]': 'readonly() || null',
    '[attr.data-disabled]': 'isDisabled() || null',
  },
})
export class NxtSwitch implements ControlValueAccessor {
  /** On / off (two-way). */
  readonly checked = model(false);
  /** The setting it controls, as a positive statement: "Nhận thông báo qua email". */
  readonly label = input.required<string>();
  /** `start`: label right before the switch (settings lists). `top`: label above, like a form-field label. */
  readonly labelPosition = input<'start' | 'top'>('start');
  /** Visually hide the label (still announced), e.g. in a table cell under a column header. */
  readonly hideLabel = input(false, { transform: booleanAttribute });
  /** What the setting does right away. Read after the name and state. */
  readonly hint = input<string>();
  /** Show a one-word state after the switch, when the label alone does not say what "on" means. */
  readonly showState = input(false, { transform: booleanAttribute });
  /** State word when on (i18n). */
  readonly onText = input('Bật');
  /** State word when off (i18n). */
  readonly offText = input('Tắt');
  readonly disabled = input(false, { transform: booleanAttribute });
  /** The value is visible and focusable but cannot be changed. */
  readonly readonly = input(false, { transform: booleanAttribute });

  protected readonly id = `nxt-switch-${nextId++}`;
  protected readonly hintId = `${this.id}-hint`;
  private readonly formDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled());
  private onChangeFn: (v: boolean) => void = () => {};
  protected onTouched: () => void = () => {};

  /** Mouse, touch, label click, Space and Enter all arrive here as the button's native click. */
  protected toggle() {
    if (this.readonly() || this.isDisabled()) return;
    const value = !this.checked();
    this.checked.set(value);
    this.onChangeFn(value);
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
