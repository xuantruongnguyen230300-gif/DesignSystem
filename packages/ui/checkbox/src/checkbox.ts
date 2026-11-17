import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  afterRenderEffect,
  booleanAttribute,
  computed,
  forwardRef,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NxtIcon } from '@nxt/ui/icon';

let nextId = 0;

/**
 * A group of checkboxes: `fieldset` + `legend`, a hint under the legend and one error for the whole group,
 * shown below it. Holds no value (each `nxt-checkbox` keeps its own); passes error, disabled and read-only
 * down to every checkbox inside.
 */
@Component({
  selector: 'nxt-checkbox-group',
  imports: [NxtIcon],
  template: `
    <fieldset class="nxt-checkbox-group__fieldset" [disabled]="disabled()" [attr.aria-describedby]="describedBy()">
      <legend class="nxt-checkbox-group__label">
        {{ label() }}
        @if (required()) {
          <span class="nxt-checkbox-group__required" aria-hidden="true">*</span>
          <span class="nxt-visually-hidden"> {{ requiredLabel() }}</span>
        }
      </legend>
      @if (hint()) {
        <p class="nxt-checkbox-group__hint" [id]="hintId">{{ hint() }}</p>
      }
      <div class="nxt-checkbox-group__options">
        <ng-content />
      </div>
      @if (error()) {
        <p class="nxt-checkbox-group__error" [id]="errorId"><nxt-icon name="alert-circle" />{{ error() }}</p>
      }
    </fieldset>
  `,
  styleUrl: './checkbox.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'nxt-checkbox-group',
    '[attr.data-orientation]': 'orientation()',
    '[attr.data-invalid]': 'error() ? "" : null',
    '[attr.data-readonly]': 'readonly() || null',
  },
})
export class NxtCheckboxGroup {
  /** The group's question (legend). Put the selection rule in brackets: "(chọn ít nhất một)". */
  readonly label = input.required<string>();
  /** Help text under the legend. */
  readonly hint = input<string>();
  /** One error for the whole group, shown below it; every checkbox inside is marked invalid. */
  readonly error = input<string | null>();
  /** Show `*` after the legend and announce `requiredLabel` (a group role has no aria-required). */
  readonly required = input(false, { transform: booleanAttribute });
  /** Hidden words read after the legend when `required` (i18n). */
  readonly requiredLabel = input('(bắt buộc)');
  /** Vertical in forms; horizontal only for 2–3 short labels. */
  readonly orientation = input<'vertical' | 'horizontal'>('vertical');
  /** Disable every checkbox in the group. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Every checkbox in the group is read-only (focusable, cannot be changed). */
  readonly readonly = input(false, { transform: booleanAttribute });

  private readonly id = `nxt-checkbox-group-${nextId++}`;
  protected readonly hintId = `${this.id}-hint`;
  protected readonly errorId = `${this.id}-error`;
  protected readonly describedBy = computed(
    () => [this.hint() ? this.hintId : '', this.error() ? this.errorId : ''].filter(Boolean).join(' ') || null,
  );
}

/**
 * Native checkbox with NXT styling (accent-color) and a label that enlarges the hit area to ≥ 24px.
 * Works with `[(checked)]` or Angular forms. `hideLabel` for table row selection (label still announced).
 * `hint` adds helper text below the label; `error` an error for this box alone (a required confirmation).
 */
@Component({
  selector: 'nxt-checkbox',
  imports: [NxtIcon],
  template: `
    <label class="nxt-checkbox__label" (pointerdown)="rememberModifiers($event)" (keydown)="rememberModifiers($event)">
      <input
        #box
        type="checkbox"
        class="nxt-checkbox__input"
        [checked]="checked()"
        [indeterminate]="indeterminate()"
        [disabled]="isDisabled()"
        [attr.aria-describedby]="describedBy()"
        [attr.aria-invalid]="isInvalid() || null"
        [attr.aria-required]="required() || null"
        [attr.aria-readonly]="isReadonly() || null"
        (click)="guardReadonly($event)"
        (change)="onChange($event)"
        (blur)="onTouched()"
      />
      <span class="nxt-checkbox__text" [class.nxt-visually-hidden]="hideLabel()">
        {{ label() }}
        @if (required()) {
          <span class="nxt-checkbox__required" aria-hidden="true">*</span>
        }
      </span>
    </label>
    <!-- Outside the label: descriptions, not part of the name. -->
    @if (error()) {
      <p class="nxt-checkbox__error" [id]="errorId"><nxt-icon name="alert-circle" />{{ error() }}</p>
    }
    @if (hint()) {
      <p class="nxt-checkbox__hint" [id]="hintId">{{ hint() }}</p>
    }
  `,
  styleUrl: './checkbox.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => NxtCheckbox), multi: true }],
  host: {
    class: 'nxt-checkbox',
    '[attr.data-invalid]': 'isInvalid() || null',
    '[attr.data-readonly]': 'isReadonly() || null',
  },
})
export class NxtCheckbox implements ControlValueAccessor {
  readonly checked = model(false);
  /** Mixed state ("some rows selected"). */
  readonly indeterminate = input(false, { transform: booleanAttribute });
  readonly label = input.required<string>();
  readonly hideLabel = input(false, { transform: booleanAttribute });
  /** Helper text below the label: what choosing it means or requires. Read after the name and state. */
  readonly hint = input<string>();
  /** Error for this box alone (e.g. a required confirmation): shown below it, marks it invalid. Say how to fix it. */
  readonly error = input<string | null>();
  /** Mark the box invalid without its own message (the message is on the group or elsewhere). */
  readonly invalid = input(false, { transform: booleanAttribute });
  /** Show `*` after the label and set aria-required (not the native attribute: no browser error bubble). */
  readonly required = input(false, { transform: booleanAttribute });
  /** Read-only inside a form being edited: focusable, but clicks and Space do not change it. */
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });

  private readonly group = inject(NxtCheckboxGroup, { optional: true });
  private readonly id = `nxt-checkbox-${nextId++}`;
  protected readonly hintId = `${this.id}-hint`;
  protected readonly errorId = `${this.id}-error`;

  /**
   * User toggled the box, with whether Shift was held — for range selection in tables
   * (`NxtSelection.select(key, checked, { range: shiftKey })`, the Gmail / Windows Explorer convention).
   */
  readonly toggled = output<{ checked: boolean; shiftKey: boolean }>();

  private readonly formDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled() || !!this.group?.disabled());
  protected readonly isReadonly = computed(() => this.readonly() || !!this.group?.readonly());
  protected readonly isInvalid = computed(() => this.invalid() || !!this.error() || !!this.group?.error());
  protected readonly describedBy = computed(
    () => [this.error() ? this.errorId : '', this.hint() ? this.hintId : ''].filter(Boolean).join(' ') || null,
  );
  private onChangeFn: (v: boolean) => void = () => {};
  protected onTouched: () => void = () => {};
  /** Taken from the real pointer/key event: `change` itself carries no modifier keys. */
  private shiftKey = false;
  private readonly box = viewChild.required<ElementRef<HTMLInputElement>>('box');

  constructor() {
    // The [checked] binding alone misses one case: the user ticks the box, then the value goes back
    // (a form resets it) before the next render — the binding still holds the old value, so it writes
    // nothing while the browser shows the tick. Re-applying on every change keeps the box true to `checked`.
    afterRenderEffect({
      write: () => {
        this.box().nativeElement.checked = this.checked();
      },
    });
  }

  protected rememberModifiers(event: PointerEvent | KeyboardEvent) {
    this.shiftKey = event.shiftKey;
  }

  /** A native checkbox has no readonly attribute: cancelling the click keeps its state (mouse and Space). */
  protected guardReadonly(event: MouseEvent) {
    if (this.isReadonly()) event.preventDefault();
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
