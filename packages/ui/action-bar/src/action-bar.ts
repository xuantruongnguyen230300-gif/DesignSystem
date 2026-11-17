import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  ViewEncapsulation,
  afterNextRender,
  computed,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { NxtButton } from '@nxt/ui/button';
import { NxtIcon } from '@nxt/ui/icon';
import { NxtPopover, NxtPopoverTrigger } from '@nxt/ui/popover';
import { NxtTooltip } from '@nxt/ui/tooltip';

/** Severity of a message, most severe first: error > warning > info > success. */
export type NxtMessageType = 'error' | 'warning' | 'info' | 'success';

/** One message of a form or of the last action (SAP Fiori: message popover item). */
export interface NxtMessage {
  id: string;
  type: NxtMessageType;
  /** Short sentence, the same as under the field: "Nhập ngày kết thúc hợp đồng." */
  title: string;
  /** Where, or how to fix it: "Hợp đồng · Ngày kết thúc". */
  description?: string;
  /** The field to fix: an element id, or the element. Without it the message is plain text. */
  target?: string | HTMLElement;
}

/** Texts of the message button, popover and list (Vietnamese by default; override for other languages). */
export interface NxtMessageLabels {
  /** Popover title and start of the button's accessible name. */
  title: string;
  error: string;
  warning: string;
  info: string;
  success: string;
  /** Accessible name and tooltip of the message button, e.g. "Thông báo: 2 lỗi, 1 cảnh báo". */
  summary: (counts: Record<NxtMessageType, number>) => string;
}

const ORDER: readonly NxtMessageType[] = ['error', 'warning', 'info', 'success'];
const ICONS = { error: 'alert-circle', warning: 'alert-triangle', info: 'info-circle', success: 'circle-check' } as const;

const DEFAULT_LABELS: Omit<NxtMessageLabels, 'summary'> = {
  title: 'Thông báo',
  error: 'Lỗi',
  warning: 'Cảnh báo',
  info: 'Thông tin',
  success: 'Thành công',
};

function resolveLabels(overrides: Partial<NxtMessageLabels>): NxtMessageLabels {
  const base = { ...DEFAULT_LABELS, ...overrides };
  const summary =
    overrides.summary ??
    ((counts: Record<NxtMessageType, number>) => {
      const parts = ORDER.filter((t) => counts[t] > 0).map((t) => `${counts[t]} ${base[t].toLocaleLowerCase('vi')}`);
      return `${base.title}: ${parts.join(', ')}`;
    });
  return { ...base, summary };
}

function countByType(messages: readonly NxtMessage[]): Record<NxtMessageType, number> {
  const counts = { error: 0, warning: 0, info: 0, success: 0 };
  for (const m of messages) counts[m.type]++;
  return counts;
}

/**
 * Bring the user to the field of a message: find it (id or element), scroll it to the middle of the screen
 * and focus it — or the first control inside it when the element itself is not focusable.
 * Returns false when there is nothing to focus.
 */
export function nxtFocusMessageTarget(target: string | HTMLElement | undefined): boolean {
  const el = typeof target === 'string' ? document.getElementById(target) : target;
  if (!el?.isConnected) return false;
  const focusable = el.matches(FOCUSABLE) ? el : el.querySelector<HTMLElement>(FOCUSABLE);
  const goal = focusable ?? el;
  if (!focusable && !goal.hasAttribute('tabindex')) goal.setAttribute('tabindex', '-1');
  goal.scrollIntoView?.({ block: 'center', inline: 'nearest' });
  goal.focus({ preventScroll: true });
  return document.activeElement === goal;
}

const FOCUSABLE = 'input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [href], [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';

let nextId = 0;

/**
 * Messages grouped by type (errors first). Items with a `target` are buttons that emit `select`;
 * the others are plain text (messages not tied to a field). Used inside the action bar's popover.
 */
@Component({
  selector: 'nxt-message-list',
  imports: [NxtIcon],
  template: `
    @for (g of groups(); track g.type) {
      <div class="nxt-message-list__group">
        <p class="nxt-message-list__heading" [id]="uid + '-' + g.type">{{ g.label }} ({{ g.items.length }})</p>
        <ul class="nxt-message-list__items" role="list" [attr.aria-labelledby]="uid + '-' + g.type">
          @for (m of g.items; track m.id) {
            <li>
              @if (m.target) {
                <button type="button" class="nxt-message-list__item" [attr.data-type]="m.type" (click)="select.emit(m)">
                  <nxt-icon class="nxt-message-list__icon" [name]="icons[m.type]" />
                  <span class="nxt-message-list__text">
                    <span class="nxt-message-list__title"><span class="nxt-visually-hidden">{{ g.label }}: </span>{{ m.title }}</span>
                    @if (m.description) {
                      <span class="nxt-message-list__description">{{ m.description }}</span>
                    }
                  </span>
                </button>
              } @else {
                <div class="nxt-message-list__item" [attr.data-type]="m.type">
                  <nxt-icon class="nxt-message-list__icon" [name]="icons[m.type]" />
                  <span class="nxt-message-list__text">
                    <span class="nxt-message-list__title"><span class="nxt-visually-hidden">{{ g.label }}: </span>{{ m.title }}</span>
                    @if (m.description) {
                      <span class="nxt-message-list__description">{{ m.description }}</span>
                    }
                  </span>
                </div>
              }
            </li>
          }
        </ul>
      </div>
    }
  `,
  styleUrl: './action-bar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'nxt-message-list' },
})
export class NxtMessageList {
  /** Messages to list; grouped error → warning → info → success. */
  readonly messages = input.required<readonly NxtMessage[]>();
  /** Group names (override for other languages). */
  readonly labels = input<Partial<NxtMessageLabels>>({});
  /** A message with a target was chosen. */
  readonly select = output<NxtMessage>();

  protected readonly uid = `nxt-message-list-${nextId++}`;
  protected readonly icons = ICONS;
  protected readonly groups = computed(() => {
    const labels = resolveLabels(this.labels());
    return ORDER.map((type) => ({ type, label: labels[type], items: this.messages().filter((m) => m.type === type) })).filter((g) => g.items.length);
  });
}

/**
 * Bar stuck to the bottom of the content area for the finishing actions of an edit/create page (Lưu, Huỷ, Gửi
 * duyệt). Start: the message button (icon + count of the most severe type) that opens the message list. End: a
 * status text (`[nxtActionBarStatus]`) and the buttons, primary last. Only on pages that have finishing actions.
 */
@Component({
  selector: 'nxt-action-bar',
  imports: [NxtButton, NxtIcon, NxtMessageList, NxtPopover, NxtPopoverTrigger, NxtTooltip],
  template: `
    <div class="nxt-action-bar__start">
      @if (messages().length) {
        <button
          nxtButton
          type="button"
          class="nxt-action-bar__messages"
          nxtPopoverPosition="top"
          [attr.data-type]="severity()"
          [nxtPopoverTriggerFor]="list"
          [nxtTooltip]="summary()"
          [attr.aria-label]="summary()"
        >
          <!-- The name ("Thông báo: 2 lỗi, 1 cảnh báo") contains the visible count (WCAG 2.5.3). -->
          <nxt-icon [name]="icons[severity()]" />
          <span class="nxt-action-bar__count">{{ counts()[severity()] }}</span>
        </button>
      }
      <nxt-popover #list [title]="labelSet().title + ' (' + messages().length + ')'">
        <nxt-message-list [messages]="messages()" [labels]="labels()" (select)="choose($event)" />
      </nxt-popover>
    </div>
    <div class="nxt-action-bar__end">
      <span class="nxt-action-bar__status"><ng-content select="[nxtActionBarStatus]" /></span>
      <div class="nxt-action-bar__actions"><ng-content /></div>
    </div>
  `,
  styleUrl: './action-bar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'nxt-action-bar', role: 'region', '[attr.aria-label]': 'label()' },
})
export class NxtActionBar {
  private readonly injector = inject(Injector);
  /** Messages of the form; none → no message button. */
  readonly messages = input<readonly NxtMessage[]>([]);
  /** Name of the region landmark. Give each bar its own name when a page has several. */
  readonly label = input('Thanh thao tác');
  /** Texts of the message button, popover and list (i18n). */
  readonly labels = input<Partial<NxtMessageLabels>>({});
  /** The user chose a message: reveal its section/tab if needed; focus moves to its target after the next render. */
  readonly messageSelect = output<NxtMessage>();

  private readonly trigger = viewChild(NxtPopoverTrigger);
  private readonly popover = viewChild.required<NxtPopover>('list');

  protected readonly icons = ICONS;
  protected readonly labelSet = computed(() => resolveLabels(this.labels()));
  protected readonly counts = computed(() => countByType(this.messages()));
  /** Most severe type present. */
  protected readonly severity = computed<NxtMessageType>(() => ORDER.find((t) => this.counts()[t] > 0) ?? 'info');
  protected readonly summary = computed(() => this.labelSet().summary(this.counts()));

  /** Open the message list (after "Lưu" found errors); focus moves to the first message. */
  openMessages() {
    // Pages call this right after setting the messages: open once the button and the list have rendered them.
    afterNextRender(() => this.trigger()?.open(), { injector: this.injector });
  }

  closeMessages() {
    this.popover().close();
  }

  protected choose(message: NxtMessage) {
    this.popover().close({ restoreFocus: false });
    this.messageSelect.emit(message);
    // The page may open a tab or a section first; focus once that has rendered.
    afterNextRender(() => nxtFocusMessageTarget(message.target), { injector: this.injector });
  }
}
