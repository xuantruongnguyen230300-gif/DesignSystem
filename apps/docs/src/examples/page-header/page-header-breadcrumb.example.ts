import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NxtBreadcrumb, NxtBreadcrumbItem } from '@nxt/ui/page-header';

/** Breadcrumb dùng riêng: mục không có trang thì không là link */
@Component({
  selector: 'example-page-header-breadcrumb',
  imports: [NxtBreadcrumb],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-breadcrumb label="Vị trí trang chức danh" [items]="items" />
  `,
})
export class PageHeaderBreadcrumbExample {
  protected readonly items: NxtBreadcrumbItem[] = [
    // "Thiết lập" and "Danh mục" are navigation groups without a page of their own → plain text.
    { label: 'Thiết lập' },
    { label: 'Danh mục' },
    { label: 'Chức danh', link: '/templates/catalog' },
    { label: 'Kế toán trưởng' },
  ];
}
