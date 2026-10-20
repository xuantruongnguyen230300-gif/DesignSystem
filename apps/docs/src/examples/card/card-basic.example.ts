import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NxtButton } from '@nxt/ui/button';
import { NxtCard } from '@nxt/ui/card';
import { NxtIcon } from '@nxt/ui/icon';

/** Card trên nền canvas: tiêu đề, mô tả, hành động và chân card */
@Component({
  selector: 'example-card-basic',
  imports: [NxtButton, NxtCard, NxtIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="canvas">
      <nxt-card title="Thông tin hợp đồng" subtitle="HĐ-2026-0412 · Không xác định thời hạn" [headingLevel]="3">
        <button nxtCardActions nxtButton variant="ghost" size="sm" aria-label="Sửa thông tin hợp đồng">
          <nxt-icon name="pencil" />Sửa
        </button>

        <dl class="fields">
          <div>
            <dt>Nhân viên</dt>
            <dd>Nguyễn Thị Ngọc Diệp</dd>
          </div>
          <div>
            <dt>Chức danh</dt>
            <dd>Kế toán tổng hợp</dd>
          </div>
          <div>
            <dt>Ngày hiệu lực</dt>
            <dd class="nxt-tabular-nums">01/03/2026</dd>
          </div>
          <div>
            <dt>Lương cơ bản</dt>
            <dd class="nxt-tabular-nums">18.500.000 ₫</dd>
          </div>
        </dl>

        <p nxtCardFooter class="footer">Cập nhật bởi Trần Thị Mai lúc 09:12 · 12/10/2026</p>
      </nxt-card>
    </div>
  `,
  styles: `
    .canvas {
      padding: var(--nxt-space-inset-lg);
      border-radius: var(--nxt-radius-container);
      background: var(--nxt-color-bg-canvas);
    }
    .fields {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, var(--nxt-layout-item-min-sm)), 1fr));
      gap: var(--nxt-space-gap-md);
    }
    .fields dt {
      color: var(--nxt-color-text-subtle);
      font: var(--nxt-typography-label-sm);
    }
    .fields dd {
      color: var(--nxt-color-text-strong);
      font: var(--nxt-typography-body-md);
    }
    .footer {
      padding: var(--nxt-space-inset-sm) var(--nxt-space-inset-lg);
      border-block-start: var(--nxt-border-width-default) solid var(--nxt-color-border-subtle);
      color: var(--nxt-color-text-subtle);
      font: var(--nxt-typography-caption);
    }
  `,
})
export class CardBasicExample {}
