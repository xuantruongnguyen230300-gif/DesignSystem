import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { NxtStack } from '@nxt/ui/layout';
import { NxtSearch, nxtMatches } from '@nxt/ui/search';

interface Candidate {
  code: string;
  name: string;
  position: string;
}

/** Stands in for the recruitment API: thousands of profiles, only searchable on the server. */
const SERVER: Candidate[] = [
  { code: 'UV-2026-0412', name: 'Nguyễn Văn Thành', position: 'Kế toán tổng hợp' },
  { code: 'UV-2026-0418', name: 'Trần Thu Trang', position: 'Chuyên viên tuyển dụng' },
  { code: 'UV-2026-0425', name: 'Lê Quốc Bảo', position: 'Lập trình viên Java' },
  { code: 'UV-2026-0431', name: 'Phạm Ngọc Ánh', position: 'Kế toán thanh toán' },
  { code: 'UV-2026-0437', name: 'Nguyễn Văn Khải', position: 'Nhân viên kinh doanh' },
  { code: 'UV-2026-0440', name: 'Hoàng Minh Trí', position: 'Lập trình viên Angular' },
  { code: 'UV-2026-0446', name: 'Đinh Thị Hồng', position: 'Chuyên viên C&B' },
  { code: 'UV-2026-0452', name: 'Vũ Đức Anh', position: 'Trưởng nhóm kho' },
  { code: 'UV-2026-0459', name: 'Ngô Thanh Hương', position: 'Kế toán thuế' },
  { code: 'UV-2026-0463', name: 'Nguyễn Văn Phát', position: 'Lập trình viên .NET' },
];

const LATENCY = 600;

/** Tìm trên máy chủ: debounce 250 ms, Enter tìm ngay, huỷ yêu cầu cũ */
@Component({
  selector: 'example-search-debounce',
  imports: [NxtSearch, NxtStack],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-stack gap="sm">
      <nxt-search
        class="box"
        label="Tìm ứng viên"
        placeholder="Họ tên, mã hồ sơ hoặc vị trí"
        [debounce]="250"
        (valueChange)="search($event)"
        (submitted)="search($event)"
      />
      <p class="docs-demo-label">Đã gửi {{ requests() }} yêu cầu tới máy chủ. Gõ nhanh “ke toan”: chỉ một yêu cầu được gửi.</p>
      <p class="count" role="status">{{ status() }}</p>
      @if (results().length) {
        <ul class="results" role="list" aria-label="Ứng viên">
          @for (c of results(); track c.code) {
            <li class="result">
              <span class="result__name">{{ c.name }}</span>
              <span class="docs-demo-label">{{ c.code }} · {{ c.position }}</span>
            </li>
          }
        </ul>
      }
    </nxt-stack>
  `,
  styles: `
    .box {
      max-inline-size: var(--nxt-size-400);
    }
    .count {
      color: var(--nxt-color-text-subtle);
      font: var(--nxt-typography-label-sm);
    }
    .results {
      display: grid;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .result {
      display: grid;
      padding-block: var(--nxt-space-inset-xs);
    }
    .result + .result {
      border-block-start: var(--nxt-border-width-default) solid var(--nxt-color-border-subtle);
    }
    .result__name {
      color: var(--nxt-color-text-strong);
      font: var(--nxt-typography-label-md);
    }
  `,
})
export class SearchDebounceExample {
  protected readonly results = signal<Candidate[]>([]);
  protected readonly status = signal('');
  protected readonly requests = signal(0);
  private term = '';
  private timer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
  }

  /**
   * Called after the debounce, and on Enter. Enter commits the text at once, so the same term can arrive
   * twice — ignore the repeat. A newer term cancels the request still in flight (switchMap in RxJS).
   */
  protected search(raw: string) {
    const term = raw.trim();
    if (term === this.term) return;
    this.term = term;
    clearTimeout(this.timer);
    if (!term) {
      this.results.set([]);
      this.status.set('');
      return;
    }
    this.status.set(`Đang tìm “${term}”…`);
    this.requests.update((n) => n + 1);
    this.timer = setTimeout(() => {
      const found = SERVER.filter((c) => nxtMatches(term, c.code, c.name, c.position));
      this.results.set(found);
      this.status.set(found.length ? `Tìm thấy ${found.length} ứng viên cho “${term}”` : `Không có ứng viên khớp “${term}”. Thử tìm theo mã hồ sơ.`);
    }, LATENCY);
  }
}
