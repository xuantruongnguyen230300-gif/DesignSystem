import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NxtIcon, NxtIconName } from '@nxt/ui/icon';
import { PAGES } from '../../generated/content';
import { fold } from '../core/tokens-data';

interface SearchItem {
  key: string;
  title: string;
  meta: string;
  icon: NxtIconName;
  path: string;
  fragment?: string;
  haystack: string;
  rank: number;
}

const SECTION_ICON: Record<string, NxtIconName> = {
  'getting-started': 'rocket',
  foundations: 'palette',
  components: 'components',
  templates: 'template',
};

const INDEX: SearchItem[] = [
  ...PAGES.map((p) => ({
    key: p.path,
    title: p.title,
    meta: p.sectionTitle,
    icon: SECTION_ICON[p.section] ?? 'file-text',
    path: p.path,
    haystack: fold([p.title, ...(p.keywords ?? []), p.description].join(' ')),
    rank: 0,
  })),
  ...PAGES.flatMap((p) =>
    p.toc.map((t) => ({
      key: `${p.path}#${t.id}`,
      title: t.text,
      meta: p.title,
      icon: 'corner-down-left' as NxtIconName,
      path: p.path,
      fragment: t.id,
      haystack: fold(`${t.text} ${p.title}`),
      rank: 1,
    })),
  ),
  { key: '/roadmap', title: 'Roadmap & trạng thái', meta: 'Tài nguyên', icon: 'map-2', path: '/roadmap', haystack: fold('roadmap trang thai ke hoach lo trinh'), rank: 0 },
];

/**
 * Header search in the Windows / Microsoft 365 style: a search box in the top bar with results
 * dropping down beneath it (not a centered macOS-style palette). Ctrl+K focuses it.
 * Combobox + listbox, diacritic-insensitive ("nut" finds "Nút").
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
        [attr.aria-expanded]="open()"
        [attr.aria-activedescendant]="open() && results().length ? 'docs-search-opt-' + active() : null"
        placeholder="Tìm kiếm"
        autocomplete="off"
        spellcheck="false"
        [value]="query()"
        (input)="onInput($event)"
        (focus)="open.set(true)"
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
            <p class="docs-search__empty" role="status">Không có kết quả cho “{{ query() }}”. Thử từ khoá ngắn hơn, ví dụ “nút”, “màu”, “lưới”.</p>
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

  protected readonly results = computed(() => {
    const q = fold(this.query().trim());
    if (!q) return INDEX.filter((i) => i.rank === 0).slice(0, 8);
    const words = q.split(/\s+/);
    return INDEX.filter((i) => words.every((w) => i.haystack.includes(w)))
      .map((i) => ({ i, score: i.rank * 10 + (fold(i.title).startsWith(q) ? 0 : fold(i.title).includes(q) ? 1 : 2) }))
      .sort((a, b) => a.score - b.score)
      .slice(0, 10)
      .map((x) => x.i);
  });

  protected onGlobalKey(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
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
