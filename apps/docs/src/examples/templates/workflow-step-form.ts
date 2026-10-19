import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { NxtCheckbox } from '@nxt/ui/checkbox';
import { NxtFormField, NxtInput } from '@nxt/ui/form-field';
import { NxtGrid, NxtSpan } from '@nxt/ui/layout';
import { NxtSegmented } from '@nxt/ui/segmented';
import {
  APPROVERS,
  ApproverKind,
  CONDITION_FIELDS,
  ConditionField,
  FIELDS_BY_TYPE,
  MODES,
  OPERATORS,
  OVERDUE,
  OverdueAction,
  PEOPLE,
  RequestType,
  StepCondition,
  StepErrors,
  WorkflowStep,
  defaultStepName,
} from './workflow-data';

const APPROVER_HINTS: Record<ApproverKind, string> = {
  manager: 'Quản lý trực tiếp của người gửi, lấy theo sơ đồ tổ chức.',
  head: 'Trưởng phòng của người gửi.',
  director: 'Giám đốc khối mà phòng của người gửi trực thuộc.',
  hr: 'Cả nhóm Phòng Nhân sự cùng nhận đơn.',
  person: 'Luôn là người này, dù người gửi ở phòng nào.',
};
const OVERDUE_HINTS: Record<OverdueAction, string> = {
  remind: 'Gửi lại thông báo mỗi 8 giờ cho đến khi có người xử lý.',
  escalate: 'Đơn chuyển cho cấp trên của người duyệt.',
  auto: 'Hệ thống duyệt thay và ghi rõ trong lịch sử đơn. Chỉ nên dùng cho bước ít rủi ro.',
};

/**
 * Settings of one approval step: name, approver, mode, deadline and what happens when it passes, condition,
 * approver permissions. Emits partial changes; the editor owns the data. Fields carry `data-field` so the
 * editor can focus the first invalid one.
 */
@Component({
  selector: 'example-workflow-step-form',
  imports: [NxtCheckbox, NxtFormField, NxtInput, NxtGrid, NxtSegmented, NxtSpan],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let s = step();
    <nxt-grid gap="md">
      <nxt-form-field label="Tên bước" required [error]="errors().name" nxtSpan="full">
        <input nxtInput data-field="name" autocomplete="off" [value]="s.name" (input)="changed.emit({ name: text($event) })" />
      </nxt-form-field>
      <nxt-form-field label="Người duyệt" [hint]="approverHints[s.approver]" [nxtSpan]="{ base: 12, md: s.approver === 'person' ? 6 : 12 }">
        <select nxtInput (change)="setApprover(text($event))">
          @for (a of approvers; track a.value) {
            <option [value]="a.value" [selected]="a.value === s.approver">{{ a.label }}</option>
          }
        </select>
      </nxt-form-field>
      @if (s.approver === 'person') {
        <nxt-form-field label="Người cụ thể" required [error]="errors().person" [nxtSpan]="{ base: 12, md: 6 }">
          <select nxtInput data-field="person" (change)="setPerson(text($event))">
            <option value="" [selected]="!s.person">Chọn người duyệt</option>
            @for (p of people; track p.id) {
              <option [value]="p.id" [selected]="p.id === s.person">{{ p.name }} · {{ p.title }}</option>
            }
          </select>
        </nxt-form-field>
      }
      <div class="field" nxtSpan="full">
        <!-- nxt-segmented names itself with a visually hidden legend; this is the visible label. -->
        <span class="field__label" aria-hidden="true">Cách duyệt</span>
        <nxt-segmented label="Cách duyệt" [options]="modes" [value]="s.mode" (valueChange)="changed.emit({ mode: $event ?? 'any' })" />
        <p class="hint">
          {{ s.mode === 'any' ? 'Đơn sang bước sau ngay khi một người trong nhóm duyệt.' : 'Đơn chỉ sang bước sau khi mọi người trong nhóm đều duyệt.' }}
        </p>
      </div>
      <nxt-form-field label="Thời hạn xử lý" required hint="Giờ làm việc, tính từ lúc đơn đến bước này." [error]="errors().hours" [nxtSpan]="{ base: 12, md: 5 }">
        <input nxtInput data-field="hours" inputmode="numeric" autocomplete="off" [value]="s.hours" (input)="changed.emit({ hours: text($event) })" />
        <span nxtSuffix>giờ</span>
      </nxt-form-field>
      <nxt-form-field label="Khi quá hạn" [hint]="overdueHints[s.overdue]" [nxtSpan]="{ base: 12, md: 7 }">
        <select nxtInput (change)="changed.emit({ overdue: $any(text($event)) })">
          @for (o of overdueOptions; track o.value) {
            <option [value]="o.value" [selected]="o.value === s.overdue">{{ o.label }}</option>
          }
        </select>
      </nxt-form-field>

      <fieldset class="group" nxtSpan="full">
        <legend class="group__title">Điều kiện</legend>
        <nxt-checkbox label="Chỉ áp dụng bước này khi…" [checked]="s.conditional && fields().length > 0" [disabled]="!fields().length" (checkedChange)="changed.emit({ conditional: $event })" />
        @if (!fields().length) {
          <p class="hint">Đơn {{ type().toLowerCase() }} không có số liệu để đặt điều kiện, nên bước này luôn được áp dụng.</p>
        } @else if (s.conditional) {
          <div class="condition">
            <nxt-form-field label="Trường" size="sm">
              <select nxtInput (change)="setCondition({ field: $any(text($event)) })">
                @for (f of fields(); track f) {
                  <option [value]="f" [selected]="f === s.condition.field">{{ conditionFields[f].label }}</option>
                }
              </select>
            </nxt-form-field>
            <nxt-form-field label="So sánh" size="sm">
              <select nxtInput (change)="setCondition({ op: $any(text($event)) })">
                @for (o of operators; track o.value) {
                  <option [value]="o.value" [selected]="o.value === s.condition.op">{{ o.label }}</option>
                }
              </select>
            </nxt-form-field>
            <nxt-form-field label="Giá trị" size="sm" required [error]="errors().value">
              <input nxtInput data-field="value" inputmode="numeric" autocomplete="off" [value]="s.condition.value" (input)="setCondition({ value: text($event) })" />
              <span nxtSuffix>{{ conditionFields[s.condition.field].unit }}</span>
            </nxt-form-field>
          </div>
          <p class="hint">Không thoả điều kiện thì đơn bỏ qua bước này và đi tiếp sang bước sau.</p>
        }
      </fieldset>

      <fieldset class="group" nxtSpan="full">
        <legend class="group__title">Quyền của người duyệt</legend>
        <p class="hint">Luôn được duyệt. Chọn thêm:</p>
        <nxt-checkbox label="Được trả lại (người gửi sửa rồi gửi lại)" [checked]="s.canReturn" (checkedChange)="changed.emit({ canReturn: $event })" />
        <nxt-checkbox label="Được từ chối" [checked]="s.canReject" (checkedChange)="changed.emit({ canReject: $event })" />
        <nxt-checkbox label="Được uỷ quyền cho người khác duyệt thay" [checked]="s.canDelegate" (checkedChange)="changed.emit({ canDelegate: $event })" />
      </fieldset>
    </nxt-grid>
  `,
  styles: `
    :host {
      display: block;
    }
    .field {
      display: grid;
      justify-items: start;
      gap: var(--nxt-space-gap-xs);
    }
    .field__label {
      color: var(--nxt-color-text-default);
      font: var(--nxt-typography-label-md);
    }
    .hint {
      color: var(--nxt-color-text-subtle);
      font: var(--nxt-typography-body-sm);
    }
    .group {
      display: grid;
      gap: var(--nxt-space-gap-xs);
      min-inline-size: 0;
      margin: 0;
      padding: 0;
      border: 0;
    }
    .group__title {
      margin-block-end: var(--nxt-space-gap-xs);
      padding: 0;
      color: var(--nxt-color-text-default);
      font: var(--nxt-typography-label-md);
    }
    .condition {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, var(--nxt-layout-item-min-sm)), 1fr));
      gap: var(--nxt-space-gap-sm);
      margin-block-start: var(--nxt-space-gap-xs);
    }
  `,
})
export class WorkflowStepForm {
  readonly step = input.required<WorkflowStep>();
  /** Request type of the workflow: decides which numbers a condition can test. */
  readonly type = input.required<RequestType>();
  /** Shown next to the fields once the user tried to apply. */
  readonly errors = input<StepErrors>({});
  readonly changed = output<Partial<WorkflowStep>>();

  protected readonly approvers = APPROVERS;
  protected readonly approverHints = APPROVER_HINTS;
  protected readonly people = PEOPLE;
  protected readonly modes = MODES;
  protected readonly overdueOptions = OVERDUE;
  protected readonly overdueHints = OVERDUE_HINTS;
  protected readonly operators = OPERATORS;
  protected readonly conditionFields = CONDITION_FIELDS;
  protected readonly fields = computed<ConditionField[]>(() => FIELDS_BY_TYPE[this.type()]);

  protected text(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  /** A name we generated follows the approver; a name the user typed is kept. */
  protected setApprover(value: string) {
    const s = this.step();
    const approver = value as ApproverKind;
    const person = approver === 'person' ? s.person : '';
    this.changed.emit({ approver, person, ...(this.generatedName(s) ? { name: defaultStepName(approver, person) } : {}) });
  }

  protected setPerson(person: string) {
    const s = this.step();
    this.changed.emit({ person, ...(this.generatedName(s) ? { name: defaultStepName('person', person) } : {}) });
  }

  protected setCondition(changes: Partial<StepCondition>) {
    this.changed.emit({ condition: { ...this.step().condition, ...changes } });
  }

  private generatedName(s: WorkflowStep): boolean {
    return !s.name.trim() || s.name === defaultStepName(s.approver, s.person);
  }
}

