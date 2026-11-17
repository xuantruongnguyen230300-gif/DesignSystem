import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NxtComboboxOption, NxtCombobox } from '@nxt/ui/combobox';
import { NxtFormField } from '@nxt/ui/form-field';
import { employeeByCode, employeeOption, fetchEmployees } from '../value-help/hrm-employees';

/** Tải gợi ý từ máy chủ theo chữ gõ: chờ 250 ms sau khi ngừng gõ, có trạng thái đang tải, tối đa 8 gợi ý */
@Component({
  selector: 'example-combobox-server',
  imports: [NxtCombobox, NxtFormField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="box">
      <nxt-form-field label="Quản lý trực tiếp" hint="Gõ tên, mã nhân viên hoặc phòng ban (1.250 nhân viên).">
        <nxt-combobox
          searchMode="server"
          clearable
          [options]="options()"
          [loading]="loading()"
          [(value)]="manager"
          (query)="search($event)"
          placeholder="VD: Trần Minh Hùng hoặc NV-0012"
        />
      </nxt-form-field>
    </div>
    <p class="docs-demo-label" role="status">Giá trị lưu: {{ manager() ?? '(chưa chọn)' }}</p>
  `,
  styles: `
    .box {
      max-inline-size: var(--nxt-size-400);
      margin-block-end: var(--nxt-space-gap-sm);
    }
  `,
})
export class ComboboxServerExample {
  protected readonly manager = signal<string | null>('NV-0003');
  /** Starts with the current value, so the box shows a name before the first search. */
  protected readonly options = signal<NxtComboboxOption[]>([employeeOption(employeeByCode('NV-0003')!)]);
  protected readonly loading = signal(false);
  private request = 0;

  /** `query` arrives at once when the list opens, then 250 ms after the user stops typing. */
  protected async search(query: string) {
    const id = ++this.request;
    this.loading.set(true);
    const { items } = await fetchEmployees(query, 8);
    // An older answer that arrives late is dropped.
    if (id !== this.request) return;
    this.options.set(items.map(employeeOption));
    this.loading.set(false);
  }
}
