import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NxtAvatar } from '@nxt/ui/avatar';
import { NxtButton } from '@nxt/ui/button';
import { NxtCard, NxtStat } from '@nxt/ui/card';
import { NXT_FORMAT_PIPES, nxtDate, nxtDateRange, nxtNumber, nxtPercent, nxtRelative, nxtUnit } from '@nxt/ui/format';
import { NxtIcon } from '@nxt/ui/icon';
import { NxtGrid } from '@nxt/ui/layout';
import { NxtPageHeader } from '@nxt/ui/page-header';
import { NxtProgress } from '@nxt/ui/progress';
import { NxtSegmented } from '@nxt/ui/segmented';
import { NxtTable } from '@nxt/ui/table';
import { NxtTag } from '@nxt/ui/tag';
import { NxtTimeline, NxtTimelineItem } from '@nxt/ui/timeline';
import { HrmFrame } from './hrm-frame';

/** Fixed "now" of the demo (Friday 06/11/2026 09:30): examples never depend on the real clock. */
const NOW = new Date(2026, 10, 6, 9, 30);
/** Every card leads to its own list; the demo app has no such pages yet, so they land back here with the filter. */
const HERE = '/templates/dashboard';
/** Figures are as of the last closed month. */
const ASOF = nxtDate('2026-10-31');

interface Request {
  id: string;
  name: string;
  kind: string;
  start: string;
  end: string;
  sent: Date;
}

/** Tổng quan nhân sự — trang tổng quan theo vai trò: thẻ việc cần xử lý, chỉ số, biểu đồ, hoạt động; mỗi thẻ dẫn tới danh sách đã lọc sẵn */
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
    NxtPageHeader,
    NxtProgress,
    NxtSegmented,
    NxtTable,
    NxtTag,
    NxtTimeline,
    NxtTimelineItem,
    NXT_FORMAT_PIPES,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <example-hrm-frame>
      <div class="overview">
        <nxt-page-header placement="topbar" title="Tổng quan nhân sự">
          <ng-container ngProjectAs="[nxtPageActions]">
            <nxt-segmented label="Kỳ báo cáo" size="sm" [options]="periods" [(value)]="period" />
            <button nxtButton><nxt-icon name="download" />Xuất báo cáo</button>
          </ng-container>
        </nxt-page-header>

        <!-- 1. Việc cần xử lý: thẻ danh sách và thẻ bảng, quan trọng nhất nên đứng đầu (thứ tự Z). -->
        <nxt-grid columns="auto" minItem="lg" gap="md">
          <nxt-card
            title="Đơn chờ duyệt"
            subtitle="Cũ nhất trước"
            region
            [count]="requests.length"
            [total]="12"
            link="/templates/approval"
            [queryParams]="{ status: 'pending' }"
            viewAllLabel="Xem tất cả 12 đơn"
          >
            <ul class="list" role="list">
              @for (r of requests; track r.id) {
                <li class="item">
                  <nxt-avatar [name]="r.name" size="sm" />
                  <span class="item__text">
                    <a class="item__title" routerLink="/templates/approval" [queryParams]="{ id: r.id }">{{ r.name }}</a>
                    <span class="item__meta">{{ r.kind }} · {{ r.start | nxtDateRange: r.end }}</span>
                  </span>
                  <time class="item__aside" [attr.datetime]="r.sent.toISOString()" [title]="r.sent | nxtDate: { time: true }">{{
                    r.sent | nxtRelative: { now: now }
                  }}</time>
                </li>
              }
            </ul>
          </nxt-card>

          <nxt-card
            #contractsCard
            title="Hợp đồng sắp hết hạn"
            subtitle="Trong 30 ngày tới"
            padding="none"
            [count]="contracts.length"
            [total]="9"
            [link]="here"
            [queryParams]="{ view: 'contracts-expiring' }"
            viewAllLabel="Xem tất cả 9 hợp đồng"
          >
            <div class="table-wrap" role="region" tabindex="0" [attr.aria-labelledby]="contractsCard.headingId">
              <table nxtTable>
                <thead>
                  <tr>
                    <th scope="col">Nhân viên</th>
                    <th scope="col">Loại hợp đồng</th>
                    <th scope="col">Hết hạn</th>
                  </tr>
                </thead>
                <tbody>
                  @for (c of contracts; track c.name) {
                    <tr>
                      <th scope="row">{{ c.name }}</th>
                      <td>{{ c.type }}</td>
                      <!-- Hạn pháp lý: luôn ngày tuyệt đối, không tương đối. -->
                      <td class="nxt-tabular-nums">{{ c.end | nxtDate }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </nxt-card>

          <nxt-card
            title="Thử việc sắp kết thúc"
            subtitle="Cần đánh giá trước ngày kết thúc"
            [count]="probations.length"
            [total]="5"
            [link]="here"
            [queryParams]="{ view: 'probation-ending' }"
            viewAllLabel="Xem tất cả 5 nhân viên"
          >
            <ul class="list" role="list">
              @for (p of probations; track p.name) {
                <li class="item">
                  <nxt-avatar [name]="p.name" size="sm" />
                  <span class="item__text">
                    <span class="item__title">{{ p.name }}</span>
                    <span class="item__meta">{{ p.title }}</span>
                  </span>
                  <span class="item__aside nxt-tabular-nums">{{ p.end | nxtDate }}</span>
                </li>
              }
            </ul>
          </nxt-card>
        </nxt-grid>

        <!-- 2. Chỉ số: thẻ KPI, mỗi thẻ một đích nên cả thẻ bấm được; đơn vị ở phụ đề sau " | ". -->
        <nxt-grid columns="auto" minItem="md" gap="md">
          <nxt-card title="Nhân sự" [subtitle]="'Đến ' + asOf + ' | người'" [link]="here" [queryParams]="{ view: 'headcount' }" clickable>
            <nxt-stat nxtCardKpi [value]="kpi.headcount" [delta]="kpi.headcountDelta" trend="up" caption="so với tháng 9" />
          </nxt-card>
          <nxt-card title="Nghỉ việc" subtitle="Tháng 10/2026 | người" [link]="here" [queryParams]="{ view: 'exits' }" clickable>
            <nxt-stat nxtCardKpi [value]="kpi.exits" [delta]="kpi.exitsDelta" trend="down" deltaTone="positive" caption="so với tháng 9" />
          </nxt-card>
          <nxt-card title="Đi làm đúng giờ" subtitle="Tháng 10/2026 | %" [link]="here" [queryParams]="{ view: 'punctuality' }" clickable>
            <nxt-stat nxtCardKpi [value]="kpi.onTime" [delta]="kpi.onTimeDelta" trend="down" deltaTone="negative" caption="so với tháng 9" />
          </nxt-card>
          <nxt-card title="Quỹ lương" subtitle="Tháng 10/2026 | tỷ ₫" [link]="here" [queryParams]="{ view: 'payroll' }" clickable>
            <nxt-tag nxtCardStatus tone="warning" size="sm" dot>Vượt kế hoạch</nxt-tag>
            <nxt-stat nxtCardKpi [value]="kpi.payroll" [delta]="kpi.payrollDelta" trend="up" deltaTone="negative" caption="so với tháng 9" />
          </nxt-card>
        </nxt-grid>

        <!-- 3. Phân tích và theo dõi: biểu đồ, cơ cấu, lịch, hoạt động. -->
        <nxt-grid columns="auto" minItem="lg" gap="md">
          <nxt-card title="Biến động nhân sự" subtitle="6 tháng gần nhất | người" [link]="here" [queryParams]="{ view: 'movement' }" viewAllLabel="Xem báo cáo biến động">
            <figure class="chart">
              <div class="chart__plot" aria-hidden="true">
                @for (m of months; track m.label) {
                  <div class="chart__group">
                    <div class="chart__bars">
                      <span class="chart__bar" data-series="hire" [style.block-size.%]="pct(m.hires)"
                        ><span class="chart__value">{{ m.hires | nxtNumber }}</span></span
                      >
                      <span class="chart__bar" data-series="exit" [style.block-size.%]="pct(m.exits)"
                        ><span class="chart__value">{{ m.exits | nxtNumber }}</span></span
                      >
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
                <caption>
                  Biến động nhân sự 6 tháng gần nhất (người)
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Tháng</th>
                    <th scope="col">Tuyển mới</th>
                    <th scope="col">Nghỉ việc</th>
                  </tr>
                </thead>
                <tbody>
                  @for (m of months; track m.label) {
                    <tr>
                      <th scope="row">{{ m.full }}</th>
                      <td>{{ m.hires | nxtNumber }}</td>
                      <td>{{ m.exits | nxtNumber }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </figure>
          </nxt-card>

          <nxt-card title="Cơ cấu theo khối" [subtitle]="structureSubtitle" link="/templates/catalog" viewAllLabel="Xem danh mục tổ chức">
            <!-- ≤ 5 thanh: 4 khối lớn nhất + nhóm còn lại, sắp giảm dần, luôn kèm số người và phần trăm. -->
            <ul class="bars" role="list">
              @for (d of structure; track d.name) {
                <li class="bars__row">
                  <span class="bars__name">{{ d.name }}</span>
                  <span class="bars__count nxt-tabular-nums">{{ d.count | nxtNumber }} · {{ d.count / total | nxtPercent }}</span>
                  <nxt-progress class="bars__meter" [value]="share(d.count)" [label]="d.name" [valueText]="shareText(d.count)" />
                </li>
              }
            </ul>
          </nxt-card>

          <nxt-card title="Sinh nhật trong tuần" [subtitle]="weekText" [link]="here" [queryParams]="{ view: 'birthdays' }" viewAllLabel="Xem lịch sinh nhật">
            <ul class="list" role="list">
              @for (p of birthdays; track p.name) {
                <li class="item">
                  <nxt-avatar [name]="p.name" size="sm" />
                  <span class="item__text">
                    <span class="item__title">{{ p.name }}</span>
                    <span class="item__meta">{{ p.dept }}</span>
                  </span>
                  <time class="item__aside" [attr.datetime]="p.date" [title]="p.date | nxtDate: { style: 'weekday' }">{{
                    p.date | nxtRelative: { now: now, precision: 'day' }
                  }}</time>
                </li>
              }
            </ul>
          </nxt-card>

          <nxt-card title="Hoạt động gần đây" subtitle="Trong phòng ban bạn quản lý" [link]="here" [queryParams]="{ view: 'activity' }" viewAllLabel="Xem tất cả hoạt động">
            <nxt-timeline>
              @for (a of activities; track a.title) {
                <nxt-timeline-item [title]="a.title" [time]="relative(a.at)" [icon]="a.icon" [tone]="a.tone">{{ a.note }}</nxt-timeline-item>
              }
            </nxt-timeline>
          </nxt-card>
        </nxt-grid>
      </div>
    </example-hrm-frame>
  `,
  styles: `
    .overview {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: var(--nxt-space-gap-md);
      /* Fixed card layout: columns of at least layout.item-min-lg; capped so a very wide screen shows at most 5. */
      max-inline-size: calc(var(--nxt-layout-item-min-lg) * 6);
    }
    .list,
    .bars {
      display: grid;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .item {
      display: flex;
      align-items: center;
      gap: var(--nxt-space-gap-md);
      padding-block: var(--nxt-space-inset-xs);
    }
    .item__text {
      display: grid;
      flex: 1;
      min-inline-size: 0;
    }
    .item__title {
      color: var(--nxt-color-text-strong);
      font: var(--nxt-typography-label-md);
    }
    a.item__title {
      color: var(--nxt-color-text-link);
      text-decoration: none;
    }
    a.item__title:hover {
      color: var(--nxt-color-text-link-hover);
      text-decoration: underline;
    }
    a.item__title:focus-visible {
      border-radius: var(--nxt-radius-control);
      outline: var(--nxt-focus-ring-width) solid var(--nxt-focus-ring-color);
      outline-offset: var(--nxt-focus-ring-offset);
    }
    .item__meta,
    .item__aside {
      color: var(--nxt-color-text-subtle);
      font: var(--nxt-typography-body-sm);
    }
    .item__aside {
      flex: none;
      font-variant-numeric: tabular-nums;
    }
    .table-wrap {
      overflow-x: auto;
    }
    .table-wrap:focus-visible {
      outline: var(--nxt-focus-ring-width) solid var(--nxt-focus-ring-color);
      outline-offset: calc(var(--nxt-focus-ring-width) * -1);
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
  `,
})
export class TemplateDashboardExample {
  protected readonly now = NOW;
  protected readonly here = HERE;
  protected readonly asOf = ASOF;

  protected readonly periods = [
    { value: 'month', label: 'Tháng' },
    { value: 'quarter', label: 'Quý' },
    { value: 'year', label: 'Năm' },
  ];
  protected readonly period = signal('month');

  protected readonly requests: Request[] = [
    { id: 'NP-0301', name: 'Hoàng Văn Đức', kind: 'Nghỉ phép', start: '2026-11-09', end: '2026-11-10', sent: new Date(2026, 10, 2, 16, 40) },
    { id: 'TC-0112', name: 'Phan Bích Ngọc', kind: 'Tăng ca', start: '2026-11-07', end: '2026-11-07', sent: new Date(2026, 10, 5, 8, 15) },
    { id: 'NP-0318', name: 'Lê Minh Anh', kind: 'Nghỉ phép', start: '2026-11-10', end: '2026-11-12', sent: new Date(2026, 10, 6, 7, 5) },
    { id: 'CT-0044', name: 'Lý Hoàng Nam', kind: 'Công tác', start: '2026-11-16', end: '2026-11-20', sent: new Date(2026, 10, 6, 9, 2) },
    { id: 'NP-0320', name: 'Nguyễn Thị Ngọc Diệp', kind: 'Nghỉ phép', start: '2026-11-13', end: '2026-11-13', sent: new Date(2026, 10, 6, 9, 20) },
  ];

  protected readonly contracts = [
    { name: 'Võ Thành Nam', type: 'Xác định thời hạn', end: '2026-11-12' },
    { name: 'Đặng Thu Hà', type: 'Thử việc', end: '2026-11-18' },
    { name: 'Bùi Gia Huy', type: 'Xác định thời hạn', end: '2026-11-25' },
    { name: 'Trịnh Mỹ Linh', type: 'Thời vụ', end: '2026-12-01' },
  ];

  protected readonly probations = [
    { name: 'Phạm Quốc Bảo', title: 'Chuyên viên tuyển dụng', end: '2026-11-15' },
    { name: 'Đỗ Khánh Vy', title: 'Kỹ sư phần mềm', end: '2026-11-20' },
    { name: 'Mai Anh Tuấn', title: 'Nhân viên kinh doanh', end: '2026-11-30' },
  ];

  /** KPI values formatted once with @nxt/ui/format (the unit is in the card subtitle). */
  protected readonly kpi = {
    headcount: nxtNumber(1284),
    headcountDelta: nxtPercent(0.021),
    exits: nxtNumber(9),
    exitsDelta: nxtUnit(5, 'người'),
    onTime: nxtNumber(96.4),
    onTimeDelta: nxtUnit(0.8, 'điểm'),
    payroll: nxtNumber(18_640_000_000 / 1e9, { maximumFractionDigits: 1 }),
    payrollDelta: nxtPercent(0.043),
  };

  protected readonly months = [
    { label: 'T5', full: 'Tháng 5/2026', hires: 28, exits: 12 },
    { label: 'T6', full: 'Tháng 6/2026', hires: 35, exits: 9 },
    { label: 'T7', full: 'Tháng 7/2026', hires: 22, exits: 15 },
    { label: 'T8', full: 'Tháng 8/2026', hires: 41, exits: 11 },
    { label: 'T9', full: 'Tháng 9/2026', hires: 26, exits: 14 },
    { label: 'T10', full: 'Tháng 10/2026', hires: 32, exits: 9 },
  ];
  private readonly max = Math.max(...this.months.flatMap((m) => [m.hires, m.exits]));

  private readonly departments = [
    { name: 'Khối Công nghệ', count: 412 },
    { name: 'Khối Kinh doanh', count: 356 },
    { name: 'Khối Vận hành', count: 214 },
    { name: 'Hành chính', count: 121 },
    { name: 'Marketing', count: 71 },
    { name: 'Tài chính – Kế toán', count: 62 },
    { name: 'Nhân sự', count: 48 },
  ];
  protected readonly total = this.departments.reduce((s, d) => s + d.count, 0);
  /** Top 4 + the rest, so the card compares at most 5 bars. */
  protected readonly structure = [
    ...this.departments.slice(0, 4),
    { name: `${this.departments.length - 4} khối còn lại`, count: this.departments.slice(4).reduce((s, d) => s + d.count, 0) },
  ];
  protected readonly structureSubtitle = `Đến ${ASOF}, tổng ${nxtNumber(this.total)} người`;

  protected readonly weekText = `Tuần này, ${nxtDateRange('2026-11-02', '2026-11-08')}`;
  protected readonly birthdays = [
    { name: 'Trần Quốc Huy', dept: 'Phòng Kế toán', date: '2026-11-04' },
    { name: 'Nguyễn Thị Ngọc Diệp', dept: 'Kinh doanh miền Nam', date: '2026-11-06' },
    { name: 'Hoàng Văn Đức', dept: 'Vận hành kho', date: '2026-11-07' },
    { name: 'Phan Bích Ngọc', dept: 'Nhân sự', date: '2026-11-08' },
  ];

  protected readonly activities = [
    { title: 'Nguyễn Thị Ngọc Diệp gửi đơn nghỉ phép 1 ngày', at: new Date(2026, 10, 6, 9, 20), icon: 'send' as const, tone: 'brand' as const, note: 'Chờ bạn duyệt · Kinh doanh miền Nam' },
    { title: 'Đã ký hợp đồng chính thức với Phạm Quốc Bảo', at: new Date(2026, 10, 6, 8, 12), icon: 'file-certificate' as const, tone: 'success' as const, note: '' },
    { title: 'Hệ thống nhắc: 9 hợp đồng hết hạn trong 30 ngày', at: new Date(2026, 10, 6, 8, 0), icon: 'alert-triangle' as const, tone: 'warning' as const, note: `Gia hạn hoặc thông báo chấm dứt trước ${nxtDate('2026-11-12')}` },
    { title: 'Trần Thị Mai cập nhật chức danh “Kế toán tổng hợp”', at: new Date(2026, 10, 5, 16, 45), icon: 'pencil' as const, tone: 'neutral' as const, note: '' },
  ];

  protected pct(v: number): number {
    return Math.round((v / this.max) * 100);
  }

  protected share(v: number): number {
    return Math.round((v / this.total) * 100);
  }

  protected shareText(v: number): string {
    return `${nxtNumber(v)} người, ${nxtPercent(v / this.total)}`;
  }

  protected relative(at: Date): string {
    return nxtRelative(at, { now: NOW });
  }
}
