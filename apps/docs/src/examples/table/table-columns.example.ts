import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NxtButton } from '@nxt/ui/button';
import { NxtCheckbox } from '@nxt/ui/checkbox';
import { NxtIcon } from '@nxt/ui/icon';
import { NxtColumnsState, NxtSelection, NxtTable, NxtTableColumnsTrigger, NxtTableScroll } from '@nxt/ui/table';
import { NxtTag } from '@nxt/ui/tag';
import { NxtTooltip } from '@nxt/ui/tooltip';

interface Employee {
  code: string;
  name: string;
  title: string;
  dept: string;
  phone: string;
  email: string;
  joined: string;
  salary: number;
  leave: number;
  status: 'working' | 'leave';
}

const EMPLOYEES: Employee[] = [
  { code: 'NV-0142', name: 'Nguyễn Thị Ngọc Diệp', title: 'Trưởng nhóm kinh doanh', dept: 'Kinh doanh miền Nam', phone: '0903 412 118', email: 'diep.ntn@congty.vn', joined: '03/04/2019', salary: 32500000, leave: 9.5, status: 'working' },
  { code: 'NV-0087', name: 'Phạm Thu Hà', title: 'Chuyên viên C&B', dept: 'Phòng Nhân sự', phone: '0912 220 457', email: 'ha.pt@congty.vn', joined: '12/08/2017', salary: 24000000, leave: 12, status: 'working' },
  { code: 'NV-0215', name: 'Lê Minh Anh', title: 'Kế toán thanh toán', dept: 'Phòng Kế toán', phone: '0986 105 330', email: 'anh.lm@congty.vn', joined: '20/02/2021', salary: 18000000, leave: 3, status: 'leave' },
  { code: 'NV-0301', name: 'Hoàng Văn Đức', title: 'Nhân viên kho', dept: 'Kho vận', phone: '0977 640 912', email: 'duc.hv@congty.vn', joined: '01/06/2023', salary: 11500000, leave: 6.5, status: 'working' },
  { code: 'NV-0056', name: 'Võ Thành Nam', title: 'Trưởng nhóm Chăm sóc khách hàng', dept: 'Chăm sóc khách hàng', phone: '0938 771 204', email: 'nam.vt@congty.vn', joined: '15/10/2016', salary: 27800000, leave: 14, status: 'working' },
];

const money = new Intl.NumberFormat('vi-VN');
const decimal = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 });

/** Tuỳ biến cột và cố định cột định danh: nút "Cài đặt bảng" chọn cột hiện và thứ tự; cột chọn + Họ và tên đứng yên khi cuộn ngang */
@Component({
  selector: 'example-table-columns',
  imports: [NxtButton, NxtCheckbox, NxtIcon, NxtTable, NxtTableColumnsTrigger, NxtTableScroll, NxtTag, NxtTooltip],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bar">
      <span class="bar__title">{{ rows.length }} nhân viên</span>
      <span class="bar__spacer"></span>
      <!-- Last tool on the right of the toolbar (before the divider and the primary action). -->
      <button nxtIconButton type="button" aria-label="Cài đặt bảng" nxtTooltip="Cài đặt bảng" [nxtTableColumnsFor]="columns">
        <nxt-icon name="adjustments" />
      </button>
    </div>
    <nxt-table-scroll class="wrap" label="Danh sách nhân viên">
      <table nxtTable stickyHeader>
        <caption class="nxt-visually-hidden">Danh sách nhân viên, {{ rows.length }} người</caption>
        <thead>
          <tr>
            <th scope="col" class="nxt-table__select nxt-table__sticky">
              <nxt-checkbox
                label="Chọn tất cả nhân viên"
                hideLabel
                [checked]="selection.allSelected(keys)"
                [indeterminate]="selection.someSelected(keys)"
                (checkedChange)="selection.setMany(keys, $event)"
              />
            </th>
            @for (c of columns.visible(); track c.key) {
              <th scope="col" [class.nxt-table__sticky]="c.key === 'name'" [class.nxt-table__num]="numeric(c.key)">{{ c.label }}</th>
            }
          </tr>
        </thead>
        <tbody>
          @for (r of rows; track r.code) {
            <tr [attr.aria-selected]="selection.has(r.code)">
              <td class="nxt-table__select nxt-table__sticky">
                <nxt-checkbox [label]="'Chọn ' + r.name" hideLabel [checked]="selection.has(r.code)" (toggled)="selection.select(r.code, $event.checked, { range: $event.shiftKey, order: keys })" />
              </td>
              @for (c of columns.visible(); track c.key) {
                @switch (c.key) {
                  @case ('name') {
                    <th scope="row" class="nxt-table__sticky name">{{ r.name }}</th>
                  }
                  @case ('code') {
                    <td class="code">{{ r.code }}</td>
                  }
                  @case ('status') {
                    <td>
                      <nxt-tag [tone]="r.status === 'working' ? 'success' : 'neutral'" dot>{{ r.status === 'working' ? 'Đang làm việc' : 'Nghỉ phép' }}</nxt-tag>
                    </td>
                  }
                  @case ('salary') {
                    <td class="nxt-table__num">{{ money.format(r.salary) }}</td>
                  }
                  @case ('leave') {
                    <td class="nxt-table__num">{{ decimal.format(r.leave) }}</td>
                  }
                  @case ('joined') {
                    <td class="nxt-table__num">{{ r.joined }}</td>
                  }
                  @default {
                    <td>{{ cell(r, c.key) }}</td>
                  }
                }
              }
            </tr>
          }
        </tbody>
      </table>
    </nxt-table-scroll>
  `,
  styles: `
    .bar {
      display: flex;
      align-items: center;
      gap: var(--nxt-space-gap-sm);
      padding-block-end: var(--nxt-space-inset-sm);
    }
    .bar__title {
      color: var(--nxt-color-text-subtle);
      font: var(--nxt-typography-body-sm);
    }
    .bar__spacer {
      flex: 1;
    }
    .wrap {
      max-block-size: var(--nxt-layout-item-min-lg);
    }
    .code {
      font: var(--nxt-typography-code);
    }
    .name {
      color: var(--nxt-color-text-strong);
      font: var(--nxt-typography-label-md);
    }
  `,
})
export class TableColumnsExample {
  protected readonly rows = EMPLOYEES;
  protected readonly keys = EMPLOYEES.map((e) => e.code);
  protected readonly selection = new NxtSelection<string>();
  protected readonly money = money;
  protected readonly decimal = decimal;
  /** Identifier first and locked; phone and e-mail hidden by default (≈ 8 columns full width). */
  protected readonly columns = new NxtColumnsState([
    { key: 'name', label: 'Họ và tên', locked: true },
    { key: 'code', label: 'Mã nhân viên' },
    { key: 'title', label: 'Chức danh' },
    { key: 'dept', label: 'Phòng ban' },
    { key: 'phone', label: 'Điện thoại', hidden: true },
    { key: 'email', label: 'Email', hidden: true },
    { key: 'joined', label: 'Ngày vào làm' },
    { key: 'salary', label: 'Lương cơ bản (₫)' },
    { key: 'leave', label: 'Phép còn lại (ngày)' },
    { key: 'status', label: 'Trạng thái' },
  ]);

  protected numeric(key: string) {
    return key === 'salary' || key === 'leave' || key === 'joined';
  }

  protected cell(r: Employee, key: string): string {
    return String(r[key as keyof Employee] ?? '—');
  }
}
