import { ChangeDetectionStrategy, Component, ElementRef, afterNextRender, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NxtDatePicker } from '@nxt/ui/date-picker';
import { NxtFormField } from '@nxt/ui/form-field';
import { NxtGrid, NxtSpan } from '@nxt/ui/layout';

/** Lỗi đọc ngày: chữ gõ sai được giữ nguyên, lỗi nói cách sửa */
@Component({
  selector: 'example-date-picker-error',
  imports: [ReactiveFormsModule, NxtDatePicker, NxtFormField, NxtGrid, NxtSpan],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-grid gap="md">
      <nxt-form-field label="Ngày nhận việc" required [error]="error()" [nxtSpan]="{ base: 12, md: 6 }">
        <nxt-date-picker [formControl]="startDate" today="2026-11-06" />
      </nxt-form-field>
    </nxt-grid>
  `,
})
export class DatePickerErrorExample {
  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  protected readonly startDate = new FormControl<string | null>(null);
  private readonly events = toSignal(this.startDate.events);

  protected readonly error = computed(() => {
    this.events();
    const parse = this.startDate.errors?.['nxtDateParse'];
    return parse && this.startDate.touched
      ? `Chưa đọc được ngày "${parse.text}": tháng 2 không có ngày 31. Nhập theo dạng dd/mm/yyyy, ví dụ 02/12/2026.`
      : null;
  });

  constructor() {
    // Demo only: replay what a user typed ("31/02/2026") and the blur, so the page opens in the error state.
    afterNextRender(() => {
      const input = this.host.querySelector<HTMLInputElement>('input');
      if (!input) return;
      input.value = '31/02/2026';
      input.dispatchEvent(new Event('input'));
      input.dispatchEvent(new Event('blur'));
    });
  }
}
