import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { NxtButton } from '@nxt/ui/button';
import { NxtIcon } from '@nxt/ui/icon';
import { NxtTooltip } from '@nxt/ui/tooltip';
import { FIELDS_BY_TYPE, MODE_SUMMARY, RequestType, WorkflowStep, approverText, conditionText, deadlineText, stepName } from './workflow-data';

/**
 * The steps of a workflow as a vertical flow: Người gửi đơn → steps → Hoàn tất. Each step is a button that
 * selects it (aria-current="step"), with named buttons to move it up/down or delete it, and "Thêm bước" after
 * it — no drag-only interaction. Buttons carry data-select / data-move so the editor can restore focus.
 */
@Component({
  selector: 'example-workflow-flow',
  imports: [NxtButton, NxtIcon, NxtTooltip],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ol class="flow__list" role="list">
      <li class="node node--start">
        <span class="node__icon" aria-hidden="true"><nxt-icon name="send" /></span>
        <span class="node__text">
          <span class="node__title">Người gửi đơn</span>
          <span class="node__sub">Nhân viên gửi đơn {{ type().toLowerCase() }}</span>
        </span>
      </li>
      @for (s of steps(); track s.id; let i = $index; let last = $last) {
        <li>
          <div class="step" [class.is-selected]="s.id === selectedId()" [class.is-invalid]="needs().has(s.id)">
            <button type="button" class="step__select" [attr.data-select]="s.id" [attr.aria-current]="s.id === selectedId() ? 'step' : null" (click)="selectStep.emit(s.id)">
              <span class="step__num"><span class="nxt-visually-hidden">Bước </span>{{ i + 1 }}</span>
              <span class="step__body">
                <span class="step__name">{{ stepName(s) }}</span>
                <span class="step__line"><nxt-icon name="user" />{{ approverText(s) }} · {{ modeSummary[s.mode] }}</span>
                <span class="step__line"><nxt-icon name="clock" />{{ deadlineText(s) }}</span>
                @if (s.conditional && fields().length) {
                  <span class="chip chip--info"><nxt-icon name="arrows-split" />{{ conditionText(s.condition) }}</span>
                }
                @if (needs().get(s.id); as missing) {
                  <span class="chip chip--danger"><nxt-icon name="alert-circle" />Bước {{ i + 1 }} {{ missing }}</span>
                }
              </span>
            </button>
            <div class="step__tools">
              <button nxtIconButton size="sm" variant="ghost" type="button" data-move="up" [attr.data-step]="s.id" [attr.aria-label]="'Đưa bước ' + (i + 1) + ' lên'" [nxtTooltip]="'Đưa bước ' + (i + 1) + ' lên'" [disabled]="i === 0" (click)="move.emit({ index: i, delta: -1 })">
                <nxt-icon name="arrow-up" />
              </button>
              <button nxtIconButton size="sm" variant="ghost" type="button" data-move="down" [attr.data-step]="s.id" [attr.aria-label]="'Đưa bước ' + (i + 1) + ' xuống'" [nxtTooltip]="'Đưa bước ' + (i + 1) + ' xuống'" [disabled]="last" (click)="move.emit({ index: i, delta: 1 })">
                <nxt-icon name="arrow-down" />
              </button>
              <button
                nxtIconButton
                size="sm"
                variant="ghost"
                type="button"
                [attr.aria-label]="'Xoá bước ' + (i + 1)"
                [nxtTooltip]="steps().length === 1 ? 'Không xoá được: quy trình cần ít nhất một bước' : 'Xoá bước ' + (i + 1)"
                [disabled]="steps().length === 1"
                (click)="remove.emit(i)"
              >
                <nxt-icon name="trash" />
              </button>
            </div>
          </div>
          <div class="connector">
            <button nxtButton variant="ghost" size="sm" type="button" (click)="add.emit(i + 1)">
              <nxt-icon name="plus" />Thêm bước<span class="nxt-visually-hidden"> sau bước {{ i + 1 }}</span>
            </button>
          </div>
        </li>
      }
      <li class="node node--end">
        <span class="node__icon" aria-hidden="true"><nxt-icon name="circle-check" /></span>
        <span class="node__text">
          <span class="node__title">Hoàn tất</span>
          <span class="node__sub">Thông báo kết quả cho người gửi</span>
        </span>
      </li>
    </ol>
  `,
  styles: `
    :host {
      display: block;
    }
    .flow__list {
      position: relative;
      display: grid;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    /* The connector line behind the nodes and steps, through the centre of the number circles. */
    .flow__list::before {
      position: absolute;
      inset-block: var(--nxt-space-4);
      inset-inline-start: calc(var(--nxt-space-inset-sm) + var(--nxt-border-width-default) + var(--nxt-size-control-sm) / 2);
      margin-inline-start: calc(var(--nxt-border-width-strong) / -2);
      border-inline-start: var(--nxt-border-width-strong) solid var(--nxt-color-border-default);
      content: '';
    }
    .node {
      position: relative;
      display: flex;
      align-items: center;
      gap: var(--nxt-space-gap-sm);
      padding: var(--nxt-space-inset-xs) var(--nxt-space-inset-sm);
      border: var(--nxt-border-width-default) solid transparent;
    }
    .node--start {
      margin-block-end: var(--nxt-space-gap-md);
    }
    .node__icon {
      --nxt-icon-size: var(--nxt-size-icon-sm);
      display: inline-grid;
      flex: none;
      place-items: center;
      inline-size: var(--nxt-size-control-sm);
      block-size: var(--nxt-size-control-sm);
      border-radius: var(--nxt-radius-full);
      background: var(--nxt-color-bg-muted);
      color: var(--nxt-color-icon-default);
    }
    .node--end .node__icon {
      background: var(--nxt-color-bg-success-subtle);
      color: var(--nxt-color-icon-success);
    }
    .node__text {
      display: grid;
      min-inline-size: 0;
    }
    .node__title {
      color: var(--nxt-color-text-strong);
      font: var(--nxt-typography-label-md);
    }
    .node__sub {
      color: var(--nxt-color-text-subtle);
      font: var(--nxt-typography-body-sm);
    }
    .step {
      position: relative;
      display: flex;
      align-items: flex-start;
      border: var(--nxt-border-width-default) solid var(--nxt-color-border-default);
      border-radius: var(--nxt-radius-control);
      background: var(--nxt-color-bg-surface);
    }
    .step:hover {
      border-color: var(--nxt-color-border-strong);
    }
    .step.is-selected {
      border-color: var(--nxt-color-border-selected);
      background: var(--nxt-color-bg-selected);
    }
    .step.is-invalid {
      border-color: var(--nxt-color-border-danger);
    }
    .step__select {
      display: flex;
      flex: 1;
      align-items: flex-start;
      gap: var(--nxt-space-gap-sm);
      min-inline-size: 0;
      padding: var(--nxt-space-inset-sm);
      border: 0;
      border-radius: var(--nxt-radius-control);
      background: transparent;
      color: inherit;
      font: inherit;
      text-align: start;
      cursor: pointer;
    }
    .step__select:focus-visible {
      outline: var(--nxt-focus-ring-width) solid var(--nxt-focus-ring-color);
      outline-offset: calc(-1 * var(--nxt-focus-ring-width));
    }
    .step__num {
      display: inline-grid;
      flex: none;
      place-items: center;
      inline-size: var(--nxt-size-control-sm);
      block-size: var(--nxt-size-control-sm);
      border-radius: var(--nxt-radius-full);
      background: var(--nxt-color-bg-muted);
      color: var(--nxt-color-text-default);
      font: var(--nxt-typography-label-sm);
      font-variant-numeric: tabular-nums;
    }
    .is-selected .step__num {
      background: var(--nxt-color-bg-primary);
      color: var(--nxt-color-text-on-primary);
    }
    .step__body {
      display: grid;
      gap: var(--nxt-space-0-5);
      min-inline-size: 0;
    }
    .step__name {
      color: var(--nxt-color-text-strong);
      font: var(--nxt-typography-label-md);
    }
    .step__line {
      --nxt-icon-size: var(--nxt-size-icon-sm);
      display: flex;
      align-items: flex-start;
      gap: var(--nxt-space-1);
      color: var(--nxt-color-text-subtle);
      font: var(--nxt-typography-body-sm);
    }
    .step__line nxt-icon {
      flex: none;
      margin-block-start: var(--nxt-space-0-5);
    }
    /* text.subtle is only checked on neutral surfaces: the selected card uses the default text colour. */
    .is-selected .step__line {
      color: var(--nxt-color-text-default);
    }
    .chip {
      --nxt-icon-size: var(--nxt-size-icon-sm);
      display: inline-flex;
      align-items: center;
      justify-self: start;
      gap: var(--nxt-space-1);
      max-inline-size: 100%;
      margin-block-start: var(--nxt-space-0-5);
      padding: var(--nxt-space-0-5) var(--nxt-space-2);
      border-radius: var(--nxt-radius-pill);
      font: var(--nxt-typography-label-sm);
    }
    .chip nxt-icon {
      flex: none;
    }
    .chip--info {
      background: var(--nxt-color-bg-info-subtle);
      color: var(--nxt-color-text-info);
    }
    .chip--danger {
      background: var(--nxt-color-bg-danger-subtle);
      color: var(--nxt-color-text-danger);
    }
    .step__tools {
      display: flex;
      flex: none;
      flex-direction: column;
      gap: var(--nxt-space-0-5);
      padding: var(--nxt-space-inset-xs);
    }
    .connector {
      display: flex;
      align-items: center;
      min-block-size: var(--nxt-size-control-md);
      padding-block: var(--nxt-space-1);
      padding-inline-start: calc(var(--nxt-space-inset-sm) + var(--nxt-size-control-sm) + var(--nxt-space-gap-xs));
    }
  `,
})
export class WorkflowFlow {
  readonly steps = input.required<WorkflowStep[]>();
  readonly type = input.required<RequestType>();
  readonly selectedId = input<string | null>(null);
  /** Per step id: what is missing, shown as "Bước 3 cần chọn người duyệt". */
  readonly needs = input<ReadonlyMap<string, string>>(new Map());
  readonly selectStep = output<string>();
  readonly move = output<{ index: number; delta: -1 | 1 }>();
  readonly remove = output<number>();
  /** Insert a new step at this index. */
  readonly add = output<number>();

  protected readonly modeSummary = MODE_SUMMARY;
  protected readonly stepName = stepName;
  protected readonly approverText = approverText;
  protected readonly deadlineText = deadlineText;
  protected readonly conditionText = conditionText;
  protected readonly fields = computed(() => FIELDS_BY_TYPE[this.type()]);
}
