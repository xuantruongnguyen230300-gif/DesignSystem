import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NxtButton } from '@nxt/ui/button';
import { NxtIcon } from '@nxt/ui/icon';
import { NxtStack } from '@nxt/ui/layout';
import { NxtMenu, NxtMenuItem, NxtMenuLabel, NxtMenuSeparator, NxtMenuTrigger } from '@nxt/ui/menu';

/** Menu thao tác: nhóm có nhãn, đường phân cách, mục phá huỷ ở cuối */
@Component({
  selector: 'example-menu-basic',
  imports: [NxtButton, NxtIcon, NxtStack, NxtMenu, NxtMenuItem, NxtMenuLabel, NxtMenuSeparator, NxtMenuTrigger],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-stack gap="sm" align="start">
      <p class="docs-demo-label">Hồ sơ đang xem: Nguyễn Văn An · NV-0125 · Phòng Kế toán</p>
      <button nxtButton [nxtMenuTriggerFor]="actions">
        Thao tác
        <nxt-icon name="chevron-down" />
      </button>
      <ng-template #actions>
        <div nxtMenu>
          <div nxtMenuLabel>Hồ sơ</div>
          <button nxtMenuItem (triggered)="pick('Sửa thông tin')"><nxt-icon name="pencil" />Sửa thông tin</button>
          <button nxtMenuItem (triggered)="pick('Điều chuyển phòng ban')"><nxt-icon name="arrows-exchange" />Điều chuyển phòng ban</button>
          <button nxtMenuItem (triggered)="pick('Nhân bản hồ sơ')"><nxt-icon name="copy" />Nhân bản hồ sơ</button>
          <div nxtMenuSeparator></div>
          <div nxtMenuLabel>Xuất</div>
          <button nxtMenuItem (triggered)="pick('Tải hồ sơ PDF')"><nxt-icon name="download" />Tải hồ sơ PDF</button>
          <button nxtMenuItem [disabled]="true"><nxt-icon name="printer" />In hồ sơ (chưa cấu hình máy in)</button>
          <div nxtMenuSeparator></div>
          <button nxtMenuItem tone="danger" (triggered)="pick('Xoá nhân viên')"><nxt-icon name="trash" />Xoá nhân viên</button>
        </div>
      </ng-template>
      <p class="docs-demo-label" role="status">{{ message() }}</p>
    </nxt-stack>
  `,
})
export class MenuBasicExample {
  protected readonly message = signal('');

  protected pick(action: string) {
    this.message.set(`Đã chọn “${action}” cho Nguyễn Văn An.`);
  }
}
