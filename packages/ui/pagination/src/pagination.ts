import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, effect, input, model, numberAttribute } from '@angular/core';
import { NxtIcon } from '@nxt/ui/icon';

const vi = new Intl.NumberFormat('vi-VN');

/**
 * Page numbers with gaps: 1 … 4 5 6 … 20 — always first, last, and the neighbours of the current page.
 * Always 7 slots once there are more than 7 pages (the control never changes width while paging),
 * and a gap never hides a single page: "1 2 3 4 5 … 20", not "1 … 3 4 5 … 20".
 */
export function nxtPageItems(page: number, count: number): (number | '…')[] {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1);
  const start = Math.max(Math.min(page - 1, count - 4), 3);
  const end = Math.min(Math.max(page + 1, 5), count - 2);
  const middle = Array.from({ length: end - start + 1 }, (_, i) => start + i);
  return [1, start > 3 ? '…' : 2, ...middle, end < count - 2 ? '…' : count - 1, count];
}

/**
 * Pagination for tables: "Hiển thị 1–20 trong 1.284 bản ghi", page size, previous/next, page numbers.
 * `page` and `pageSize` are two-way; changing the page size returns to page 1.
 */
@Component({
  selector: 'nxt-pagination',
  imports: [NxtIcon],
  template: `
    <nav class="nxt-pagination" [attr.aria-label]="label()">
      <p class="nxt-pagination__summary" aria-live="polite">
        @if (total() > 0) {
          Hiển thị <strong>{{ fmt(from()) }}–{{ fmt(to()) }}</strong> trong <strong>{{ fmt(total()) }}</strong> {{ itemLabel() }}
        } @else {
          Không có {{ itemLabel() }}
        }
      </p>
      <div class="nxt-pagination__controls">
        <label class="nxt-pagination__size">
          <span class="nxt-visually-hidden">Số dòng mỗi trang</span>
          <select (change)="setSize($event)">
            @for (opt of pageSizeOptions(); track opt) {
              <option [value]="opt" [selected]="opt === pageSize()">{{ opt }} / trang</option>
            }
          </select>
          <nxt-icon name="chevron-down" />
        </label>
        <!-- aria-disabled, not disabled: a focused button that becomes disabled would drop focus to <body>. -->
        <button type="button" class="nxt-pagination__item" aria-label="Trang trước" [attr.aria-disabled]="page() <= 1 || null" (click)="go(page() - 1)">
          <nxt-icon name="chevron-left" />
        </button>
        <!-- Track by page number so focus stays on the same page button while the window of numbers shifts. -->
        @for (p of items(); track p === '…' ? 'gap-' + $index : p) {
          @if (p === '…') {
            <span class="nxt-pagination__gap" aria-hidden="true">…</span>
          } @else {
            <button
              type="button"
              class="nxt-pagination__item"
              [attr.aria-current]="p === page() ? 'page' : null"
              [attr.aria-label]="'Trang ' + p"
              (click)="go(p)"
            >
              {{ p }}
            </button>
          }
        }
        <button type="button" class="nxt-pagination__item" aria-label="Trang sau" [attr.aria-disabled]="page() >= pageCount() || null" (click)="go(page() + 1)">
          <nxt-icon name="chevron-right" />
        </button>
      </div>
    </nav>
  `,
  styleUrl: './pagination.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'nxt-pagination-host' },
})
export class NxtPagination {
  readonly total = input.required({ transform: numberAttribute });
  /** Current page, 1-based (two-way). */
  readonly page = model(1);
  readonly pageSize = model(20);
  readonly pageSizeOptions = input([10, 20, 50, 100]);
  /** Noun for the items, e.g. "nhân viên", "phiếu". */
  readonly itemLabel = input('bản ghi');
  readonly label = input('Phân trang');

  protected readonly pageCount = computed(() => Math.max(1, Math.ceil(this.total() / this.pageSize())));
  protected readonly from = computed(() => (this.total() ? (this.page() - 1) * this.pageSize() + 1 : 0));
  protected readonly to = computed(() => Math.min(this.page() * this.pageSize(), this.total()));
  protected readonly items = computed(() => nxtPageItems(this.page(), this.pageCount()));

  constructor() {
    // Filtering can shrink the total below the current page — move back to the last page that exists.
    effect(() => {
      if (this.page() > this.pageCount()) this.page.set(this.pageCount());
    });
  }

  protected fmt(n: number): string {
    return vi.format(n);
  }

  protected go(p: number) {
    this.page.set(Math.max(1, Math.min(p, this.pageCount())));
  }

  protected setSize(event: Event) {
    this.pageSize.set(Number((event.target as HTMLSelectElement).value));
    this.page.set(1);
  }
}
