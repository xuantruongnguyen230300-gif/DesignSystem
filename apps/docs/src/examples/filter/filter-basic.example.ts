import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { NxtCheckbox } from '@nxt/ui/checkbox';
import { NxtEmptyState } from '@nxt/ui/empty-state';
import { NxtFilter, NxtFilterChip, NxtFilterChips, NxtFilterState } from '@nxt/ui/filter';
import { NxtStack } from '@nxt/ui/layout';
import { NxtTag, NxtTone } from '@nxt/ui/tag';

type Status = 'all' | 'official' | 'probation' | 'leave';

interface Employee {
  code: string;
  name: string;
  dept: string;
  status: Exclude<Status, 'all'>;
}

const STATUS: { value: Status; label: string; tone: NxtTone }[] = [
  { value: 'all', label: 'Tất cả', tone: 'neutral' },
  { value: 'official', label: 'Chính thức', tone: 'success' },
  { value: 'probation', label: 'Thử việc', tone: 'info' },
  { value: 'leave', label: 'Tạm nghỉ', tone: 'warning' },
];
const DEPTS = ['Kế toán', 'Nhân sự', 'Kinh doanh', 'Công nghệ'];

const EMPLOYEES: Employee[] = [
  { code: 'NV-0012', name: 'Nguyễn Văn An', dept: 'Kế toán', status: 'official' },
  { code: 'NV-0027', name: 'Trần Thị Bích Ngọc', dept: 'Nhân sự', status: 'official' },
  { code: 'NV-0031', name: 'Lê Hoàng Phúc', dept: 'Công nghệ', status: 'probation' },
  { code: 'NV-0045', name: 'Nguyễn Văn Hùng', dept: 'Kinh doanh', status: 'official' },
  { code: 'NV-0052', name: 'Phạm Thu Hà', dept: 'Nhân sự', status: 'leave' },
  { code: 'NV-0073', name: 'Nguyễn Thị Thu Vân', dept: 'Kế toán', status: 'probation' },
  { code: 'NV-0094', name: 'Bùi Quang Huy', dept: 'Công nghệ', status: 'official' },
  { code: 'NV-0117', name: 'Đỗ Thị Mai Anh', dept: 'Kinh doanh', status: 'leave' },
  { code: 'NV-0123', name: 'Nguyễn Văn Long', dept: 'Công nghệ', status: 'official' },
  { code: 'NV-0146', name: 'Trương Đình Nam', dept: 'Kinh doanh', status: 'probation' },
];

/** Bộ lọc trong panel, áp dụng bằng "Áp dụng"; chip cho từng tiêu chí đang áp dụng */
@Component({
  selector: 'example-filter-basic',
  imports: [NxtCheckbox, NxtEmptyState, NxtFilter, NxtFilterChips, NxtStack, NxtTag],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-stack gap="sm">
      <div class="toolbar">
        <nxt-filter
          #filter
          title="Lọc nhân viên"
          [activeCount]="filters.activeCount()"
          (opened)="filters.edit()"
          (applied)="filters.apply()"
          (reset)="filters.resetDraft()"
        >
          <fieldset class="group">
            <legend class="group__title">Trạng thái</legend>
            @for (s of statusOptions; track s.value) {
              <label class="radio">
                <input
                  type="radio"
                  name="filter-basic-status"
                  [value]="s.value"
                  [checked]="filters.draft().status === s.value"
                  (change)="filters.set('status', s.value)"
                />
                {{ s.label }}
              </label>
            }
          </fieldset>
          <fieldset class="group">
            <legend class="group__title">Phòng ban</legend>
            @for (d of depts; track d) {
              <nxt-checkbox [label]="d" [checked]="filters.draft().depts.includes(d)" (checkedChange)="filters.toggle('depts', d, $event)" />
            }
          </fieldset>
        </nxt-filter>
        <p class="count" role="status">Hiển thị {{ visible().length }} / {{ employees.length }} nhân viên</p>
      </div>

      @if (chips().length) {
        <nxt-filter-chips [chips]="chips()" [returnFocusTo]="filter" (remove)="clear($event)" (clearAll)="filters.clearAll()" />
      }

      @if (visible().length) {
        <ul class="people" role="list" aria-label="Nhân viên">
          @for (e of visible(); track e.code) {
            <li class="person">
              <span class="person__text">
                <span class="person__name">{{ e.name }}</span>
                <span class="docs-demo-label">{{ e.code }} · {{ e.dept }}</span>
              </span>
              <nxt-tag size="sm" dot [tone]="statusOf(e).tone">{{ statusOf(e).label }}</nxt-tag>
            </li>
          }
        </ul>
      } @else {
        <nxt-empty-state
          icon="filter-off"
          [headingLevel]="3"
          size="sm"
          title="Không có nhân viên phù hợp"
          description="Bỏ bớt tiêu chí ở hàng bộ lọc phía trên, hoặc mở Bộ lọc để chọn lại."
        />
      }
    </nxt-stack>
  `,
  styles: `
    .toolbar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--nxt-space-gap-md);
    }
    .count {
      color: var(--nxt-color-text-subtle);
      font: var(--nxt-typography-label-sm);
    }
    .group {
      display: grid;
      gap: var(--nxt-space-gap-xs);
      margin: 0;
      padding: 0;
      border: 0;
    }
    .group__title {
      margin-block-end: var(--nxt-space-gap-xs);
      padding: 0;
      color: var(--nxt-color-text-strong);
      font: var(--nxt-typography-label-md);
    }
    .radio {
      display: flex;
      align-items: center;
      gap: var(--nxt-space-gap-sm);
      min-block-size: var(--nxt-size-control-sm);
      font: var(--nxt-typography-body-md);
      cursor: pointer;
    }
    .radio input {
      accent-color: var(--nxt-color-bg-primary);
    }
    .people {
      display: grid;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .person {
      display: flex;
      align-items: center;
      gap: var(--nxt-space-gap-md);
      padding-block: var(--nxt-space-inset-xs);
    }
    .person + .person {
      border-block-start: var(--nxt-border-width-default) solid var(--nxt-color-border-subtle);
    }
    .person__text {
      display: grid;
      flex: 1;
      min-inline-size: 0;
    }
    .person__name {
      color: var(--nxt-color-text-strong);
      font: var(--nxt-typography-label-md);
    }
  `,
})
export class FilterBasicExample {
  protected readonly statusOptions = STATUS;
  protected readonly depts = DEPTS;
  protected readonly employees = EMPLOYEES;
  /** Defaults mean "no filter": 'all' and [] are not counted as applied criteria. */
  protected readonly filters = new NxtFilterState({ status: 'all' as Status, depts: [] as string[] });

  protected readonly visible = computed(() => {
    const { status, depts } = this.filters.applied();
    return EMPLOYEES.filter((e) => (status === 'all' || e.status === status) && (!depts.length || depts.includes(e.dept)));
  });

  /** "Tên tiêu chí: giá trị", several values joined by commas. */
  protected readonly chips = computed<NxtFilterChip[]>(() => {
    const { status, depts } = this.filters.applied();
    const chips: NxtFilterChip[] = [];
    if (this.filters.isActive('status')) chips.push({ key: 'status', label: `Trạng thái: ${STATUS.find((s) => s.value === status)?.label}` });
    if (this.filters.isActive('depts')) chips.push({ key: 'depts', label: `Phòng ban: ${depts.join(', ')}` });
    return chips;
  });

  constructor() {
    // Start with one criterion applied, so the chip row is visible in this demo.
    this.filters.set('depts', ['Kinh doanh', 'Công nghệ']);
    this.filters.apply();
  }

  protected statusOf(e: Employee) {
    return STATUS.find((s) => s.value === e.status)!;
  }

  protected clear(key: string) {
    this.filters.clear(key as 'status' | 'depts');
  }
}
