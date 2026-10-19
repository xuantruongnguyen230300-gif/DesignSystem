import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NxtStack } from '@nxt/ui/layout';
import { NxtTab, NxtTabs } from '@nxt/ui/tabs';
import { NxtTag, NxtTone } from '@nxt/ui/tag';

type Status = 'pending' | 'approved' | 'rejected';

interface Request {
  id: string;
  name: string;
  range: string;
  status: Status;
}

const STATUS: Record<Status, { label: string; tone: NxtTone }> = {
  pending: { label: 'Chờ duyệt', tone: 'warning' },
  approved: { label: 'Đã duyệt', tone: 'success' },
  rejected: { label: 'Từ chối', tone: 'danger' },
};

const REQUESTS: Request[] = [
  { id: 'DNP-0412', name: 'Lê Minh Anh', range: '20/10 – 22/10/2026', status: 'pending' },
  { id: 'DNP-0411', name: 'Trần Thị Mai', range: '24/10/2026', status: 'pending' },
  { id: 'DNP-0409', name: 'Nguyễn Thị Ngọc Diệp', range: '27/10/2026', status: 'pending' },
  { id: 'DNP-0405', name: 'Bùi Khánh Linh', range: '03/11 – 04/11/2026', status: 'approved' },
  { id: 'DNP-0403', name: 'Hoàng Văn Đức', range: '15/10/2026', status: 'approved' },
  { id: 'DNP-0402', name: 'Đỗ Minh Khoa', range: '14/10/2026', status: 'rejected' },
];

/** Tab lọc (panels tắt): tab chỉ đổi giá trị, trang tự vẽ danh sách */
@Component({
  selector: 'example-tabs-filter',
  imports: [NxtStack, NxtTab, NxtTabs, NxtTag],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-stack gap="md">
      <nxt-tabs label="Lọc đơn nghỉ phép theo trạng thái" [panels]="false" [(value)]="filter">
        <nxt-tab value="pending" label="Chờ duyệt" [count]="count('pending')" />
        <nxt-tab value="approved" label="Đã duyệt" [count]="count('approved')" />
        <nxt-tab value="rejected" label="Từ chối" [count]="count('rejected')" />
        <nxt-tab value="all" label="Tất cả" />
      </nxt-tabs>
      <p class="nxt-visually-hidden" role="status">{{ summary() }}</p>
      <ul class="requests" role="list">
        @for (r of visible(); track r.id) {
          <li class="request">
            <span class="request__text">
              <span class="request__name">{{ r.name }}</span>
              <span class="docs-demo-label">{{ r.id }} · {{ r.range }}</span>
            </span>
            <nxt-tag [tone]="status[r.status].tone" dot size="sm">{{ status[r.status].label }}</nxt-tag>
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
export class TabsFilterExample {
  protected readonly status = STATUS;
  protected readonly filter = signal('pending');
  protected readonly visible = computed(() => {
    const f = this.filter();
    return f === 'all' ? REQUESTS : REQUESTS.filter((r) => r.status === f);
  });
  protected readonly summary = computed(() => `${this.visible().length} đơn`);

  protected count(s: Status): number {
    return REQUESTS.filter((r) => r.status === s).length;
  }
}
