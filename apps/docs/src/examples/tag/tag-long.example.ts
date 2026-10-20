import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NxtDescription, NxtDescriptions } from '@nxt/ui/descriptions';
import { NxtStack } from '@nxt/ui/layout';
import { NxtTag } from '@nxt/ui/tag';

/** Nhãn dài: trong cột hẹp bị cắt "…" và có tooltip khi rê chuột; ở màn chi tiết dùng wrap để xuống dòng */
@Component({
  selector: 'example-tag-long',
  imports: [NxtDescription, NxtDescriptions, NxtStack, NxtTag],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-stack gap="lg">
      <nxt-stack gap="xs">
        <p class="docs-demo-label">Cột hẹp (mặc định): cắt "…", rê chuột lên nhãn bị cắt để xem đủ chữ</p>
        <ul class="rows">
          @for (r of rows; track r.name) {
            <li class="row">
              <span class="row__name">{{ r.name }}</span>
              <span class="row__scope"><nxt-tag size="sm">{{ r.scope }}</nxt-tag></span>
            </li>
          }
        </ul>
      </nxt-stack>

      <nxt-stack gap="xs">
        <p class="docs-demo-label">Màn chi tiết: wrap, xuống dòng trong bề rộng của cột, không cắt</p>
        <dl nxtDescriptions [columns]="2">
          <div nxtDescription label="Quy trình">Nghỉ phép · Khối Vận hành</div>
          <div nxtDescription label="Phạm vi áp dụng">
            <nxt-tag tone="info" wrap>Khối Vận hành · Trung tâm Chăm sóc khách hàng miền Nam và chi nhánh Cần Thơ</nxt-tag>
          </div>
        </dl>
      </nxt-stack>
    </nxt-stack>
  `,
  styles: `
    .rows {
      margin: 0;
      padding: 0;
      list-style: none;
      max-inline-size: var(--nxt-layout-item-min-lg);
    }
    .row {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      align-items: center;
      gap: var(--nxt-space-gap-sm);
      padding-block: var(--nxt-space-inset-xs);
    }
    .row + .row {
      border-block-start: var(--nxt-border-width-default) solid var(--nxt-color-border-subtle);
    }
    .row__name {
      color: var(--nxt-color-text-strong);
      font: var(--nxt-typography-label-md);
    }
    .row__scope {
      display: flex;
      min-inline-size: 0;
    }
  `,
})
export class TagLongExample {
  protected readonly rows = [
    { name: 'Nghỉ phép', scope: 'Toàn công ty' },
    { name: 'Tăng ca', scope: 'Khối Vận hành · Trung tâm Chăm sóc khách hàng miền Nam' },
    { name: 'Công tác', scope: 'Khối Kinh doanh · Chi nhánh Đà Nẵng và Quảng Nam' },
  ];
}
