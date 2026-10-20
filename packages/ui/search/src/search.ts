import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  effect,
  inject,
  input,
  linkedSignal,
  model,
  numberAttribute,
  output,
  untracked,
  viewChild,
} from '@angular/core';
import { NxtIcon } from '@nxt/ui/icon';

/** Lowercase without Vietnamese diacritics: "Nguyễn Đức" → "nguyen duc". */
export function nxtFold(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
}

/**
 * Every word of `query` appears in at least one of `fields`, ignoring case and diacritics, in any order:
 * nxtMatches('ke toan tong', 'KT-TH', 'Kế toán tổng hợp') → true. An empty query matches everything.
 */
export function nxtMatches(query: string, ...fields: (string | number | null | undefined)[]): boolean {
  const words = nxtFold(query).split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  const haystack = fields
    .filter((f) => f != null && f !== '')
    .map((f) => nxtFold(String(f)))
    .join(' ');
  return words.every((w) => haystack.includes(w));
}

let nextId = 0;

/**
 * Search box for lists: magnifier, clear button, Escape clears (Windows convention), diacritic-insensitive
 * helpers (`nxtFold`, `nxtMatches`). The label is required and visually hidden unless `showLabel`.
 */
@Component({
  selector: 'nxt-search',
  imports: [NxtIcon],
  template: `
    <label class="nxt-search__label" [for]="inputId" [class.nxt-visually-hidden]="!showLabel()">{{ label() }}</label>
    <div class="nxt-search__control">
      <nxt-icon class="nxt-search__icon" name="search" />
      <input
        #box
        class="nxt-search__input"
        type="search"
        autocomplete="off"
        spellcheck="false"
        [id]="inputId"
        [placeholder]="placeholder()"
        [value]="text()"
        (input)="onInput($event)"
        (keydown.escape)="onEscape($event)"
        (keydown.enter)="onEnter()"
      />
      @if (text()) {
        <!-- Out of the Tab order: Escape does the same for keyboard users, so the box stays one Tab stop. -->
        <button type="button" class="nxt-search__clear" tabindex="-1" aria-label="Xoá nội dung tìm kiếm" (click)="clear()">
          <nxt-icon name="x" />
        </button>
      }
    </div>
  `,
  styleUrl: './search.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'nxt-search', '[attr.data-size]': 'size()' },
})
export class NxtSearch {
  /** Accessible name, e.g. "Tìm chức danh". */
  readonly label = input.required<string>();
  /** Say what is searched: "Mã hoặc tên chức danh". */
  readonly placeholder = input('Tìm kiếm');
  /** Show the label above the box (forms, panels). */
  readonly showLabel = input(false, { transform: booleanAttribute });
  readonly size = input<'sm' | 'md'>('md');
  /** Delay before `value` updates, in ms: 0 for local data, about 250 when each change queries a server. */
  readonly debounce = input(0, { transform: numberAttribute });
  /** Search text (two-way), updated after `debounce`. */
  readonly value = model('');
  /** Enter pressed — for searches that only run on demand. */
  readonly submitted = output<string>();

  protected readonly inputId = `nxt-search-${nextId++}`;
  /** What the box shows right now; follows `value` when it is changed from outside (e.g. "Xoá bộ lọc"). */
  protected readonly text = linkedSignal(() => this.value());
  private readonly box = viewChild.required<ElementRef<HTMLInputElement>>('box');
  private timer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
    // `value` changed from outside (e.g. "Xoá tìm kiếm"): drop a pending debounce so old text cannot come back.
    effect(() => {
      this.value();
      untracked(() => clearTimeout(this.timer));
    });
  }

  focus() {
    this.box().nativeElement.focus();
  }

  clear() {
    this.text.set('');
    this.commit('', true);
    this.focus();
  }

  protected onInput(event: Event) {
    const text = (event.target as HTMLInputElement).value;
    this.text.set(text);
    this.commit(text);
  }

  /** Escape clears the text; when already empty it is left alone so it can close the drawer or panel around. */
  protected onEscape(event: Event) {
    if (!this.text()) return;
    event.preventDefault();
    event.stopPropagation();
    this.clear();
  }

  protected onEnter() {
    this.commit(this.text(), true);
    this.submitted.emit(this.text());
  }

  private commit(text: string, now = false) {
    clearTimeout(this.timer);
    if (now || !this.debounce()) this.value.set(text);
    else this.timer = setTimeout(() => this.value.set(text), this.debounce());
  }
}
