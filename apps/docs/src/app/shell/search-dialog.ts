import { DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { PAGES } from '../../generated/content';
import { fold } from '../core/tokens-data';
import { DocsIcon } from './icons';

interface SearchItem {
  key: string;
  title: string;
  meta: string;
  path: string;
  fragment?: string;
  haystack: string;
  rank: number;
}

const INDEX: SearchItem[] = [
  ...PAGES.map((p) => ({
    key: p.path,
    title: p.title,
    meta: p.sectionTitle,
    path: p.path,
    haystack: fold([p.title, ...(p.keywords ?? []), p.description].join(' ')),
    rank: 0,
  })),
  ...PAGES.flatMap((p) =>
    p.toc.map((t) => ({ key: `${p.path}#${t.id}`, title: t.text, meta: p.title, path: p.path, fragment: t.id, haystack: fold(`${t.text} ${p.title}`), rank: 1 })),
  ),
  { key: '/roadmap', title: 'Roadmap & trạng thái', meta: 'Tài nguyên', path: '/roadmap', haystack: fold('roadmap trang thai ke hoach lo trinh'), rank: 0 },
];

/** Command-palette search: combobox + listbox, diacritic-insensitive ("nut" finds "Nút"). */
@Component({
  selector: 'docs-search-dialog',
  imports: [DocsIcon],
  template: `
    <div class="docs-search">
      <div class="docs-search__field">
        <docs-icon name="search" />
        <label class="nxt-visually-hidden" for="docs-search-input">Tìm trong tài liệu</label>
        <input
          id="docs-search-input"
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-controls="docs-search-results"
          [attr.aria-expanded]="results().length > 0"
          [attr.aria-activedescendant]="results().length ? 'docs-search-opt-' + active() : null"
          placeholder="Tìm trang, mục… (không cần gõ dấu)"
          autocomplete="off"
          spellcheck="false"
          [value]="query()"
          (input)="onInput($event)"
          (keydown)="onKey($event)"
        />
        <button type="button" class="docs-tool" (click)="ref.close()">
          <docs-icon name="close" /><span class="nxt-visually-hidden">Đóng tìm kiếm</span>
        </button>
      </div>
      @if (results().length) {
        <ul id="docs-search-results" role="listbox" aria-label="Kết quả tìm kiếm" class="docs-search__results">
          @for (r of results(); track r.key; let i = $index) {
            <li
              role="option"
              [id]="'docs-search-opt-' + i"
              [attr.aria-selected]="i === active()"
              class="docs-search__option"
              (click)="go(r)"
              (pointermove)="active.set(i)"
            >
              <span class="docs-search__title">{{ r.title }}</span>
              <span class="docs-search__meta">{{ r.meta }}</span>
            </li>
          }
        </ul>
      } @else {
        <p class="docs-search__empty" role="status">Không có kết quả cho “{{ query() }}”. Thử từ khoá ngắn hơn, ví dụ “nút”, “màu”, “lưới”.</p>
      }
      <p class="docs-search__hint" aria-hidden="true"><kbd>↑</kbd> <kbd>↓</kbd> chọn · <kbd>Enter</kbd> mở · <kbd>Esc</kbd> đóng</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchDialog {
  protected readonly ref = inject(DialogRef);
  private readonly router = inject(Router);
  protected readonly query = signal('');
  protected readonly active = signal(0);

  protected readonly results = computed(() => {
    const q = fold(this.query().trim());
    if (!q) return INDEX.filter((i) => i.rank === 0).slice(0, 10);
    const words = q.split(/\s+/);
    return INDEX.filter((i) => words.every((w) => i.haystack.includes(w)))
      .map((i) => ({ i, score: i.rank * 10 + (fold(i.title).startsWith(q) ? 0 : fold(i.title).includes(q) ? 1 : 2) }))
      .sort((a, b) => a.score - b.score)
      .slice(0, 12)
      .map((x) => x.i);
  });

  protected onInput(event: Event) {
    this.query.set((event.target as HTMLInputElement).value);
    this.active.set(0);
  }

  protected onKey(event: KeyboardEvent) {
    const n = this.results().length;
    if (event.key === 'ArrowDown' && n) {
      event.preventDefault();
      this.active.update((a) => (a + 1) % n);
      this.scrollActive();
    } else if (event.key === 'ArrowUp' && n) {
      event.preventDefault();
      this.active.update((a) => (a - 1 + n) % n);
      this.scrollActive();
    } else if (event.key === 'Enter' && n) {
      event.preventDefault();
      this.go(this.results()[this.active()]);
    }
  }

  private scrollActive() {
    queueMicrotask(() => document.getElementById(`docs-search-opt-${this.active()}`)?.scrollIntoView({ block: 'nearest' }));
  }

  protected go(item: SearchItem) {
    this.ref.close();
    void this.router.navigate([item.path], { fragment: item.fragment });
  }
}
