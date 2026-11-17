import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Directive,
  ElementRef,
  HostAttributeToken,
  ViewEncapsulation,
  afterEveryRender,
  afterNextRender,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgControl } from '@angular/forms';
import { NxtIcon, NxtIconName } from '@nxt/ui/icon';

let nextId = 0;

/** Value state of a field. One at a time, in this priority: error > warning > info > success. */
export type NxtFieldStatus = 'error' | 'warning' | 'info' | 'success';
/** Hidden words read before a warning / info / success message (an error is already announced by aria-invalid). */
export type NxtFieldStatusLabels = Partial<Record<Exclude<NxtFieldStatus, 'error'>, string>>;

const STATUS_ICON: Record<NxtFieldStatus, NxtIconName> = {
  error: 'alert-circle',
  warning: 'alert-triangle',
  info: 'info-circle',
  success: 'circle-check',
};
const STATUS_LABELS: Required<NxtFieldStatusLabels> = { warning: 'Cảnh báo', info: 'Thông tin', success: 'Thành công' };
const number = new Intl.NumberFormat('vi-VN');

/**
 * Label + control + value-state message, hint and character counter. Wires id, aria-describedby,
 * aria-invalid, aria-required and read-only onto the `nxtInput` control inside, so every field is
 * accessible without manual ids. Label always visible (no placeholder-as-label); `hideLabel` only for
 * self-explanatory search boxes.
 */
@Component({
  selector: 'nxt-form-field',
  imports: [NxtIcon],
  template: `
    <label class="nxt-form-field__label" [for]="controlId()" [class.nxt-visually-hidden]="hideLabel()">
      {{ label() }}
      @if (isRequired()) {
        <span class="nxt-form-field__required" aria-hidden="true">*</span>
      }
    </label>
    <div
      class="nxt-form-field__control"
      [attr.data-status]="status()"
      [attr.data-invalid]="status() === 'error' ? '' : null"
      [attr.data-readonly]="readonly() || null"
      [attr.data-kind]="control()?.kind"
    >
      <ng-content select="[nxtPrefix]" />
      <ng-content />
      <ng-content select="[nxtSuffix]" />
      @if (control()?.kind === 'select' && !readonly()) {
        <nxt-icon class="nxt-form-field__chevron" name="chevron-down" />
      }
    </div>
    @if (status() || hint() || showCounter()) {
      <div class="nxt-form-field__footer">
        @if (status() || hint()) {
          <div class="nxt-form-field__notes">
            @if (status(); as s) {
              <p class="nxt-form-field__message" [class.nxt-form-field__error]="s === 'error'" [attr.data-status]="s" [id]="messageId">
                <nxt-icon [name]="icons[s]" />
                <span>
                  @if (s !== 'error') {
                    <span class="nxt-visually-hidden">{{ statusLabel(s) }}: </span>
                  }
                  {{ statusMessage() }}
                </span>
              </p>
            }
            @if (hint()) {
              <p class="nxt-form-field__hint" [id]="hintId">{{ hint() }}</p>
            }
          </div>
        }
        @if (showCounter()) {
          <p class="nxt-form-field__counter" [id]="counterId">
            <span aria-hidden="true">{{ format(count()) }}/{{ format(maxLength()!) }}</span>
            <span class="nxt-visually-hidden">{{ counterText()(count(), maxLength()!) }}</span>
          </p>
        }
      </div>
    }
  `,
  styleUrl: './form-field.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'nxt-form-field',
    '[attr.data-size]': 'size()',
    '[attr.data-status]': 'status()',
    '[attr.data-readonly]': 'readonly() || null',
  },
})
export class NxtFormField {
  readonly label = input.required<string>();
  /** Help text below the control. Stays visible when a message is shown. */
  readonly hint = input<string>();
  /** Error: the value is wrong or missing and blocks saving. Say what is wrong and how to fix it. */
  readonly error = input<string | null>();
  /** Warning: the value is valid but unusual and worth a second look. Does not block saving. */
  readonly warning = input<string | null>();
  /** Information: the value was suggested or filled in by the system, or something to keep in mind. */
  readonly info = input<string | null>();
  /** Success: only right after the system has confirmed the value (e.g. checked with a server). */
  readonly success = input<string | null>();
  /** Hidden words read before a warning / info / success message, for screen readers (i18n). */
  readonly statusLabels = input<NxtFieldStatusLabels>({});
  readonly required = input(false, { transform: booleanAttribute });
  /**
   * Read-only inside a form being edited: the control can be focused and copied but not changed.
   * For values that are never editable, show text (`nxt-descriptions`) instead.
   */
  readonly readonly = input(false, { transform: booleanAttribute });
  /** Show a character counter based on the control's `maxlength`. */
  readonly counter = input(false, { transform: booleanAttribute });
  /** Full counter sentence read by screen readers when the control gets focus (i18n). */
  readonly counterText = input<(count: number, max: number) => string>(
    (count, max) => `Đã nhập ${number.format(count)} trên ${number.format(max)} ký tự`,
  );
  /** Visually hide the label (still announced). Only for search boxes with an obvious purpose. */
  readonly hideLabel = input(false, { transform: booleanAttribute });
  readonly size = input<'sm' | 'md'>('md');

  // ---- Read by composite controls inside the field (date picker, combobox…): inject(NxtFormField, { optional: true }).
  private readonly generatedId = `nxt-field-${nextId++}`;
  /** Id of the value-state message element (present while `status()` is set). */
  readonly messageId = `${this.generatedId}-message`;
  readonly hintId = `${this.generatedId}-hint`;
  readonly counterId = `${this.generatedId}-counter`;
  /** @deprecated Use `messageId`: the error is now one of the value-state messages. */
  readonly errorId = this.messageId;
  readonly control = signal<NxtInput | null>(null);
  /** The control's own static id when it has one, so `label[for]` still points at it. */
  readonly controlId = computed(() => this.control()?.ownId ?? this.generatedId);

  protected readonly icons = STATUS_ICON;
  /** Value state on show (highest priority wins). */
  readonly status = computed<NxtFieldStatus | null>(() =>
    this.error() ? 'error' : this.warning() ? 'warning' : this.info() ? 'info' : this.success() ? 'success' : null,
  );
  /** Text of the value-state message on show (null when none), e.g. to repeat it inside a popup panel. */
  readonly statusMessage = computed(() => {
    const s = this.status();
    return s ? (this[s]() ?? null) : null;
  });
  /** A read-only field cannot be filled in by the user, so it is not marked required. */
  readonly isRequired = computed(() => this.required() && !this.readonly());
  protected readonly count = computed(() => this.control()?.length() ?? 0);
  protected readonly maxLength = computed(() => this.control()?.maxLength() ?? null);
  protected readonly showCounter = computed(() => this.counter() && this.maxLength() !== null);
  /** Ids the control is described by: message, hint, counter (in reading order). */
  readonly describedIds = computed(() => {
    const ids: string[] = [];
    if (this.status()) ids.push(this.messageId);
    if (this.hint()) ids.push(this.hintId);
    if (this.showCounter()) ids.push(this.counterId);
    return ids;
  });

  protected statusLabel(status: Exclude<NxtFieldStatus, 'error'>): string {
    return this.statusLabels()[status] ?? STATUS_LABELS[status];
  }

  protected format(value: number): string {
    return number.format(value);
  }
}

/** Keys that change a closed native select: blocked while the field is read-only. */
const SELECT_CHANGE_KEYS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown', 'Enter', 'F4']);

/** Native input / textarea / select styled and wired by the surrounding `nxt-form-field`. */
@Directive({
  selector: 'input[nxtInput], textarea[nxtInput], select[nxtInput]',
  host: {
    class: 'nxt-input',
    '[attr.id]': 'field ? field.controlId() : ownId',
    '[attr.aria-describedby]': 'describedBy()',
    '[attr.aria-invalid]': 'field?.status() === "error" ? true : null',
    '[attr.aria-required]': 'field?.isRequired() || null',
    '[attr.aria-readonly]': 'kind === "select" && field?.readonly() ? true : null',
    '[attr.data-numeric]': 'numeric() || null',
    '(input)': 'syncLength()',
    '(keydown)': 'guardSelect($event)',
    '(mousedown)': 'guardSelect($event)',
  },
})
export class NxtInput {
  protected readonly field = inject(NxtFormField, { optional: true });
  private readonly el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement = inject(ElementRef).nativeElement;
  readonly kind: 'input' | 'textarea' | 'select';
  /** Static `id` written on the control by the app; kept and used for the label. */
  readonly ownId = inject(new HostAttributeToken('id'), { optional: true });
  private readonly ownDescribedBy = inject(new HostAttributeToken('aria-describedby'), { optional: true });
  /** Angular forms write the value straight into the DOM (no input event, maybe no render): follow them too. */
  private readonly ngControl = inject(NgControl, { optional: true, self: true });
  private readonly destroyRef = inject(DestroyRef);

  /** Amounts, quantities, hours: aligned to the end with tabular figures. Not for codes, phone or ID numbers. */
  readonly numeric = input(false, { transform: booleanAttribute });

  /** Current value length and `maxlength` (null when unset), for the field's counter. */
  readonly length = signal(0);
  readonly maxLength = signal<number | null>(null);

  protected readonly describedBy = computed(() => {
    const ids = [...(this.field?.describedIds() ?? []), ...(this.ownDescribedBy?.split(/\s+/).filter(Boolean) ?? [])];
    return ids.length ? ids.join(' ') : null;
  });

  /** True while the field (not the app) has put the native `readonly` attribute on the control. */
  private readonlyByField = false;

  constructor() {
    const tag = this.el.tagName;
    this.kind = tag === 'SELECT' ? 'select' : tag === 'TEXTAREA' ? 'textarea' : 'input';
    this.field?.control.set(this);

    // Native readonly for input/textarea, set and removed by the field only, so an app's own
    // `[readOnly]` binding is never overwritten.
    effect(() => {
      const readonly = !!this.field?.readonly();
      if (this.kind === 'select') return;
      const el = this.el as HTMLInputElement | HTMLTextAreaElement;
      if (readonly) {
        el.readOnly = true;
        this.readonlyByField = true;
      } else if (this.readonlyByField) {
        el.readOnly = false;
        this.readonlyByField = false;
      }
    });

    // Values also change without an `input` event: [value] bindings (re-read after rendering) and
    // Angular forms (setValue / reset write the DOM directly, possibly without a render).
    afterEveryRender({ read: () => this.field?.counter() && this.syncLength() });
    afterNextRender(() =>
      this.ngControl?.valueChanges?.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.syncLength()),
    );
  }

  protected syncLength() {
    if (this.kind === 'select') return;
    const el = this.el as HTMLInputElement | HTMLTextAreaElement;
    this.length.set(el.value.length);
    this.maxLength.set(el.maxLength >= 0 ? el.maxLength : null);
  }

  /** A native select has no readonly attribute: block the keys and clicks that would change it. */
  protected guardSelect(event: Event) {
    if (this.kind !== 'select' || !this.field?.readonly()) return;
    if (event.type === 'mousedown') {
      event.preventDefault();
      this.el.focus();
      return;
    }
    const { key, ctrlKey, metaKey } = event as KeyboardEvent;
    if (ctrlKey || metaKey || key === 'Tab') return;
    if (SELECT_CHANGE_KEYS.has(key) || key.length === 1) event.preventDefault();
  }
}
