import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NxtButton } from '@nxt/ui/button';
import { NxtDrawer, NxtDrawerLayout } from '@nxt/ui/drawer';
import { NxtTable } from '@nxt/ui/table';
import { NxtTag } from '@nxt/ui/tag';

interface Employee {
  code: string;
  name: string;
  title: string;
  dept: string;
  manager: string;
  email: string;
  phone: string;
  start: string;
  onLeave: boolean;
}

const EMPLOYEES: Employee[] = [
  { code: 'NV-0318', name: 'Nguyễn Thị Ngọc Diệp', title: 'Kế toán tổng hợp', dept: 'Phòng Kế toán', manager: 'Hoàng Văn Đức', email: 'diep.ntn@congty.example', phone: '0912 345 678', start: '15/03/2024', onLeave: false },
  { code: 'NV-0402', name: 'Lê Minh Anh', title: 'Kế toán thanh toán', dept: 'Phòng Kế toán', manager: 'Hoàng Văn Đức', email: 'anh.lm@congty.example', phone: '0987 654 321', start: '02/06/2025', onLeave: true },
  { code: 'NV-0127', name: 'Phạm Quốc Bảo', title: 'Kế toán thuế', dept: 'Phòng Kế toán', manager: 'Hoàng Văn Đức', email: 'bao.pq@congty.example', phone: '0903 112 233', start: '10/01/2022', onLeave: false },
];

/** Xem nhanh hồ sơ từ một hàng mà không rời danh sách */
@Component({
  selector: 'example-drawer-detail',
  imports: [NxtButton, NxtTable],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="table-wrap" role="region" aria-label="Nhân viên Phòng Kế toán" tabindex="0">
      <table nxtTable>
        <thead>
          <tr>
            <th scope="col">Mã NV</th>
            <th scope="col">Họ và tên</th>
            <th scope="col">Chức danh</th>
            <th scope="col" class="nxt-table__actions"><span class="nxt-visually-hidden">Thao tác</span></th>
          </tr>
        </thead>
        <tbody>
          @for (e of employees; track e.code) {
            <tr>
              <td class="nxt-tabular-nums">{{ e.code }}</td>
              <th scope="row">{{ e.name }}</th>
              <td>{{ e.title }}</td>
              <td class="nxt-table__actions">
                <button nxtButton size="sm" variant="ghost" [attr.aria-label]="'Xem hồ sơ ' + e.name" (click)="open(e)">Xem</button>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
    <p class="docs-demo-label status" role="status">{{ message() }}</p>
  `,
  styles: `
    .table-wrap {
      overflow-x: auto;
    }
    .table-wrap:focus-visible {
      outline: var(--nxt-focus-ring-width) solid var(--nxt-focus-ring-color);
      outline-offset: calc(-1 * var(--nxt-focus-ring-width));
    }
    .status {
      margin-block-start: var(--nxt-space-gap-sm);
    }
  `,
})
export class DrawerDetailExample {
  private readonly drawer = inject(NxtDrawer);
  protected readonly employees = EMPLOYEES;
  protected readonly message = signal('');

  protected open(employee: Employee) {
    const ref = this.drawer.open<'edit', Employee>(EmployeeDetail, {
      title: `Hồ sơ ${employee.name}`,
      size: 'sm',
      data: employee,
    });
    // Đóng bằng Esc, nút Đóng hay backdrop đều trả về undefined; focus tự quay lại nút "Xem" đã mở drawer.
    ref.closed.subscribe((result) => {
      this.message.set(result === 'edit' ? `Chuyển sang sửa hồ sơ ${employee.name}.` : '');
    });
  }
}

/** Nội dung drawer: chỉ đọc, một hành động chính ở chân. */
@Component({
  selector: 'example-drawer-detail-content',
  imports: [NxtButton, NxtDrawerLayout, NxtTag],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-drawer-layout [title]="e.name" [description]="e.code + ' · ' + e.title">
      <div class="body">
        <nxt-tag [tone]="e.onLeave ? 'warning' : 'success'" dot>{{ e.onLeave ? 'Đang nghỉ phép' : 'Đang làm việc' }}</nxt-tag>
        <dl class="fields">
          <div>
            <dt>Phòng ban</dt>
            <dd>{{ e.dept }}</dd>
          </div>
          <div>
            <dt>Quản lý trực tiếp</dt>
            <dd>{{ e.manager }}</dd>
          </div>
          <div>
            <dt>Email công việc</dt>
            <dd>{{ e.email }}</dd>
          </div>
          <div>
            <dt>Điện thoại</dt>
            <dd class="nxt-tabular-nums">{{ e.phone }}</dd>
          </div>
          <div>
            <dt>Ngày vào làm</dt>
            <dd class="nxt-tabular-nums">{{ e.start }}</dd>
          </div>
        </dl>
      </div>
      <ng-container ngProjectAs="[nxtDrawerFooter]">
        <button nxtButton variant="primary" (click)="ref.close('edit')">Sửa hồ sơ</button>
      </ng-container>
    </nxt-drawer-layout>
  `,
  styles: `
    .body {
      display: grid;
      justify-items: start;
      gap: var(--nxt-space-gap-lg);
    }
    .fields {
      display: grid;
      gap: var(--nxt-space-gap-md);
    }
    .fields dt {
      color: var(--nxt-color-text-subtle);
      font: var(--nxt-typography-label-sm);
    }
    .fields dd {
      color: var(--nxt-color-text-strong);
      font: var(--nxt-typography-body-md);
      overflow-wrap: anywhere;
    }
  `,
})
class EmployeeDetail {
  protected readonly ref = inject<DialogRef<'edit'>>(DialogRef);
  protected readonly e = inject<Employee>(DIALOG_DATA);
}
