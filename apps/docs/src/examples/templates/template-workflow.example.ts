import { ChangeDetectionStrategy, Component, ElementRef, Injector, afterNextRender, computed, inject, signal, viewChild } from '@angular/core';
import { NxtAlert, NxtAlertTone, NxtLiveRegion } from '@nxt/ui/alert';
import { NxtButton } from '@nxt/ui/button';
import { NxtCard } from '@nxt/ui/card';
import { NxtCheckbox } from '@nxt/ui/checkbox';
import { NxtEmptyState } from '@nxt/ui/empty-state';
import { NxtFilter, NxtFilterChip, NxtFilterChips, NxtFilterState } from '@nxt/ui/filter';
import { NxtIcon } from '@nxt/ui/icon';
import { NxtFill } from '@nxt/ui/layout';
import { NxtMenu, NxtMenuItem, NxtMenuSeparator, NxtMenuTrigger } from '@nxt/ui/menu';
import { NxtPageHeader } from '@nxt/ui/page-header';
import { NxtSearch, nxtMatches } from '@nxt/ui/search';
import { NxtSort, NxtSortHeader, NxtSortState, NxtTable, NxtTableScroll } from '@nxt/ui/table';
import { NxtTag } from '@nxt/ui/tag';
import { NxtTooltip } from '@nxt/ui/tooltip';
import { dateKey } from './catalog-data';
import { HrmFrame } from './hrm-frame';
import { WorkflowEditor } from './workflow-editor';
import { REQUEST_TYPES, STATUS_META, TODAY, ME, WORKFLOWS, Workflow, WorkflowStatus, blankWorkflow, copyOf, formatNumber, totalHours } from './workflow-data';

const STATUS_OPTIONS: { value: 'all' | WorkflowStatus; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'active', label: STATUS_META.active.label },
  { value: 'draft', label: STATUS_META.draft.label },
  { value: 'inactive', label: STATUS_META.inactive.label },
];

interface Notice {
  text: string;
  /** Default success. */
  tone?: NxtAlertTone;
  undo?: () => void;
}

interface Editing {
  workflow: Workflow;
  /** Not in the list until it is saved ("Thêm mới", "Nhân bản"). */
  isNew: boolean;
}

/** Quy trình duyệt — danh sách quy trình và trình sửa luồng duyệt: bước, người duyệt, điều kiện, thời hạn, mô phỏng, phiên bản */
@Component({
  selector: 'example-template-workflow',
  imports: [
    HrmFrame,
    NxtAlert,
    NxtButton,
    NxtCard,
    NxtCheckbox,
    NxtEmptyState,
    NxtFill,
    NxtFilter,
    NxtFilterChips,
    NxtIcon,
    NxtLiveRegion,
    NxtMenu,
    NxtMenuItem,
    NxtMenuSeparator,
    NxtMenuTrigger,
    NxtPageHeader,
    NxtSearch,
    NxtSort,
    NxtSortHeader,
    NxtTable,
    NxtTableScroll,
    NxtTag,
    NxtTooltip,
    WorkflowEditor,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- The list fills the screen (the grid scrolls inside); the editor fills it only when its two columns fit side by side. -->
    <example-hrm-frame [fill]="!editing() || editorWide()">
      @if (editing(); as e) {
        <example-workflow-editor [workflow]="e.workflow" [isNew]="e.isNew" (saved)="onSaved($event)" (closed)="closeEditor($event)" (wideChange)="editorWide.set($event)" />
      } @else {
        <div class="stack" nxtFill>
          <nxt-page-header
            title="Quy trình duyệt"
            description="Ai duyệt từng loại đơn, theo thứ tự nào và trong bao lâu. Thay đổi có hiệu lực cho đơn gửi sau khi áp dụng."
            [breadcrumb]="[{ label: 'Thiết lập' }, { label: 'Quy trình duyệt' }]"
          />

          <div class="notice" nxtLiveRegion>
            @if (notice(); as n) {
              <nxt-alert [tone]="n.tone ?? 'success'">
                {{ n.text }}
                @if (n.undo) {
                  <button nxtAlertActions nxtButton variant="ghost" size="sm" type="button" (click)="undo(n)">Hoàn tác</button>
                }
              </nxt-alert>
            }
          </div>

          <nxt-card padding="none" fill>
            @if (workflows().length) {
              <div class="bar">
                <nxt-search class="bar__search" label="Tìm quy trình duyệt" placeholder="Tên quy trình hoặc loại đơn" [value]="query()" (valueChange)="query.set($event)" />
                <nxt-filter #filter title="Lọc quy trình duyệt" [activeCount]="filters.activeCount()" (opened)="filters.edit()" (applied)="filters.apply()" (reset)="filters.resetDraft()">
                  <fieldset class="group">
                    <legend class="group__title">Trạng thái</legend>
                    @for (s of statusOptions; track s.value) {
                      <label class="radio">
                        <input type="radio" name="workflow-status" [value]="s.value" [checked]="filters.draft().status === s.value" (change)="filters.set('status', s.value)" />
                        {{ s.label }}
                      </label>
                    }
                  </fieldset>
                  <fieldset class="group">
                    <legend class="group__title">Loại đơn</legend>
                    @for (t of requestTypes; track t) {
                      <nxt-checkbox [label]="t" [checked]="filters.draft().types.includes(t)" (checkedChange)="filters.toggle('types', t, $event)" />
                    }
                  </fieldset>
                </nxt-filter>
                <span class="bar__spacer"></span>
                <button nxtButton variant="primary" type="button" data-create aria-label="Thêm mới quy trình duyệt" (click)="create()"><nxt-icon name="plus" />Thêm mới</button>
              </div>
              @if (chips().length) {
                <div class="chips">
                  <nxt-filter-chips [chips]="chips()" [returnFocusTo]="filter" (remove)="filters.clear($any($event))" (clearAll)="filters.clearAll()" />
                </div>
              }
              <p class="nxt-visually-hidden" role="status">{{ narrowed() ? 'Tìm thấy ' + rows().length + ' quy trình' : '' }}</p>

              @if (rows().length) {
                <nxt-table-scroll fill label="Bảng quy trình duyệt">
                  <table nxtTable stickyHeader [(nxtSort)]="sort">
                    <thead>
                      <tr>
                        <th scope="col" nxtSortHeader="name">Tên quy trình</th>
                        <th scope="col">Loại đơn</th>
                        <th scope="col">Phạm vi áp dụng</th>
                        <th scope="col" class="nxt-table__num">Số bước</th>
                        <th scope="col" class="nxt-table__num">Tổng thời hạn (giờ)</th>
                        <th scope="col">Trạng thái</th>
                        <th scope="col">Phiên bản</th>
                        <th scope="col" nxtSortHeader="updated">Cập nhật</th>
                        <th scope="col" class="nxt-table__actions"><span class="nxt-visually-hidden">Thao tác</span></th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (w of rows(); track w.id) {
                        <tr class="row" (click)="onRowClick($event, w)">
                          <th scope="row" class="name">
                            <!-- Opens the editor; the whole row does too (mouse). -->
                            <button type="button" class="name__open" [attr.data-open]="w.id" (click)="edit(w)">{{ w.name }}</button>
                          </th>
                          <td>{{ w.type }}</td>
                          <td>{{ w.scope }}</td>
                          <td class="nxt-table__num">{{ w.steps.length }}</td>
                          <td class="nxt-table__num">{{ hours(w) }}</td>
                          <td>
                            <nxt-tag [tone]="statusOf(w).tone" dot>{{ statusOf(w).label }}</nxt-tag>
                          </td>
                          <td class="nxt-tabular-nums">
                            @if (w.version) {
                              v{{ w.version }}
                            } @else {
                              <span aria-hidden="true">—</span><span class="nxt-visually-hidden">Chưa áp dụng</span>
                            }
                            @if (w.draft) {
                              <span class="sub"> · có bản nháp</span>
                            }
                          </td>
                          <td class="nxt-tabular-nums">{{ w.updated }}</td>
                          <td class="nxt-table__actions">
                            <button nxtIconButton size="sm" variant="ghost" type="button" [attr.aria-label]="'Sửa ' + w.name" nxtTooltip="Sửa" (click)="edit(w)">
                              <nxt-icon name="pencil" />
                            </button>
                            <button nxtIconButton size="sm" variant="ghost" type="button" [attr.aria-label]="'Thao tác khác cho ' + w.name" nxtTooltip="Thao tác khác" [nxtMenuTriggerFor]="more">
                              <nxt-icon name="dots" />
                            </button>
                            <ng-template #more>
                              <div nxtMenu>
                                <button nxtMenuItem (triggered)="duplicate(w)"><nxt-icon name="copy" />Nhân bản</button>
                                @if (w.status === 'active') {
                                  <button nxtMenuItem (triggered)="setStatus(w, 'inactive')"><nxt-icon name="ban" />Ngừng áp dụng</button>
                                } @else if (w.status === 'inactive') {
                                  <button nxtMenuItem (triggered)="setStatus(w, 'active')"><nxt-icon name="restore" />Áp dụng lại</button>
                                }
                                <div nxtMenuSeparator></div>
                                @if (w.status === 'active') {
                                  <button nxtMenuItem tone="danger" [disabled]="true"><nxt-icon name="trash" />Không xoá được: đang áp dụng</button>
                                } @else {
                                  <button nxtMenuItem tone="danger" (triggered)="remove(w)"><nxt-icon name="trash" />Xoá quy trình</button>
                                }
                              </div>
                            </ng-template>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </nxt-table-scroll>
                <div class="footer nxt-tabular-nums">{{ footer() }}</div>
              } @else {
                <nxt-empty-state icon="search" title="Không có quy trình phù hợp" description="Thử từ khoá ngắn hơn, hoặc bỏ bớt bộ lọc." size="sm">
                  <button nxtEmptyActions nxtButton type="button" (click)="clearAll()">Xoá tìm kiếm và bộ lọc</button>
                </nxt-empty-state>
              }
            } @else {
              <nxt-empty-state icon="route" title="Chưa có quy trình duyệt nào" description="Tạo quy trình đầu tiên: chọn loại đơn, người duyệt từng bước và thời hạn xử lý.">
                <button nxtEmptyActions nxtButton variant="primary" type="button" data-create (click)="create()"><nxt-icon name="plus" />Thêm mới</button>
              </nxt-empty-state>
            }
          </nxt-card>
        </div>
      }
    </example-hrm-frame>
  `,
  styles: `
    .stack {
      gap: var(--nxt-space-gap-lg);
    }
    .bar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--nxt-space-gap-sm);
      padding: var(--nxt-space-inset-sm) var(--nxt-space-inset-md);
      border-block-end: var(--nxt-border-width-default) solid var(--nxt-color-border-default);
    }
    .bar__search {
      flex: 1 1 var(--nxt-layout-item-min-sm);
      max-inline-size: var(--nxt-size-400);
    }
    .bar__spacer {
      flex: 1;
    }
    .chips {
      padding: var(--nxt-space-inset-sm) var(--nxt-space-inset-md);
      border-block-end: var(--nxt-border-width-default) solid var(--nxt-color-border-default);
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
    .row {
      cursor: pointer;
    }
    .name {
      text-align: start;
    }
    .name__open {
      padding: 0;
      border: 0;
      background: none;
      color: var(--nxt-color-text-strong);
      font: var(--nxt-typography-label-md);
      text-align: start;
      cursor: pointer;
    }
    .name__open:hover {
      color: var(--nxt-color-text-link);
      text-decoration: underline;
    }
    .name__open:focus-visible {
      outline: var(--nxt-focus-ring-width) solid var(--nxt-focus-ring-color);
      outline-offset: var(--nxt-focus-ring-offset);
      border-radius: var(--nxt-radius-control);
    }
    .sub {
      color: var(--nxt-color-text-subtle);
      font: var(--nxt-typography-body-sm);
    }
    .footer {
      padding: var(--nxt-space-inset-sm) var(--nxt-space-inset-md);
      border-block-start: var(--nxt-border-width-default) solid var(--nxt-color-border-default);
      color: var(--nxt-color-text-subtle);
      font: var(--nxt-typography-body-sm);
    }
  `,
})
export class TemplateWorkflowExample {
  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  private readonly injector = inject(Injector);
  private readonly listHeader = viewChild(NxtPageHeader);
  protected readonly statusOptions = STATUS_OPTIONS;
  protected readonly requestTypes = REQUEST_TYPES;

  protected readonly workflows = signal<Workflow[]>(WORKFLOWS);
  protected readonly query = signal('');
  protected readonly filters = new NxtFilterState({ status: 'all' as string, types: [] as string[] });
  protected readonly sort = signal<NxtSortState>({ active: 'name', direction: 'asc' });
  protected readonly notice = signal<Notice | null>(null);
  protected readonly editing = signal<Editing | null>(null);
  protected readonly editorWide = signal(false);

  protected readonly rows = computed(() => {
    const { status, types } = this.filters.applied();
    const filtered = this.workflows().filter(
      (w) => nxtMatches(this.query(), w.name, w.type, w.scope) && (status === 'all' || w.status === status) && (!types.length || types.includes(w.type)),
    );
    const { active, direction } = this.sort();
    if (!direction) return filtered;
    const dir = direction === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => (active === 'updated' ? dateKey(a.updated) - dateKey(b.updated) : a.name.localeCompare(b.name, 'vi')) * dir);
  });
  protected readonly narrowed = computed(() => !!this.query().trim() || this.filters.activeCount() > 0);
  protected readonly chips = computed<NxtFilterChip[]>(() => {
    const { status, types } = this.filters.applied();
    return [
      ...(this.filters.isActive('status') ? [{ key: 'status', label: `Trạng thái: ${STATUS_OPTIONS.find((o) => o.value === status)?.label}` }] : []),
      ...(types.length ? [{ key: 'types', label: `Loại đơn: ${types.join(', ')}` }] : []),
    ];
  });
  protected readonly footer = computed(() => {
    const rows = this.rows();
    const active = rows.filter((w) => w.status === 'active').length;
    return `${rows.length} quy trình${this.narrowed() ? ' đang lọc' : ''} · ${active} đang áp dụng`;
  });

  protected statusOf(w: Workflow) {
    return STATUS_META[w.status];
  }

  protected hours(w: Workflow): string {
    return formatNumber(totalHours(w.steps));
  }

  protected clearAll() {
    this.query.set('');
    this.filters.clearAll();
  }

  protected undo(n: Notice) {
    n.undo?.();
    this.notice.set({ text: 'Đã hoàn tác.', tone: 'info' });
  }

  // ---------- editor ----------
  /** Mouse convenience: a click anywhere on the row opens the editor, except on its buttons. */
  protected onRowClick(event: MouseEvent, w: Workflow) {
    if ((event.target as Element).closest('button, a, input, label')) return;
    this.edit(w);
  }

  protected edit(w: Workflow) {
    this.notice.set(null);
    this.editing.set({ workflow: w, isNew: false });
  }

  /** A draft with one default step; it joins the list only when the user saves it. */
  protected create() {
    this.notice.set(null);
    this.editing.set({ workflow: blankWorkflow(), isNew: true });
  }

  /** Same steps under a new name, opened in the editor (e.g. to set it up for another department). */
  protected duplicate(w: Workflow) {
    this.notice.set(null);
    this.editing.set({ workflow: copyOf(w), isNew: true });
  }

  protected onSaved(saved: Workflow) {
    this.workflows.update((list) => (list.some((w) => w.id === saved.id) ? list.map((w) => (w.id === saved.id ? saved : w)) : [saved, ...list]));
  }

  /** Back to the list: report what happened, and put focus back on the workflow that was open. */
  protected closeEditor(message: string | null) {
    const id = this.editing()?.workflow.id;
    this.editing.set(null);
    this.editorWide.set(false);
    this.notice.set(message ? { text: message } : null);
    afterNextRender(
      () => {
        const target = this.host.querySelector<HTMLElement>(`[data-open="${id}"]`) ?? this.host.querySelector<HTMLElement>('[data-create]');
        if (target) target.focus();
        else this.listHeader()?.focusTitle();
      },
      { injector: this.injector },
    );
  }

  // ---------- list actions (undo instead of confirm) ----------
  /** Stopping a workflow only affects new requests: the ones already sent keep going with their version. */
  protected setStatus(w: Workflow, status: WorkflowStatus) {
    const before = this.workflows();
    this.workflows.update((list) => list.map((x) => (x.id === w.id ? { ...x, status, updated: TODAY, updatedBy: ME } : x)));
    this.notice.set({
      text:
        status === 'inactive'
          ? `Đã ngừng áp dụng “${w.name}”. Đơn đang chờ duyệt vẫn đi tiếp theo phiên bản ${w.version}.`
          : `Đã áp dụng lại “${w.name}” (phiên bản ${w.version}).`,
      undo: () => this.workflows.set(before),
    });
  }

  /** Only workflows not in force can be deleted; stop the workflow first. */
  protected remove(w: Workflow) {
    if (w.status === 'active') return;
    const before = this.workflows();
    const index = this.rows().findIndex((x) => x.id === w.id);
    this.workflows.update((list) => list.filter((x) => x.id !== w.id));
    this.notice.set({ text: `Đã xoá quy trình “${w.name}”.`, undo: () => this.workflows.set(before) });
    // The row (and the menu trigger focus would return to) is gone: continue on the row that took its place.
    afterNextRender(
      () => {
        const names = this.host.querySelectorAll<HTMLElement>('[data-open]');
        (names[Math.min(index, names.length - 1)] ?? this.host.querySelector<HTMLElement>('[data-create]'))?.focus();
      },
      { injector: this.injector },
    );
  }
}
