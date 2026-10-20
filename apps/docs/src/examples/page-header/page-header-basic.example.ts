import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NxtPageHeader } from '@nxt/ui/page-header';

/** Trang danh sách: tiêu đề và mô tả, không có nút (nút nằm trên thanh công cụ của danh sách) */
@Component({
  selector: 'example-page-header-basic',
  imports: [NxtPageHeader],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- headingLevel="2" chỉ vì ví dụ nằm trong trang docs đã có h1. Trang thật để mặc định (h1). -->
    <nxt-page-header headingLevel="2" title="Nhân viên" description="1.284 hồ sơ đang làm việc · cập nhật 5 phút trước" />
  `,
})
export class PageHeaderBasicExample {}
