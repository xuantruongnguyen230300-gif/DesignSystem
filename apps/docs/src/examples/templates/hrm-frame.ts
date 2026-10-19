import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NxtAppShell, NxtNavItem, NxtSidenav, NxtTopbar } from '@nxt/ui/app-shell';
import { NxtAvatar } from '@nxt/ui/avatar';
import { NxtButton } from '@nxt/ui/button';
import { NxtFormField, NxtInput } from '@nxt/ui/form-field';
import { NxtIcon } from '@nxt/ui/icon';
import { NxtMenu, NxtMenuItem, NxtMenuLabel, NxtMenuSeparator, NxtMenuTrigger } from '@nxt/ui/menu';
import { NxtBadge } from '@nxt/ui/tag';
import { NxtTooltip } from '@nxt/ui/tooltip';

const DEMO = 'Màn hình này chưa có trong bản demo';

/** Product navigation of the demo HRM app (screens not built yet stay visible but disabled, with a reason). */
export const HRM_NAV: NxtNavItem[] = [
  { label: 'Chính', heading: true },
  { label: 'Tổng quan', icon: 'layout-dashboard', link: '/templates/dashboard', exact: true },
  { label: 'Phê duyệt', icon: 'clipboard-check', link: '/templates/approval', badge: 12 },
  {
    label: 'Nhân sự',
    icon: 'users',
    children: [
      { label: 'Danh sách nhân viên', disabled: true, hint: DEMO },
      { label: 'Hồ sơ nhân viên', disabled: true, hint: DEMO },
      { label: 'Hợp đồng lao động', disabled: true, hint: DEMO },
      { label: 'Sơ đồ tổ chức', disabled: true, hint: DEMO },
    ],
  },
  {
    label: 'Chấm công',
    icon: 'calendar-time',
    children: [
      { label: 'Bảng công', disabled: true, hint: DEMO },
      { label: 'Đơn nghỉ phép', disabled: true, hint: DEMO },
      { label: 'Tăng ca', disabled: true, hint: DEMO },
    ],
  },
  { label: 'Tiền lương', icon: 'wallet', disabled: true, hint: DEMO },
  { label: 'Thiết lập', heading: true },
  {
    label: 'Danh mục',
    icon: 'database',
    children: [
      { label: 'Danh mục tổ chức', link: '/templates/catalog' },
      { label: 'Danh mục chấm công', disabled: true, hint: DEMO },
      { label: 'Danh mục lương & phúc lợi', disabled: true, hint: DEMO },
    ],
  },
  { label: 'Cấu hình hệ thống', icon: 'settings', disabled: true, hint: DEMO },
];

/** Shared frame of the HRM templates: app shell, product navigation, header search, account menu. */
@Component({
  selector: 'example-hrm-frame',
  imports: [
    NxtAppShell,
    NxtSidenav,
    NxtTopbar,
    NxtAvatar,
    NxtBadge,
    NxtButton,
    NxtFormField,
    NxtInput,
    NxtIcon,
    NxtMenu,
    NxtMenuItem,
    NxtMenuLabel,
    NxtMenuSeparator,
    NxtMenuTrigger,
    NxtTooltip,
  ],
  template: `
    <nxt-app-shell>
      <nxt-sidenav [items]="nav" [(collapsed)]="collapsed" label="Điều hướng NXT HRM">
        <div nxtSidenavHeader class="brand">
          <span class="brand__mark" aria-hidden="true"><nxt-icon name="users-group" /></span>
          <span class="brand__text">
            <span class="brand__name">NXT HRM</span>
            <span class="brand__org">Công ty CP NXT</span>
          </span>
        </div>
      </nxt-sidenav>

      <nxt-topbar>
        <div nxtTopbarCenter class="search">
          <nxt-form-field label="Tìm kiếm trong NXT HRM" hideLabel size="sm">
            <nxt-icon nxtPrefix name="search" />
            <input nxtInput type="search" placeholder="Tìm kiếm" />
          </nxt-form-field>
        </div>
        <div nxtTopbarEnd class="actions">
          <button nxtIconButton variant="ghost" type="button" aria-label="Trợ giúp" nxtTooltip="Trợ giúp" nxtTooltipPosition="bottom">
            <nxt-icon name="help-circle" />
          </button>
          <button nxtIconButton variant="ghost" type="button" class="bell" aria-label="Thông báo, 3 chưa đọc" nxtTooltip="Thông báo" nxtTooltipPosition="bottom">
            <nxt-icon name="bell" />
            <nxt-badge dot />
          </button>
          <button type="button" class="account" aria-label="Tài khoản: Đặng Anh" [nxtMenuTriggerFor]="account">
            <nxt-avatar name="Đặng Anh" size="sm" />
            <nxt-icon name="chevron-down" />
          </button>
          <ng-template #account>
            <div nxtMenu>
              <div nxtMenuLabel>Đặng Anh · Trưởng phòng Nhân sự</div>
              <button nxtMenuItem><nxt-icon name="user" />Hồ sơ của tôi</button>
              <button nxtMenuItem><nxt-icon name="settings" />Cài đặt tài khoản</button>
              <div nxtMenuSeparator></div>
              <button nxtMenuItem><nxt-icon name="logout" />Đăng xuất</button>
            </div>
          </ng-template>
        </div>
      </nxt-topbar>

      <div class="page"><ng-content /></div>
    </nxt-app-shell>
  `,
  styles: `
    :host {
      display: block;
      block-size: 100%;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: var(--nxt-space-gap-sm);
      min-inline-size: 0;
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
    .brand__text {
      display: grid;
      min-inline-size: 0;
    }
    .brand__name {
      color: var(--nxt-color-text-strong);
      font: var(--nxt-typography-heading-sm);
    }
    .brand__org {
      overflow: hidden;
      color: var(--nxt-color-text-subtle);
      font: var(--nxt-typography-caption);
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .search nxt-form-field {
      inline-size: 100%;
    }
    .actions {
      display: flex;
      align-items: center;
      gap: var(--nxt-space-gap-xs);
    }
    .bell {
      position: relative;
    }
    .bell nxt-badge {
      position: absolute;
      inset-block-start: var(--nxt-space-1-5);
      inset-inline-end: var(--nxt-space-1-5);
    }
    .account {
      --nxt-icon-size: var(--nxt-size-icon-sm);
      display: inline-flex;
      align-items: center;
      gap: var(--nxt-space-1);
      padding: var(--nxt-space-0-5);
      border: 0;
      border-radius: var(--nxt-radius-pill);
      background: transparent;
      color: var(--nxt-color-icon-subtle);
      cursor: pointer;
    }
    .account:hover {
      background: var(--nxt-color-bg-surface-hover);
    }
    .account:focus-visible {
      outline: var(--nxt-focus-ring-width) solid var(--nxt-focus-ring-color);
    }
    .page {
      padding: var(--nxt-space-section-sm) var(--nxt-space-section-md) var(--nxt-space-section-md);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HrmFrame {
  protected readonly nav = HRM_NAV;
  protected readonly collapsed = signal(false);
}
