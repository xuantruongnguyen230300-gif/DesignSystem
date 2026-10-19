import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NxtTab, NxtTabs } from '@nxt/ui/tabs';

/** Tab có panel: các phần của hồ sơ nhân viên */
@Component({
  selector: 'example-tabs-basic',
  imports: [NxtTab, NxtTabs],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-tabs label="Hồ sơ Nguyễn Văn An" [(value)]="tab">
      <nxt-tab value="general" label="Thông tin chung">
        <dl class="facts">
          <dt>Mã nhân viên</dt>
          <dd>NV-0125</dd>
          <dt>Chức danh</dt>
          <dd>Kế toán trưởng</dd>
          <dt>Phòng ban</dt>
          <dd>Phòng Kế toán</dd>
          <dt>Ngày vào làm</dt>
          <dd>03/04/2019</dd>
        </dl>
      </nxt-tab>
      <nxt-tab value="contracts" label="Hợp đồng" [count]="2">
        <dl class="facts">
          <dt>HĐ-2024-0311</dt>
          <dd>Không xác định thời hạn · hiệu lực từ 01/04/2024</dd>
          <dt>HĐ-2021-0178</dt>
          <dd>Xác định thời hạn 36 tháng · đã kết thúc 31/03/2024</dd>
        </dl>
      </nxt-tab>
      <nxt-tab value="history" label="Quá trình công tác">
        <p>04/2019: Chuyên viên kế toán · 01/2022: Kế toán tổng hợp · 04/2024: Kế toán trưởng.</p>
      </nxt-tab>
    </nxt-tabs>
  `,
  styles: `
    .facts {
      display: grid;
      grid-template-columns: max-content 1fr;
      gap: var(--nxt-space-gap-sm) var(--nxt-space-gap-lg);
      margin: 0;
    }
    .facts dt {
      color: var(--nxt-color-text-subtle);
      font: var(--nxt-typography-body-sm);
    }
    .facts dd {
      margin: 0;
      color: var(--nxt-color-text-default);
    }
  `,
})
export class TabsBasicExample {
  protected readonly tab = signal('general');
}
