import type { ConnectedPosition } from '@angular/cdk/overlay';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NxtAvatar } from '@nxt/ui/avatar';
import { NxtButton } from '@nxt/ui/button';
import { NxtIcon } from '@nxt/ui/icon';
import { NxtStack } from '@nxt/ui/layout';
import { NxtMenu, NxtMenuItem, NxtMenuSeparator, NxtMenuTrigger } from '@nxt/ui/menu';
import { NxtTooltip } from '@nxt/ui/tooltip';

interface Employee {
  name: string;
  title: string;
  dept: string;
}

const EMPLOYEES: Employee[] = [
  { name: 'Nguyễn Văn An', title: 'Kế toán trưởng', dept: 'Phòng Kế toán' },
  { name: 'Trần Thị Bích Ngọc', title: 'Chuyên viên tuyển dụng', dept: 'Phòng Nhân sự' },
  { name: 'Phạm Quốc Huy', title: 'Trưởng nhóm kinh doanh', dept: 'Khối Kinh doanh' },
];

/** Trên hàng dữ liệu: nút icon có tên riêng, menu canh mép phải */
@Component({
  selector: 'example-menu-row-actions',
  imports: [NxtAvatar, NxtButton, NxtIcon, NxtStack, NxtMenu, NxtMenuItem, NxtMenuSeparator, NxtMenuTrigger, NxtTooltip],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-stack gap="sm">
      <ul class="rows" role="list">
        @for (e of employees; track e.name) {
          <li class="row">
            <nxt-avatar [name]="e.name" size="sm" />
            <span class="row__text">
              <span class="row__name">{{ e.name }}</span>
              <span class="docs-demo-label">{{ e.title }} · {{ e.dept }}</span>
            </span>
            <button
              nxtIconButton
              variant="ghost"
              size="sm"
              [attr.aria-label]="'Thao tác cho ' + e.name"
              nxtTooltip="Thao tác"
              [nxtMenuTriggerFor]="rowMenu"
              [nxtMenuPosition]="endAligned"
            >
              <nxt-icon name="dots-vertical" />
            </button>
            <ng-template #rowMenu>
              <div nxtMenu>
                <button nxtMenuItem (triggered)="pick('Xem hồ sơ', e)"><nxt-icon name="user" />Xem hồ sơ</button>
                <button nxtMenuItem (triggered)="pick('Gửi email', e)"><nxt-icon name="mail" />Gửi email</button>
                <button nxtMenuItem (triggered)="pick('Tạo đơn nghỉ phép thay', e)"><nxt-icon name="calendar-event" />Tạo đơn nghỉ phép thay</button>
                <div nxtMenuSeparator></div>
                <button nxtMenuItem tone="danger" (triggered)="pick('Cho nghỉ việc', e)"><nxt-icon name="user-minus" />Cho nghỉ việc</button>
              </div>
            </ng-template>
          </li>
        }
      </ul>
      <p class="docs-demo-label" role="status">{{ message() }}</p>
    </nxt-stack>
  `,
  styles: `
    .rows {
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .row {
      display: flex;
      align-items: center;
      gap: var(--nxt-space-gap-md);
      padding-block: var(--nxt-space-inset-sm);
    }
    .row + .row {
      border-block-start: var(--nxt-border-width-default) solid var(--nxt-color-border-subtle);
    }
    .row__text {
      display: grid;
      flex: 1;
      min-inline-size: 0;
    }
    .row__name {
      color: var(--nxt-color-text-strong);
      font: var(--nxt-typography-label-md);
    }
  `,
})
export class MenuRowActionsExample {
  protected readonly employees = EMPLOYEES;
  protected readonly message = signal('');
  /** Menu opens below the button, aligned to its end edge; flips above when there is no room. */
  protected readonly endAligned: ConnectedPosition[] = [
    { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top' },
    { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom' },
  ];

  protected pick(action: string, e: Employee) {
    this.message.set(`Đã chọn “${action}” cho ${e.name}.`);
  }
}
