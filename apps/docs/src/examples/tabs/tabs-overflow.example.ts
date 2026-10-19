import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NxtStack } from '@nxt/ui/layout';
import { NxtSegmented, NxtSegmentedOption } from '@nxt/ui/segmented';
import { NxtTab, NxtTabs } from '@nxt/ui/tabs';

type Width = 'narrow' | 'medium' | 'full';

interface Catalog {
  id: string;
  label: string;
  count: number;
}

const CATALOGS: Catalog[] = [
  { id: 'job-titles', label: 'Chức danh', count: 29 },
  { id: 'grades', label: 'Cấp bậc', count: 12 },
  { id: 'departments', label: 'Phòng ban', count: 18 },
  { id: 'branches', label: 'Chi nhánh', count: 6 },
  { id: 'shifts', label: 'Ca làm việc', count: 4 },
  { id: 'contract-types', label: 'Loại hợp đồng', count: 5 },
  { id: 'leave-reasons', label: 'Lý do nghỉ việc', count: 9 },
  { id: 'banks', label: 'Ngân hàng', count: 31 },
];

/** Nhiều tab: tab không vừa dồn vào "Xem thêm", tab đang chọn luôn hiện */
@Component({
  selector: 'example-tabs-overflow',
  imports: [NxtSegmented, NxtStack, NxtTab, NxtTabs],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-stack gap="md">
      <nxt-segmented label="Bề rộng vùng chứa" size="sm" [options]="widths" [(value)]="width" />
      <div class="frame" [attr.data-width]="width()">
        <nxt-tabs label="Danh mục tổ chức" [panels]="false" [(value)]="active">
          @for (c of catalogs; track c.id) {
            <nxt-tab [value]="c.id" [label]="c.label" [count]="c.count" />
          }
        </nxt-tabs>
        <p class="frame__content">{{ current().label }}: {{ current().count }} bản ghi</p>
      </div>
      <p class="docs-demo-label">Đổi bề rộng để thấy tab dồn vào hoặc ra khỏi “Xem thêm”. Chọn một tab trong menu đó: tab hiện lên hàng tab và nhận focus.</p>
    </nxt-stack>
  `,
  styles: `
    .frame {
      display: grid;
      gap: var(--nxt-space-gap-md);
      inline-size: min(100%, var(--nxt-size-560));
      padding: var(--nxt-space-inset-md);
      border: var(--nxt-border-width-default) dashed var(--nxt-color-border-default);
      border-radius: var(--nxt-radius-container);
    }
    .frame[data-width='narrow'] {
      inline-size: min(100%, var(--nxt-size-320));
    }
    .frame[data-width='full'] {
      inline-size: 100%;
    }
    .frame__content {
      color: var(--nxt-color-text-default);
      font: var(--nxt-typography-body-md);
    }
  `,
})
export class TabsOverflowExample {
  protected readonly catalogs = CATALOGS;
  protected readonly widths: NxtSegmentedOption<Width>[] = [
    { value: 'narrow', label: 'Hẹp' },
    { value: 'medium', label: 'Vừa' },
    { value: 'full', label: 'Đầy đủ' },
  ];
  protected readonly width = signal<Width>('medium');
  protected readonly active = signal<string | undefined>('job-titles');
  protected readonly current = computed(() => CATALOGS.find((c) => c.id === this.active()) ?? CATALOGS[0]);
}
