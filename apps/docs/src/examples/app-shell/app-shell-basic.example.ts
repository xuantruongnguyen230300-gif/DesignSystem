import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NxtAppShell, NxtNavItem, NxtSidenav, NxtTopbar } from '@nxt/ui/app-shell';
import { NxtAvatar } from '@nxt/ui/avatar';
import { NxtButton } from '@nxt/ui/button';
import { NxtFormField, NxtInput } from '@nxt/ui/form-field';
import { NxtIcon } from '@nxt/ui/icon';
import { NxtMenu, NxtMenuItem, NxtMenuLabel, NxtMenuSeparator, NxtMenuTrigger } from '@nxt/ui/menu';
import { NxtPageHeader } from '@nxt/ui/page-header';
import { NxtSearch } from '@nxt/ui/search';
import { NxtTag, NxtTone } from '@nxt/ui/tag';
import { NxtTooltip } from '@nxt/ui/tooltip';

const LATER = 'Chưa có trong bản demo';

interface LeaveRow {
  id: string;
  name: string;
  dept: string;
  range: string;
  status: string;
  tone: NxtTone;
}

const ROWS: LeaveRow[] = [
  { id: 'DNP-0412', name: 'Lê Minh Anh', dept: 'Phòng Kế toán', range: '20/10 – 22/10 · 3 ngày', status: 'Chờ duyệt', tone: 'warning' },
  { id: 'DNP-0411', name: 'Trần Thị Mai', dept: 'Phòng Kế toán', range: '24/10 · 1 ngày', status: 'Chờ duyệt', tone: 'warning' },
  { id: 'DNP-0409', name: 'Nguyễn Thị Ngọc Diệp', dept: 'Kinh doanh miền Nam', range: '27/10 · 1 ngày', status: 'Chờ duyệt', tone: 'warning' },
  { id: 'DNP-0407', name: 'Lý Hoàng Nam', dept: 'Kinh doanh miền Nam', range: '28/10 – 29/10 · 2 ngày', status: 'Đã duyệt', tone: 'success' },
  { id: 'DNP-0405', name: 'Bùi Khánh Linh', dept: 'Phòng Nhân sự', range: '03/11 – 04/11 · 2 ngày', status: 'Đã duyệt', tone: 'success' },
  { id: 'DNP-0403', name: 'Hoàng Văn Đức', dept: 'Khối Vận hành', range: '15/10 · 0,5 ngày', status: 'Đã duyệt', tone: 'success' },
  { id: 'DNP-0402', name: 'Đỗ Minh Khoa', dept: 'Ban Pháp chế', range: '14/10 · 1 ngày', status: 'Trả lại', tone: 'danger' },
  { id: 'DNP-0399', name: 'Phạm Thu Hà', dept: 'Phòng Nhân sự', range: '09/10 – 10/10 · 2 ngày', status: 'Đã duyệt', tone: 'success' },
  { id: 'DNP-0396', name: 'Võ Thành Nam', dept: 'Khối Kinh doanh', range: '06/10 · 1 ngày', status: 'Đã duyệt', tone: 'success' },
  { id: 'DNP-0391', name: 'Trịnh Bảo Châu', dept: 'Phòng Marketing', range: '02/10 – 03/10 · 2 ngày', status: 'Đã duyệt', tone: 'success' },
];

/** Khung ứng dụng: điều hướng, thanh trên cùng, vùng nội dung tự cuộn */
@Component({
  selector: 'example-app-shell-basic',
  imports: [
    NxtAppShell,
    NxtSidenav,
    NxtTopbar,
    NxtAvatar,
    NxtButton,
    NxtFormField,
    NxtInput,
    NxtIcon,
    NxtMenu,
    NxtMenuItem,
    NxtMenuLabel,
    NxtMenuSeparator,
    NxtMenuTrigger,
    NxtPageHeader,
    NxtSearch,
    NxtTag,
    NxtTooltip,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="frame">
      <nxt-app-shell>
        <nxt-sidenav [items]="nav" [(collapsed)]="collapsed" label="Điều hướng NXT HRM (ví dụ khung ứng dụng)">
          <div nxtSidenavHeader class="brand">
            <span class="brand__mark" aria-hidden="true"><nxt-icon name="users-group" /></span>
            <span class="brand__name">NXT HRM</span>
          </div>
        </nxt-sidenav>

        <nxt-topbar>
          <nxt-form-field nxtTopbarCenter label="Tìm kiếm trong NXT HRM" hideLabel size="sm">
            <nxt-icon nxtPrefix name="search" />
            <input nxtInput type="search" placeholder="Tìm nhân viên, đơn từ" />
          </nxt-form-field>
          <button nxtTopbarEnd nxtIconButton variant="ghost" aria-label="Trợ giúp" nxtTooltip="Trợ giúp" nxtTooltipPosition="bottom">
            <nxt-icon name="help-circle" />
          </button>
          <button nxtTopbarEnd nxtIconButton variant="ghost" aria-label="Thông báo" nxtTooltip="Thông báo" nxtTooltipPosition="bottom">
            <nxt-icon name="bell" />
          </button>
          <!-- The signed-in user lives here only (top right, Windows / Microsoft 365 convention), not in the sidenav. -->
          <button nxtTopbarEnd type="button" class="account" aria-label="Tài khoản: Đặng Anh" [nxtMenuTriggerFor]="account">
            <nxt-avatar name="Đặng Anh" size="sm" />
            <nxt-icon name="chevron-down" />
          </button>
          <ng-template #account>
            <div nxtMenu>
              <div nxtMenuLabel>Đặng Anh · Trưởng phòng Nhân sự</div>
              <button nxtMenuItem><nxt-icon name="user" />Hồ sơ của tôi</button>
              <div nxtMenuSeparator></div>
              <button nxtMenuItem><nxt-icon name="logout" />Đăng xuất</button>
            </div>
          </ng-template>
        </nxt-topbar>

        <div class="page">
          <nxt-page-header headingLevel="2" title="Đơn nghỉ phép" description="Tháng 10/2026 · phòng ban bạn quản lý" />
          <div class="list">
            <!-- List actions sit on the toolbar above the data they act on, not in the page header. -->
            <div class="toolbar">
              <nxt-search class="toolbar__search" label="Tìm đơn nghỉ phép" placeholder="Tên hoặc mã đơn" size="sm" />
              <span class="toolbar__spacer"></span>
              <button nxtIconButton size="sm" type="button" aria-label="Xuất 10 đơn nghỉ phép ra Excel" nxtTooltip="Xuất 10 đơn nghỉ phép ra Excel">
                <nxt-icon name="file-download" />
              </button>
              <button nxtButton size="sm" variant="primary" type="button" aria-label="Thêm mới đơn nghỉ phép"><nxt-icon name="plus" />Thêm mới</button>
            </div>
          <ul class="rows" role="list">
            @for (r of rows; track r.id) {
              <li class="row">
                <span class="row__text">
                  <span class="row__name">{{ r.name }}</span>
                  <span class="row__meta">{{ r.id }} · {{ r.dept }} · {{ r.range }}</span>
                </span>
                <nxt-tag [tone]="r.tone" dot size="sm">{{ r.status }}</nxt-tag>
              </li>
            }
          </ul>
          </div>
        </div>
      </nxt-app-shell>
    </div>
  `,
  styles: `
    .frame {
      block-size: var(--nxt-size-560);
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
    .list {
      border: var(--nxt-border-width-default) solid var(--nxt-color-border-default);
      border-radius: var(--nxt-radius-container);
      background: var(--nxt-color-bg-surface);
    }
    .toolbar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--nxt-space-gap-sm);
      padding: var(--nxt-space-inset-sm) var(--nxt-space-inset-md);
      border-block-end: var(--nxt-border-width-default) solid var(--nxt-color-border-default);
    }
    .toolbar__search {
      flex: 1 1 var(--nxt-layout-item-min-sm);
      max-inline-size: var(--nxt-size-400);
    }
    .toolbar__spacer {
      flex: 1;
    }
    .row__meta {
      overflow: hidden;
      color: var(--nxt-color-text-subtle);
      font: var(--nxt-typography-caption);
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .page {
      display: grid;
      gap: var(--nxt-space-gap-lg);
      padding: var(--nxt-space-section-sm) var(--nxt-space-section-md);
    }
    .rows {
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .row {
      display: flex;
      align-items: center;
      gap: var(--nxt-space-gap-md);
      padding: var(--nxt-space-inset-sm) var(--nxt-space-inset-md);
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
export class AppShellBasicExample {
  /** Docs demo only: "Đơn nghỉ phép" points at the page you are reading, so it shows the current-page state. */
  private readonly here = inject(Router).url.split(/[?#]/)[0];
  protected readonly collapsed = signal(false);
  protected readonly nav: NxtNavItem[] = [
    { label: 'Chính', heading: true },
    { label: 'Tổng quan', icon: 'layout-dashboard', link: '/templates/dashboard', exact: true },
    { label: 'Phê duyệt', icon: 'clipboard-check', link: '/templates/approval', badge: 12 },
    {
      label: 'Nhân sự',
      icon: 'users',
      children: [
        { label: 'Danh sách nhân viên', disabled: true, hint: LATER },
        { label: 'Hợp đồng lao động', disabled: true, hint: LATER },
      ],
    },
    {
      label: 'Chấm công',
      icon: 'calendar-time',
      children: [
        { label: 'Bảng công', disabled: true, hint: LATER },
        { label: 'Đơn nghỉ phép', link: this.here },
        { label: 'Tăng ca', disabled: true, hint: LATER },
      ],
    },
    { label: 'Tiền lương', icon: 'wallet', disabled: true, hint: 'Cần quyền Quản trị tiền lương' },
    { label: 'Thiết lập', heading: true },
    { label: 'Danh mục', icon: 'database', children: [{ label: 'Chức danh', link: '/templates/catalog' }] },
  ];
  protected readonly rows = ROWS;
}
