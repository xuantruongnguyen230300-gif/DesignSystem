import { ChangeDetectionStrategy, Component, TemplateRef, computed, inject, signal, viewChild } from '@angular/core';
import { NxtDescription, NxtDescriptions } from '@nxt/ui/descriptions';
import { NxtDrawer, NxtDrawerLayout } from '@nxt/ui/drawer';
import { NxtRowHighlight, NxtTable, NxtTableScroll } from '@nxt/ui/table';
import { NxtTag, NxtTone } from '@nxt/ui/tag';

interface Contract {
  code: string;
  name: string;
  dept: string;
  type: string;
  end: string;
  /** Days left until the end date, from 06/11/2026; null = no end date. */
  daysLeft: number | null;
  /** Added in this session (shown first, until the next sort or filter). */
  added?: boolean;
  missing?: string;
}

const CONTRACTS: Contract[] = [
  { code: 'HĐ-2026-204', name: 'Trịnh Bảo Ngọc', dept: 'Phòng Nhân sự', type: 'Thử việc 2 tháng', end: '05/01/2027', daysLeft: 60, added: true },
  { code: 'HĐ-2025-118', name: 'Nguyễn Thu Giang', dept: 'Phòng Kế toán', type: 'Xác định thời hạn 12 tháng', end: '20/11/2026', daysLeft: 14 },
  { code: 'HĐ-2024-121', name: 'Bùi Hoàng Nam', dept: 'Kinh doanh miền Bắc', type: 'Xác định thời hạn 24 tháng', end: '30/11/2026', daysLeft: 24 },
  { code: 'HĐ-2025-092', name: 'Lâm Thị Hồng Nhung', dept: 'Kho vận', type: 'Xác định thời hạn 12 tháng', end: '31/10/2026', daysLeft: -6 },
  { code: 'HĐ-2023-130', name: 'Đỗ Kim Oanh', dept: 'Phòng Công nghệ thông tin', type: 'Không xác định thời hạn', end: '—', daysLeft: null },
  { code: 'HĐ-2026-031', name: 'Hà Minh Tuấn', dept: 'Chăm sóc khách hàng', type: 'Xác định thời hạn 12 tháng', end: '15/03/2027', daysLeft: 129, missing: 'Thiếu bản ký của nhân viên' },
];

interface RowState {
  highlight: NxtRowHighlight | null;
  label: string;
  tone: NxtTone;
}

/** Why a row stands out. The strip is only a hint: the same words are always in the row. */
function stateOf(c: Contract): RowState {
  if (c.missing) return { highlight: 'danger', label: `Lỗi: ${c.missing}`, tone: 'danger' };
  if (c.daysLeft !== null && c.daysLeft < 0) return { highlight: 'danger', label: `Đã hết hạn ${-c.daysLeft} ngày`, tone: 'danger' };
  if (c.daysLeft !== null && c.daysLeft <= 30) return { highlight: 'warning', label: `Sắp hết hạn · còn ${c.daysLeft} ngày`, tone: 'warning' };
  if (c.added) return { highlight: 'info', label: 'Mới thêm', tone: 'info' };
  return { highlight: null, label: 'Đang hiệu lực', tone: 'success' };
}

/** Tô sáng hàng và hàng đang mở: hợp đồng sắp hết hạn (warning), lỗi (danger), mới thêm (info); bấm tên để mở drawer */
@Component({
  selector: 'example-table-highlight',
  imports: [NxtDescription, NxtDescriptions, NxtDrawerLayout, NxtTable, NxtTableScroll, NxtTag],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-table-scroll label="Hợp đồng lao động">
      <table nxtTable>
        <caption class="nxt-visually-hidden">Hợp đồng lao động, {{ rows.length }} hợp đồng</caption>
        <thead>
          <tr>
            <th scope="col">Số hợp đồng</th>
            <th scope="col">Nhân viên</th>
            <th scope="col">Phòng ban</th>
            <th scope="col">Loại hợp đồng</th>
            <th scope="col" class="nxt-table__num">Ngày kết thúc</th>
            <th scope="col">Tình trạng</th>
          </tr>
        </thead>
        <tbody>
          @for (r of rows; track r.code) {
            <tr [attr.data-highlight]="state(r).highlight" [attr.aria-current]="r.code === open() ? 'true' : null">
              <td class="code">{{ r.code }}</td>
              <th scope="row">
                <button type="button" class="open" [attr.data-code]="r.code" (click)="openDetail(r)">{{ r.name }}</button>
              </th>
              <td>{{ r.dept }}</td>
              <td>{{ r.type }}</td>
              <td class="nxt-table__num">
                @if (r.daysLeft === null) {
                  <span aria-hidden="true">—</span><span class="nxt-visually-hidden">Không có ngày kết thúc</span>
                } @else {
                  {{ r.end }}
                }
              </td>
              <td><nxt-tag [tone]="state(r).tone" dot>{{ state(r).label }}</nxt-tag></td>
            </tr>
          }
        </tbody>
      </table>
    </nxt-table-scroll>

    <ng-template #detail>
      @if (current(); as c) {
        <nxt-drawer-layout [title]="c.name" [description]="c.code + ' · ' + c.type">
          <dl nxtDescriptions>
            <div nxtDescription label="Phòng ban">{{ c.dept }}</div>
            <div nxtDescription label="Ngày kết thúc"><span class="nxt-tabular-nums">{{ c.end }}</span></div>
            <div nxtDescription label="Tình trạng"><nxt-tag [tone]="state(c).tone" dot>{{ state(c).label }}</nxt-tag></div>
          </dl>
        </nxt-drawer-layout>
      }
    </ng-template>
  `,
  styles: `
    .code {
      font: var(--nxt-typography-code);
    }
    .open {
      padding: 0;
      border: 0;
      background: none;
      color: var(--nxt-color-text-strong);
      font: var(--nxt-typography-label-md);
      cursor: pointer;
    }
    .open:hover {
      color: var(--nxt-color-text-link);
      text-decoration: underline;
    }
    .open:focus-visible {
      outline: var(--nxt-focus-ring-width) solid var(--nxt-focus-ring-color);
      outline-offset: var(--nxt-focus-ring-offset);
      border-radius: var(--nxt-radius-control);
    }
  `,
})
export class TableHighlightExample {
  private readonly drawer = inject(NxtDrawer);
  private readonly detail = viewChild.required<TemplateRef<unknown>>('detail');
  protected readonly rows = CONTRACTS;
  protected readonly state = stateOf;
  /** Code of the contract shown in the drawer: that row is aria-current while it is open. */
  protected readonly open = signal<string | null>(null);
  protected readonly current = computed(() => this.rows.find((r) => r.code === this.open()) ?? null);

  protected openDetail(r: Contract) {
    this.open.set(r.code);
    const ref = this.drawer.open(this.detail(), { title: `Hợp đồng ${r.code}`, size: 'sm' });
    ref.closed.subscribe(() => this.open.set(null));
  }
}
