import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NxtGrid, NxtStack } from '@nxt/ui/layout';

interface Unit {
  name: string;
  head: string;
  people: number;
}

/** columns="auto": tự lấp số cột theo bề rộng tối thiểu của thẻ */
@Component({
  selector: 'example-grid-auto',
  imports: [NxtGrid, NxtStack],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-grid columns="auto" minItem="md" gap="md">
      @for (u of units; track u.name) {
        <nxt-stack gap="xs" class="docs-demo-box">
          <p class="nxt-text-label-md">{{ u.name }}</p>
          <p class="docs-demo-label">Trưởng đơn vị: {{ u.head }}</p>
          <p class="nxt-text-body-sm nxt-tabular-nums">{{ u.people }} nhân sự</p>
        </nxt-stack>
      }
    </nxt-grid>
  `,
})
export class GridAutoExample {
  protected readonly units: Unit[] = [
    { name: 'Phòng Nhân sự', head: 'Trần Thị Mai', people: 18 },
    { name: 'Phòng Kế toán', head: 'Lê Văn Hùng', people: 12 },
    { name: 'Khối Công nghệ', head: 'Phạm Quốc Bảo', people: 146 },
    { name: 'Khối Kinh doanh miền Nam', head: 'Nguyễn Thị Ngọc Diệp', people: 87 },
    { name: 'Ban Pháp chế', head: 'Đỗ Minh Khoa', people: 6 },
  ];
}
