import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NxtStack } from '@nxt/ui/layout';
import { NxtPagination } from '@nxt/ui/pagination';

/** Tóm tắt, số dòng mỗi trang, trước/sau và số trang có khoảng trống */
@Component({
  selector: 'example-pagination-basic',
  imports: [NxtPagination, NxtStack],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-stack gap="sm">
      <nxt-pagination label="Phân trang danh sách nhân viên" [total]="1284" [(page)]="page" [(pageSize)]="pageSize" itemLabel="nhân viên" />
      <p class="docs-demo-label nxt-tabular-nums">page = {{ page() }} · pageSize = {{ pageSize() }}</p>
    </nxt-stack>
  `,
})
export class PaginationBasicExample {
  protected readonly page = signal(5);
  protected readonly pageSize = signal(20);
}
