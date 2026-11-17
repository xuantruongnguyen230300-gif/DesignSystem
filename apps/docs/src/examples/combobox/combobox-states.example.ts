import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { NxtComboboxOption, NxtCombobox } from '@nxt/ui/combobox';
import { NxtFormField } from '@nxt/ui/form-field';

const DEPARTMENTS: NxtComboboxOption[] = [
  { key: 'KD', label: 'Phòng Kinh doanh', description: 'KD01' },
  { key: 'KT', label: 'Phòng Kế toán', description: 'KT01' },
  { key: 'NS', label: 'Phòng Nhân sự', description: 'NS01' },
  { key: 'PC', label: 'Phòng Pháp chế', description: 'PC01' },
];
const BRANCHES: NxtComboboxOption[] = [
  { key: 'DN', label: 'Chi nhánh Đà Nẵng', description: 'DN' },
  { key: 'HN', label: 'Chi nhánh Hà Nội', description: 'HN' },
  { key: 'HCM', label: 'Chi nhánh TP. Hồ Chí Minh', description: 'HCM' },
  { key: 'CT', label: 'Chi nhánh Cần Thơ', description: 'CT' },
];
const ENTITIES: NxtComboboxOption[] = [{ key: 'VN01', label: 'Công ty Cổ phần Phần mềm Sao Việt', description: 'VN01' }];
const CONTRACTS: NxtComboboxOption[] = [
  { key: 'XDTH', label: 'Hợp đồng xác định thời hạn', description: '12–36 tháng' },
  { key: 'KXDTH', label: 'Hợp đồng không xác định thời hạn' },
];

/** Trạng thái: lỗi (bắt buộc), xoá được, bị khoá có lý do, chỉ đọc, và đứng một mình trên thanh công cụ */
@Component({
  selector: 'example-combobox-states',
  imports: [NxtCombobox, NxtFormField, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="grid">
      <nxt-form-field label="Phòng ban" required [error]="dept.invalid && dept.touched ? 'Hãy chọn một phòng ban trong danh sách.' : null">
        <nxt-combobox [options]="departments" [formControl]="dept" placeholder="Chọn phòng ban" />
      </nxt-form-field>
      <nxt-form-field label="Chi nhánh làm việc" hint="Không bắt buộc. Nút × để bỏ chọn.">
        <nxt-combobox clearable [options]="branches" [(value)]="branch" placeholder="Chọn chi nhánh" />
      </nxt-form-field>
      <nxt-form-field label="Pháp nhân" hint="Chỉ đổi được khi tạo hồ sơ mới.">
        <nxt-combobox disabled [options]="entities" [value]="'VN01'" />
      </nxt-form-field>
      <nxt-form-field label="Loại hợp đồng" readonly>
        <nxt-combobox [options]="contracts" [value]="'XDTH'" />
      </nxt-form-field>
    </div>
    <div class="toolbar">
      <nxt-combobox label="Lọc theo chi nhánh" size="sm" clearable [options]="branches" [(value)]="filterBranch" placeholder="Tất cả chi nhánh" />
    </div>
  `,
  styles: `
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(min(100%, var(--nxt-layout-item-min-lg)), 1fr));
      gap: var(--nxt-space-gap-lg);
    }
    .toolbar {
      max-inline-size: var(--nxt-layout-item-min-lg);
      margin-block-start: var(--nxt-space-gap-lg);
    }
  `,
})
export class ComboboxStatesExample {
  protected readonly departments = DEPARTMENTS;
  protected readonly branches = BRANCHES;
  protected readonly entities = ENTITIES;
  protected readonly contracts = CONTRACTS;
  /** Shown already touched so the error state is visible. */
  protected readonly dept = new FormControl<string | null>(null, Validators.required);
  protected readonly branch = signal<string | null>('HN');
  protected readonly filterBranch = signal<string | null>(null);

  constructor() {
    this.dept.markAsTouched();
  }
}
