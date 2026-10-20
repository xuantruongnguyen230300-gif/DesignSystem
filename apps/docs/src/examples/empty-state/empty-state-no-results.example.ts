import { ChangeDetectionStrategy, Component, ElementRef, computed, signal, viewChild } from '@angular/core';
import { NxtButton } from '@nxt/ui/button';
import { NxtCard } from '@nxt/ui/card';
import { NxtEmptyState } from '@nxt/ui/empty-state';
import { NxtFormField, NxtInput } from '@nxt/ui/form-field';
import { NxtIcon } from '@nxt/ui/icon';

const DEPARTMENTS = ['Phòng Kế toán', 'Phòng Nhân sự', 'Phòng Kinh doanh'];

const EMPLOYEES = [
  { name: 'Nguyễn Thị Ngọc Diệp', dept: 'Phòng Kế toán' },
  { name: 'Lê Minh Anh', dept: 'Phòng Kế toán' },
  { name: 'Phạm Quốc Bảo', dept: 'Phòng Kế toán' },
  { name: 'Phan Bích Ngọc', dept: 'Phòng Nhân sự' },
  { name: 'Trần Thị Mai', dept: 'Phòng Nhân sự' },
  { name: 'Võ Thành Nam', dept: 'Phòng Kinh doanh' },
  { name: 'Đỗ Thu Hà', dept: 'Phòng Kinh doanh' },
];

/** Tìm không dấu. */
const fold = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase();

/** Không có kết quả cho bộ lọc: nói rõ đang lọc gì và đưa lối thoát "Xoá bộ lọc" */
@Component({
  selector: 'example-empty-state-no-results',
  imports: [NxtButton, NxtCard, NxtEmptyState, NxtFormField, NxtInput, NxtIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-card padding="none">
      <div class="bar">
        <nxt-form-field class="bar__search" label="Tìm nhân viên" hideLabel size="sm">
          <nxt-icon nxtPrefix name="search" />
          <input #search nxtInput type="search" placeholder="Tìm theo tên (không cần dấu)" [value]="query()" (input)="query.set(text($event))" />
        </nxt-form-field>
        <nxt-form-field label="Phòng ban" hideLabel size="sm">
          <select nxtInput (change)="dept.set(text($event))">
            <option value="" [selected]="!dept()">Tất cả phòng ban</option>
            @for (d of departments; track d) {
              <option [value]="d" [selected]="d === dept()">{{ d }}</option>
            }
          </select>
        </nxt-form-field>
      </div>

      @if (rows().length) {
        <ul class="list" role="list" aria-label="Kết quả tìm nhân viên">
          @for (r of rows(); track r.name) {
            <li class="item">
              <span class="item__name">{{ r.name }}</span>
              <span class="item__meta">{{ r.dept }}</span>
            </li>
          }
        </ul>
      } @else {
        <nxt-empty-state icon="search" title="Không có nhân viên phù hợp" [description]="emptyText()" [headingLevel]="3">
          <button nxtEmptyActions nxtButton (click)="clearFilters()"><nxt-icon name="filter-off" />Xoá bộ lọc</button>
        </nxt-empty-state>
      }
    </nxt-card>
    <p class="nxt-visually-hidden" role="status">{{ rows().length ? 'Có ' + rows().length + ' nhân viên phù hợp.' : 'Không có nhân viên phù hợp.' }}</p>
  `,
  styles: `
    .bar {
      display: flex;
      flex-wrap: wrap;
      gap: var(--nxt-space-gap-sm);
      padding: var(--nxt-space-inset-sm) var(--nxt-space-inset-md);
      border-block-end: var(--nxt-border-width-default) solid var(--nxt-color-border-default);
    }
    .bar__search {
      inline-size: min(100%, var(--nxt-layout-item-min-lg));
    }
    .list {
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .item {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: var(--nxt-space-gap-sm);
      padding: var(--nxt-space-inset-sm) var(--nxt-space-inset-md);
    }
    .item + .item {
      border-block-start: var(--nxt-border-width-default) solid var(--nxt-color-border-subtle);
    }
    .item__name {
      color: var(--nxt-color-text-strong);
      font: var(--nxt-typography-label-md);
    }
    .item__meta {
      color: var(--nxt-color-text-subtle);
      font: var(--nxt-typography-body-sm);
    }
  `,
})
export class EmptyStateNoResultsExample {
  private readonly search = viewChild.required<ElementRef<HTMLInputElement>>('search');
  protected readonly departments = DEPARTMENTS;
  // Bắt đầu ở trạng thái đã lọc mà không có kết quả, để thấy empty state ngay.
  protected readonly query = signal('Hoàng');
  protected readonly dept = signal('Phòng Nhân sự');

  protected readonly rows = computed(() => {
    const q = fold(this.query().trim());
    return EMPLOYEES.filter((e) => (!q || fold(e.name).includes(q)) && (!this.dept() || e.dept === this.dept()));
  });

  protected readonly emptyText = computed(() => {
    const q = this.query().trim();
    const where = this.dept() || 'mọi phòng ban';
    return q
      ? `Không tìm thấy “${q}” trong ${where}. Kiểm tra lại chính tả, thử từ khoá ngắn hơn hoặc xoá bộ lọc.`
      : `${where} chưa có nhân viên nào. Xoá bộ lọc để xem toàn bộ danh sách.`;
  });

  protected text(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  protected clearFilters() {
    this.query.set('');
    this.dept.set('');
    // Nút "Xoá bộ lọc" biến mất cùng empty state: đưa focus về ô tìm kiếm để không mất vị trí.
    this.search().nativeElement.focus();
  }
}
