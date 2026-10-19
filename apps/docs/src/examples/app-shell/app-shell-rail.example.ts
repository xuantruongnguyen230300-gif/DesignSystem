import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NxtAppShell, NxtNavItem, NxtSidenav, NxtTopbar } from '@nxt/ui/app-shell';
import { NxtAvatar } from '@nxt/ui/avatar';
import { NxtIcon } from '@nxt/ui/icon';
import { NxtMenu, NxtMenuItem, NxtMenuLabel, NxtMenuTrigger } from '@nxt/ui/menu';
import { NxtPageHeader } from '@nxt/ui/page-header';

const LATER = 'Chưa có trong bản demo';

/** Thu gọn thành thanh icon: tooltip và menu bên cạnh */
@Component({
  selector: 'example-app-shell-rail',
  imports: [NxtAppShell, NxtSidenav, NxtTopbar, NxtAvatar, NxtIcon, NxtMenu, NxtMenuItem, NxtMenuLabel, NxtMenuTrigger, NxtPageHeader],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="frame">
      <nxt-app-shell>
        <nxt-sidenav [items]="nav" [(collapsed)]="collapsed" label="Điều hướng NXT HRM (ví dụ thu gọn)">
          <div nxtSidenavHeader class="brand">
            <span class="brand__mark" aria-hidden="true"><nxt-icon name="users-group" /></span>
            <span class="brand__name">NXT HRM</span>
          </div>
        </nxt-sidenav>

        <nxt-topbar>
          <span nxtTopbarStart class="product">Công ty CP NXT</span>
          <!-- The signed-in user lives in the top bar only, so the rail never repeats it. -->
          <button nxtTopbarEnd type="button" class="account" aria-label="Tài khoản: Đặng Anh" [nxtMenuTriggerFor]="account">
            <nxt-avatar name="Đặng Anh" size="sm" />
            <nxt-icon name="chevron-down" />
          </button>
          <ng-template #account>
            <div nxtMenu>
              <div nxtMenuLabel>Đặng Anh · Trưởng phòng Nhân sự</div>
              <button nxtMenuItem><nxt-icon name="logout" />Đăng xuất</button>
            </div>
          </ng-template>
        </nxt-topbar>

        <div class="page">
          <nxt-page-header headingLevel="2" title="Hợp đồng lao động" description="Di chuột hoặc Tab tới từng icon để thấy tên. Nhóm “Nhân sự” và “Chấm công” mở thành menu bên cạnh." />
          <p class="docs-demo-label">
            Giá trị <code>collapsed</code>: {{ collapsed() }}. Lưu giá trị này (ví dụ vào localStorage) để lần sau người dùng mở lại đúng trạng thái.
          </p>
        </div>
      </nxt-app-shell>
    </div>
  `,
  styles: `
    .frame {
      block-size: var(--nxt-size-400);
      overflow: hidden;
      border: var(--nxt-border-width-default) solid var(--nxt-color-border-default);
      border-radius: var(--nxt-radius-container);
    }
    .brand {
      display: flex;
      align-items: center;
      gap: var(--nxt-space-gap-sm);
    }
    .brand__mark {
      display: inline-grid;
      flex: none;
      place-items: center;
      inline-size: var(--nxt-size-control-md);
      block-size: var(--nxt-size-control-md);
      border-radius: var(--nxt-radius-control);
      background: var(--nxt-color-bg-primary);
      color: var(--nxt-color-text-on-primary);
    }
    .brand__name {
      color: var(--nxt-color-text-strong);
      font: var(--nxt-typography-heading-sm);
      white-space: nowrap;
    }
    .account {
      --nxt-icon-size: var(--nxt-size-icon-sm);
      display: inline-flex;
      align-items: center;
      gap: var(--nxt-space-gap-xs);
      min-block-size: var(--nxt-size-control-md);
      padding-inline: var(--nxt-space-inset-xs);
      border: 0;
      border-radius: var(--nxt-radius-control);
      background: transparent;
      color: var(--nxt-color-icon-subtle);
      cursor: pointer;
    }
    .account:hover {
      background: var(--nxt-color-bg-surface-hover);
    }
    .account:focus-visible {
      outline: var(--nxt-focus-ring-width) solid var(--nxt-focus-ring-color);
      outline-offset: var(--nxt-focus-ring-offset);
    }
    .product {
      color: var(--nxt-color-text-subtle);
      font: var(--nxt-typography-label-md);
    }
    .page {
      display: grid;
      gap: var(--nxt-space-gap-md);
      padding: var(--nxt-space-section-sm) var(--nxt-space-section-md);
    }
  `,
})
export class AppShellRailExample {
  /** Docs demo only: "Hợp đồng lao động" points at the page you are reading, so it shows the current-page state. */
  private readonly here = inject(Router).url.split(/[?#]/)[0];
  /** Starts as an icon rail. Two-way: the toggle button in the header updates it. */
  protected readonly collapsed = signal(true);
  protected readonly nav: NxtNavItem[] = [
    { label: 'Tổng quan', icon: 'layout-dashboard', link: '/templates/dashboard', exact: true },
    { label: 'Phê duyệt', icon: 'clipboard-check', link: '/templates/approval', badge: 12 },
    {
      label: 'Nhân sự',
      icon: 'users',
      children: [
        { label: 'Danh sách nhân viên', disabled: true, hint: LATER },
        { label: 'Hợp đồng lao động', link: this.here },
        { label: 'Báo cáo', heading: true },
        { label: 'Biến động nhân sự', disabled: true, hint: LATER },
      ],
    },
    {
      label: 'Chấm công',
      icon: 'calendar-time',
      children: [
        { label: 'Bảng công', disabled: true, hint: LATER },
        { label: 'Đơn nghỉ phép', disabled: true, hint: LATER },
      ],
    },
    { label: 'Thiết lập', heading: true },
    { label: 'Cấu hình hệ thống', icon: 'settings', disabled: true, hint: 'Cần quyền Quản trị hệ thống' },
  ];
}
