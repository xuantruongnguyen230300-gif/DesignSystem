import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  afterNextRender,
  booleanAttribute,
  computed,
  inject,
  input,
  linkedSignal,
  output,
  signal,
} from '@angular/core';
import { NxtButton } from '@nxt/ui/button';
import { NxtCard } from '@nxt/ui/card';
import { NxtDescription, NxtDescriptions } from '@nxt/ui/descriptions';
import { NxtFormField, NxtInput } from '@nxt/ui/form-field';
import { NxtIcon } from '@nxt/ui/icon';
import { NxtGrid, NxtSpan } from '@nxt/ui/layout';
import { NxtBreadcrumbItem, NxtPageHeader } from '@nxt/ui/page-header';
import { NxtTag } from '@nxt/ui/tag';
import { NxtTimeline, NxtTimelineItem } from '@nxt/ui/timeline';
import {
  BLOCKS,
  COMPANY,
  CONDITION_FIELDS,
  ConditionField,
  DEPARTMENTS,
  FIELDS_BY_TYPE,
  ME,
  MODE_SUMMARY,
  REQUEST_TYPES,
  RequestType,
  STATUS_META,
  STEP_NEEDS,
  StepErrors,
  StepField,
  TODAY,
  Workflow,
  WorkflowStep,
  cloneConfig,
  deadlineText,
  editableConfig,
  formatNumber,
  inScope,
  newStep,
  parseNumber,
  sameConfig,
  simulate,
  stepName,
  stepErrors,
  totalHours,
} from './workflow-data';
import { WorkflowFlow } from './workflow-flow';
import { WorkflowStepForm } from './workflow-step-form';

/** Own width (px) from which the flow and the step form sit side by side and the page fills the screen. */
const WIDE_MIN = 880;
let nextId = 0;

interface Notice {
  text: string;
  tone: 'success' | 'danger' | 'info';
  undo?: () => void;
}

/** Something that blocks "Áp dụng": where it is and which field to focus. */
interface Problem {
  stepId: string | null;
  field: StepField | 'wf-name';
}

/**
 * Editor of one approval workflow: steps in order (move, insert, delete with undo), the selected step's
 * settings, a live simulation, "Lưu nháp" / "Áp dụng" with versioning, and a guard when leaving with changes.
 */
@Component({
  selector: 'example-workflow-editor',
  imports: [
    NxtButton,
    NxtCard,
    NxtDescription,
    NxtDescriptions,
    NxtFormField,
    NxtInput,
    NxtGrid,
    NxtIcon,
    NxtPageHeader,
    NxtSpan,
    NxtTag,
    NxtTimeline,
    NxtTimelineItem,
    WorkflowFlow,
    WorkflowStepForm,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.nxt-fill]': 'wide()', '[class.is-wide]': 'wide()' },
  template: `
    <nxt-page-header [title]="title()" [breadcrumb]="breadcrumb()" description="Ai duyệt, theo thứ tự nào, trong bao lâu, và khi nào thì bỏ qua một bước.">
      <nxt-tag nxtPageMeta dot [tone]="status().tone">{{ status().label }}</nxt-tag>
      <span nxtPageMeta class="meta">{{ versionText() }}</span>
      @if (dirty()) {
        <nxt-tag nxtPageMeta tone="info" icon="pencil">Có thay đổi chưa lưu</nxt-tag>
      }
      <ng-container ngProjectAs="[nxtPageActions]">
        <button nxtButton variant="ghost" type="button" data-back (click)="requestLeave()"><nxt-icon name="arrow-left" />Quay lại danh sách</button>
        <button nxtButton type="button" (click)="saveDraft()"><nxt-icon name="device-floppy" />Lưu nháp</button>
        <button nxtButton variant="primary" type="button" (click)="apply()"><nxt-icon name="check" />Áp dụng</button>
      </ng-container>
    </nxt-page-header>

    @if (leaving()) {
      <!-- No dialog component yet: an inline alert under the header, focus moves into it, Esc = "Ở lại". -->
      <div class="leave" role="group" [attr.aria-labelledby]="uid + '-leave'" [attr.aria-describedby]="uid + '-leave-text'" (keydown.escape)="stay()">
        <nxt-icon class="leave__icon" name="alert-triangle" />
        <div class="leave__text">
          <p class="leave__title" [id]="uid + '-leave'">Có thay đổi chưa lưu</p>
          <p [id]="uid + '-leave-text'">Rời trang bây giờ sẽ mất các thay đổi trong “{{ title() }}”. Lưu nháp để giữ lại mà chưa áp dụng.</p>
        </div>
        <div class="leave__actions">
          <button nxtButton variant="primary" size="sm" type="button" data-leave-first (click)="leaveSave()">Lưu nháp</button>
          <button nxtButton size="sm" type="button" (click)="leaveDiscard()">Bỏ thay đổi</button>
          <button nxtButton variant="ghost" size="sm" type="button" (click)="stay()">Ở lại</button>
        </div>
      </div>
    }

    <div class="notice" role="status" [attr.data-tone]="notice()?.tone">
      @if (notice(); as n) {
        <nxt-icon [name]="n.tone === 'danger' ? 'alert-circle' : n.tone === 'info' ? 'info-circle' : 'circle-check'" />
        <span>{{ n.text }}</span>
        @if (n.undo) {
          <button nxtButton variant="ghost" size="sm" type="button" (click)="undo(n)">Hoàn tác</button>
        }
      }
    </div>

    <nxt-card class="summary">
      <div class="summary__row">
        @if (infoOpen()) {
          <nxt-grid class="summary__main" gap="md">
            <nxt-form-field label="Tên quy trình" required [error]="nameErrorShown()" [nxtSpan]="{ base: 12, md: 5 }">
              <input nxtInput data-field="wf-name" autocomplete="off" [value]="work().name" (input)="setName(text($event))" />
            </nxt-form-field>
            <nxt-form-field label="Loại đơn" [hint]="base().version ? 'Không đổi được sau khi đã áp dụng. Nhân bản quy trình để dùng cho loại đơn khác.' : undefined" [nxtSpan]="{ base: 12, md: 3 }">
              @if (base().version) {
                <input nxtInput readonly [value]="work().type" />
              } @else {
                <select nxtInput (change)="setType(text($event))">
                  @for (t of requestTypes; track t) {
                    <option [value]="t" [selected]="t === work().type">{{ t }}</option>
                  }
                </select>
              }
            </nxt-form-field>
            <nxt-form-field label="Phạm vi áp dụng" hint="Phạm vi hẹp hơn được ưu tiên khi trùng loại đơn." [nxtSpan]="{ base: 12, md: 4 }">
              <select nxtInput (change)="setScope(text($event))">
                <option [value]="company" [selected]="work().scope === company">{{ company }}</option>
                <optgroup label="Khối">
                  @for (b of blocks; track b) {
                    <option [value]="b" [selected]="work().scope === b">{{ b }}</option>
                  }
                </optgroup>
                <optgroup label="Phòng ban">
                  @for (d of departments; track d.name) {
                    <option [value]="d.name" [selected]="work().scope === d.name">{{ d.name }}</option>
                  }
                </optgroup>
              </select>
            </nxt-form-field>
          </nxt-grid>
          <button nxtButton size="sm" type="button" data-info-toggle (click)="closeInfo()"><nxt-icon name="check" />Xong</button>
        } @else {
          <dl nxtDescriptions class="summary__main">
            <div nxtDescription label="Loại đơn">{{ work().type }}</div>
            <div nxtDescription label="Phạm vi áp dụng">{{ work().scope }}</div>
            <div nxtDescription label="Phiên bản đang áp dụng">{{ appliedText() }}</div>
            <div nxtDescription label="Cập nhật"><span class="nxt-tabular-nums">{{ base().updated }}</span> · {{ base().updatedBy }}</div>
          </dl>
          <button nxtButton variant="ghost" size="sm" type="button" data-info-toggle (click)="openInfo()"><nxt-icon name="pencil" />Sửa thông tin chung</button>
        }
      </div>
      @if (base().draft; as d) {
        <p class="note">
          <nxt-icon name="info-circle" size="sm" />Đang sửa bản nháp lưu ngày {{ d.saved }}. Phiên bản {{ base().version }} vẫn áp dụng cho đơn mới cho đến khi bấm “Áp dụng”.
        </p>
      }
    </nxt-card>

    <div class="columns">
      <nxt-card class="flow-card" title="Các bước duyệt" [subtitle]="flowSubtitle()" padding="none" [fill]="wide()">
        <div class="flow" role="region" aria-label="Các bước duyệt" [attr.tabindex]="wide() ? 0 : null">
          <example-workflow-flow [steps]="work().steps" [type]="work().type" [selectedId]="selected()?.id ?? null" [needs]="needs()" (selectStep)="select($event)" (move)="move($event.index, $event.delta)" (remove)="remove($event)" (add)="add($event)" />
        </div>
      </nxt-card>

      <div class="side" role="region" aria-label="Thiết lập bước và mô phỏng" [attr.tabindex]="wide() ? 0 : null">
        @if (selected(); as s) {
          <nxt-card [title]="'Thiết lập bước ' + (selectedIndex() + 1)" [subtitle]="stepName(s)">
            <example-workflow-step-form [step]="s" [type]="work().type" [errors]="errors()" (changed)="patch($event)" />
          </nxt-card>
        }

        <nxt-card title="Mô phỏng" subtitle="Thử một đơn giả định để xem đơn đi qua những bước nào, trước khi áp dụng.">
          <div class="sim">
            <nxt-grid gap="md">
              @for (f of fields(); track f) {
                <nxt-form-field [label]="conditionFields[f].label" [error]="simError(f)" [nxtSpan]="{ base: 12, md: 6 }">
                  <input nxtInput inputmode="numeric" autocomplete="off" [value]="simValues()[f]" (input)="setSim(f, text($event))" />
                  <span nxtSuffix>{{ conditionFields[f].unit }}</span>
                </nxt-form-field>
              }
              <nxt-form-field label="Phòng ban của người gửi" [nxtSpan]="{ base: 12, md: 6 }">
                <select nxtInput (change)="simDept.set(text($event))">
                  @for (d of departments; track d.name) {
                    <option [value]="d.name" [selected]="d.name === dept().name">{{ d.name }}</option>
                  }
                </select>
              </nxt-form-field>
            </nxt-grid>
            @if (outOfScope()) {
              <p class="note">
                <nxt-icon name="info-circle" size="sm" />{{ dept().name }} không thuộc phạm vi “{{ work().scope }}”: đơn thật sẽ đi theo quy trình khác. Kết quả dưới đây chỉ để tham khảo.
              </p>
            }
            <h3 class="section-title" [id]="uid + '-path'">Đường đi của đơn</h3>
            <nxt-timeline [attr.aria-labelledby]="uid + '-path'">
              <nxt-timeline-item title="Gửi đơn" icon="send">Nhân viên {{ dept().name }}</nxt-timeline-item>
              @for (p of path(); track p.step.id) {
                @if (p.applies) {
                  <nxt-timeline-item [title]="'Bước ' + (p.index + 1) + ' · ' + stepName(p.step)" [time]="deadlineText(p.step)" icon="user-check" tone="brand">
                    {{ p.who }} · {{ modeSummary[p.step.mode] }}
                  </nxt-timeline-item>
                } @else {
                  <nxt-timeline-item [title]="'Bước ' + (p.index + 1) + ' · ' + stepName(p.step)" time="Bỏ qua: điều kiện không thoả" icon="minus">{{ p.reason }}</nxt-timeline-item>
                }
              }
              <nxt-timeline-item title="Hoàn tất" icon="circle-check" tone="success">Thông báo kết quả cho người gửi</nxt-timeline-item>
            </nxt-timeline>
            <p class="total" role="status">{{ simSummary() }}</p>
          </div>
        </nxt-card>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: var(--nxt-space-gap-lg);
    }
    .meta {
      color: var(--nxt-color-text-subtle);
      font: var(--nxt-typography-label-sm);
    }

    /* ---------- leave guard ---------- */
    .leave {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--nxt-space-gap-md);
      padding: var(--nxt-space-inset-md) var(--nxt-space-inset-lg);
      border: var(--nxt-border-width-default) solid var(--nxt-color-border-default);
      border-inline-start: var(--nxt-border-width-strong) solid var(--nxt-color-icon-warning);
      border-radius: var(--nxt-radius-control);
      background: var(--nxt-color-bg-surface);
      color: var(--nxt-color-text-default);
      font: var(--nxt-typography-body-md);
      box-shadow: var(--nxt-elevation-raised);
    }
    .leave__icon {
      --nxt-icon-size: var(--nxt-size-icon-md);
      color: var(--nxt-color-icon-warning);
    }
    .leave__text {
      display: grid;
      flex: 1 1 var(--nxt-size-320);
      gap: var(--nxt-space-0-5);
    }
    .leave__title {
      color: var(--nxt-color-text-strong);
      font: var(--nxt-typography-label-md);
    }
    .leave__actions {
      display: flex;
      flex-wrap: wrap;
      gap: var(--nxt-space-gap-sm);
    }

    /* ---------- notice (role=status stays in the tree; when empty it takes no room and no gap) ---------- */
    .notice {
      --nxt-icon-size: var(--nxt-size-icon-sm);
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--nxt-space-gap-sm);
      padding: var(--nxt-space-inset-xs) var(--nxt-space-inset-md);
      border: var(--nxt-border-width-default) solid var(--nxt-color-border-default);
      border-radius: var(--nxt-radius-control);
      background: var(--nxt-color-bg-surface);
      color: var(--nxt-color-text-default);
      font: var(--nxt-typography-label-sm);
    }
    .notice:empty {
      position: absolute;
      padding: 0;
      border: 0;
    }
    .notice nxt-icon {
      color: var(--nxt-color-icon-success);
    }
    .notice[data-tone='danger'] {
      border-color: var(--nxt-color-border-danger);
    }
    .notice[data-tone='danger'] nxt-icon {
      color: var(--nxt-color-icon-danger);
    }
    .notice[data-tone='info'] nxt-icon {
      color: var(--nxt-color-icon-info);
    }

    /* ---------- summary ---------- */
    .summary {
      flex: none;
    }
    .summary__row {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-start;
      gap: var(--nxt-space-gap-md);
    }
    .summary__main {
      flex: 1 1 var(--nxt-size-480);
      min-inline-size: 0;
    }
    .note {
      --nxt-icon-size: var(--nxt-size-icon-sm);
      display: flex;
      align-items: flex-start;
      gap: var(--nxt-space-gap-xs);
      margin-block-start: var(--nxt-space-gap-md);
      color: var(--nxt-color-text-subtle);
      font: var(--nxt-typography-body-sm);
    }
    .sim .note {
      margin: 0;
    }

    /* ---------- columns: stacked; side by side and filling the screen when wide ---------- */
    .columns {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: var(--nxt-space-gap-lg);
      align-items: start;
    }
    .side {
      display: flex;
      flex-direction: column;
      gap: var(--nxt-space-gap-lg);
      min-inline-size: 0;
    }
    .side > nxt-card {
      flex: none;
    }
    :host(.is-wide) .columns {
      flex: 1 1 0;
      grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
      grid-template-rows: minmax(0, 1fr);
      align-items: stretch;
      /* Never squeezed to nothing on a short screen: below this the page scrolls instead. */
      min-block-size: var(--nxt-layout-scroll-region-min);
    }
    :host(.is-wide) .side,
    :host(.is-wide) .flow {
      min-block-size: 0;
      overflow: auto;
    }
    :host(.is-wide) .flow {
      flex: 1 1 0;
    }
    /* Room for the cards' shadow inside the scrolling column. */
    :host(.is-wide) .side {
      margin: calc(-1 * var(--nxt-space-1));
      padding: var(--nxt-space-1);
    }
    .flow:focus-visible,
    .side:focus-visible {
      outline: var(--nxt-focus-ring-width) solid var(--nxt-focus-ring-color);
      outline-offset: calc(-1 * var(--nxt-focus-ring-width));
    }

    /* ---------- flow ---------- */
    .flow {
      padding: 0 var(--nxt-space-inset-lg) var(--nxt-space-inset-lg);
    }

    /* ---------- simulation ---------- */
    .sim {
      display: grid;
      gap: var(--nxt-space-gap-md);
    }
    .section-title {
      color: var(--nxt-color-text-strong);
      font: var(--nxt-typography-label-md);
    }
    .total {
      padding-block-start: var(--nxt-space-gap-sm);
      border-block-start: var(--nxt-border-width-default) solid var(--nxt-color-border-default);
      color: var(--nxt-color-text-strong);
      font: var(--nxt-typography-label-md);
    }
  `,
})
export class WorkflowEditor {
  /** The workflow as last saved. */
  readonly workflow = input.required<Workflow>();
  /** Not in the list yet ("Thêm mới", "Nhân bản"): nothing is created until it is saved. */
  readonly isNew = input(false, { transform: booleanAttribute });
  /** "Lưu nháp" / "Áp dụng" — the list replaces (or adds) this workflow. */
  readonly saved = output<Workflow>();
  /** Back to the list, with a message for it (null: nothing to report). */
  readonly closed = output<string | null>();
  /** Side by side (wide) or stacked: the page fills the screen only when wide. */
  readonly wideChange = output<boolean>();

  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  private readonly injector = inject(Injector);
  protected readonly uid = `wf-editor-${nextId++}`;

  protected readonly requestTypes = REQUEST_TYPES;
  protected readonly modeSummary = MODE_SUMMARY;
  protected readonly conditionFields = CONDITION_FIELDS;
  protected readonly departments = DEPARTMENTS;
  protected readonly blocks = BLOCKS;
  protected readonly company = COMPANY;
  protected readonly deadlineText = deadlineText;
  protected readonly stepName = stepName;

  /** Last saved state; `work` is what the user is editing (the saved draft, if any, else the applied version). */
  protected readonly base = linkedSignal(() => this.workflow());
  protected readonly work = linkedSignal(() => editableConfig(this.workflow()));
  protected readonly stored = linkedSignal(() => !this.isNew());
  protected readonly infoOpen = linkedSignal(() => this.isNew());
  protected readonly selectedId = linkedSignal(() => (this.workflow().draft ?? this.workflow()).steps[0]?.id ?? '');
  protected readonly showErrors = signal(false);
  protected readonly nameChecked = signal(false);
  protected readonly leaving = signal(false);
  protected readonly notice = signal<Notice | null>(null);
  protected readonly wide = signal(false);
  /** Told to the list when the user goes back: "Đã áp dụng phiên bản 4 …". */
  private savedMessage: string | null = null;

  protected readonly title = computed(() => this.work().name.trim() || 'Quy trình chưa đặt tên');
  protected readonly breadcrumb = computed<NxtBreadcrumbItem[]>(() => [{ label: 'Thiết lập' }, { label: 'Quy trình duyệt' }, { label: this.title() }]);
  protected readonly status = computed(() => STATUS_META[this.base().status]);
  protected readonly versionText = computed(() => {
    const b = this.base();
    if (!this.stored()) return 'Mới, chưa lưu';
    return b.version ? `Phiên bản ${b.version}` : 'Chưa áp dụng lần nào';
  });
  protected readonly appliedText = computed(() => {
    const b = this.base();
    if (!b.version) return 'Chưa có';
    return b.status === 'inactive' ? `Phiên bản ${b.version} (đã ngừng áp dụng)` : `Phiên bản ${b.version}`;
  });
  protected readonly dirty = computed(() => !sameConfig(this.work(), editableConfig(this.base())));
  protected readonly fields = computed(() => FIELDS_BY_TYPE[this.work().type]);
  protected readonly flowSubtitle = computed(() => `${this.work().steps.length} bước · tối đa ${formatNumber(totalHours(this.work().steps))} giờ`);

  protected readonly selected = computed<WorkflowStep | null>(() => {
    const steps = this.work().steps;
    return steps.find((s) => s.id === this.selectedId()) ?? steps[0] ?? null;
  });
  protected readonly selectedIndex = computed(() => this.work().steps.findIndex((s) => s.id === this.selected()?.id));

  // ---------- validation ----------
  private readonly nameError = computed(() => (this.work().name.trim() ? null : 'Nhập tên quy trình, ví dụ “Nghỉ phép · Khối Vận hành”.'));
  protected readonly nameErrorShown = computed(() => (this.showErrors() || this.nameChecked() ? this.nameError() : null));
  private readonly stepErrorMap = computed(() => new Map(this.work().steps.map((s) => [s.id, stepErrors(s, this.work().type)])));
  /** Errors of the selected step, shown once the user tried to apply. */
  protected readonly errors = computed<StepErrors>(() => {
    const s = this.selected();
    return this.showErrors() && s ? (this.stepErrorMap().get(s.id) ?? {}) : {};
  });
  /** Per step id: what is missing ("cần chọn người duyệt"), once the user tried to apply. */
  protected readonly needs = computed(() => {
    const map = new Map<string, string>();
    if (!this.showErrors()) return map;
    for (const [id, errors] of this.stepErrorMap()) {
      const first = Object.keys(errors)[0] as StepField | undefined;
      if (first) map.set(id, STEP_NEEDS[first]);
    }
    return map;
  });
  private readonly problems = computed<Problem[]>(() => {
    const list: Problem[] = this.nameError() ? [{ stepId: null, field: 'wf-name' }] : [];
    for (const s of this.work().steps) {
      const first = Object.keys(this.stepErrorMap().get(s.id) ?? {})[0] as StepField | undefined;
      if (first) list.push({ stepId: s.id, field: first });
    }
    return list;
  });

  // ---------- simulation ----------
  protected readonly simValues = signal<Record<ConditionField, string>>({ days: '2', hours: '3', tripDays: '2', amount: '8.000.000' });
  protected readonly simDept = linkedSignal(() => (DEPARTMENTS.find((d) => inScope(d, this.workflow().scope)) ?? DEPARTMENTS[0]).name);
  protected readonly dept = computed(() => DEPARTMENTS.find((d) => d.name === this.simDept()) ?? DEPARTMENTS[0]);
  protected readonly outOfScope = computed(() => !inScope(this.dept(), this.work().scope));
  protected readonly path = computed(() => {
    const values: Partial<Record<ConditionField, number>> = {};
    for (const f of this.fields()) {
      const n = parseNumber(this.simValues()[f]);
      values[f] = Number.isNaN(n) ? 0 : n;
    }
    return simulate(this.work(), values, this.dept());
  });
  protected readonly simSummary = computed(() => {
    const applied = this.path().filter((p) => p.applies);
    const hours = totalHours(applied.map((p) => p.step));
    const days = (hours / 8).toLocaleString('vi-VN', { maximumFractionDigits: 1 });
    return `Đơn này qua ${applied.length}/${this.path().length} bước · tổng thời hạn tối đa ${formatNumber(hours)} giờ (khoảng ${days} ngày làm việc).`;
  });

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      // Container-style breakpoint: the editor's own width decides, wherever it is rendered.
      const observer = new ResizeObserver(([entry]) => {
        const wide = entry.contentRect.width >= WIDE_MIN;
        if (wide === this.wide()) return;
        this.wide.set(wide);
        this.wideChange.emit(wide);
      });
      observer.observe(this.host);
      destroyRef.onDestroy(() => observer.disconnect());

      // The list was replaced by the editor: start at the page title (new workflow: at its name).
      if (this.isNew()) {
        const name = this.host.querySelector<HTMLInputElement>('[data-field="wf-name"]');
        name?.focus();
        name?.select();
        return;
      }
      const heading = this.host.querySelector<HTMLElement>('.nxt-page-header__title');
      if (heading) {
        heading.tabIndex = -1;
        heading.focus();
      }
    });
  }

  protected text(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  protected simError(f: ConditionField): string | null {
    const raw = this.simValues()[f];
    return raw.trim() && Number.isNaN(parseNumber(raw)) ? `Nhập một số, ví dụ ${CONDITION_FIELDS[f].example}.` : null;
  }

  protected setSim(f: ConditionField, value: string) {
    this.simValues.update((v) => ({ ...v, [f]: value }));
  }

  // ---------- general info ----------
  protected openInfo() {
    this.infoOpen.set(true);
    this.focusLater('[data-field="wf-name"]');
  }

  protected closeInfo() {
    this.nameChecked.set(true);
    if (this.nameError()) {
      this.focusLater('[data-field="wf-name"]');
      return;
    }
    this.infoOpen.set(false);
    this.focusLater('[data-info-toggle]');
  }

  protected setName(name: string) {
    this.work.update((w) => ({ ...w, name }));
  }

  /** Conditions follow the request type: a leave workflow cannot test an advance amount. */
  protected setType(value: string) {
    const type = value as RequestType;
    const fields = FIELDS_BY_TYPE[type];
    this.work.update((w) => ({
      ...w,
      type,
      steps: w.steps.map((s) =>
        fields.includes(s.condition.field) ? s : { ...s, conditional: s.conditional && fields.length > 0, condition: { ...s.condition, field: fields[0] ?? s.condition.field } },
      ),
    }));
  }

  protected setScope(scope: string) {
    this.work.update((w) => ({ ...w, scope }));
  }

  // ---------- steps ----------
  private updateSteps(fn: (steps: WorkflowStep[]) => WorkflowStep[]) {
    this.work.update((w) => ({ ...w, steps: fn(w.steps) }));
  }

  protected select(id: string) {
    this.selectedId.set(id);
  }

  protected patch(changes: Partial<WorkflowStep>) {
    const id = this.selected()?.id;
    if (id) this.updateSteps((steps) => steps.map((s) => (s.id === id ? { ...s, ...changes } : s)));
  }

  protected move(index: number, delta: -1 | 1) {
    const steps = this.work().steps;
    const to = index + delta;
    if (to < 0 || to >= steps.length) return;
    const s = steps[index];
    this.updateSteps((list) => {
      const next = [...list];
      next.splice(index, 1);
      next.splice(to, 0, s);
      return next;
    });
    this.notice.set({ text: `Đã chuyển “${stepName(s)}” thành bước ${to + 1}.`, tone: 'info' });
    // @for moves the DOM node, which drops focus: put it back on the same button of the same step.
    this.focusLater(`[data-move="${delta < 0 ? 'up' : 'down'}"][data-step="${s.id}"]`);
  }

  /** Insert a step and select it; focus goes to its name so the user can carry on typing. */
  protected add(at: number) {
    const s = newStep(this.work().type);
    this.updateSteps((list) => [...list.slice(0, at), s, ...list.slice(at)]);
    this.selectedId.set(s.id);
    this.notice.set({ text: `Đã thêm bước ${at + 1}. Thiết lập bước trong khung “Thiết lập bước ${at + 1}”.`, tone: 'info' });
    this.focusLater('[data-field="name"]');
  }

  /** Delete without asking; "Hoàn tác" puts the step back where it was. */
  protected remove(index: number) {
    const steps = this.work().steps;
    if (steps.length <= 1) return;
    const s = steps[index];
    this.updateSteps((list) => list.filter((x) => x.id !== s.id));
    const neighbour = this.work().steps[Math.min(index, this.work().steps.length - 1)];
    if (this.selectedId() === s.id) this.selectedId.set(neighbour.id);
    this.notice.set({
      text: `Đã xoá bước ${index + 1} “${stepName(s)}”.`,
      tone: 'success',
      undo: () => {
        this.updateSteps((list) => [...list.slice(0, index), s, ...list.slice(index)]);
        this.selectedId.set(s.id);
        this.focusLater(`[data-select="${s.id}"]`);
      },
    });
    this.focusLater(`[data-select="${neighbour.id}"]`);
  }

  protected undo(n: Notice) {
    n.undo?.();
    this.notice.set({ text: 'Đã hoàn tác.', tone: 'info' });
  }

  // ---------- save ----------
  private commit(next: Workflow, message: string) {
    this.base.set(next);
    this.stored.set(true);
    this.saved.emit(next);
    this.savedMessage = message;
  }

  /** Drafts may be incomplete (only the name is required); an applied version stays in force. */
  protected saveDraft(): boolean {
    if (this.nameError()) {
      this.nameChecked.set(true);
      this.infoOpen.set(true);
      this.notice.set({ text: 'Chưa lưu được: quy trình cần có tên.', tone: 'danger' });
      this.focusLater('[data-field="wf-name"]');
      return false;
    }
    const b = this.base();
    if (this.stored() && !this.dirty()) {
      this.notice.set({ text: 'Không có thay đổi nào cần lưu.', tone: 'info' });
      return false;
    }
    const config = cloneConfig(this.work());
    const stamp = { updated: TODAY, updatedBy: ME };
    const next: Workflow = b.version === 0 ? { ...b, ...config, ...stamp, status: 'draft', draft: undefined } : { ...b, ...stamp, draft: { ...config, saved: TODAY } };
    const text =
      b.version === 0
        ? 'Đã lưu bản nháp. Quy trình chưa có hiệu lực cho đến khi bấm “Áp dụng”.'
        : b.status === 'active'
          ? `Đã lưu bản nháp; phiên bản ${b.version} vẫn đang áp dụng.`
          : 'Đã lưu bản nháp; quy trình vẫn đang ngừng áp dụng.';
    const kept = b.version && b.status === 'active' ? `; phiên bản ${b.version} vẫn đang áp dụng` : '';
    this.commit(next, `Đã lưu bản nháp “${next.draft?.name ?? next.name}”${kept}.`);
    this.notice.set({ text, tone: 'success' });
    return true;
  }

  /** Validate everything, then publish a new version. Requests already sent keep the version they started with. */
  protected apply() {
    this.showErrors.set(true);
    const problems = this.problems();
    if (problems.length) {
      const steps = problems.filter((p) => p.stepId).length;
      const parts = [...(this.nameError() ? ['quy trình cần có tên'] : []), ...(steps ? [`${steps} bước cần sửa`] : [])];
      this.notice.set({ text: `Chưa áp dụng được: ${parts.join(', ')}. Bước cần sửa được đánh dấu trong danh sách các bước.`, tone: 'danger' });
      this.goTo(problems[0]);
      return;
    }
    const b = this.base();
    const changed = b.version === 0 || !sameConfig(this.work(), cloneConfig(b));
    const stamp = { updated: TODAY, updatedBy: ME, draft: undefined };
    if (!changed && b.status === 'active') {
      this.notice.set({ text: `Phiên bản ${b.version} đang áp dụng; không có thay đổi nào để áp dụng.`, tone: 'info' });
      return;
    }
    if (!changed) {
      this.commit({ ...b, ...stamp, status: 'active' }, `Đã áp dụng lại “${b.name}” (phiên bản ${b.version}).`);
      this.notice.set({ text: `Đã áp dụng lại phiên bản ${b.version}.`, tone: 'success' });
      return;
    }
    const next: Workflow = { ...b, ...cloneConfig(this.work()), ...stamp, status: 'active', version: b.version + 1 };
    this.commit(next, `Đã áp dụng phiên bản ${next.version} của “${next.name}”.`);
    this.showErrors.set(false);
    this.notice.set({
      text: b.version
        ? `Đã áp dụng phiên bản ${next.version}. Đơn đang chờ duyệt vẫn đi theo phiên bản ${b.version}.`
        : `Đã áp dụng phiên bản 1. Đơn ${next.type.toLowerCase()} gửi từ bây giờ đi theo quy trình này.`,
      tone: 'success',
    });
  }

  private goTo(p: Problem) {
    if (p.stepId === null) {
      this.infoOpen.set(true);
    } else {
      this.selectedId.set(p.stepId);
    }
    // aria-invalid and the error text appear in the next render — focus after it.
    this.focusLater(`[data-field="${p.field}"]`);
  }

  // ---------- leaving ----------
  protected requestLeave() {
    if (!this.dirty()) {
      this.closed.emit(this.savedMessage);
      return;
    }
    this.leaving.set(true);
    this.focusLater('[data-leave-first]');
  }

  protected leaveSave() {
    this.leaving.set(false);
    if (this.saveDraft()) this.closed.emit(this.savedMessage);
  }

  protected leaveDiscard() {
    this.closed.emit(this.stored() ? `Đã bỏ các thay đổi chưa lưu của “${this.base().name}”.` : null);
  }

  protected stay() {
    this.leaving.set(false);
    this.focusLater('[data-back]');
  }

  private focusLater(selector: string) {
    afterNextRender(() => this.host.querySelector<HTMLElement>(selector)?.focus(), { injector: this.injector });
  }
}
