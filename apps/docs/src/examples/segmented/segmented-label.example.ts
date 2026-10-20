import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NxtFormField, NxtInput } from '@nxt/ui/form-field';
import { NxtStack } from '@nxt/ui/layout';
import { NxtSegmented, NxtSegmentedOption } from '@nxt/ui/segmented';

type Mode = 'any' | 'all';

/** Nhãn hiển thị trong form (showLabel): cùng kiểu với nhãn của form field, tên nhóm chỉ đọc một lần */
@Component({
  selector: 'example-segmented-label',
  imports: [NxtFormField, NxtInput, NxtSegmented, NxtStack],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-stack gap="md" align="start" class="form">
      <nxt-form-field class="field" label="Tên bước" required>
        <input nxtInput autocomplete="off" value="Trưởng phòng duyệt" />
      </nxt-form-field>
      <nxt-segmented label="Cách duyệt" showLabel [options]="modes" [(value)]="mode" />
      <nxt-form-field class="field" label="Thời hạn xử lý" hint="Giờ làm việc, tính từ lúc đơn đến bước này.">
        <input nxtInput inputmode="numeric" autocomplete="off" value="16" />
        <span nxtSuffix>giờ</span>
      </nxt-form-field>
    </nxt-stack>
  `,
  styles: `
    .form {
      max-inline-size: var(--nxt-layout-content-narrow);
    }
    .field {
      align-self: stretch;
    }
  `,
})
export class SegmentedLabelExample {
  protected readonly modes: NxtSegmentedOption<Mode>[] = [
    { value: 'any', label: 'Một người duyệt là đủ' },
    { value: 'all', label: 'Tất cả cùng duyệt' },
  ];
  protected readonly mode = signal<Mode>('any');
}
