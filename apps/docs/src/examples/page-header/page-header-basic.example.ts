import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NxtButton } from '@nxt/ui/button';
import { NxtIcon } from '@nxt/ui/icon';
import { NxtPageHeader } from '@nxt/ui/page-header';

/** Trang danh sách: tiêu đề, mô tả, một hành động chính */
@Component({
  selector: 'example-page-header-basic',
  imports: [NxtButton, NxtIcon, NxtPageHeader],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- headingLevel="2" chỉ vì ví dụ nằm trong trang docs đã có h1. Trang thật để mặc định (h1). -->
    <nxt-page-header headingLevel="2" title="Nhân viên" description="1.284 hồ sơ đang làm việc · cập nhật 5 phút trước">
      <ng-container ngProjectAs="[nxtPageActions]">
        <button nxtButton><nxt-icon name="file-import" />Nhập từ Excel</button>
        <button nxtButton variant="primary"><nxt-icon name="plus" />Thêm nhân viên</button>
      </ng-container>
    </nxt-page-header>
  `,
})
export class PageHeaderBasicExample {}
