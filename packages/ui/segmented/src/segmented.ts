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
  viewChildren,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NxtIcon, NxtIconName } from '@nxt/ui/icon';
import { NxtTooltip } from '@nxt/ui/tooltip';

export interface NxtSegmentedOption<T extends string = string> {
  value: T;
  label: string;
  icon?: NxtIconName;
  /** This option cannot be picked (the others still can). */
  disabled?: boolean;
}

let nextId = 0;

/**
 * Pick one of 2–5 visible options (view switch, theme, period). Built on native radios:
 * arrow keys, form semantics and screen-reader support come from the browser.
 * `iconOnly` hides labels visually (still announced) and shows them as tooltips. `showLabel` shows the group
 * name above the options, like a form-field label. Works with `[(value)]` or Angular forms.
 */
@Component({
  selector: 'nxt-segmented',
  imports: [NxtIcon, NxtTooltip],
  template: `
    <fieldset class="nxt-segmented__group" [disabled]="isDisabled()" (focusout)="onFocusOut($event)">
      <!-- One legend, visible or not: the group name is announced once either way. -->
      <legend class="nxt-segmented__label" [class.nxt-visually-hidden]="!showLabel()">{{ label() }}</legend>
      <div class="nxt-segmented__track">
        @for (o of options(); track o.value) {
          <label class="nxt-segmented__option" [nxtTooltip]="iconOnly() ? o.label : ''" nxtTooltipPosition="bottom">
            <input
              #radio
              type="radio"
              [name]="name"
              [value]="o.value"
              [checked]="o.value === value()"
              [disabled]="!!o.disabled"
              (change)="select(o.value)"
            />
            <span class="nxt-segmented__face">
              @if (o.icon) {
                <nxt-icon [name]="o.icon" />
              }
              <span [class.nxt-visually-hidden]="iconOnly() && o.icon">{{ o.label }}</span>
            </span>
          </label>
        }
      </div>
    </fieldset>
  `,
  styleUrl: './segmented.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => NxtSegmented), multi: true }],
  host: {
    class: 'nxt-segmented',
    '[attr.data-size]': 'size()',
    '[attr.data-icon-only]': 'iconOnly() || null',
    '[attr.data-show-label]': 'showLabel() || null',
    '[attr.data-disabled]': 'isDisabled() || null',
  },
})
export class NxtSegmented<T extends string = string> implements ControlValueAccessor {
  /** Group name announced by screen readers (legend). */
  readonly label = input.required<string>();
  readonly options = input.required<NxtSegmentedOption<T>[]>();
  /** Selected value (two-way). */
  readonly value = model<T>();
  readonly size = input<'sm' | 'md'>('md');
  /** Show icons only; labels become tooltips and stay available to assistive tech. */
  readonly iconOnly = input(false, { transform: booleanAttribute });
  /**
   * Show `label` above the options, styled like a form-field label (in forms, next to `nxt-form-field`s).
   * It is the same legend, so the group name is still announced once.
   */
  readonly showLabel = input(false, { transform: booleanAttribute });
  /** Disable the whole group. Disable a single option with `NxtSegmentedOption.disabled`. */
  readonly disabled = input(false, { transform: booleanAttribute });
  protected readonly name = `nxt-segmented-${nextId++}`;

  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  private readonly radios = viewChildren<ElementRef<HTMLInputElement>>('radio');
  private readonly formDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled());
  private onChangeFn: (v: T | undefined) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    // The [checked] binding alone misses one case: the user picks B, then the value goes back to A
    // (a form resets it) before the next render — the binding still holds A, so it writes nothing while the
    // browser shows B. Re-applying on every value change keeps the radios true to `value`.
    afterRenderEffect({
      write: () => {
        const value = this.value();
        for (const { nativeElement: radio } of this.radios()) radio.checked = radio.value === value;
      },
    });
  }

  protected select(value: T) {
    this.value.set(value);
    this.onChangeFn(value);
  }

  protected onFocusOut(event: FocusEvent) {
    if (!this.host.contains(event.relatedTarget as Node | null)) this.onTouched();
  }

  writeValue(value: T | null | undefined): void {
    this.value.set(value ?? undefined);
  }
  registerOnChange(fn: (v: T | undefined) => void): void {
    this.onChangeFn = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(disabled: boolean): void {
    this.formDisabled.set(disabled);
  }
}
