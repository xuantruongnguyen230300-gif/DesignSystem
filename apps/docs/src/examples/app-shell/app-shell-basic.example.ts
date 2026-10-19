import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NxtAppShell, NxtNavItem, NxtSidenav, NxtTopbar } from '@nxt/ui/app-shell';
import { NxtAvatar } from '@nxt/ui/avatar';
import { NxtButton } from '@nxt/ui/button';
import { NxtFormField, NxtInput } from '@nxt/ui/form-field';
import { NxtIcon } from '@nxt/ui/icon';
import { NxtPageHeader } from '@nxt/ui/page-header';
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
  imports: [NxtAppShell, NxtSidenav, NxtTopbar, NxtAvatar, NxtButton, NxtFormField, NxtInput, NxtIcon, NxtPageHeader, NxtTag, NxtTooltip],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="frame">
      <nxt-app-shell>
        <nxt-sidenav [items]="nav" [(collapsed)]="collapsed" label="Điều hướng NXT HRM (ví dụ khung ứng dụng)">
          <div nxtSidenavHeader class="brand">
            <span class="brand__mark" aria-hidden="true"><nxt-icon name="users-group" /></span>
            <span class="brand__name">NXT HRM</span>
          </div>
          <div nxtSidenavFooter class="user">
            <nxt-avatar name="Đặng Anh" size="sm" />
            @if (!collapsed()) {
              <span class="user__text">
                <span class="user__name">Đặng Anh</span>
                <span class="user__role">Trưởng phòng Nhân sự</span>
              </span>
            }
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
        </nxt-topbar>

        <div class="page">
          <nxt-page-header headingLevel="2" title="Đơn nghỉ phép" description="Tháng 10/2026 · phòng ban bạn quản lý">
            <ng-container ngProjectAs="[nxtPageActions]">
              <button nxtButton><nxt-icon name="download" />Xuất Excel</button>
              <button nxtButton variant="primary"><nxt-icon name="plus" />Tạo đơn</button>
            </ng-container>
          </nxt-page-header>
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
    .user {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--nxt-space-gap-sm);
    }
    .user:has(.user__text) {
      justify-content: flex-start;
    }
    .user__text {
      display: grid;
      min-inline-size: 0;
    }
    .user__name {
      color: var(--nxt-color-text-strong);
      font: var(--nxt-typography-label-sm);
    }
    .user__role,
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
      border: var(--nxt-border-width-default) solid var(--nxt-color-border-default);
      border-radius: var(--nxt-radius-container);
      background: var(--nxt-color-bg-surface);
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
