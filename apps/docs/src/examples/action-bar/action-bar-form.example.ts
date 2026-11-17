import { ChangeDetectionStrategy, Component, computed, inject, signal, viewChild } from '@angular/core';
import { NxtActionBar, NxtMessage } from '@nxt/ui/action-bar';
import { NxtButton } from '@nxt/ui/button';
import { NxtFormField, NxtInput } from '@nxt/ui/form-field';
import { NxtGrid, NxtSpan } from '@nxt/ui/layout';
import { NxtToast } from '@nxt/ui/toast';

interface Contract {
  number: string;
  start: string;
  end: string;
  salary: string;
  note: string;
}

const SAVED: Contract = { number: 'HĐ-2026/0418', start: '01/12/2026', end: '', salary: '7.800.000', note: '' };
const STEP_3_MIN = 8_500_000;
const DATE = /^(\d{2})\/(\d{2})\/(\d{4})$/;

const toDate = (s: string) => {
  const m = DATE.exec(s.trim());
  return m ? new Date(+m[3], +m[2] - 1, +m[1]) : null;
};

/** Trang sửa hợp đồng: thanh hành động dính đáy, bấm lưu còn lỗi thì danh sách thông báo tự mở, chọn một tin để tới trường */
@Component({
  selector: 'example-action-bar-form',
  imports: [NxtActionBar, NxtButton, NxtFormField, NxtInput, NxtGrid, NxtSpan],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- In an app the bar sticks to the bottom of the content area; here this box plays that role. -->
    <div class="page">
      <form class="form" novalidate (submit)="$event.preventDefault()">
        <h2 class="nxt-text-heading-sm">Hợp đồng lao động · Nguyễn Văn An</h2>
        <section aria-labelledby="ab-contract">
          <h3 id="ab-contract" class="section">Thông tin hợp đồng</h3>
          <nxt-grid gap="md">
            <nxt-form-field id="ab-number" label="Số hợp đồng" readonly [nxtSpan]="{ base: 12, md: 6 }">
              <input nxtInput [value]="draft().number" />
            </nxt-form-field>
            <nxt-form-field id="ab-start" label="Ngày bắt đầu" required hint="dd/mm/yyyy" [error]="errorOf('start')" [nxtSpan]="{ base: 12, md: 6 }">
              <input nxtInput autocomplete="off" [value]="draft().start" (input)="edit('start', $event)" />
            </nxt-form-field>
            <nxt-form-field id="ab-end" label="Ngày kết thúc" required hint="dd/mm/yyyy" [error]="errorOf('end')" [nxtSpan]="{ base: 12, md: 6 }">
              <input nxtInput autocomplete="off" [value]="draft().end" (input)="edit('end', $event)" />
            </nxt-form-field>
          </nxt-grid>
        </section>
        <section aria-labelledby="ab-pay">
          <h3 id="ab-pay" class="section">Lương & phụ cấp</h3>
          <nxt-grid gap="md">
            <nxt-form-field id="ab-salary" label="Lương cơ bản (₫)" required [warning]="warningOf('salary')" [error]="errorOf('salary')" [nxtSpan]="{ base: 12, md: 6 }">
              <input nxtInput numeric inputmode="numeric" autocomplete="off" [value]="draft().salary" (input)="edit('salary', $event)" />
            </nxt-form-field>
            <nxt-form-field label="Ghi chú" nxtSpan="full">
              <textarea nxtInput rows="3" [value]="draft().note" (input)="edit('note', $event)"></textarea>
            </nxt-form-field>
          </nxt-grid>
        </section>
      </form>

      <nxt-action-bar label="Thao tác hợp đồng" [messages]="messages()">
        @if (dirty()) {
          <span nxtActionBarStatus>Có thay đổi chưa lưu</span>
        }
        <button nxtButton variant="ghost" type="button" (click)="cancel()">Huỷ</button>
        <button nxtButton type="button" (click)="saveDraft()">Lưu nháp</button>
        <button nxtButton variant="primary" type="button" (click)="submit()">Lưu và gửi duyệt</button>
      </nxt-action-bar>
    </div>
  `,
  styles: `
    .page {
      display: flex;
      flex-direction: column;
      max-block-size: calc(var(--nxt-size-row-lg) * 9);
      overflow: auto;
      /* Same as the bar does for the app's scroll container: focused fields stay above it. */
      scroll-padding-block-end: calc(var(--nxt-size-control-md) + 2 * var(--nxt-space-inset-sm));
      border: var(--nxt-border-width-default) solid var(--nxt-color-border-default);
      border-radius: var(--nxt-radius-container);
      background: var(--nxt-color-bg-canvas);
    }
    .form {
      display: grid;
      gap: var(--nxt-space-section-sm);
      padding: var(--nxt-space-inset-lg);
    }
    .section {
      margin-block-end: var(--nxt-space-gap-sm);
      font: var(--nxt-typography-label-md);
    }
  `,
})
export class ActionBarFormExample {
  private readonly toast = inject(NxtToast);
  private readonly bar = viewChild.required(NxtActionBar);
  protected readonly saved = signal<Contract>(SAVED);
  protected readonly draft = signal<Contract>(SAVED);
  protected readonly dirty = computed(() => JSON.stringify(this.draft()) !== JSON.stringify(this.saved()));
  /** Checked when a finishing action is used, then again after every edit (never while typing the first time). */
  private readonly checked = signal(false);
  protected readonly messages = computed<NxtMessage[]>(() => (this.checked() ? this.validate(this.draft()) : []));

  protected errorOf(field: keyof Contract) {
    return this.messages().find((m) => m.id === field && m.type === 'error')?.title ?? null;
  }

  protected warningOf(field: keyof Contract) {
    return this.messages().find((m) => m.id === field && m.type === 'warning')?.title ?? null;
  }

  protected edit(field: keyof Contract, event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.draft.update((d) => ({ ...d, [field]: value }));
  }

  protected saveDraft() {
    // A draft may be incomplete: only save it.
    this.saved.set(this.draft());
    this.toast.show('Đã lưu nháp hợp đồng HĐ-2026/0418.');
  }

  protected submit() {
    this.checked.set(true);
    if (this.messages().some((m) => m.type === 'error')) {
      this.bar().openMessages();
      return;
    }
    this.saved.set(this.draft());
    this.toast.show('Đã lưu và gửi duyệt hợp đồng HĐ-2026/0418.');
  }

  protected cancel() {
    this.draft.set(this.saved());
    this.checked.set(false);
  }

  private validate(c: Contract): NxtMessage[] {
    const out: NxtMessage[] = [];
    const start = toDate(c.start);
    const end = toDate(c.end);
    if (!c.start.trim()) out.push({ id: 'start', type: 'error', title: 'Nhập ngày bắt đầu.', description: 'Thông tin hợp đồng · Ngày bắt đầu', target: 'ab-start' });
    else if (!start) out.push({ id: 'start', type: 'error', title: 'Ngày bắt đầu chưa đúng dạng dd/mm/yyyy.', description: 'Thông tin hợp đồng · Ngày bắt đầu', target: 'ab-start' });
    if (!c.end.trim()) out.push({ id: 'end', type: 'error', title: 'Nhập ngày kết thúc hợp đồng.', description: 'Thông tin hợp đồng · Ngày kết thúc', target: 'ab-end' });
    else if (!end) out.push({ id: 'end', type: 'error', title: 'Ngày kết thúc chưa đúng dạng dd/mm/yyyy.', description: 'Thông tin hợp đồng · Ngày kết thúc', target: 'ab-end' });
    else if (start && end <= start) out.push({ id: 'end', type: 'error', title: `Ngày kết thúc phải sau ngày bắt đầu ${c.start}.`, description: 'Thông tin hợp đồng · Ngày kết thúc', target: 'ab-end' });
    const salary = Number(c.salary.replace(/\./g, '').trim());
    if (!c.salary.trim() || Number.isNaN(salary)) {
      out.push({ id: 'salary', type: 'error', title: 'Nhập lương cơ bản bằng số, ví dụ 8.500.000.', description: 'Lương & phụ cấp · Lương cơ bản', target: 'ab-salary' });
    } else if (salary < STEP_3_MIN) {
      out.push({ id: 'salary', type: 'warning', title: 'Lương cơ bản thấp hơn mức tối thiểu của bậc 3 (8.500.000 ₫).', description: 'Lương & phụ cấp · Lương cơ bản', target: 'ab-salary' });
    }
    return out;
  }
}
