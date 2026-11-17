import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NxtButton } from '@nxt/ui/button';
import { NxtStack } from '@nxt/ui/layout';
import { NxtSegmented, NxtSegmentedOption } from '@nxt/ui/segmented';

type Period = 'week' | 'month' | 'quarter' | 'year';

/** Khoá từng lựa chọn hoặc cả nhóm; dùng với Angular forms */
@Component({
  selector: 'example-segmented-forms',
  imports: [ReactiveFormsModule, NxtButton, NxtSegmented, NxtStack],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-stack gap="md" align="start">
      <nxt-segmented label="Kỳ báo cáo" showLabel [options]="periods" [formControl]="period" />
      <button nxtButton type="button" [attr.aria-pressed]="locked()" (click)="toggleLock()">Khoá kỳ báo cáo</button>
      <p class="docs-demo-label">Giá trị: {{ value() }} · {{ locked() ? 'đang khoá' : 'đang mở' }}</p>
    </nxt-stack>
  `,
})
export class SegmentedFormsExample {
  protected readonly periods: NxtSegmentedOption<Period>[] = [
    { value: 'week', label: 'Tuần' },
    { value: 'month', label: 'Tháng' },
    { value: 'quarter', label: 'Quý' },
    // Yearly figures only exist after the year-end closing.
    { value: 'year', label: 'Năm', disabled: true },
  ];
  protected readonly period = new FormControl<Period>('month', { nonNullable: true });
  protected readonly value = toSignal(this.period.valueChanges, { initialValue: this.period.value });
  protected readonly locked = signal(false);

  protected toggleLock() {
    const locked = !this.locked();
    this.locked.set(locked);
    if (locked) this.period.disable();
    else this.period.enable();
  }
}
