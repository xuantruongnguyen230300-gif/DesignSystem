import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NxtAvatar } from '@nxt/ui/avatar';
import { NxtButton } from '@nxt/ui/button';
import { NxtDescription, NxtDescriptions } from '@nxt/ui/descriptions';
import { NxtIcon } from '@nxt/ui/icon';
import { NxtObjectPage, NxtObjectPageSection, NxtObjectPageSubsection } from '@nxt/ui/object-page';
import { NxtTag } from '@nxt/ui/tag';
import { NxtTimeline, NxtTimelineItem } from '@nxt/ui/timeline';

/** Thanh neo theo section đang thấy, header co lại khi cuộn, ghim được */
@Component({
  selector: 'example-object-page-anchors',
  imports: [
    NxtAvatar,
    NxtButton,
    NxtDescription,
    NxtDescriptions,
    NxtIcon,
    NxtObjectPage,
    NxtObjectPageSection,
    NxtObjectPageSubsection,
    NxtTag,
    NxtTimeline,
    NxtTimelineItem,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Docs example + a11y fixture: realistic Vietnamese content, no random data or current time.
  // The frame stands in for the shell's scrolling content area (the page title row lives on the top bar).
  template: `
    <div class="frame" role="region" aria-label="Hồ sơ Nguyễn Thị Ngọc Diệp" tabindex="0">
      <nxt-object-page navLabel="Các phần của hồ sơ" pinnable>
        <div nxtObjectPageHeader>
          <nxt-avatar name="Nguyễn Thị Ngọc Diệp" size="lg" />
          <div class="lead">
            <p class="lead__title">Trưởng nhóm Kế toán tổng hợp</p>
            <p class="lead__sub">Phòng Tài chính – Kế toán · Văn phòng Hà Nội</p>
            <nxt-tag tone="success" dot>Đang làm việc</nxt-tag>
          </div>
          <dl nxtDescriptions class="facts">
            <div nxtDescription label="Mã nhân viên"><span class="nxt-tabular-nums">NV-00123</span></div>
            <div nxtDescription label="Ngày vào làm"><span class="nxt-tabular-nums">15/03/2019</span></div>
            <div nxtDescription label="Thâm niên">7 năm 7 tháng</div>
            <div nxtDescription label="Quản lý trực tiếp">Trần Văn Bình</div>
          </dl>
        </div>
        <div nxtObjectPageSummary>
          <nxt-avatar name="Nguyễn Thị Ngọc Diệp" size="sm" />
          <span class="nxt-truncate">NV-00123 · Trưởng nhóm Kế toán tổng hợp · Phòng Tài chính – Kế toán</span>
        </div>

        <nxt-object-page-section id="ex-anchors-general" title="Thông tin chung">
          <nxt-object-page-subsection title="Thông tin cá nhân">
            <dl nxtDescriptions>
              <div nxtDescription label="Ngày sinh"><span class="nxt-tabular-nums">08/09/1990</span></div>
              <div nxtDescription label="Giới tính">Nữ</div>
              <div nxtDescription label="Số CCCD"><span class="nxt-tabular-nums">001190012345</span></div>
              <div nxtDescription label="Tình trạng hôn nhân">Đã kết hôn</div>
            </dl>
          </nxt-object-page-subsection>
          <nxt-object-page-subsection title="Liên hệ">
            <dl nxtDescriptions>
              <div nxtDescription label="Email công ty">diep.ntn&#64;nxt.vn</div>
              <div nxtDescription label="Điện thoại"><span class="nxt-tabular-nums">0912 345 678</span></div>
              <div nxtDescription label="Địa chỉ thường trú" full>Số 18 ngõ 42 Trần Duy Hưng, phường Trung Hoà, quận Cầu Giấy, Hà Nội</div>
            </dl>
          </nxt-object-page-subsection>
        </nxt-object-page-section>

        <nxt-object-page-section id="ex-anchors-job" title="Công việc">
          <dl nxtDescriptions>
            <div nxtDescription label="Chức danh">Trưởng nhóm Kế toán tổng hợp</div>
            <div nxtDescription label="Cấp bậc">Chuyên viên chính (bậc 4)</div>
            <div nxtDescription label="Phòng ban">Phòng Tài chính – Kế toán</div>
            <div nxtDescription label="Nơi làm việc">Văn phòng Hà Nội</div>
            <div nxtDescription label="Loại nhân viên">Chính thức</div>
            <div nxtDescription label="Ngày chính thức"><span class="nxt-tabular-nums">15/05/2019</span></div>
          </dl>
        </nxt-object-page-section>

        <nxt-object-page-section id="ex-anchors-history" title="Lịch sử">
          <button nxtSectionActions nxtButton variant="ghost" size="sm" type="button"><nxt-icon name="history" />Xem tất cả (12)</button>
          <nxt-timeline>
            <nxt-timeline-item title="Bổ nhiệm Trưởng nhóm Kế toán tổng hợp" time="01/07/2024" icon="user-star" tone="brand">Quyết định số 112/QĐ-NXT</nxt-timeline-item>
            <nxt-timeline-item title="Ký hợp đồng không xác định thời hạn" time="15/05/2021" icon="file-certificate" tone="success" />
            <nxt-timeline-item title="Vào làm, Kế toán tổng hợp" time="15/03/2019" icon="user-plus" />
          </nxt-timeline>
        </nxt-object-page-section>
      </nxt-object-page>
    </div>
  `,
  styles: `
    .frame {
      block-size: calc(var(--nxt-layout-scroll-region-min) * 2);
      overflow-y: auto;
      padding: var(--nxt-space-inset-md);
      border: var(--nxt-border-width-default) solid var(--nxt-color-border-default);
      border-radius: var(--nxt-radius-container);
      background: var(--nxt-color-bg-canvas);
    }
    .frame:focus-visible {
      outline: var(--nxt-focus-ring-width) solid var(--nxt-focus-ring-color);
      outline-offset: var(--nxt-focus-ring-offset);
    }
    .lead {
      display: grid;
      justify-items: start;
      gap: var(--nxt-space-gap-xs);
      min-inline-size: 0;
    }
    .lead__title {
      color: var(--nxt-color-text-strong);
      font: var(--nxt-typography-heading-sm);
    }
    .lead__sub {
      color: var(--nxt-color-text-subtle);
      font: var(--nxt-typography-body-sm);
    }
    .facts {
      flex: 1 1 var(--nxt-layout-item-min-lg);
    }
  `,
})
export class ObjectPageAnchorsExample {}
