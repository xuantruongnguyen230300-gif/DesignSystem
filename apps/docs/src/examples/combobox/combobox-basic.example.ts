import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NxtComboboxOption, NxtCombobox } from '@nxt/ui/combobox';
import { NxtFormField } from '@nxt/ui/form-field';

/** Sorted with Intl.Collator('vi') inside each group; the code is searched too. */
const DEPARTMENTS: NxtComboboxOption[] = [
  { key: 'BGD', label: 'Ban Giám đốc', description: 'BGD', group: 'Khối Điều hành' },
  { key: 'TL', label: 'Ban Trợ lý', description: 'TL01', group: 'Khối Điều hành' },
  { key: 'KD', label: 'Phòng Kinh doanh', description: 'KD01', group: 'Khối Kinh doanh' },
  { key: 'KDDA', label: 'Phòng Kinh doanh Dự án', description: 'KD02', group: 'Khối Kinh doanh' },
  { key: 'MK', label: 'Phòng Marketing', description: 'MK01', group: 'Khối Kinh doanh' },
  { key: 'CNTT', label: 'Phòng Công nghệ thông tin', description: 'IT01', group: 'Khối Kỹ thuật' },
  { key: 'KV', label: 'Kho vận', description: 'KV01', group: 'Khối Kỹ thuật' },
  { key: 'HC', label: 'Phòng Hành chính', description: 'HC01', group: 'Khối Văn phòng' },
  { key: 'KT', label: 'Phòng Kế toán', description: 'KT01', group: 'Khối Văn phòng' },
  { key: 'NS', label: 'Phòng Nhân sự', description: 'NS01', group: 'Khối Văn phòng' },
  { key: 'PC', label: 'Phòng Pháp chế', description: 'PC01', group: 'Khối Văn phòng' },
  { key: 'QTNL', label: 'Phòng Quản trị Nguồn nhân lực & Phát triển Tổ chức', description: 'HR02', group: 'Khối Văn phòng', keywords: 'HRBP' },
];

/** Chọn phòng ban: gõ có dấu hay không dấu, theo tên hoặc mã; lựa chọn chia nhóm theo khối */
@Component({
  selector: 'example-combobox-basic',
  imports: [NxtCombobox, NxtFormField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="box">
      <nxt-form-field label="Phòng ban" hint="Gõ tên hoặc mã, ví dụ “ke toan” hoặc “it01”." required>
        <nxt-combobox [options]="departments" [(value)]="department" placeholder="Chọn phòng ban" />
      </nxt-form-field>
    </div>
    <p class="docs-demo-label" role="status">Giá trị lưu: {{ department() ?? '(chưa chọn)' }}</p>
  `,
  styles: `
    .box {
      max-inline-size: var(--nxt-size-400);
      margin-block-end: var(--nxt-space-gap-sm);
    }
  `,
})
export class ComboboxBasicExample {
  protected readonly departments = DEPARTMENTS;
  protected readonly department = signal<string | null>('KT');
}
