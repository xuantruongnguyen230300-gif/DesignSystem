import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NxtInline, NxtStack } from '@nxt/ui/layout';
import { NxtSegmented, NxtSegmentedOption } from '@nxt/ui/segmented';
import { NxtTag } from '@nxt/ui/tag';

type Kind = 'all' | 'leave' | 'overtime' | 'trip';

interface Request {
  id: string;
  kind: Exclude<Kind, 'all'>;
  name: string;
  detail: string;
}

const KIND_LABEL: Record<Exclude<Kind, 'all'>, string> = { leave: 'Nghỉ phép', overtime: 'Tăng ca', trip: 'Công tác' };

const REQUESTS: Request[] = [
  { id: 'DNP-0412', kind: 'leave', name: 'Lê Minh Anh', detail: '20/10 – 22/10/2026 · 3 ngày' },
  { id: 'TC-0198', kind: 'overtime', name: 'Phạm Thu Hà', detail: '18/10/2026 · 18:00 – 21:00' },
  { id: 'CT-0077', kind: 'trip', name: 'Võ Thành Nam', detail: 'Đà Nẵng · 23/10 – 25/10/2026' },
  { id: 'DNP-0409', kind: 'leave', name: 'Nguyễn Thị Ngọc Diệp', detail: '27/10/2026 · 1 ngày' },
  { id: 'TC-0195', kind: 'overtime', name: 'Hoàng Văn Đức', detail: '19/10/2026 · 07:00 – 11:00' },
  { id: 'DNP-0405', kind: 'leave', name: 'Bùi Khánh Linh', detail: '03/11 – 04/11/2026 · 2 ngày' },
];

/** Lọc nhanh một danh sách: số kết quả được thông báo cho screen reader */
@Component({
  selector: 'example-segmented-filter',
  imports: [NxtSegmented, NxtInline, NxtStack, NxtTag],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-stack gap="md">
      <nxt-inline justify="between" gap="md">
        <nxt-segmented label="Loại đơn" size="sm" [options]="kinds" [(value)]="kind" />
        <p class="docs-demo-label nxt-tabular-nums" role="status">{{ summary() }}</p>
      </nxt-inline>
      <ul class="requests" role="list">
        @for (r of visible(); track r.id) {
          <li class="request">
            <span class="request__text">
              <span class="request__name">{{ r.name }}</span>
              <span class="docs-demo-label">{{ r.id }} · {{ r.detail }}</span>
            </span>
            <nxt-tag size="sm">{{ kindLabel[r.kind] }}</nxt-tag>
          </li>
        }
      </ul>
    </nxt-stack>
  `,
  styles: `
    .requests {
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .request {
      display: flex;
      align-items: center;
      gap: var(--nxt-space-gap-md);
      padding-block: var(--nxt-space-inset-sm);
    }
    .request + .request {
      border-block-start: var(--nxt-border-width-default) solid var(--nxt-color-border-subtle);
    }
    .request__text {
      display: grid;
      flex: 1;
      min-inline-size: 0;
    }
    .request__name {
      color: var(--nxt-color-text-strong);
      font: var(--nxt-typography-label-md);
    }
  `,
})
export class SegmentedFilterExample {
  protected readonly kindLabel = KIND_LABEL;
  protected readonly kinds: NxtSegmentedOption<Kind>[] = [
    { value: 'all', label: 'Tất cả' },
    { value: 'leave', label: 'Nghỉ phép' },
    { value: 'overtime', label: 'Tăng ca' },
    { value: 'trip', label: 'Công tác' },
  ];
  protected readonly kind = signal<Kind>('all');
  protected readonly visible = computed(() => {
    const k = this.kind();
    return k === 'all' ? REQUESTS : REQUESTS.filter((r) => r.kind === k);
  });
  protected readonly summary = computed(() => {
    const k = this.kind();
    const n = this.visible().length;
    return k === 'all' ? `${n} đơn chờ duyệt` : `${n} đơn ${KIND_LABEL[k].toLowerCase()} chờ duyệt`;
  });
}
