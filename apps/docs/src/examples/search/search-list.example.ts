import { ChangeDetectionStrategy, Component, computed, signal, viewChild } from '@angular/core';
import { NxtAvatar } from '@nxt/ui/avatar';
import { NxtButton } from '@nxt/ui/button';
import { NxtEmptyState } from '@nxt/ui/empty-state';
import { NxtStack } from '@nxt/ui/layout';
import { NxtSearch, nxtMatches } from '@nxt/ui/search';

interface Employee {
  code: string;
  name: string;
  dept: string;
}

const EMPLOYEES: Employee[] = [
  { code: 'NV-0012', name: 'Nguyễn Văn An', dept: 'Kế toán' },
  { code: 'NV-0027', name: 'Trần Thị Bích Ngọc', dept: 'Nhân sự' },
  { code: 'NV-0031', name: 'Lê Hoàng Phúc', dept: 'Công nghệ' },
  { code: 'NV-0045', name: 'Nguyễn Văn Hùng', dept: 'Kinh doanh' },
  { code: 'NV-0052', name: 'Phạm Thu Hà', dept: 'Nhân sự' },
  { code: 'NV-0068', name: 'Đặng Minh Khoa', dept: 'Pháp chế' },
  { code: 'NV-0073', name: 'Nguyễn Thị Thu Vân', dept: 'Kế toán' },
  { code: 'NV-0081', name: 'Võ Thanh Tâm', dept: 'Kho hàng' },
  { code: 'NV-0094', name: 'Bùi Quang Huy', dept: 'Công nghệ' },
  { code: 'NV-0102', name: 'Hoàng Văn Đức', dept: 'Kho hàng' },
  { code: 'NV-0117', name: 'Đỗ Thị Mai Anh', dept: 'Kinh doanh' },
  { code: 'NV-0123', name: 'Nguyễn Văn Long', dept: 'Công nghệ' },
  { code: 'NV-0138', name: 'Lý Hải Yến', dept: 'Kế toán' },
  { code: 'NV-0146', name: 'Trương Đình Nam', dept: 'Kinh doanh' },
  { code: 'NV-0159', name: 'Phan Ngọc Diệp', dept: 'Nhân sự' },
];

/** Lọc danh sách tại máy bằng nxtMatches: gõ không dấu, số kết quả qua role="status" */
@Component({
  selector: 'example-search-list',
  imports: [NxtAvatar, NxtButton, NxtEmptyState, NxtSearch, NxtStack],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-stack gap="sm">
      <nxt-search class="box" label="Tìm nhân viên" placeholder="Mã, họ tên hoặc phòng ban" [(value)]="query" />
      <p class="docs-demo-label">Thử gõ “nguyen van”, “ke toan” hoặc “duc”.</p>
      <p class="count" role="status">{{ summary() }}</p>

      @if (results().length) {
        <ul class="people" role="list" aria-label="Nhân viên">
          @for (e of results(); track e.code) {
            <li class="person">
              <nxt-avatar [name]="e.name" size="sm" />
              <span class="person__text">
                <span class="person__name">{{ e.name }}</span>
                <span class="docs-demo-label">{{ e.code }} · {{ e.dept }}</span>
              </span>
            </li>
          }
        </ul>
      } @else {
        <nxt-empty-state
          icon="user-search"
          [headingLevel]="3"
          size="sm"
          [title]="'Không có nhân viên khớp “' + query().trim() + '”'"
          description="Thử gõ ít chữ hơn, hoặc tìm theo mã nhân viên."
        >
          <button nxtEmptyActions nxtButton type="button" (click)="clear()">Xoá tìm kiếm</button>
        </nxt-empty-state>
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
    .people {
      display: grid;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .person {
      display: flex;
      align-items: center;
      gap: var(--nxt-space-gap-md);
      padding-block: var(--nxt-space-inset-xs);
    }
    .person + .person {
      border-block-start: var(--nxt-border-width-default) solid var(--nxt-color-border-subtle);
    }
    .person__text {
      display: grid;
      min-inline-size: 0;
    }
    .person__name {
      color: var(--nxt-color-text-strong);
      font: var(--nxt-typography-label-md);
    }
  `,
})
export class SearchListExample {
  private readonly search = viewChild.required(NxtSearch);
  protected readonly query = signal('');
  /** Every word must appear in the code, name or department, with or without diacritics, in any order. */
  protected readonly results = computed(() => EMPLOYEES.filter((e) => nxtMatches(this.query(), e.code, e.name, e.dept)));
  protected readonly summary = computed(() =>
    this.query().trim() ? `Tìm thấy ${this.results().length} / ${EMPLOYEES.length} nhân viên` : `${EMPLOYEES.length} nhân viên`,
  );

  /** The button disappears with the empty state: put focus back in the search box. */
  protected clear() {
    this.query.set('');
    this.search().focus();
  }
}
