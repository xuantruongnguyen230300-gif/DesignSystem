import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NxtRadio, NxtRadioGroup } from '@nxt/ui/radio-group';

type WorkMode = 'office' | 'hybrid' | 'remote';

/** Chọn một trong vài phương án, xếp dọc, chọn sẵn phương án ít rủi ro nhất */
@Component({
  selector: 'example-radio-group-basic',
  imports: [NxtRadio, NxtRadioGroup],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-radio-group label="Hình thức làm việc" hint="Áp dụng từ kỳ lương tháng 12/2026." [(value)]="mode">
      <nxt-radio value="office" label="Tại văn phòng" />
      <nxt-radio value="hybrid" label="Kết hợp" hint="Tối đa 2 ngày làm từ xa mỗi tuần, đăng ký trước thứ Sáu." />
      <nxt-radio value="remote" label="Từ xa" disabled hint="Cần quản lý trực tiếp đề xuất và phòng Nhân sự phê duyệt." />
    </nxt-radio-group>
    <p class="docs-demo-label">Giá trị: {{ mode() }}</p>
  `,
})
export class RadioGroupBasicExample {
  protected readonly mode = signal<WorkMode>('office');
}
