import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NxtActionBar, NxtMessage } from '@nxt/ui/action-bar';
import { NxtButton } from '@nxt/ui/button';

const WARNINGS: NxtMessage[] = [
  { id: 'w1', type: 'warning', title: 'Lương cơ bản thấp hơn mức tối thiểu của bậc 3 (8.500.000 ₫).', description: 'Lương & phụ cấp · Lương cơ bản' },
];

const MIXED: NxtMessage[] = [
  { id: 'e1', type: 'error', title: 'Nhập ngày kết thúc hợp đồng.', description: 'Thông tin hợp đồng · Ngày kết thúc' },
  { id: 'e2', type: 'error', title: 'Chọn người duyệt cho bước 3.', description: 'Quy trình duyệt · Bước 3' },
  { id: 'w1', type: 'warning', title: 'Phòng Quản trị Nguồn nhân lực & Phát triển Tổ chức chưa có trưởng phòng.', description: 'Quy trình duyệt · Bước 2' },
  { id: 'i1', type: 'info', title: 'Lần lưu trước: 06/11/2026 10:24 bởi Đặng Anh.' },
];

/** Các trạng thái: không có thông báo (chỉ trạng thái lưu), chỉ cảnh báo, có lỗi; nút primary luôn ở cuối */
@Component({
  selector: 'example-action-bar-states',
  imports: [NxtActionBar, NxtButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="stack">
      <p class="docs-demo-label">Không có thông báo, đã lưu nháp</p>
      <nxt-action-bar label="Thao tác hồ sơ nhân viên">
        <span nxtActionBarStatus>Đã lưu nháp lúc 10:24</span>
        <button nxtButton variant="ghost" type="button">Huỷ</button>
        <button nxtButton variant="primary" type="button">Lưu hồ sơ</button>
      </nxt-action-bar>

      <p class="docs-demo-label">Chỉ có cảnh báo: vẫn lưu được</p>
      <nxt-action-bar label="Thao tác hợp đồng" [messages]="warnings">
        <span nxtActionBarStatus>Có thay đổi chưa lưu</span>
        <button nxtButton variant="ghost" type="button">Huỷ</button>
        <button nxtButton type="button">Lưu nháp</button>
        <button nxtButton variant="primary" type="button">Lưu và gửi duyệt</button>
      </nxt-action-bar>

      <p class="docs-demo-label">Có lỗi sau khi bấm lưu: bấm nút đỏ để xem danh sách</p>
      <nxt-action-bar label="Thao tác quy trình duyệt" [messages]="mixed">
        <span nxtActionBarStatus>Có thay đổi chưa lưu</span>
        <button nxtButton variant="ghost" type="button">Huỷ</button>
        <button nxtButton type="button">Lưu nháp</button>
        <button nxtButton variant="primary" type="button">Áp dụng</button>
      </nxt-action-bar>
    </div>
  `,
  styles: `
    .stack {
      display: grid;
      gap: var(--nxt-space-gap-sm);
    }
    nxt-action-bar {
      position: static;
      border: var(--nxt-border-width-default) solid var(--nxt-color-border-default);
      border-radius: var(--nxt-radius-container);
    }
    nxt-action-bar + .docs-demo-label {
      margin-block-start: var(--nxt-space-gap-md);
    }
  `,
})
export class ActionBarStatesExample {
  protected readonly warnings = WARNINGS;
  protected readonly mixed = MIXED;
}
