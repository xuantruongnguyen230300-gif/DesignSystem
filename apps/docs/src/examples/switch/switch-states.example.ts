import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NxtFormField, NxtInput } from '@nxt/ui/form-field';
import { NxtGrid, NxtSpan } from '@nxt/ui/layout';
import { NxtSwitch } from '@nxt/ui/switch';

/** Nhãn phía trên cạnh các trường, chữ trạng thái khi nhãn chưa đủ rõ, chỉ đọc và bị khoá */
@Component({
  selector: 'example-switch-states',
  imports: [NxtFormField, NxtInput, NxtGrid, NxtSpan, NxtSwitch],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-grid gap="md">
      <nxt-form-field label="Tên quy trình" required [nxtSpan]="{ base: 12, md: 6 }">
        <input nxtInput autocomplete="off" value="Duyệt đơn nghỉ phép khối văn phòng" />
      </nxt-form-field>
      <nxt-switch
        label="Duyệt nhanh"
        labelPosition="top"
        showState
        hint="Đơn dưới 1 ngày được duyệt tự động, áp dụng ngay."
        [(checked)]="fast"
        [nxtSpan]="{ base: 12, md: 6 }"
      />
      <nxt-switch
        label="Đồng bộ chấm công từ máy vân tay"
        labelPosition="top"
        showState
        readonly
        hint="Do quản trị viên hệ thống bật, bạn chỉ xem được."
        [checked]="true"
        [nxtSpan]="{ base: 12, md: 6 }"
      />
      <nxt-switch
        label="Gửi nhắc việc qua Zalo"
        labelPosition="top"
        showState
        disabled
        hint="Mở khi công ty đã kết nối tài khoản Zalo OA."
        [nxtSpan]="{ base: 12, md: 6 }"
      />
    </nxt-grid>
  `,
})
export class SwitchStatesExample {
  protected readonly fast = signal(false);
}
