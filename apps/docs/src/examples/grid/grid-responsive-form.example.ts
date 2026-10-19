import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NxtGrid, NxtResponsiveSpan, NxtSpan } from '@nxt/ui/layout';

interface Field {
  label: string;
  span: NxtResponsiveSpan;
}

/** Bố cục form hồ sơ: 1 cột khi hẹp, 2–3 cột khi rộng (theo bề rộng của lưới) */
@Component({
  selector: 'example-grid-responsive-form',
  imports: [NxtGrid, NxtSpan],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-grid>
      @for (f of fields; track f.label) {
        <div class="docs-demo-cell" [nxtSpan]="f.span">
          {{ f.label }}
          <span class="docs-demo-label">{{ describe(f.span) }}</span>
        </div>
      }
    </nxt-grid>
  `,
})
export class GridResponsiveFormExample {
  protected readonly fields: Field[] = [
    { label: 'Họ và tên', span: { base: 12, md: 6 } },
    { label: 'Mã nhân viên', span: { base: 12, md: 6, lg: 3 } },
    { label: 'Ngày sinh', span: { base: 12, md: 6, lg: 3 } },
    { label: 'Phòng ban', span: { base: 12, md: 6, lg: 4 } },
    { label: 'Chức danh', span: { base: 12, md: 6, lg: 4 } },
    { label: 'Ngày vào làm', span: { base: 12, md: 6, lg: 4 } },
    { label: 'Địa chỉ thường trú', span: { base: 12 } },
  ];

  protected describe(s: NxtResponsiveSpan): string {
    return Object.entries(s)
      .map(([k, v]) => `${k}: ${v}`)
      .join(' · ');
  }
}
