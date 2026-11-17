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
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NxtIcon } from '@nxt/ui/icon';

let nextId = 0;

/** Keys a native radio group uses to move and select: blocked while the group is read-only. */
const ARROW_KEYS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);

/**
 * Pick exactly one of up to 8 visible options in a form. Native radios sharing one name, so Tab (one stop,
 * on the checked option) and arrow keys come from the browser. `fieldset` + `legend` with role radiogroup,
 * a hint under the legend and one error for the group below it. Works with `[(value)]` or Angular forms.
 */
@Component({
  selector: 'nxt-radio-group',
  imports: [NxtIcon],
  template: `
    <!-- role=radiogroup (allowed on fieldset) so the group can carry aria-required / -invalid / -readonly. -->
    <fieldset
      class="nxt-radio-group__fieldset"
      role="radiogroup"
      [disabled]="isDisabled()"
      [attr.aria-labelledby]="labelId"
      [attr.aria-describedby]="describedBy()"
      [attr.aria-required]="required() || null"
      [attr.aria-invalid]="error() ? true : null"
      [attr.aria-readonly]="readonly() || null"
      (focusout)="onFocusOut($event)"
    >
      <legend class="nxt-radio-group__label" [id]="labelId" [class.nxt-visually-hidden]="hideLabel()">
        {{ label() }}
        @if (required()) {
          <span class="nxt-radio-group__required" aria-hidden="true">*</span>
        }
      </legend>
      @if (hint()) {
        <p class="nxt-radio-group__hint" [id]="hintId">{{ hint() }}</p>
      }
      <div class="nxt-radio-group__options">
        <ng-content />
      </div>
      @if (error()) {
        <p class="nxt-radio-group__error" [id]="errorId"><nxt-icon name="alert-circle" />{{ error() }}</p>
      }
    </fieldset>
  `,
  styleUrl: './radio-group.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => NxtRadioGroup), multi: true }],
  host: {
    class: 'nxt-radio-group',
    '[attr.data-orientation]': 'orientation()',
    '[attr.data-invalid]': 'error() ? "" : null',
    '[attr.data-readonly]': 'readonly() || null',
  },
})
export class NxtRadioGroup<T = unknown> implements ControlValueAccessor {
  /** Selected option's value (two-way); compared with `===`. `null` = nothing selected. */
  readonly value = model<T | null>(null);
  /** Group name (legend): a short question or noun, e.g. "Hình thức làm việc". */
  readonly label = input.required<string>();
  /** Help text under the legend. */
  readonly hint = input<string>();
  /** One error for the whole group, shown below it. Say how to fix it: "Chọn hình thức làm việc." */
  readonly error = input<string | null>();
  /** Show `*` after the legend and set aria-required on the group. */
  readonly required = input(false, { transform: booleanAttribute });
  /** Vertical in forms; horizontal only for 2–3 one-word options. */
  readonly orientation = input<'vertical' | 'horizontal'>('vertical');
  /** Disable the whole group. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Read-only inside a form being edited: the checked option is focusable but nothing can be changed. */
  readonly readonly = input(false, { transform: booleanAttribute });
  /** Visually hide the legend (still announced) when a heading right above already names the group. */
  readonly hideLabel = input(false, { transform: booleanAttribute });

  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  private readonly id = `nxt-radio-group-${nextId++}`;
  /** Shared `name` of the native radios. */
  readonly name = this.id;
  protected readonly labelId = `${this.id}-label`;
  protected readonly hintId = `${this.id}-hint`;
  protected readonly errorId = `${this.id}-error`;
  protected readonly describedBy = computed(
    () => [this.hint() ? this.hintId : '', this.error() ? this.errorId : ''].filter(Boolean).join(' ') || null,
  );

  private readonly formDisabled = signal(false);
  readonly isDisabled = computed(() => this.disabled() || this.formDisabled());
  private onChangeFn: (v: T | null) => void = () => {};
  private onTouched: () => void = () => {};

  /** Called by `nxt-radio` when the user picks it. */
  select(value: T) {
    if (this.readonly() || this.isDisabled()) return;
    this.value.set(value);
    this.onChangeFn(value);
  }

  protected onFocusOut(event: FocusEvent) {
    if (!this.host.contains(event.relatedTarget as Node | null)) this.onTouched();
  }

  writeValue(value: T | null): void {
    this.value.set(value ?? null);
  }
  registerOnChange(fn: (v: T | null) => void): void {
    this.onChangeFn = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(disabled: boolean): void {
    this.formDisabled.set(disabled);
  }
}

/** One option of an `nxt-radio-group`: a native radio inside its label, with an optional hint. */
@Component({
  selector: 'nxt-radio',
  template: `
    <label class="nxt-radio__label">
      <input
        #radio
        type="radio"
        class="nxt-radio__input"
        [name]="group.name"
        [checked]="checked()"
        [disabled]="disabled()"
        [attr.aria-describedby]="hint() ? hintId : null"
        (click)="guardClick($event)"
        (keydown)="guardKeys($event)"
        (change)="group.select(value())"
      />
      <span class="nxt-radio__text">{{ label() }}</span>
    </label>
    <!-- Outside the label: a description, not part of the name. -->
    @if (hint()) {
      <p class="nxt-radio__hint" [id]="hintId">{{ hint() }}</p>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'nxt-radio', '[attr.data-checked]': 'checked() || null' },
})
export class NxtRadio {
  /** Value given to the group's `value` when this option is picked. */
  readonly value = input.required<unknown>();
  /** Visible label and accessible name. Keep it to one line. */
  readonly label = input.required<string>();
  /** Helper text below the label: what picking it means. Read after the name and state. */
  readonly hint = input<string>();
  /** Disable this option only (say why in `hint`). */
  readonly disabled = input(false, { transform: booleanAttribute });

  protected readonly group = inject(NxtRadioGroup);
  protected readonly hintId = `nxt-radio-${nextId++}-hint`;
  protected readonly checked = computed(() => this.group.value() === this.value());
  private readonly radio = viewChild.required<ElementRef<HTMLInputElement>>('radio');

  constructor() {
    // The [checked] binding alone misses one case: the user picks B, then the value goes back to A
    // (a form resets it) before the next render — the binding still holds A, so it writes nothing while the
    // browser shows B. Re-applying on every change of the group's value keeps the radio true to it.
    afterRenderEffect({
      write: () => {
        this.radio().nativeElement.checked = this.group.value() === this.value();
      },
    });
  }

  /** A native radio has no readonly attribute: cancelling the click restores the previous choice. */
  protected guardClick(event: MouseEvent) {
    if (this.group.readonly()) event.preventDefault();
  }

  /** Arrow keys move and select natively: keep focus and choice where they are when read-only. */
  protected guardKeys(event: KeyboardEvent) {
    if (this.group.readonly() && ARROW_KEYS.has(event.key)) event.preventDefault();
  }
}
