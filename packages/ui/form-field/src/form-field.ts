import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { NxtIcon } from '@nxt/ui/icon';

let nextId = 0;

/**
 * Label + control + hint/error. Wires id, aria-describedby, aria-invalid and aria-required
 * onto the `nxtInput` control inside, so every field is accessible without manual ids.
 * Label always visible (no placeholder-as-label); `hideLabel` only for self-explanatory search boxes.
 */
@Component({
  selector: 'nxt-form-field',
  imports: [NxtIcon],
  template: `
    <label class="nxt-form-field__label" [for]="controlId" [class.nxt-visually-hidden]="hideLabel()">
      {{ label() }}
      @if (required()) {
        <span class="nxt-form-field__required" aria-hidden="true">*</span>
      }
    </label>
    <div class="nxt-form-field__control" [attr.data-invalid]="error() ? '' : null" [attr.data-kind]="control()?.kind">
      <ng-content select="[nxtPrefix]" />
      <ng-content />
      <ng-content select="[nxtSuffix]" />
      @if (control()?.kind === 'select') {
        <nxt-icon class="nxt-form-field__chevron" name="chevron-down" />
      }
    </div>
    @if (error()) {
      <p class="nxt-form-field__error" [id]="errorId"><nxt-icon name="alert-circle" />{{ error() }}</p>
    } @else if (hint()) {
      <p class="nxt-form-field__hint" [id]="hintId">{{ hint() }}</p>
    }
  `,
  styleUrl: './form-field.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'nxt-form-field', '[attr.data-size]': 'size()' },
})
export class NxtFormField {
  readonly label = input.required<string>();
  /** Help text below the control. */
  readonly hint = input<string>();
  /** Error message; non-empty marks the control invalid. Say what is wrong and how to fix it. */
  readonly error = input<string | null>();
  readonly required = input(false, { transform: booleanAttribute });
  /** Visually hide the label (still announced). Only for search boxes with an obvious purpose. */
  readonly hideLabel = input(false, { transform: booleanAttribute });
  readonly size = input<'sm' | 'md'>('md');

  readonly controlId = `nxt-field-${nextId++}`;
  readonly hintId = `${this.controlId}-hint`;
  readonly errorId = `${this.controlId}-error`;
  readonly control = signal<NxtInput | null>(null);
  readonly describedBy = computed(() => (this.error() ? this.errorId : this.hint() ? this.hintId : null));
}

/** Native input / textarea / select styled and wired by the surrounding `nxt-form-field`. */
@Directive({
  selector: 'input[nxtInput], textarea[nxtInput], select[nxtInput]',
  host: {
    class: 'nxt-input',
    '[id]': 'field?.controlId ?? null',
    '[attr.aria-describedby]': 'field?.describedBy() ?? null',
    '[attr.aria-invalid]': 'field?.error() ? true : null',
    '[attr.aria-required]': 'field?.required() || null',
  },
})
export class NxtInput {
  protected readonly field = inject(NxtFormField, { optional: true });
  readonly kind: 'input' | 'textarea' | 'select';

  constructor() {
    const tag = (inject(ElementRef).nativeElement as HTMLElement).tagName;
    this.kind = tag === 'SELECT' ? 'select' : tag === 'TEXTAREA' ? 'textarea' : 'input';
    this.field?.control.set(this);
  }
}
