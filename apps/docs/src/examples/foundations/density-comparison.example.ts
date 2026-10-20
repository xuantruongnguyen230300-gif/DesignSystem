import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NxtButton } from '@nxt/ui/button';
import { NxtGrid, NxtInline, NxtSpan, NxtStack } from '@nxt/ui/layout';

/** Ba mức mật độ đặt cạnh nhau — mỗi vùng chỉ cần một thuộc tính data-nxt-density */
@Component({
  selector: 'example-density-comparison',
  imports: [NxtButton, NxtGrid, NxtInline, NxtSpan, NxtStack],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-grid gap="md">
      @for (d of densities; track d.mode) {
        <section class="docs-demo-box" [nxtSpan]="{ base: 12, lg: 4 }" [attr.data-nxt-density]="d.mode" [attr.aria-label]="'Mật độ ' + d.label">
          <nxt-stack gap="md">
            <nxt-stack gap="xs">
              <p class="nxt-text-label-md">{{ d.label }}</p>
              <p class="docs-demo-label">{{ d.use }}</p>
            </nxt-stack>
            <ul class="docs-rows" role="list">
              @for (r of rows; track r) {
                <li>{{ r }}</li>
              }
            </ul>
            <nxt-inline gap="sm">
              <button nxtButton size="sm">Huỷ</button>
              <button nxtButton variant="primary" size="sm">Duyệt</button>
            </nxt-inline>
          </nxt-stack>
        </section>
      }
    </nxt-grid>
  `,
})
export class DensityComparisonExample {
  protected readonly densities = [
    { mode: 'compact', label: 'Gọn (compact)', use: 'Bảng rà soát, dữ liệu nhiều dòng' },
    { mode: 'comfortable', label: 'Vừa (comfortable)', use: 'Mặc định cho mọi màn hình' },
    { mode: 'spacious', label: 'Rộng (spacious)', use: 'Màn hình cảm ứng, người dùng ít thao tác' },
  ];
  protected readonly rows = ['Đơn nghỉ phép · Lê Minh Anh', 'Tăng ca · Phạm Thu Hà', 'Công tác · Võ Thành Nam'];
}
