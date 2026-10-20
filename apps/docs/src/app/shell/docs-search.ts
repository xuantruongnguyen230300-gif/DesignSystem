import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { NxtIcon } from '@nxt/ui/icon';
import { fold } from '../core/tokens-data';
import type { SearchItem } from './search-index';

/**
 * Header search in the Windows / Microsoft 365 style: a search box in the top bar with results
 * dropping down beneath it (not a centered macOS-style palette). Ctrl+K focuses it.
 * Combobox + listbox, diacritic-insensitive ("nut" finds "Nút").
 *
 * The index (every page's keywords and table of contents) is a lazy chunk: prefetched when the browser is idle
 * after first render, and loaded at the latest on focus / Ctrl+K. Typing before it arrives is kept; results
 * appear as soon as it has loaded (the status line reads "Đang tải…" meanwhile).
 */
@Component({
  selector: 'docs-search',
  imports: [NxtIcon],
  template: `
    <div class="docs-search" [attr.data-open]="open() || null" (focusout)="onFocusOut($event)">
      <nxt-icon class="docs-search__icon" name="search" />
      <label class="nxt-visually-hidden" for="docs-search-input">Tìm trong tài liệu</label>
      <input
        #input
        id="docs-search-input"
        class="docs-search__input"
        type="text"
        role="combobox"
        aria-autocomplete="list"
        aria-controls="docs-search-results"
        aria-keyshortcuts="Control+K"
        [attr.aria-expanded]="expanded()"
        [attr.aria-activedescendant]="expanded() ? 'docs-search-opt-' + active() : null"
        placeholder="Tìm kiếm"
        autocomplete="off"
        spellcheck="false"
        [value]="query()"
        (input)="onInput($event)"
        (focus)="onFocus()"
        (click)="open.set(true)"
        (keydown)="onKey($event)"
      />
      @if (query()) {
        <button type="button" class="docs-search__clear" aria-label="Xoá nội dung tìm kiếm" (click)="clear()">
          <nxt-icon name="x" />
        </button>
      } @else {
        <kbd class="docs-search__shortcut" aria-hidden="true">Ctrl+K</kbd>
      }

      @if (open()) {
        <div class="docs-search__panel">
          @if (results().length) {
            <ul id="docs-search-results" role="listbox" aria-label="Kết quả tìm kiếm" class="docs-search__results">
              @for (r of results(); track r.key; let i = $index) {
                <li
                  role="option"
                  class="docs-search__option"
                  [id]="'docs-search-opt-' + i"
                  [attr.aria-selected]="i === active()"
                  (pointerdown)="$event.preventDefault()"
                  (click)="go(r)"
                  (pointermove)="active.set(i)"
                >
                  <nxt-icon [name]="r.icon" />
                  <span class="docs-search__title">{{ r.title }}</span>
                  <span class="docs-search__meta">{{ r.meta }}</span>
                </li>
              }
            </ul>
          } @else {
            <!-- One status element for every non-result state, so its text changes are announced. -->
            <p class="docs-search__empty" role="status">
              @if (loadError()) {
                Không tải được dữ liệu tìm kiếm. Kiểm tra kết nối mạng rồi thử lại.
              } @else if (!index()) {
                Đang tải…
              } @else {
                Không có kết quả cho “{{ query() }}”. Thử từ khoá ngắn hơn, ví dụ “nút”, “màu”, “lưới”.
              }
            </p>
          }
          <p class="docs-search__hint" aria-hidden="true">
            <kbd>↑</kbd><kbd>↓</kbd> để chọn · <kbd>Enter</kbd> để mở · <kbd>Esc</kbd> để đóng
          </p>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown)': 'onGlobalKey($event)' },
})
export class DocsSearch {
  private readonly router = inject(Router);
  private readonly input = viewChild.required<ElementRef<HTMLInputElement>>('input');
  protected readonly query = signal('');
  protected readonly open = signal(false);
  protected readonly active = signal(0);
  /** null until the lazy index chunk has loaded. */
  protected readonly index = signal<readonly SearchItem[] | null>(null);
  protected readonly loadError = signal(false);
  private loading: Promise<void> | null = null;

  protected readonly results = computed(() => {
    const index = this.index();
    if (!index) return [];
    const q = fold(this.query().trim());
    if (!q) return index.filter((i) => i.rank === 0).slice(0, 8);
    const words = q.split(/\s+/);
    return index
      .filter((i) => words.every((w) => i.haystack.includes(w)))
      .map((i) => ({ i, score: i.rank * 10 + (fold(i.title).startsWith(q) ? 0 : fold(i.title).includes(q) ? 1 : 2) }))
      .sort((a, b) => a.score - b.score)
      .slice(0, 10)
      .map((x) => x.i);
  });
  /**
   * The listbox popup is displayed. The panel can be open without it (loading, no results: a status line only),
   * and then aria-expanded must stay false, since aria-controls would point at a listbox that does not exist.
   */
  protected readonly expanded = computed(() => this.open() && this.results().length > 0);

  constructor() {
    // Prefetch once the page has rendered and the browser is idle, so the first search is usually instant.
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const load = () => void this.loadIndex();
      if (typeof requestIdleCallback === 'function') {
        const id = requestIdleCallback(load, { timeout: 3000 });
        destroyRef.onDestroy(() => cancelIdleCallback(id));
      } else {
        const id = setTimeout(load, 1500);
        destroyRef.onDestroy(() => clearTimeout(id));
      }
    });
  }

  /** Loads the index chunk once. Never rejects: a failure is shown in the status line and retried on next focus. */
  private loadIndex(): Promise<void> {
    if (!this.loading) {
      this.loadError.set(false);
      this.loading = import('./search-index').then(
        (m) => this.index.set(m.SEARCH_INDEX),
        () => {
          this.loading = null;
          this.loadError.set(true);
        },
      );
    }
    return this.loading;
  }

  protected onFocus() {
    this.open.set(true);
    void this.loadIndex();
  }

  protected onGlobalKey(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      void this.loadIndex();
      const el = this.input().nativeElement;
      el.focus();
      el.select();
      this.open.set(true);
    }
  }

  protected onInput(event: Event) {
    this.query.set((event.target as HTMLInputElement).value);
    this.active.set(0);
    this.open.set(true);
    void this.loadIndex();
  }

  protected onKey(event: KeyboardEvent) {
    const n = this.results().length;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.open.set(true);
      if (n) this.active.update((a) => (a + 1) % n);
      this.scrollActive();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (n) this.active.update((a) => (a - 1 + n) % n);
      this.scrollActive();
    } else if (event.key === 'Enter' && this.open() && n) {
      event.preventDefault();
      this.go(this.results()[this.active()]);
    } else if (event.key === 'Enter' && this.open() && !this.index()) {
      // Typed and pressed Enter before the index arrived: open the top result once it has loaded.
      event.preventDefault();
      const query = this.query();
      void this.loadIndex().then(() => {
        if (this.open() && this.query() === query && this.results().length) this.go(this.results()[this.active()]);
      });
    } else if (event.key === 'Escape') {
      // Windows convention: first Esc closes the results, second clears the box.
      if (this.open()) this.open.set(false);
      else this.clear();
    }
  }

  protected onFocusOut(event: FocusEvent) {
    const next = event.relatedTarget as Node | null;
    if (!next || !(event.currentTarget as HTMLElement).contains(next)) this.open.set(false);
  }

  protected clear() {
    this.query.set('');
    this.active.set(0);
    this.input().nativeElement.focus();
  }

  private scrollActive() {
    queueMicrotask(() => document.getElementById(`docs-search-opt-${this.active()}`)?.scrollIntoView({ block: 'nearest' }));
  }

  protected go(item: SearchItem) {
    this.open.set(false);
    this.query.set('');
    this.input().nativeElement.blur();
    void this.router.navigate([item.path], { fragment: item.fragment });
  }
}
