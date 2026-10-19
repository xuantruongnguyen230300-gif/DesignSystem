import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NxtAvatar } from '@nxt/ui/avatar';
import { NxtButton } from '@nxt/ui/button';
import { NxtCard, NxtStat } from '@nxt/ui/card';
import { NxtIcon, NxtIconName } from '@nxt/ui/icon';
import { NxtGrid, NxtSpan } from '@nxt/ui/layout';
import { NxtPageHeader } from '@nxt/ui/page-header';
import { NxtProgress } from '@nxt/ui/progress';
import { NxtSegmented } from '@nxt/ui/segmented';
import { NxtTimeline, NxtTimelineItem } from '@nxt/ui/timeline';
import { HrmFrame } from './hrm-frame';

interface Task {
  icon: NxtIconName;
  tone: 'brand' | 'warning' | 'danger' | 'info';
  title: string;
  detail: string;
  action: string;
  link: string;
}

/** Tổng quan nhân sự — việc cần xử lý trước, chỉ số, biến động, cơ cấu, hoạt động */
@Component({
  selector: 'example-template-dashboard',
  imports: [
    RouterLink,
    HrmFrame,
    NxtAvatar,
    NxtButton,
    NxtCard,
    NxtStat,
    NxtIcon,
    NxtGrid,
    NxtSpan,
    NxtPageHeader,
    NxtProgress,
    NxtSegmented,
    NxtTimeline,
    NxtTimelineItem,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <example-hrm-frame>
      <div class="stack">
        <nxt-page-header title="Tổng quan nhân sự" description="Số liệu đến 16/10/2026 · Công ty CP NXT · 7 khối, 32 phòng ban">
          <ng-container ngProjectAs="[nxtPageActions]">
            <nxt-segmented label="Kỳ báo cáo" size="sm" [options]="periods" [(value)]="period" />
            <button nxtButton><nxt-icon name="download" />Xuất báo cáo</button>
          </ng-container>
        </nxt-page-header>

        <nxt-grid gap="md">
          <nxt-card title="Việc cần xử lý" subtitle="Sắp xếp theo mức độ gấp" [nxtSpan]="{ base: 12, xl: 5 }">
            <ul class="tasks" role="list">
              @for (t of tasks; track t.title) {
                <li class="task">
                  <span class="task__icon" [attr.data-tone]="t.tone" aria-hidden="true"><nxt-icon [name]="t.icon" /></span>
                  <span class="task__text">
                    <span class="task__title">{{ t.title }}</span>
                    <span class="task__detail">{{ t.detail }}</span>
                  </span>
                  <a nxtButton size="sm" variant="ghost" [routerLink]="t.link">{{ t.action }}</a>
                </li>
              }
            </ul>
          </nxt-card>

          <div class="stats" [nxtSpan]="{ base: 12, xl: 7 }">
            <nxt-card><nxt-stat label="Tổng nhân sự" value="1.284" icon="users" delta="2,1%" trend="up" caption="so với tháng 9" /></nxt-card>
            <nxt-card><nxt-stat label="Tuyển mới trong tháng" value="32" icon="user-plus" delta="6 người" trend="up" deltaTone="positive" caption="so với tháng 9" /></nxt-card>
            <nxt-card><nxt-stat label="Nghỉ việc trong tháng" value="9" unit="(0,7%)" icon="user-minus" delta="5 người" trend="down" deltaTone="positive" caption="so với tháng 9" /></nxt-card>
            <nxt-card><nxt-stat label="Đi làm đúng giờ" value="96,4" unit="%" icon="clock-hour-4" delta="0,8 điểm" trend="down" deltaTone="negative" caption="so với tháng 9" /></nxt-card>
          </div>

          <nxt-card title="Biến động nhân sự 6 tháng" subtitle="Số người tuyển mới và nghỉ việc mỗi tháng" [nxtSpan]="{ base: 12, lg: 7 }">
            <figure class="chart">
              <div class="chart__plot" aria-hidden="true">
                @for (m of months; track m.label) {
                  <div class="chart__group">
                    <div class="chart__bars">
                      <span class="chart__bar" data-series="hire" [style.block-size.%]="pct(m.hires)"><span class="chart__value">{{ m.hires }}</span></span>
                      <span class="chart__bar" data-series="exit" [style.block-size.%]="pct(m.exits)"><span class="chart__value">{{ m.exits }}</span></span>
                    </div>
                    <span class="chart__label">{{ m.label }}</span>
                  </div>
                }
              </div>
              <figcaption class="chart__legend">
                <span><span class="chart__swatch" data-series="hire"></span>Tuyển mới</span>
                <span><span class="chart__swatch" data-series="exit"></span>Nghỉ việc</span>
              </figcaption>
              <table class="nxt-visually-hidden">
                <caption>Biến động nhân sự 6 tháng gần nhất</caption>
                <thead><tr><th scope="col">Tháng</th><th scope="col">Tuyển mới</th><th scope="col">Nghỉ việc</th></tr></thead>
                <tbody>
                  @for (m of months; track m.label) {
                    <tr><th scope="row">{{ m.full }}</th><td>{{ m.hires }}</td><td>{{ m.exits }}</td></tr>
                  }
                </tbody>
              </table>
            </figure>
          </nxt-card>

          <nxt-card title="Cơ cấu theo khối" [subtitle]="'Tổng ' + totalText() + ' nhân sự'" [nxtSpan]="{ base: 12, lg: 5 }">
            <ul class="bars" role="list">
              @for (d of departments; track d.name) {
                <li class="bars__row">
                  <span class="bars__name">{{ d.name }}</span>
                  <span class="bars__count nxt-tabular-nums">{{ d.count }}</span>
                  <nxt-progress class="bars__meter" [value]="share(d.count)" [label]="d.name" [valueText]="d.count + ' người, ' + share(d.count) + '%'" />
                </li>
              }
            </ul>
          </nxt-card>

          <nxt-card title="Sinh nhật trong tuần" [nxtSpan]="{ base: 12, lg: 5 }">
            <ul class="people" role="list">
              @for (p of birthdays; track p.name) {
                <li class="person">
                  <nxt-avatar [name]="p.name" />
                  <span class="person__text">
                    <span class="person__name">{{ p.name }}</span>
                    <span class="person__meta">{{ p.dept }}</span>
                  </span>
                  <span class="person__date nxt-tabular-nums">{{ p.date }}</span>
                </li>
              }
            </ul>
          </nxt-card>

          <nxt-card title="Hoạt động gần đây" [nxtSpan]="{ base: 12, lg: 7 }">
            <nxt-timeline>
              <nxt-timeline-item title="Lê Minh Anh gửi đơn nghỉ phép 3 ngày" time="10 phút trước" icon="send" tone="brand">Chờ bạn duyệt · Phòng Kế toán</nxt-timeline-item>
              <nxt-timeline-item title="Đã ký hợp đồng chính thức với Phạm Quốc Bảo" time="09:12 hôm nay" icon="file-certificate" tone="success" />
              <nxt-timeline-item title="12 hợp đồng sẽ hết hạn trong 30 ngày" time="Hệ thống nhắc · 08:00" icon="alert-triangle" tone="warning">Gia hạn hoặc thông báo chấm dứt trước 15/11/2026</nxt-timeline-item>
              <nxt-timeline-item title="Cập nhật danh mục chức danh “Kế toán tổng hợp”" time="Hôm qua · Trần Thị Mai" icon="pencil" />
            </nxt-timeline>
          </nxt-card>
        </nxt-grid>
      </div>
    </example-hrm-frame>
  `,
  styles: `
    .stack {
      display: grid;
      gap: var(--nxt-space-section-sm);
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, var(--nxt-layout-item-min-md)), 1fr));
      gap: var(--nxt-space-gap-md);
    }
    .tasks,
    .bars,
    .people {
      display: grid;
      gap: var(--nxt-space-gap-xs);
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .task {
      display: flex;
      align-items: center;
      gap: var(--nxt-space-gap-md);
      padding-block: var(--nxt-space-inset-xs);
      border-block-end: var(--nxt-border-width-default) solid var(--nxt-color-border-subtle);
    }
    .task:last-child {
      border-block-end: 0;
    }
    .task__icon {
      --nxt-icon-size: var(--nxt-size-icon-sm);
      display: inline-grid;
      flex: none;
      place-items: center;
      inline-size: var(--nxt-size-control-md);
      block-size: var(--nxt-size-control-md);
      border-radius: var(--nxt-radius-control);
      background: var(--nxt-color-bg-primary-subtle);
      color: var(--nxt-color-icon-primary);
    }
    .task__icon[data-tone='warning'] { background: var(--nxt-color-bg-warning-subtle); color: var(--nxt-color-text-warning); }
    .task__icon[data-tone='danger'] { background: var(--nxt-color-bg-danger-subtle); color: var(--nxt-color-text-danger); }
    .task__icon[data-tone='info'] { background: var(--nxt-color-bg-info-subtle); color: var(--nxt-color-text-info); }
    .task__text,
    .person__text {
      display: grid;
      flex: 1;
      min-inline-size: 0;
    }
    .task__title,
    .person__name {
      color: var(--nxt-color-text-strong);
      font: var(--nxt-typography-label-md);
    }
    .task__detail,
    .person__meta {
      color: var(--nxt-color-text-subtle);
      font: var(--nxt-typography-body-sm);
    }
    .chart {
      display: grid;
      gap: var(--nxt-space-gap-md);
      margin: 0;
    }
    .chart__plot {
      display: grid;
      grid-template-columns: repeat(6, minmax(0, 1fr));
      align-items: end;
      gap: var(--nxt-space-gap-md);
      block-size: calc(var(--nxt-layout-item-min-sm) * 1.25);
      padding-block-start: var(--nxt-space-section-sm);
      border-block-end: var(--nxt-border-width-default) solid var(--nxt-color-border-default);
    }
    .chart__group {
      display: grid;
      grid-template-rows: minmax(0, 1fr) auto;
      gap: var(--nxt-space-gap-xs);
      block-size: 100%;
    }
    .chart__bars {
      display: flex;
      align-items: flex-end;
      justify-content: center;
      gap: var(--nxt-space-1);
      block-size: 100%;
    }
    .chart__bar {
      position: relative;
      inline-size: min(40%, var(--nxt-size-24));
      min-block-size: var(--nxt-space-1);
      border-radius: var(--nxt-radius-control) var(--nxt-radius-control) 0 0;
      background: var(--nxt-color-data-1);
    }
    .chart__bar[data-series='exit'],
    .chart__swatch[data-series='exit'] {
      background: var(--nxt-color-data-3);
    }
    .chart__value {
      position: absolute;
      inset-block-end: 100%;
      inset-inline: 0;
      color: var(--nxt-color-text-subtle);
      font: var(--nxt-typography-caption);
      font-variant-numeric: tabular-nums;
      text-align: center;
    }
    .chart__label {
      color: var(--nxt-color-text-subtle);
      font: var(--nxt-typography-caption);
      text-align: center;
    }
    .chart__legend {
      display: flex;
      gap: var(--nxt-space-gap-lg);
      color: var(--nxt-color-text-default);
      font: var(--nxt-typography-body-sm);
    }
    .chart__legend > span {
      display: inline-flex;
      align-items: center;
      gap: var(--nxt-space-gap-xs);
    }
    .chart__swatch {
      inline-size: var(--nxt-space-3);
      block-size: var(--nxt-space-3);
      border-radius: var(--nxt-radius-xs);
      background: var(--nxt-color-data-1);
    }
    .bars__row {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: var(--nxt-space-1) var(--nxt-space-gap-md);
      padding-block: var(--nxt-space-1);
    }
    .bars__name {
      color: var(--nxt-color-text-default);
      font: var(--nxt-typography-body-sm);
    }
    .bars__count {
      color: var(--nxt-color-text-strong);
      font: var(--nxt-typography-label-sm);
    }
    .bars__meter {
      grid-column: 1 / -1;
    }
    .person {
      display: flex;
      align-items: center;
      gap: var(--nxt-space-gap-md);
      padding-block: var(--nxt-space-1);
    }
    .person__date {
      color: var(--nxt-color-text-default);
      font: var(--nxt-typography-label-sm);
    }
  `,
})
export class TemplateDashboardExample {
  protected readonly periods = [
    { value: 'month', label: 'Tháng' },
    { value: 'quarter', label: 'Quý' },
    { value: 'year', label: 'Năm' },
  ];
  protected readonly period = signal('month');

  protected readonly tasks: Task[] = [
    { icon: 'clipboard-check', tone: 'brand', title: '12 đơn chờ bạn duyệt', detail: 'Nghỉ phép 7 · Tăng ca 3 · Công tác 2', action: 'Duyệt', link: '/templates/approval' },
    { icon: 'file-certificate', tone: 'warning', title: '12 hợp đồng hết hạn trong 30 ngày', detail: 'Sớm nhất: Võ Thành Nam, 22/10/2026', action: 'Xem', link: '/templates/dashboard' },
    { icon: 'hourglass', tone: 'info', title: '5 nhân viên sắp hết thử việc', detail: 'Cần đánh giá trước 31/10/2026', action: 'Xem', link: '/templates/dashboard' },
    { icon: 'alert-triangle', tone: 'danger', title: '3 hồ sơ thiếu giấy tờ bắt buộc', detail: 'Thiếu CCCD hoặc sổ BHXH', action: 'Xem', link: '/templates/dashboard' },
  ];

  protected readonly months = [
    { label: 'T5', full: 'Tháng 5/2026', hires: 28, exits: 12 },
    { label: 'T6', full: 'Tháng 6/2026', hires: 35, exits: 9 },
    { label: 'T7', full: 'Tháng 7/2026', hires: 22, exits: 15 },
    { label: 'T8', full: 'Tháng 8/2026', hires: 41, exits: 11 },
    { label: 'T9', full: 'Tháng 9/2026', hires: 26, exits: 14 },
    { label: 'T10', full: 'Tháng 10/2026', hires: 32, exits: 9 },
  ];
  private readonly max = Math.max(...this.months.flatMap((m) => [m.hires, m.exits]));

  protected readonly departments = [
    { name: 'Khối Công nghệ', count: 412 },
    { name: 'Khối Kinh doanh', count: 356 },
    { name: 'Khối Vận hành', count: 214 },
    { name: 'Hành chính', count: 121 },
    { name: 'Marketing', count: 71 },
    { name: 'Tài chính – Kế toán', count: 62 },
    { name: 'Nhân sự', count: 48 },
  ];
  private readonly total = this.departments.reduce((s, d) => s + d.count, 0);
  protected readonly totalText = computed(() => new Intl.NumberFormat('vi-VN').format(this.total));

  protected readonly birthdays = [
    { name: 'Nguyễn Thị Ngọc Diệp', dept: 'Kinh doanh miền Nam', date: '17/10' },
    { name: 'Hoàng Văn Đức', dept: 'Vận hành kho', date: '18/10' },
    { name: 'Phan Bích Ngọc', dept: 'Nhân sự', date: '20/10' },
    { name: 'Lý Hoàng Nam', dept: 'Khối Công nghệ', date: '21/10' },
  ];

  protected pct(v: number): number {
    return Math.round((v / this.max) * 100);
  }

  protected share(v: number): number {
    return Math.round((v / this.total) * 100);
  }
}
