import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StatusBadge } from '../shell/status-badge';
import type { DocStatus } from '../core/types';

interface RoadmapItem {
  name: string;
  status: DocStatus | 'planned';
  link?: string;
}
interface Phase {
  title: string;
  goal: string;
  items: RoadmapItem[];
}

const planned = (names: string): RoadmapItem[] => names.split(', ').map((name) => ({ name, status: 'planned' as const }));

/** Mirrors docs/PLAN.md §6. Planned items live here — never as "missing" entries in the navigation. */
@Component({
  selector: 'docs-roadmap',
  imports: [RouterLink, StatusBadge],
  template: `
    <div class="docs-page">
      <article class="docs-article">
        <header class="docs-page-header">
          <p class="docs-page-header__section">Tài nguyên</p>
          <div class="docs-page-header__title"><h1>Roadmap &amp; trạng thái</h1></div>
          <p class="docs-page-header__lead">
            Thành phần nào đã dùng được, thành phần nào đang làm. Mục chưa phát hành chỉ xuất hiện ở đây, không nằm trong menu.
          </p>
        </header>
        <div class="docs-prose">
          <p>
            Trạng thái: <strong>Beta</strong> là dùng được, API có thể còn đổi. <strong>Stable</strong> là API cam kết semver.
            <strong>Kế hoạch</strong> là chưa phát hành.
          </p>
        </div>
        @for (phase of phases; track phase.title) {
          <section class="docs-roadmap__phase" [attr.aria-labelledby]="'phase-' + $index">
            <h2 [id]="'phase-' + $index" class="nxt-text-heading-md">{{ phase.title }}</h2>
            <p class="nxt-text-subtle">{{ phase.goal }}</p>
            <ul role="list" class="docs-roadmap__list">
              @for (item of phase.items; track item.name) {
                <li>
                  @if (item.link) {
                    <a [routerLink]="item.link">{{ item.name }}</a>
                  } @else {
                    <span>{{ item.name }}</span>
                  }
                  @if (item.status === 'planned') {
                    <span class="docs-status" data-status="planned">Kế hoạch</span>
                  } @else {
                    <docs-status [status]="item.status" />
                  }
                </li>
              }
            </ul>
          </section>
        }
      </article>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoadmapPage {
  protected readonly phases: Phase[] = [
    {
      title: 'Phase 1: Foundations & token',
      goal: 'Token 3 tầng, mode sáng/tối × 3 mật độ × motion, brand theo sản phẩm, typography, layout.',
      items: [
        { name: 'Màu sắc', status: 'beta', link: '/foundations/color' },
        { name: 'Typography', status: 'beta', link: '/foundations/typography' },
        { name: 'Spacing & mật độ', status: 'beta', link: '/foundations/spacing' },
        { name: 'Layout & Grid', status: 'beta', link: '/foundations/layout' },
        { name: 'Elevation & hình khối', status: 'beta', link: '/foundations/elevation' },
        { name: 'Motion', status: 'beta', link: '/foundations/motion' },
        { name: 'Bộ icon @nxt/icons', status: 'planned' },
      ],
    },
    {
      title: 'Phase 2: Core components',
      goal: 'Đợt A hành động & hiển thị, đợt B nhập liệu, đợt C overlay & phản hồi, đợt D điều hướng.',
      items: [
        { name: 'Button', status: 'beta', link: '/components/button' },
        { name: 'Stack · Inline · Grid', status: 'beta', link: '/components/grid' },
        ...planned('IconButton, Link, Badge / Tag, StatusTag, Avatar, Spinner, Skeleton, Divider, Tooltip'),
        ...planned('FormField, Input, Textarea, NumberInput (VND), Select, Combobox, Checkbox, Radio, Switch, DatePicker, DateRangePicker'),
        ...planned('Dialog, Confirm, Drawer, Popover, Menu, Toast, Alert'),
        ...planned('Tabs, Breadcrumb, Pagination, Steps'),
      ],
    },
    {
      title: 'Phase 3: Dữ liệu & pattern',
      goal: 'Bảng dữ liệu và các luồng nghiệp vụ: danh sách, lọc, master-detail, form, phê duyệt.',
      items: planned('Table, Table cells, EmptyState, DescriptionList, Timeline, Tree / TreeSelect, Upload, Filter panel, App shell, Command palette, Pattern: List page, Pattern: Master-detail, Pattern: Form, Pattern: Phê duyệt'),
    },
  ];
}
