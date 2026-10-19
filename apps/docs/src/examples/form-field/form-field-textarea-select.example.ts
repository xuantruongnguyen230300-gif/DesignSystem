import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NxtFormField, NxtInput } from '@nxt/ui/form-field';
import { NxtGrid, NxtSpan } from '@nxt/ui/layout';

/** Select có chevron, textarea kéo giãn theo chiều dọc */
@Component({
  selector: 'example-form-field-textarea-select',
  imports: [NxtFormField, NxtInput, NxtGrid, NxtSpan],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-grid gap="md">
      <nxt-form-field label="Loại nghỉ" required [nxtSpan]="{ base: 12, md: 6 }">
        <select nxtInput>
          @for (t of leaveTypes; track t) {
            <option [value]="t">{{ t }}</option>
          }
        </select>
      </nxt-form-field>

      <nxt-form-field label="Người duyệt" hint="Theo quy trình của phòng Kế toán, không đổi được." [nxtSpan]="{ base: 12, md: 6 }">
        <select nxtInput disabled>
          <option>Trần Văn Bình, Trưởng phòng Kế toán</option>
        </select>
      </nxt-form-field>

      <nxt-form-field label="Lý do nghỉ" [hint]="counter()" nxtSpan="full">
        <textarea nxtInput rows="3" [value]="reason()" (input)="reason.set(text($event))"></textarea>
      </nxt-form-field>
    </nxt-grid>
  `,
})
export class FormFieldTextareaSelectExample {
  protected readonly leaveTypes = ['Nghỉ phép năm', 'Nghỉ ốm', 'Nghỉ việc riêng có lương', 'Nghỉ không lương', 'Nghỉ chế độ thai sản'];
  protected readonly reason = signal('Về quê dự đám cưới em gái.');
  protected readonly counter = computed(() => `Tối đa 300 ký tự · đã nhập ${this.reason().length}.`);

  protected text(event: Event): string {
    return (event.target as HTMLTextAreaElement).value;
  }
}
