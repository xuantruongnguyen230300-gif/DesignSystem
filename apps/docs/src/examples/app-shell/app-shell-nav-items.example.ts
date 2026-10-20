import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NxtNavItem, NxtSidenav } from '@nxt/ui/app-shell';
import { NxtButton } from '@nxt/ui/button';
import { NxtIcon } from '@nxt/ui/icon';

const LATER = 'Chưa có trong bản demo';

/** Các loại mục: tiêu đề nhóm, nhóm lồng, số đếm, mục bị khoá */
@Component({
  selector: 'example-app-shell-nav-items',
  imports: [NxtSidenav, NxtButton, NxtIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="frame">
      <nxt-sidenav [items]="nav" label="Điều hướng NXT HRM (ví dụ các loại mục)">
        <span nxtSidenavHeader class="brand">NXT HRM</span>
        <div nxtSidenavTop class="top">
          <button nxtButton class="top__action"><nxt-icon name="plus" />Tạo đơn từ</button>
        </div>
      </nxt-sidenav>
      <div class="legend">
        <p class="docs-demo-label">“Chính”, “Thiết lập”: tiêu đề nhóm (<code>heading</code>), không tương tác.</p>
        <p class="docs-demo-label">“Nhân sự” mở sẵn vì chứa trang hiện tại; “Cơ cấu tổ chức” là nhóm cấp 2.</p>
        <p class="docs-demo-label">Số đếm (<code>badge</code>) cho việc đang chờ; mục bị khoá vẫn focus được và có tooltip giải thích.</p>
      </div>
    </div>
  `,
  styles: `
    .frame {
      display: flex;
      block-size: var(--nxt-size-560);
      overflow: hidden;
      border: var(--nxt-border-width-default) solid var(--nxt-color-border-default);
      border-radius: var(--nxt-radius-container);
      background: var(--nxt-color-bg-canvas);
    }
    .brand {
      color: var(--nxt-color-text-strong);
      font: var(--nxt-typography-heading-sm);
      white-space: nowrap;
    }
    .top {
      padding: var(--nxt-space-inset-sm) var(--nxt-space-inset-sm) 0;
    }
    .top__action {
      inline-size: 100%;
    }
    .legend {
      display: grid;
      align-content: start;
      gap: var(--nxt-space-gap-sm);
      max-inline-size: 40ch;
      padding: var(--nxt-space-section-sm) var(--nxt-space-section-md);
    }
  `,
})
export class AppShellNavItemsExample {
  /** Docs demo only: "Danh sách nhân viên" points at the page you are reading, so it shows the current-page state. */
  private readonly here = inject(Router).url.split(/[?#]/)[0];
  protected readonly nav: NxtNavItem[] = [
    { label: 'Chính', heading: true },
    { label: 'Tổng quan', icon: 'layout-dashboard', link: '/templates/dashboard', exact: true },
    { label: 'Phê duyệt', icon: 'clipboard-check', link: '/templates/approval', badge: 12 },
    {
      label: 'Nhân sự',
      icon: 'users',
      badge: 3,
      children: [
        { label: 'Danh sách nhân viên', link: this.here },
        { label: 'Hợp đồng sắp hết hạn', disabled: true, hint: LATER },
        {
          label: 'Cơ cấu tổ chức',
          children: [
            { label: 'Sơ đồ tổ chức', disabled: true, hint: LATER },
            { label: 'Định biên', disabled: true, hint: LATER },
          ],
        },
      ],
    },
    { label: 'Tiền lương', icon: 'wallet', disabled: true, hint: 'Cần quyền Quản trị tiền lương' },
    { label: 'Thiết lập', heading: true },
    { label: 'Danh mục', icon: 'database', children: [{ label: 'Chức danh', link: '/templates/catalog' }] },
    { label: 'Cấu hình hệ thống', icon: 'settings', disabled: true, hint: 'Cần quyền Quản trị hệ thống' },
  ];
}
