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
        { name: 'Bộ icon (Tabler, chọn lọc)', status: 'beta', link: '/components/icon' },
      ],
    },
    {
      title: 'Phase 2: Core components',
      goal: 'Đợt A hành động & hiển thị, đợt B nhập liệu, đợt C overlay & phản hồi, đợt D điều hướng.',
      items: [
        { name: 'Button · IconButton', status: 'beta', link: '/components/button' },
        { name: 'Stack · Inline · Grid', status: 'beta', link: '/components/grid' },
        { name: 'Menu', status: 'beta', link: '/components/menu' },
        { name: 'Segmented', status: 'beta', link: '/components/segmented' },
        { name: 'Tag · Badge', status: 'beta', link: '/components/tag' },
        { name: 'Avatar', status: 'beta', link: '/components/avatar' },
        { name: 'Tooltip', status: 'beta', link: '/components/tooltip' },
        { name: 'Form field · Input · Textarea · Select', status: 'beta', link: '/components/form-field' },
        { name: 'Checkbox', status: 'beta', link: '/components/checkbox' },
        { name: 'Search (tìm kiếm không dấu)', status: 'beta', link: '/components/search' },
        { name: 'Filter (Bộ lọc + chip)', status: 'beta', link: '/components/filter' },
        { name: 'Drawer', status: 'beta', link: '/components/drawer' },
        { name: 'Dialog · Confirm', status: 'beta', link: '/components/dialog' },
        { name: 'Alert · Live region', status: 'beta', link: '/components/alert' },
        { name: 'Tabs', status: 'beta', link: '/components/tabs' },
        { name: 'Page header · Breadcrumb', status: 'beta', link: '/components/page-header' },
        { name: 'Pagination', status: 'beta', link: '/components/pagination' },
        ...planned('Link, Spinner, Skeleton, Divider'),
        ...planned('NumberInput (VND), Combobox, Radio, Switch, DatePicker, DateRangePicker'),
        ...planned('Popover, Toast'),
        ...planned('Steps'),
      ],
    },
    {
      title: 'Phase 3: Dữ liệu & pattern',
      goal: 'Bảng dữ liệu và các luồng nghiệp vụ: danh sách, lọc, master-detail, form, phê duyệt.',
      items: [
        { name: 'App shell · Sidenav', status: 'beta', link: '/components/app-shell' },
        { name: 'Table (sắp xếp, chọn hàng)', status: 'beta', link: '/components/table' },
        { name: 'Card · Stat', status: 'beta', link: '/components/card' },
        { name: 'Progress', status: 'beta', link: '/components/progress' },
        { name: 'Timeline', status: 'beta', link: '/components/timeline' },
        { name: 'Descriptions (nhãn – giá trị)', status: 'beta', link: '/components/descriptions' },
        { name: 'Empty state', status: 'beta', link: '/components/empty-state' },
        { name: 'Pattern: Trang danh sách & danh mục', status: 'beta', link: '/patterns/list-page' },
        { name: 'Mẫu: Tổng quan (Dashboard)', status: 'beta', link: '/templates/dashboard' },
        { name: 'Mẫu: Danh mục', status: 'beta', link: '/templates/catalog' },
        { name: 'Mẫu: Phê duyệt (master-detail)', status: 'beta', link: '/templates/approval' },
        { name: 'Mẫu: Quy trình duyệt (cấu hình luồng duyệt)', status: 'beta', link: '/templates/workflow' },
        { name: 'Mẫu: Đăng nhập', status: 'beta', link: '/templates/login' },
        ...planned('Table cells nâng cao, DescriptionList, Tree / TreeSelect, Upload, Filter panel, Command palette, Mẫu: Form nhiều bước, Mẫu: Hồ sơ nhân viên'),
      ],
    },
  ];
}
