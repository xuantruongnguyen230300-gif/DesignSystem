import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NxtAvatar } from '@nxt/ui/avatar';
import { NxtDescription, NxtDescriptions } from '@nxt/ui/descriptions';
import { NxtObjectPage, NxtObjectPageSection } from '@nxt/ui/object-page';
import { NxtTable } from '@nxt/ui/table';
import { NxtTag } from '@nxt/ui/tag';

interface Course {
  name: string;
  provider: string;
  finished: string;
  hours: number;
  result: string;
}

/** Chế độ tab: mỗi lần một section, cho các phần nặng (bảng dài) */
@Component({
  selector: 'example-object-page-tabs',
  imports: [NxtAvatar, NxtDescription, NxtDescriptions, NxtObjectPage, NxtObjectPageSection, NxtTable, NxtTag],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Docs example + a11y fixture: realistic Vietnamese content, no random data or current time.
  template: `
    <div class="frame" role="region" aria-label="Hồ sơ Lê Hoàng Nam" tabindex="0">
      <nxt-object-page navigation="tabs" navLabel="Các phần của hồ sơ" [(section)]="section">
        <div nxtObjectPageHeader>
          <nxt-avatar name="Lê Hoàng Nam" size="lg" />
          <dl nxtDescriptions class="facts">
            <div nxtDescription label="Chức danh">Kỹ sư vận hành hệ thống</div>
            <div nxtDescription label="Phòng ban">Phòng Công nghệ thông tin</div>
            <div nxtDescription label="Mã nhân viên"><span class="nxt-tabular-nums">NV-00318</span></div>
            <div nxtDescription label="Trạng thái"><nxt-tag tone="warning" dot>Đang thử việc</nxt-tag></div>
          </dl>
        </div>

        <nxt-object-page-section id="ex-tabs-training" title="Đào tạo" [count]="courses.length">
          <div class="wrap" role="region" aria-label="Khoá đào tạo đã hoàn thành" tabindex="0">
            <table nxtTable>
              <thead>
                <tr>
                  <th scope="col">Khoá học</th>
                  <th scope="col">Đơn vị đào tạo</th>
                  <th scope="col" class="nxt-table__num">Hoàn thành</th>
                  <th scope="col" class="nxt-table__num">Số giờ</th>
                  <th scope="col">Kết quả</th>
                </tr>
              </thead>
              <tbody>
                @for (c of courses; track c.name) {
                  <tr>
                    <th scope="row">{{ c.name }}</th>
                    <td>{{ c.provider }}</td>
                    <td class="nxt-table__num">{{ c.finished }}</td>
                    <td class="nxt-table__num">{{ c.hours }}</td>
                    <td>{{ c.result }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </nxt-object-page-section>

        <nxt-object-page-section id="ex-tabs-assets" title="Tài sản cấp phát">
          <dl nxtDescriptions>
            <div nxtDescription label="Máy tính xách tay">ThinkPad T14 · mã TS-2026-0412</div>
            <div nxtDescription label="Thẻ ra vào"><span class="nxt-tabular-nums">RV-10318</span></div>
            <div nxtDescription label="Ngày nhận"><span class="nxt-tabular-nums">02/09/2026</span></div>
          </dl>
        </nxt-object-page-section>

        <nxt-object-page-section id="ex-tabs-notes" title="Ghi chú">
          <p class="note">Hoàn thành đánh giá thử việc trước ngày 02/11/2026. Người đánh giá: Phạm Thị Lan.</p>
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
    .frame:focus-visible,
    .wrap:focus-visible {
      outline: var(--nxt-focus-ring-width) solid var(--nxt-focus-ring-color);
      outline-offset: var(--nxt-focus-ring-offset);
    }
    .facts {
      flex: 1 1 var(--nxt-layout-item-min-lg);
    }
    .wrap {
      overflow-x: auto;
    }
    .note {
      max-inline-size: 75ch;
    }
  `,
})
export class ObjectPageTabsExample {
  protected readonly section = signal<string | undefined>(undefined);
  protected readonly courses: Course[] = [
    { name: 'An toàn thông tin cơ bản', provider: 'Trung tâm Đào tạo NXT', finished: '12/09/2026', hours: 8, result: 'Đạt' },
    { name: 'Quản trị máy chủ Linux', provider: 'Học viện Công nghệ Bưu chính', finished: '30/09/2026', hours: 24, result: 'Giỏi' },
    { name: 'Quy trình xử lý sự cố', provider: 'Trung tâm Đào tạo NXT', finished: '15/10/2026', hours: 4, result: 'Đạt' },
  ];
}
