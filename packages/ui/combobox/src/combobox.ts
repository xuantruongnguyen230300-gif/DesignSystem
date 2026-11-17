import { ListKeyManager, LiveAnnouncer } from '@angular/cdk/a11y';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  TemplateRef,
  ViewContainerRef,
  ViewEncapsulation,
  afterNextRender,
  afterRenderEffect,
  booleanAttribute,
  computed,
  effect,
  forwardRef,
  inject,
  input,
  linkedSignal,
  model,
  numberAttribute,
  output,
  signal,
  untracked,
  viewChild,
  viewChildren,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NxtFormField, NxtInput } from '@nxt/ui/form-field';
import { NxtIcon } from '@nxt/ui/icon';
import { nxtFold, nxtMatches } from '@nxt/ui/search';
import { NxtTooltip } from '@nxt/ui/tooltip';

/** One choice of a combobox. Choices that cannot be picked are left out, never disabled. */
export interface NxtComboboxOption<K = string> {
  /** Stored value. */
  key: K;
  /** Visible text, also what the box shows once chosen. */
  label: string;
  /** Short secondary text shown at the end (code, abbreviation); also searched. */
  description?: string;
  /** Heading of the group this choice belongs to. Choices of one group must be next to each other. */
  group?: string;
  /** Extra words that are searched but not shown (former name, English name). */
  keywords?: string;
}

/** Every text the combobox shows or announces (i18n). */
export interface NxtComboboxTexts {
  toggle: string;
  clear: string;
  valueHelp: string;
  noResults: string;
  loading: string;
  /** Accessible name of the list of chosen values (multiple). */
  selected: string;
  remove: (label: string) => string;
  added: (label: string) => string;
  removed: (label: string) => string;
}

const TEXTS: NxtComboboxTexts = {
  toggle: 'Hiện danh sách',
  clear: 'Xoá lựa chọn',
  valueHelp: 'Mở danh sách đầy đủ',
  noResults: 'Không có kết quả phù hợp',
  loading: 'Đang tải…',
  selected: 'Đã chọn',
  remove: (label) => `Bỏ ${label}`,
  added: (label) => `Đã thêm ${label}`,
  removed: (label) => `Đã bỏ ${label}`,
};

/** A run of text that does (`match`) or does not match the query. */
export interface NxtHighlightPart {
  text: string;
  match: boolean;
}

/**
 * Splits `text` into runs that match a word of `query` or not, ignoring case and Vietnamese diacritics,
 * so "nguyen" marks "Nguyễn". Same matching rule as `nxtMatches` (every word, anywhere, any order).
 */
export function nxtHighlight(text: string, query: string): NxtHighlightPart[] {
  const words = nxtFold(query).split(/\s+/).filter(Boolean);
  const chars = Array.from(text.normalize('NFC'));
  if (!words.length || !chars.length) return [{ text, match: false }];
  // Fold character by character and remember which character each folded code unit came from.
  let folded = '';
  const owner: number[] = [];
  chars.forEach((c, i) => {
    const f = nxtFold(c);
    for (let j = 0; j < f.length; j++) owner.push(i);
    folded += f;
  });
  const marked = chars.map(() => false);
  for (const w of words) {
    for (let at = folded.indexOf(w); at >= 0; at = folded.indexOf(w, at + w.length)) {
      for (let k = at; k < at + w.length; k++) marked[owner[k]] = true;
    }
  }
  // A lone combining mark (text not in NFC) belongs with the letter before it.
  chars.forEach((c, i) => {
    if (i > 0 && !nxtFold(c)) marked[i] = marked[i - 1];
  });
  const parts: NxtHighlightPart[] = [];
  chars.forEach((c, i) => {
    const last = parts[parts.length - 1];
    if (last && last.match === marked[i]) last.text += c;
    else parts.push({ text: c, match: marked[i] });
  });
  return parts;
}

interface OptionItem<K> {
  option: NxtComboboxOption<K>;
  id: string;
  label: NxtHighlightPart[];
  description: NxtHighlightPart[] | null;
  getLabel(): string;
}

interface Section<K> {
  id: string;
  label: string | null;
  items: OptionItem<K>[];
}

let nextId = 0;

/**
 * Pick one value — or several, shown as removable tokens (`multiple`) — from a list by typing a few letters,
 * with or without diacritics (WAI-ARIA combobox, list autocomplete). Stores keys, not typed text: text that
 * matches no choice is not kept. Put it in `nxt-form-field` for the label, hint and value states; works with
 * `[(value)]` / `[(values)]` and Angular forms. Large lists: `searchMode="server"` + `(query)`, plus a
 * `valueHelp` button that opens `nxt-value-help`.
 */
@Component({
  selector: 'nxt-combobox',
  imports: [NgTemplateOutlet, NxtIcon, NxtInput, NxtTooltip],
  template: `
    <div class="nxt-combobox__values">
      @if (multiple() && chosenOptions().length) {
        <ul class="nxt-combobox__tokens" role="list" [attr.aria-label]="t().selected">
          @for (o of chosenOptions(); track o.key; let i = $index) {
            <li class="nxt-combobox__token" [title]="o.label">
              <span class="nxt-combobox__token-text">{{ o.label }}</span>
              @if (interactive()) {
                <button
                  #tokenButton
                  type="button"
                  class="nxt-combobox__token-remove"
                  tabindex="-1"
                  [attr.aria-label]="t().remove(o.label)"
                  (mousedown)="$event.preventDefault()"
                  (click)="removeAt(i, $event.detail === 0 ? 'next' : 'input')"
                  (keydown)="onTokenKeydown($event, i)"
                >
                  <nxt-icon name="x" />
                </button>
              }
            </li>
          }
        </ul>
      }
      <input
        #box
        nxtInput
        class="nxt-combobox__input"
        type="text"
        role="combobox"
        autocomplete="off"
        spellcheck="false"
        aria-autocomplete="list"
        aria-haspopup="listbox"
        [attr.aria-label]="field ? null : label() || null"
        [attr.aria-expanded]="isOpen()"
        [attr.aria-controls]="isOpen() ? listboxId : null"
        [attr.aria-activedescendant]="isOpen() ? activeId() : null"
        [placeholder]="multiple() && values().length ? '' : placeholder()"
        [value]="text()"
        [disabled]="isDisabled()"
        [readOnly]="isReadonly()"
        (input)="onInput($event)"
        (keydown)="onKeydown($event)"
        (click)="open()"
        (blur)="onBlur()"
      />
    </div>
    @if (interactive()) {
      @if (clearable() && !multiple() && value() !== null) {
        <!-- Out of the Tab order: Escape does the same for keyboard users. -->
        <button
          type="button"
          class="nxt-combobox__button nxt-combobox__clear"
          tabindex="-1"
          [attr.aria-label]="t().clear"
          (mousedown)="$event.preventDefault()"
          (click)="clear()"
        >
          <nxt-icon name="x" />
        </button>
      }
      <!-- Out of the Tab order (APG): Alt+Down opens the list from the box. -->
      <button
        type="button"
        class="nxt-combobox__button nxt-combobox__toggle"
        tabindex="-1"
        [attr.aria-label]="t().toggle"
        [attr.aria-expanded]="isOpen()"
        [attr.aria-controls]="isOpen() ? listboxId : null"
        (mousedown)="$event.preventDefault()"
        (click)="toggle()"
      >
        <nxt-icon name="selector" />
      </button>
      @if (valueHelp()) {
        <button
          type="button"
          class="nxt-combobox__button nxt-combobox__help"
          [attr.aria-label]="t().valueHelp"
          [nxtTooltip]="t().valueHelp"
          (click)="requestValueHelp()"
        >
          <nxt-icon name="list-details" />
        </button>
      }
    }

    <ng-template #panel>
      <!-- mousedown is cancelled so a click on a choice never takes focus away from the box. -->
      <div class="nxt-combobox__popup" [id]="popupId" (mousedown)="$event.preventDefault()">
        @if (loading()) {
          <p class="nxt-combobox__message"><nxt-icon class="nxt-combobox__spinner" name="loader-2" />{{ t().loading }}</p>
        } @else if (!items().length) {
          <p class="nxt-combobox__message">{{ t().noResults }}</p>
        }
        <div
          class="nxt-combobox__listbox"
          role="listbox"
          [id]="listboxId"
          [attr.aria-label]="listLabel()"
          [attr.aria-multiselectable]="multiple() || null"
          [attr.aria-busy]="loading() || null"
        >
          @for (s of sections(); track s.id) {
            @if (s.label) {
              <div class="nxt-combobox__group" role="group" [attr.aria-labelledby]="s.id">
                <div class="nxt-combobox__group-label" role="presentation" [id]="s.id">{{ s.label }}</div>
                @for (item of s.items; track item.id) {
                  <ng-container [ngTemplateOutlet]="optionTemplate" [ngTemplateOutletContext]="{ $implicit: item }" />
                }
              </div>
            } @else {
              @for (item of s.items; track item.id) {
                <ng-container [ngTemplateOutlet]="optionTemplate" [ngTemplateOutletContext]="{ $implicit: item }" />
              }
            }
          }
        </div>
      </div>
    </ng-template>

    <ng-template #optionTemplate let-item>
      <div
        class="nxt-combobox__option"
        role="option"
        [id]="item.id"
        [attr.aria-selected]="multiple() ? isChosen(item.option.key) : item.id === activeId()"
        [attr.data-active]="item.id === activeId() || null"
        [attr.data-selected]="isChosen(item.option.key) || null"
        (click)="choose(item)"
      >
        @if (multiple()) {
          <span class="nxt-combobox__check" aria-hidden="true">
            @if (isChosen(item.option.key)) {
              <nxt-icon name="check" />
            }
          </span>
        } @else {
          <nxt-icon class="nxt-combobox__checkmark" name="check" />
        }
        <span class="nxt-combobox__option-label">
          @for (p of item.label; track $index) {<span [class.nxt-combobox__match]="p.match">{{ p.text }}</span>}
        </span>
        @if (item.description) {
          <span class="nxt-combobox__option-description">
            @for (p of item.description; track $index) {<span [class.nxt-combobox__match]="p.match">{{ p.text }}</span>}
          </span>
        }
      </div>
    </ng-template>
  `,
  styleUrl: './combobox.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => NxtCombobox), multi: true }],
  host: {
    class: 'nxt-combobox',
    '[attr.data-framed]': 'field ? null : ""',
    '[attr.data-size]': 'field ? null : size()',
    '[attr.data-multiple]': 'multiple() || null',
    '[attr.data-disabled]': 'isDisabled() || null',
    '[attr.data-readonly]': 'isReadonly() || null',
    '[attr.data-open]': 'isOpen() || null',
    '(click)': 'onHostClick($event)',
  },
})
export class NxtCombobox<K = string> implements ControlValueAccessor {
  protected readonly field = inject(NxtFormField, { optional: true });
  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private readonly overlay = inject(Overlay);
  private readonly vcr = inject(ViewContainerRef);
  private readonly announcer = inject(LiveAnnouncer);

  /** Choices, already sorted (Intl.Collator('vi')); choices of one group next to each other. */
  readonly options = input<readonly NxtComboboxOption<K>[]>([]);
  /** Pick several values, shown as removable tokens. */
  readonly multiple = input(false, { transform: booleanAttribute });
  /** Chosen key (single choice, two-way). */
  readonly value = model<K | null>(null);
  /** Chosen keys in the order they were picked (`multiple`, two-way). */
  readonly values = model<K[]>([]);
  /** Example value or how to search: "Gõ tên hoặc mã phòng ban". Hidden once there are tokens. */
  readonly placeholder = input('');
  /** Accessible name when the combobox is not inside `nxt-form-field`. */
  readonly label = input<string>();
  /** Only when standing alone; inside a form field the field's size applies. */
  readonly size = input<'sm' | 'md'>('md');
  /** Not usable; also set by Angular forms (`control.disable()`). Say why in the field's hint. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Can be focused and copied, not changed. The read-only state of `nxt-form-field` is honoured too. */
  readonly readonly = input(false, { transform: booleanAttribute });
  /** Choices are being loaded: shows "Đang tải…" and sets aria-busy on the list. */
  readonly loading = input(false, { transform: booleanAttribute });
  /** `local`: filter `options` here (diacritic-insensitive). `server`: show `options` as given, reload them on `query`. */
  readonly searchMode = input<'local' | 'server'>('local');
  /** Delay before `query` is emitted while typing, in ms. Local filtering is never delayed. */
  readonly debounce = input(250, { transform: numberAttribute });
  /** Show a button that clears the value (single choice). Not needed on required fields. */
  readonly clearable = input(false, { transform: booleanAttribute });
  /** Show a button that opens the full list (`nxt-value-help`) — emits `valueHelpRequested`. */
  readonly valueHelp = input(false, { transform: booleanAttribute });
  /** Texts shown or announced (i18n); missing keys use the Vietnamese defaults. */
  readonly texts = input<Partial<NxtComboboxTexts>>({});

  /** Text typed by the user, after `debounce`; emitted at once with the current text when the list opens. */
  readonly query = output<string>();
  /** The value help button was pressed; carries the text the user typed, for the value help's search box. */
  readonly valueHelpRequested = output<string>();

  private readonly baseId = `nxt-combobox-${nextId++}`;
  protected readonly listboxId = `${this.baseId}-listbox`;
  protected readonly popupId = `${this.baseId}-popup`;
  protected readonly t = computed<NxtComboboxTexts>(() => ({ ...TEXTS, ...this.texts() }));

  private readonly formDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled());
  protected readonly isReadonly = computed(() => this.readonly() || !!this.field?.readonly());
  protected readonly interactive = computed(() => !this.isDisabled() && !this.isReadonly());
  protected readonly isOpen = signal(false);
  protected readonly listLabel = computed(() => this.label() ?? this.field?.label() ?? null);

  /** Text the user typed since the last choice; filters the list. */
  protected readonly term = signal('');
  /** Labels of keys seen before, so chosen values keep their label when server results change. */
  private readonly known = signal(new Map<K, NxtComboboxOption<K>>());
  private readonly optionMap = computed(() => new Map(this.options().map((o) => [o.key, o] as const)));
  private readonly selectedLabel = computed(() => {
    const v = this.value();
    return v === null || v === undefined ? '' : this.lookup(v).label;
  });
  /** What the box shows: the chosen label (single), or only the typed text (multiple). */
  protected readonly text = linkedSignal(() => (this.multiple() ? '' : this.selectedLabel()));
  protected readonly chosenOptions = computed(() => this.values().map((k) => this.lookup(k)));
  private readonly chosenSet = computed(() => new Set<K>(this.multiple() ? this.values() : this.value() === null ? [] : [this.value() as K]));

  protected readonly items = computed<OptionItem<K>[]>(() => {
    const term = this.term();
    const filter = this.searchMode() === 'local' && !!term.trim();
    const out: OptionItem<K>[] = [];
    this.options().forEach((option, i) => {
      if (filter && !nxtMatches(term, option.label, option.description, option.keywords)) return;
      out.push({
        option,
        id: `${this.baseId}-option-${i}`,
        label: nxtHighlight(option.label, term),
        description: option.description ? nxtHighlight(option.description, term) : null,
        getLabel: () => option.label,
      });
    });
    return out;
  });

  protected readonly sections = computed<Section<K>[]>(() => {
    const sections: Section<K>[] = [];
    for (const item of this.items()) {
      const group = item.option.group ?? null;
      const last = sections[sections.length - 1];
      if (last && last.label === group) last.items.push(item);
      else sections.push({ id: `${this.baseId}-group-${sections.length}`, label: group, items: [item] });
    }
    return sections;
  });

  /** Arrow keys, Page Up / Page Down over the visible choices (CDK, base of ActiveDescendantKeyManager). */
  private readonly keys = new ListKeyManager<OptionItem<K>>(this.items, this.injector).withWrap().withPageUpDown(true, 10);
  protected readonly activeId = computed(() => this.keys.activeItem?.id ?? null);

  private readonly box = viewChild.required<ElementRef<HTMLInputElement>>('box');
  private readonly panel = viewChild.required<TemplateRef<unknown>>('panel');
  private readonly tokenButtons = viewChildren<ElementRef<HTMLButtonElement>>('tokenButton');
  private overlayRef: OverlayRef | null = null;
  private portal: TemplatePortal | null = null;
  private timer: ReturnType<typeof setTimeout> | undefined;
  /** Last text typed, kept after the box loses focus so the value help can search for it. */
  private lastTyped = '';
  private announcedEmpty = false;
  private onChange: (value: unknown) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      clearTimeout(this.timer);
      this.ownByModal(false);
      this.overlayRef?.dispose();
      this.keys.destroy();
    });

    // Remember every label seen (server mode replaces `options` on each query).
    effect(() => {
      const options = this.options();
      untracked(() => this.remember(...options));
    });

    // The visible choices changed: typing highlights the first match; otherwise keep the same choice highlighted.
    effect(() => {
      const items = this.items();
      untracked(() => {
        if (!this.isOpen()) return;
        if (this.term().trim()) {
          this.keys.setActiveItem(items.length ? 0 : -1);
          return;
        }
        const active = this.keys.activeItem;
        this.keys.setActiveItem(items.find((i) => active && i.option.key === active.option.key) ?? -1);
      });
    });

    // "Không có kết quả phù hợp" is announced once each time the filtered list becomes empty.
    effect(() => {
      const empty = this.isOpen() && !this.loading() && !!this.term().trim() && this.items().length === 0;
      untracked(() => {
        if (empty && !this.announcedEmpty) this.announcer.announce(this.t().noResults, 'polite');
        this.announcedEmpty = empty;
      });
    });

    // Keep the highlighted choice in view.
    afterRenderEffect(() => {
      const id = this.activeId();
      if (id) this.document.getElementById(id)?.scrollIntoView?.({ block: 'nearest' });
    });
  }

  focus() {
    this.box().nativeElement.focus();
  }

  /** Open the list. `activate`: which choice is highlighted first. */
  open(activate: 'selected' | 'first' | 'last' | 'none' = 'selected', emitQuery = true) {
    if (this.isOpen() || !this.interactive()) return;
    const origin = this.origin();
    const ref = this.ensureOverlay(origin);
    ref.updateSize({ width: origin.getBoundingClientRect().width });
    ref.attach((this.portal ??= new TemplatePortal(this.panel(), this.vcr)));
    this.isOpen.set(true);
    this.ownByModal(true);
    if (emitQuery) this.emitQuery(this.term(), true);

    const items = this.items();
    const chosen = this.multiple() ? -1 : items.findIndex((i) => this.isChosen(i.option.key));
    const index = activate === 'selected' ? chosen : activate === 'first' ? (chosen >= 0 ? chosen : 0) : activate === 'last' ? items.length - 1 : -1;
    this.keys.setActiveItem(index < items.length ? index : -1);
  }

  close() {
    if (!this.isOpen()) return;
    this.overlayRef?.detach();
    this.isOpen.set(false);
    this.ownByModal(false);
    this.keys.setActiveItem(-1);
  }

  // ---------- ControlValueAccessor ----------
  writeValue(value: unknown): void {
    if (this.multiple() || Array.isArray(value)) this.values.set(Array.isArray(value) ? [...(value as K[])] : []);
    else this.value.set((value ?? null) as K | null);
  }

  registerOnChange(fn: (value: unknown) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.formDisabled.set(disabled);
  }

  // ---------- template handlers ----------
  protected isChosen(key: K): boolean {
    return this.chosenSet().has(key);
  }

  protected onInput(event: Event) {
    const text = (event.target as HTMLInputElement).value;
    this.text.set(text);
    this.term.set(text);
    if (text.trim()) this.lastTyped = text;
    this.emitQuery(text);
    if (!this.isOpen()) this.open('none', false);
  }

  protected onKeydown(event: KeyboardEvent) {
    // Keys pressed while a Telex / VNI word is being composed belong to the input method.
    if (event.isComposing) return;
    const open = this.isOpen();
    const active = this.keys.activeItem;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (event.altKey) this.open('selected');
        else if (!open) this.open('first');
        else this.keys.onKeydown(event);
        return;
      case 'ArrowUp':
        event.preventDefault();
        if (event.altKey) this.close();
        else if (!open) this.open('last');
        else this.keys.onKeydown(event);
        return;
      case 'PageUp':
      case 'PageDown':
        if (!open) return;
        event.preventDefault();
        this.keys.onKeydown(event);
        return;
      case 'Enter':
        if (open && active) {
          event.preventDefault();
          this.choose(active);
        } else if (open) {
          event.preventDefault();
          this.close();
        } else if (!this.multiple()) {
          this.commitText();
        }
        return;
      case 'Escape':
        if (open) {
          event.preventDefault();
          event.stopPropagation();
          this.close();
        } else if (this.text()) {
          event.preventDefault();
          event.stopPropagation();
          this.clearText();
        }
        return;
      case 'Tab':
        if (open && active && !this.multiple()) this.choose(active);
        return;
      case 'Backspace':
        if (this.multiple() && !this.text() && this.values().length) {
          event.preventDefault();
          this.removeAt(this.values().length - 1, 'input');
        }
        return;
      case 'ArrowLeft':
        if (this.multiple() && !this.text() && this.values().length) {
          event.preventDefault();
          this.close();
          this.focusToken(this.values().length - 1);
        }
        return;
    }
  }

  protected onBlur() {
    this.close();
    this.onTouched();
    if (this.multiple()) {
      this.text.set('');
      this.term.set('');
    } else {
      this.commitText();
    }
  }

  protected onHostClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (this.interactive() && !target.closest('button, input')) this.focus();
  }

  protected toggle() {
    if (this.isOpen()) {
      this.close();
      return;
    }
    this.focus();
    this.open('selected');
  }

  protected clear() {
    this.text.set('');
    this.term.set('');
    this.setValue(null);
    this.focus();
  }

  protected requestValueHelp() {
    this.close();
    this.valueHelpRequested.emit(this.term().trim() || this.lastTyped.trim());
  }

  protected choose(item: OptionItem<K>) {
    const option = item.option;
    this.remember(option);
    if (this.multiple()) {
      this.toggleKey(option);
      if (this.term()) {
        this.text.set('');
        this.term.set('');
        this.emitQuery('', true);
      }
      return;
    }
    this.lastTyped = '';
    this.setValue(option.key);
    this.text.set(option.label);
    this.term.set('');
    this.close();
  }

  /** Remove the token at `index`; `focus` says where focus goes afterwards. */
  protected removeAt(index: number, focus: 'next' | 'prev' | 'input') {
    const values = this.values();
    if (index < 0 || index >= values.length) return;
    const label = this.lookup(values[index]).label;
    const next = values.filter((_, i) => i !== index);
    this.setValues(next);
    this.announcer.announce(this.t().removed(label), 'polite');
    const n = next.length;
    const target = focus === 'input' || n === 0 ? -1 : focus === 'next' ? (index < n ? index : -1) : Math.max(0, index - 1);
    afterNextRender(() => (target < 0 ? this.focus() : this.tokenButtons()[target]?.nativeElement.focus()), { injector: this.injector });
  }

  protected onTokenKeydown(event: KeyboardEvent, index: number) {
    const n = this.values().length;
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        this.focusToken(Math.max(0, index - 1));
        return;
      case 'ArrowRight':
        event.preventDefault();
        if (index < n - 1) this.focusToken(index + 1);
        else this.focus();
        return;
      case 'Delete':
        event.preventDefault();
        this.removeAt(index, 'next');
        return;
      case 'Backspace':
        event.preventDefault();
        this.removeAt(index, 'prev');
        return;
    }
  }

  // ---------- internals ----------
  private lookup(key: K): NxtComboboxOption<K> {
    return this.optionMap().get(key) ?? this.known().get(key) ?? { key, label: String(key) };
  }

  private remember(...options: readonly NxtComboboxOption<K>[]) {
    if (!options.length) return;
    const map = new Map(this.known());
    for (const o of options) map.set(o.key, o);
    this.known.set(map);
  }

  private setValue(key: K | null) {
    if (this.value() === key) return;
    this.value.set(key);
    this.onChange(key);
  }

  private setValues(keys: K[]) {
    this.values.set(keys);
    this.onChange(keys);
  }

  private toggleKey(option: NxtComboboxOption<K>) {
    const has = this.values().includes(option.key);
    this.setValues(has ? this.values().filter((k) => k !== option.key) : [...this.values(), option.key]);
    this.announcer.announce(has ? this.t().removed(option.label) : this.t().added(option.label), 'polite');
  }

  /**
   * Single choice, on leaving the box (or Enter while closed): text matching exactly one label or code picks
   * it, empty text clears the value, anything else goes back to the current label (typed values are blocked).
   */
  private commitText() {
    const text = this.text().trim();
    this.term.set('');
    if (!text) {
      this.text.set('');
      this.setValue(null);
      return;
    }
    const current = this.selectedLabel();
    if (text === current) return;
    const folded = nxtFold(text);
    const exact = this.options().find((o) => nxtFold(o.label) === folded || (!!o.description && nxtFold(o.description) === folded));
    if (exact) {
      this.remember(exact);
      this.setValue(exact.key);
      this.text.set(exact.label);
    } else {
      this.text.set(current);
    }
  }

  /** Escape on a closed list with text: clear it (single choice: the value too). */
  private clearText() {
    this.text.set('');
    this.term.set('');
    this.lastTyped = '';
    if (!this.multiple()) this.setValue(null);
  }

  private focusToken(index: number) {
    this.tokenButtons()[index]?.nativeElement.focus();
  }

  private emitQuery(text: string, now = false) {
    clearTimeout(this.timer);
    if (now || !this.debounce()) this.query.emit(text);
    else this.timer = setTimeout(() => this.query.emit(text), this.debounce());
  }

  /** The list lines up with the whole field frame, not just the text box. */
  private origin(): HTMLElement {
    return this.host.closest<HTMLElement>('.nxt-form-field__control') ?? this.host;
  }

  private ensureOverlay(origin: HTMLElement): OverlayRef {
    if (this.overlayRef) return this.overlayRef;
    this.overlayRef = this.overlay.create({
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(origin)
        .withFlexibleDimensions(false)
        .withPush(false)
        .withPositions([
          { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' },
          { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom' },
        ]),
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      panelClass: 'nxt-combobox-pane',
    });
    this.overlayRef.outsidePointerEvents().subscribe((event) => {
      if (!this.host.contains(event.target as Node)) this.close();
    });
    return this.overlayRef;
  }

  /**
   * The popup lives in the CDK overlay container, outside the drawer / dialog. While it is open, a modal
   * ancestor owns it (aria-owns) so screen readers treat it as part of the modal.
   */
  private ownByModal(on: boolean) {
    const modal = this.host.closest('[aria-modal="true"]');
    if (!modal) return;
    const ids = (modal.getAttribute('aria-owns') ?? '').split(/\s+/).filter((id) => id && id !== this.popupId);
    if (on) ids.push(this.popupId);
    if (ids.length) modal.setAttribute('aria-owns', ids.join(' '));
    else modal.removeAttribute('aria-owns');
  }
}
