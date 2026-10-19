import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NxtInline, NxtStack } from '@nxt/ui/layout';
import { NxtSegmented, NxtSegmentedOption } from '@nxt/ui/segmented';

type View = 'list' | 'grid' | 'org';

/** Hai kích thước, icon kèm nhãn, và chế độ chỉ icon (nhãn thành tooltip) */
@Component({
  selector: 'example-segmented-sizes',
  imports: [NxtSegmented, NxtInline, NxtStack],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-stack gap="lg">
      <nxt-stack gap="xs">
        <p class="docs-demo-label">md (mặc định) — icon kèm nhãn</p>
        <nxt-inline>
          <nxt-segmented label="Kiểu hiển thị nhân viên" [options]="views" [(value)]="view" />
        </nxt-inline>
      </nxt-stack>
      <nxt-stack gap="xs">
        <p class="docs-demo-label">sm — trong toolbar, page header</p>
        <nxt-inline>
          <nxt-segmented label="Kiểu hiển thị nhân viên (cỡ nhỏ)" size="sm" [options]="views" [(value)]="view" />
        </nxt-inline>
      </nxt-stack>
      <nxt-stack gap="xs">
        <p class="docs-demo-label">iconOnly — nhãn vẫn được đọc, hiện thành tooltip khi hover hoặc focus</p>
        <nxt-inline gap="md">
          <nxt-segmented label="Kiểu hiển thị nhân viên (chỉ icon)" size="sm" iconOnly [options]="views" [(value)]="view" />
          <span class="docs-demo-label" role="status">Đang chọn: {{ label(view()) }}</span>
        </nxt-inline>
      </nxt-stack>
    </nxt-stack>
  `,
})
export class SegmentedSizesExample {
  protected readonly views: NxtSegmentedOption<View>[] = [
    { value: 'list', label: 'Danh sách', icon: 'layout-list' },
    { value: 'grid', label: 'Thẻ', icon: 'layout-grid' },
    { value: 'org', label: 'Sơ đồ tổ chức', icon: 'sitemap' },
  ];
  protected readonly view = signal<View>('list');

  protected label(value: View): string {
    return this.views.find((v) => v.value === value)?.label ?? '';
  }
}
