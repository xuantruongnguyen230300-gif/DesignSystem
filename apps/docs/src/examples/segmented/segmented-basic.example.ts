import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NxtStack } from '@nxt/ui/layout';
import { NxtSegmented, NxtSegmentedOption } from '@nxt/ui/segmented';

type Period = 'week' | 'month' | 'quarter' | 'year';

const RANGES: Record<Period, string> = {
  week: 'tuần 42 (13/10 – 19/10/2026)',
  month: 'tháng 10/2026',
  quarter: 'quý IV/2026',
  year: 'năm 2026',
};

/** Chọn kỳ báo cáo: một giá trị, luôn thấy mọi lựa chọn */
@Component({
  selector: 'example-segmented-basic',
  imports: [NxtSegmented, NxtStack],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-stack gap="sm" align="start">
      <nxt-segmented label="Kỳ báo cáo" [options]="periods" [(value)]="period" />
      <p class="docs-demo-label" role="status">Số liệu chấm công theo {{ range() }}</p>
    </nxt-stack>
  `,
})
export class SegmentedBasicExample {
  protected readonly periods: NxtSegmentedOption<Period>[] = [
    { value: 'week', label: 'Tuần' },
    { value: 'month', label: 'Tháng' },
    { value: 'quarter', label: 'Quý' },
    { value: 'year', label: 'Năm' },
  ];
  protected readonly period = signal<Period>('month');
  protected readonly range = computed(() => RANGES[this.period()]);
}
