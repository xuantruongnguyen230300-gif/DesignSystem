import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NxtComboboxOption, NxtCombobox } from '@nxt/ui/combobox';
import { NxtFormField } from '@nxt/ui/form-field';

const SKILLS: NxtComboboxOption[] = [
  { key: 'angular', label: 'Angular', group: 'Lập trình' },
  { key: 'csharp', label: 'C# / .NET', group: 'Lập trình' },
  { key: 'java', label: 'Java', group: 'Lập trình' },
  { key: 'python', label: 'Python', group: 'Lập trình' },
  { key: 'typescript', label: 'TypeScript', group: 'Lập trình' },
  { key: 'powerbi', label: 'Power BI', group: 'Dữ liệu' },
  { key: 'sql', label: 'SQL Server', group: 'Dữ liệu' },
  { key: 'excel', label: 'Excel nâng cao', group: 'Dữ liệu' },
  { key: 'en', label: 'Tiếng Anh', description: 'IELTS', group: 'Ngoại ngữ' },
  { key: 'ja', label: 'Tiếng Nhật', description: 'JLPT', group: 'Ngoại ngữ' },
  { key: 'ko', label: 'Tiếng Hàn', description: 'TOPIK', group: 'Ngoại ngữ' },
  { key: 'tax', label: 'Kế toán thuế', group: 'Nghiệp vụ' },
  { key: 'payroll', label: 'Tính lương & bảo hiểm', group: 'Nghiệp vụ' },
  { key: 'recruit', label: 'Tuyển dụng', group: 'Nghiệp vụ' },
];

/** Chọn nhiều kỹ năng: lựa chọn thành token; Backspace bỏ token cuối, ← để đi giữa các token */
@Component({
  selector: 'example-combobox-multiple',
  imports: [NxtCombobox, NxtFormField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="box">
      <nxt-form-field label="Kỹ năng" hint="Enter chọn và giữ danh sách mở để chọn tiếp. ← tới các kỹ năng đã chọn, Delete để bỏ.">
        <nxt-combobox multiple [options]="skills" [(values)]="chosen" placeholder="Gõ để tìm kỹ năng" />
      </nxt-form-field>
    </div>
    <p class="docs-demo-label" role="status">Đã chọn {{ chosen().length }} kỹ năng: {{ summary() }}</p>
  `,
  styles: `
    .box {
      max-inline-size: var(--nxt-size-400);
      margin-block-end: var(--nxt-space-gap-sm);
    }
  `,
})
export class ComboboxMultipleExample {
  protected readonly skills = SKILLS;
  protected readonly chosen = signal<string[]>(['angular', 'sql', 'en']);
  protected readonly summary = computed(() =>
    this.chosen()
      .map((k) => SKILLS.find((s) => s.key === k)?.label ?? k)
      .join(', '),
  );
}
