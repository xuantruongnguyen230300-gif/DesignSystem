import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NxtDatePicker } from '@nxt/ui/date-picker';
import { NxtFormField, NxtInput } from '@nxt/ui/form-field';
import { NxtGrid, NxtSpan } from '@nxt/ui/layout';

/** Bốn trạng thái giá trị: lỗi chặn lưu; cảnh báo và thông tin không chặn; thành công chỉ khi hệ thống vừa xác nhận */
@Component({
  selector: 'example-form-field-value-states',
  imports: [NxtDatePicker, NxtFormField, NxtInput, NxtGrid, NxtSpan],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-grid gap="md">
      <nxt-form-field
        label="Số CCCD"
        required
        hint="12 chữ số, in ở mặt trước thẻ."
        error="Số CCCD gồm 12 chữ số, bạn đã nhập 11."
        [nxtSpan]="{ base: 12, md: 6 }"
      >
        <input nxtInput inputmode="numeric" autocomplete="off" class="nxt-tabular-nums" value="07909501234" />
      </nxt-form-field>
      <nxt-form-field
        label="Ngày bắt đầu nghỉ"
        required
        warning="Ngày 02/09/2026 là ngày lễ, ngày này không tính vào phép năm."
        [nxtSpan]="{ base: 12, md: 6 }"
      >
        <nxt-date-picker value="2026-09-02" today="2026-11-06" />
      </nxt-form-field>
      <nxt-form-field
        label="Lương cơ bản (đồng/tháng)"
        info="Lấy theo hợp đồng HĐ-2026-0142. Sửa nếu đã có phụ lục điều chỉnh lương."
        [nxtSpan]="{ base: 12, md: 6 }"
      >
        <input nxtInput numeric inputmode="numeric" autocomplete="off" value="18.500.000" />
        <span nxtSuffix>₫</span>
      </nxt-form-field>
      <nxt-form-field
        label="Mã số thuế cá nhân"
        success="Đã đối chiếu với cơ quan thuế lúc 09:15 ngày 06/11/2026."
        [nxtSpan]="{ base: 12, md: 6 }"
      >
        <input nxtInput inputmode="numeric" autocomplete="off" class="nxt-tabular-nums" value="8012345678" />
      </nxt-form-field>
    </nxt-grid>
  `,
})
export class FormFieldValueStatesExample {}
