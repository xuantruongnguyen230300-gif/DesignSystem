import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NxtGrid, NxtSpan } from '@nxt/ui/layout';
import { NxtRadio, NxtRadioGroup } from '@nxt/ui/radio-group';

/** Chỉ đọc, bị khoá và xếp ngang cho nhãn một từ */
@Component({
  selector: 'example-radio-group-states',
  imports: [NxtGrid, NxtSpan, NxtRadio, NxtRadioGroup],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-grid gap="lg">
      <nxt-radio-group
        label="Loại hợp đồng"
        readonly
        hint="Hợp đồng đã ký, đổi loại hợp đồng bằng hợp đồng mới."
        [value]="'fixed'"
        [nxtSpan]="{ base: 12, md: 6 }"
      >
        <nxt-radio value="probation" label="Thử việc" />
        <nxt-radio value="fixed" label="Xác định thời hạn 36 tháng" />
        <nxt-radio value="indefinite" label="Không xác định thời hạn" />
      </nxt-radio-group>
      <nxt-radio-group
        label="Cách tính ngày phép"
        disabled
        hint="Theo chính sách chung của công ty, chỉ quản trị viên đổi được."
        [value]="'calendar'"
        [nxtSpan]="{ base: 12, md: 6 }"
      >
        <nxt-radio value="calendar" label="Theo năm dương lịch" />
        <nxt-radio value="anniversary" label="Theo ngày vào làm" />
      </nxt-radio-group>
      <nxt-radio-group label="Ca làm việc" orientation="horizontal" [(value)]="shift" [nxtSpan]="{ base: 12, md: 6 }">
        <nxt-radio value="morning" label="Sáng" />
        <nxt-radio value="afternoon" label="Chiều" />
        <nxt-radio value="night" label="Đêm" />
      </nxt-radio-group>
    </nxt-grid>
  `,
})
export class RadioGroupStatesExample {
  protected readonly shift = signal<'morning' | 'afternoon' | 'night'>('morning');
}
