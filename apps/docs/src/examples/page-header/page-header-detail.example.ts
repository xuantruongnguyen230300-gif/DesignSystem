import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NxtButton } from '@nxt/ui/button';
import { NxtStack } from '@nxt/ui/layout';
import { NxtBreadcrumbItem, NxtPageHeader } from '@nxt/ui/page-header';
import { NxtTab, NxtTabs } from '@nxt/ui/tabs';
import { NxtTag } from '@nxt/ui/tag';

/** Trang chi tiết: breadcrumb, trạng thái cạnh tiêu đề, tab bên dưới */
@Component({
  selector: 'example-page-header-detail',
  imports: [NxtButton, NxtStack, NxtPageHeader, NxtTab, NxtTabs, NxtTag],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-stack gap="lg">
      <nxt-page-header
        headingLevel="2"
        title="Đơn nghỉ phép DNP-0412"
        description="Lê Minh Anh · Kế toán thanh toán, Phòng Kế toán · gửi 10 phút trước"
        [breadcrumb]="breadcrumb"
      >
        <nxt-tag nxtPageMeta tone="warning" dot>Chờ duyệt</nxt-tag>
        <ng-container ngProjectAs="[nxtPageActions]">
          <button nxtButton>Trả lại</button>
          <button nxtButton variant="primary">Phê duyệt</button>
        </ng-container>
        <nxt-tabs label="Nội dung đơn" [panels]="false" [(value)]="tab">
          <nxt-tab value="info" label="Thông tin đơn" />
          <nxt-tab value="flow" label="Quy trình duyệt" [count]="3" />
          <nxt-tab value="history" label="Lịch sử" />
        </nxt-tabs>
      </nxt-page-header>

      @switch (tab()) {
        @case ('flow') {
          <p>Bước 1/3 · Trưởng phòng Kế toán (Nguyễn Văn An) đang xem xét.</p>
        }
        @case ('history') {
          <p>10 phút trước · Lê Minh Anh gửi đơn.</p>
        }
        @default {
          <p>Nghỉ phép năm từ 20/10 đến 22/10/2026 (3 ngày). Người làm thay: Trần Thị Mai.</p>
        }
      }
    </nxt-stack>
  `,
})
export class PageHeaderDetailExample {
  /** The last item is the current page: never a link. */
  protected readonly breadcrumb: NxtBreadcrumbItem[] = [
    { label: 'Tổng quan', link: '/templates/dashboard' },
    { label: 'Phê duyệt', link: '/templates/approval' },
    { label: 'DNP-0412' },
  ];
  protected readonly tab = signal('info');
}
