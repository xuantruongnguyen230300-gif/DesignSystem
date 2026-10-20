import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NxtAlert } from '@nxt/ui/alert';
import { NxtButton } from '@nxt/ui/button';
import { NxtStack } from '@nxt/ui/layout';

/** Bốn tone, có tiêu đề, nút hành động và nút đóng */
@Component({
  selector: 'example-alert-tones',
  imports: [NxtAlert, NxtButton, NxtStack],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-stack gap="sm">
      <nxt-alert tone="info">Đang sửa bản nháp lưu ngày 12/10/2026. Phiên bản 3 vẫn áp dụng cho đơn mới cho đến khi bấm “Áp dụng”.</nxt-alert>
      <nxt-alert tone="success">
        Đã xoá 3 chức danh.
        <button nxtAlertActions nxtButton size="sm" variant="ghost" type="button">Hoàn tác</button>
      </nxt-alert>
      <nxt-alert tone="warning" title="Đã xoá 1 trong 5 chức danh">
        4 chức danh đang được dùng trong hồ sơ nhân viên nên chưa xoá. Ngừng sử dụng để ẩn chúng khỏi danh sách chọn.
      </nxt-alert>
      <nxt-alert tone="danger" title="Không tải được danh sách chức danh">
        Kết nối tới máy chủ bị gián đoạn. Dữ liệu đang hiển thị là bản lúc 09:15.
        <button nxtAlertActions nxtButton size="sm" type="button">Thử lại</button>
      </nxt-alert>
      @if (tipShown()) {
        <nxt-alert tone="info" dismissible (dismissed)="tipShown.set(false)">
          Mẹo: bấm vào chỗ trống của một dòng để xem nhanh chi tiết, Alt+↑/↓ để chuyển bản ghi.
        </nxt-alert>
      }
    </nxt-stack>
  `,
})
export class AlertTonesExample {
  protected readonly tipShown = signal(true);
}
