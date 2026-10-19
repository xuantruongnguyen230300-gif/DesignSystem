import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NxtButton } from '@nxt/ui/button';
import { NxtIcon } from '@nxt/ui/icon';
import { NxtInline, NxtStack } from '@nxt/ui/layout';
import { NxtMenu, NxtMenuItemRadio, NxtMenuLabel, NxtMenuTrigger } from '@nxt/ui/menu';

type SortKey = 'newest' | 'oldest' | 'name' | 'days';

interface LeaveRequest {
  name: string;
  dept: string;
  days: number;
  /** Minutes since the request was sent. */
  age: number;
  sent: string;
}

const SORTS: { value: SortKey; label: string }[] = [
  { value: 'newest', label: 'Mới gửi nhất' },
  { value: 'oldest', label: 'Chờ lâu nhất' },
  { value: 'name', label: 'Tên nhân viên A–Z' },
  { value: 'days', label: 'Nghỉ nhiều ngày nhất' },
];

const REQUESTS: LeaveRequest[] = [
  { name: 'Lê Minh Anh', dept: 'Phòng Kế toán', days: 3, age: 10, sent: '10 phút trước' },
  { name: 'Phạm Thu Hà', dept: 'Phòng Nhân sự', days: 1, age: 180, sent: '3 giờ trước' },
  { name: 'Võ Thành Nam', dept: 'Khối Kinh doanh', days: 5, age: 1440, sent: 'Hôm qua' },
  { name: 'Đỗ Khánh Linh', dept: 'Phòng Pháp chế', days: 2, age: 4320, sent: '3 ngày trước' },
];

/** Một lựa chọn (menuitemradio): sắp xếp danh sách đơn chờ duyệt */
@Component({
  selector: 'example-menu-radio',
  imports: [NxtButton, NxtIcon, NxtInline, NxtStack, NxtMenu, NxtMenuItemRadio, NxtMenuLabel, NxtMenuTrigger],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-stack gap="md">
      <nxt-inline justify="between" gap="md">
        <p class="nxt-text-heading-sm" id="menu-radio-title">Đơn nghỉ phép chờ duyệt</p>
        <button nxtButton variant="ghost" size="sm" [nxtMenuTriggerFor]="sortMenu">
          <nxt-icon name="arrows-sort" />
          Sắp xếp: {{ sortLabel() }}
          <nxt-icon name="chevron-down" />
        </button>
        <ng-template #sortMenu>
          <div nxtMenu>
            <div nxtMenuLabel>Sắp xếp theo</div>
            @for (s of sorts; track s.value) {
              <button nxtMenuItemRadio [checked]="s.value === sort()" (triggered)="setSort(s.value)">{{ s.label }}</button>
            }
          </div>
        </ng-template>
      </nxt-inline>

      <ol class="requests" aria-labelledby="menu-radio-title">
        @for (r of sorted(); track r.name) {
          <li class="request">
            <span class="request__name">{{ r.name }}</span>
            <span class="docs-demo-label">{{ r.dept }} · {{ r.days }} ngày · gửi {{ r.sent }}</span>
          </li>
        }
      </ol>
      <p class="nxt-visually-hidden" role="status">{{ message() }}</p>
    </nxt-stack>
  `,
  styles: `
    .requests {
      display: grid;
      margin: 0;
      padding: 0;
      list-style: none;
      border: var(--nxt-border-width-default) solid var(--nxt-color-border-default);
      border-radius: var(--nxt-radius-container);
    }
    .request {
      display: grid;
      gap: var(--nxt-space-0-5);
      padding: var(--nxt-space-inset-sm) var(--nxt-space-inset-md);
    }
    .request + .request {
      border-block-start: var(--nxt-border-width-default) solid var(--nxt-color-border-subtle);
    }
    .request__name {
      color: var(--nxt-color-text-strong);
      font: var(--nxt-typography-label-md);
    }
  `,
})
export class MenuRadioExample {
  protected readonly sorts = SORTS;
  protected readonly sort = signal<SortKey>('newest');
  protected readonly message = signal('');
  protected readonly sortLabel = computed(() => SORTS.find((s) => s.value === this.sort())?.label ?? '');
  protected readonly sorted = computed(() => {
    const list = [...REQUESTS];
    switch (this.sort()) {
      case 'oldest':
        return list.sort((a, b) => b.age - a.age);
      case 'name':
        return list.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
      case 'days':
        return list.sort((a, b) => b.days - a.days);
      default:
        return list.sort((a, b) => a.age - b.age);
    }
  });

  protected setSort(value: SortKey) {
    this.sort.set(value);
    this.message.set(`Đã sắp xếp: ${this.sortLabel()}.`);
  }
}
