import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NxtCheckbox, NxtCheckboxGroup } from '@nxt/ui/checkbox';
import { NxtStack } from '@nxt/ui/layout';

/** Chỉ đọc trong form đang sửa: vẫn focus và đọc được, không đổi được; khác với bị khoá */
@Component({
  selector: 'example-checkbox-readonly',
  imports: [NxtCheckbox, NxtCheckboxGroup, NxtStack],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-stack gap="lg">
      <nxt-checkbox-group label="Phụ cấp theo hợp đồng" hint="Hợp đồng HĐ-2026-0142 đã ký, sửa phụ cấp bằng phụ lục hợp đồng." readonly>
        <nxt-checkbox label="Phụ cấp ăn trưa" [checked]="true" />
        <nxt-checkbox label="Phụ cấp điện thoại" />
        <nxt-checkbox label="Phụ cấp xăng xe" [checked]="true" />
      </nxt-checkbox-group>
      <nxt-checkbox label="Đóng bảo hiểm xã hội" [checked]="true" readonly hint="Bắt buộc với hợp đồng từ 1 tháng trở lên." />
      <nxt-checkbox label="Đóng bảo hiểm tự nguyện" disabled hint="Mở sau khi nhân viên hết thời gian thử việc." />
    </nxt-stack>
  `,
})
export class CheckboxReadonlyExample {}
