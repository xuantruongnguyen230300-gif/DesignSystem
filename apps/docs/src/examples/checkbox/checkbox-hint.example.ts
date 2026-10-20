import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NxtCheckbox } from '@nxt/ui/checkbox';
import { NxtStack } from '@nxt/ui/layout';

/** Gợi ý dưới nhãn (hint): giải thích hệ quả của lựa chọn, được đọc sau tên và trạng thái */
@Component({
  selector: 'example-checkbox-hint',
  imports: [NxtCheckbox, NxtStack],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <fieldset class="group">
      <legend class="group__legend">Quyền của người duyệt ở bước Trưởng phòng</legend>
      <nxt-stack gap="sm">
        <nxt-checkbox label="Được trả lại" hint="Người gửi sửa đơn rồi gửi lại; đơn quay về bước đầu tiên." [(checked)]="canReturn" />
        <nxt-checkbox label="Được từ chối" hint="Đơn kết thúc ngay, các bước sau không nhận được đơn." [(checked)]="canReject" />
        <nxt-checkbox
          label="Được uỷ quyền cho người khác duyệt thay"
          hint="Người được uỷ quyền phải cùng phòng hoặc là cấp trên. Lịch sử đơn ghi rõ ai duyệt thay."
          [(checked)]="canDelegate"
        />
      </nxt-stack>
    </fieldset>
  `,
  styles: `
    .group {
      min-inline-size: 0;
      margin: 0;
      padding: 0;
      border: 0;
    }
    .group__legend {
      margin-block-end: var(--nxt-space-gap-sm);
      padding: 0;
      color: var(--nxt-color-text-strong);
      font: var(--nxt-typography-label-md);
    }
  `,
})
export class CheckboxHintExample {
  protected readonly canReturn = signal(true);
  protected readonly canReject = signal(false);
  protected readonly canDelegate = signal(false);
}
