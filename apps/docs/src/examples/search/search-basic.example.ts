import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NxtStack } from '@nxt/ui/layout';
import { NxtSearch } from '@nxt/ui/search';

/** Ô tìm kiếm: nhãn ẩn, placeholder nói tìm theo gì, nút xoá và Esc */
@Component({
  selector: 'example-search-basic',
  imports: [NxtSearch, NxtStack],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-stack gap="lg">
      <nxt-stack gap="xs">
        <p class="docs-demo-label">Trên toolbar danh sách: nhãn ẩn, cỡ md</p>
        <nxt-search class="box" label="Tìm nhân viên" placeholder="Mã, họ tên hoặc email" [(value)]="employee" />
        <p class="docs-demo-label">Từ khoá: {{ employee() || '(trống)' }}</p>
      </nxt-stack>

      <nxt-stack gap="xs">
        <p class="docs-demo-label">Trong panel hoặc form: hiện nhãn, cỡ sm</p>
        <nxt-search class="box" label="Tìm phòng ban" placeholder="Tên hoặc mã phòng ban" showLabel size="sm" [(value)]="department" />
      </nxt-stack>
    </nxt-stack>
  `,
  styles: `
    .box {
      max-inline-size: var(--nxt-size-400);
    }
  `,
})
export class SearchBasicExample {
  protected readonly employee = signal('Nguyễn Văn');
  protected readonly department = signal('');
}
