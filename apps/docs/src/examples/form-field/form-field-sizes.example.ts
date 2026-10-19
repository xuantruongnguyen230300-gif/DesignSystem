import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NxtFormField, NxtInput } from '@nxt/ui/form-field';
import { NxtIcon } from '@nxt/ui/icon';
import { NxtInline, NxtStack } from '@nxt/ui/layout';

/** Hai kích thước: md cho form, sm cho thanh lọc phía trên bảng */
@Component({
  selector: 'example-form-field-sizes',
  imports: [NxtFormField, NxtInput, NxtIcon, NxtInline, NxtStack],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-stack gap="lg">
      <nxt-stack gap="xs">
        <p class="docs-demo-label">md (mặc định): form nhập liệu</p>
        <nxt-form-field class="field" label="Chức danh">
          <input nxtInput autocomplete="off" value="Chuyên viên tuyển dụng" />
        </nxt-form-field>
      </nxt-stack>

      <nxt-stack gap="xs">
        <p class="docs-demo-label">sm: thanh lọc, toolbar. Chỉ ẩn nhãn khi mục đích đã rõ: ô tìm có kính lúp, bộ lọc có lựa chọn “Tất cả phòng ban”.</p>
        <nxt-inline gap="sm">
          <nxt-form-field class="field" label="Tìm nhân viên" hideLabel size="sm">
            <nxt-icon nxtPrefix name="search" />
            <input nxtInput type="search" placeholder="Tìm theo tên hoặc mã" />
          </nxt-form-field>
          <nxt-form-field label="Phòng ban" hideLabel size="sm">
            <select nxtInput>
              <option value="">Tất cả phòng ban</option>
              <option>Kế toán</option>
              <option>Nhân sự</option>
              <option>Vận hành kho</option>
            </select>
          </nxt-form-field>
        </nxt-inline>
      </nxt-stack>
    </nxt-stack>
  `,
  styles: `
    .field {
      inline-size: min(100%, var(--nxt-layout-item-min-lg));
    }
  `,
})
export class FormFieldSizesExample {}
