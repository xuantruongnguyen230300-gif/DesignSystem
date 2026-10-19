import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, signal } from '@angular/core';
import { NxtAvatar } from '@nxt/ui/avatar';
import { NxtButton } from '@nxt/ui/button';
import { NxtCard } from '@nxt/ui/card';
import { NxtEmptyState } from '@nxt/ui/empty-state';
import { NxtFormField, NxtInput } from '@nxt/ui/form-field';
import { NxtIcon } from '@nxt/ui/icon';
import { NxtPageHeader } from '@nxt/ui/page-header';
import { NxtCheckbox } from '@nxt/ui/checkbox';
import { NxtFilter, NxtFilterChip, NxtFilterChips, NxtFilterState } from '@nxt/ui/filter';
import { NxtSearch, nxtMatches } from '@nxt/ui/search';
import { NxtTab, NxtTabs } from '@nxt/ui/tabs';
import { NxtTag, NxtTone } from '@nxt/ui/tag';
import { NxtTimeline, NxtTimelineItem } from '@nxt/ui/timeline';
import { HrmFrame } from './hrm-frame';

type Status = 'pending' | 'approved' | 'rejected' | 'returned';
type RequestType = 'Nghỉ phép' | 'Tăng ca' | 'Công tác';

interface LeaveRequest {
  id: string;
  type: RequestType;
  name: string;
  title: string;
  dept: string;
  from: string;
  to: string;
  days: string;
  submitted: string;
  reason: string;
  substitute?: string;
  attachments?: string[];
  status: Status;
  note?: string;
}

const STATUS: Record<Status, { label: string; tone: NxtTone }> = {
  pending: { label: 'Chờ duyệt', tone: 'warning' },
  approved: { label: 'Đã duyệt', tone: 'success' },
  rejected: { label: 'Từ chối', tone: 'danger' },
  returned: { label: 'Trả lại', tone: 'info' },
};

const REQUESTS: LeaveRequest[] = [
  { id: 'DNP-0412', type: 'Nghỉ phép', name: 'Lê Minh Anh', title: 'Kế toán thanh toán', dept: 'Phòng Kế toán', from: '20/10/2026', to: '22/10/2026', days: '3 ngày', submitted: '10 phút trước', reason: 'Về quê dự đám cưới em gái tại Nam Định.', substitute: 'Trần Thị Mai', status: 'pending' },
  { id: 'TC-0198', type: 'Tăng ca', name: 'Phạm Thu Hà', title: 'Chuyên viên C&B', dept: 'Phòng Nhân sự', from: '18/10/2026 18:00', to: '18/10/2026 21:00', days: '3 giờ', submitted: '1 giờ trước', reason: 'Hoàn tất bảng lương tháng 10 trước hạn chuyển ngân hàng.', status: 'pending' },
  { id: 'CT-0077', type: 'Công tác', name: 'Võ Thành Nam', title: 'Trưởng nhóm Chăm sóc khách hàng', dept: 'Khối Kinh doanh', from: '23/10/2026', to: '25/10/2026', days: '3 ngày', submitted: '3 giờ trước', reason: 'Đào tạo đội ngũ chăm sóc khách hàng chi nhánh Đà Nẵng.', attachments: ['ke-hoach-dao-tao.pdf', 'du-toan-chi-phi.xlsx'], status: 'pending' },
  { id: 'DNP-0409', type: 'Nghỉ phép', name: 'Nguyễn Thị Ngọc Diệp', title: 'Nhân viên kinh doanh', dept: 'Kinh doanh miền Nam', from: '27/10/2026', to: '27/10/2026', days: '1 ngày', submitted: 'Hôm qua', reason: 'Đưa con đi khám sức khoẻ định kỳ.', substitute: 'Lý Hoàng Nam', status: 'pending' },
  { id: 'TC-0195', type: 'Tăng ca', name: 'Hoàng Văn Đức', title: 'Nhân viên kho', dept: 'Khối Vận hành', from: '19/10/2026 07:00', to: '19/10/2026 11:00', days: '4 giờ', submitted: 'Hôm qua', reason: 'Kiểm kê kho cuối quý.', status: 'pending' },
  { id: 'DNP-0401', type: 'Nghỉ phép', name: 'Bùi Khánh Linh', title: 'Chuyên viên tuyển dụng', dept: 'Phòng Nhân sự', from: '14/10/2026', to: '15/10/2026', days: '2 ngày', submitted: '12/10/2026', reason: 'Nghỉ ốm, có giấy khám bệnh.', attachments: ['giay-kham-benh.jpg'], status: 'approved', note: 'Chúc em mau khoẻ.' },
  { id: 'CT-0071', type: 'Công tác', name: 'Đỗ Minh Khoa', title: 'Chuyên viên pháp chế', dept: 'Ban Pháp chế', from: '09/10/2026', to: '10/10/2026', days: '2 ngày', submitted: '05/10/2026', reason: 'Làm việc với đối tác tại Hà Nội.', status: 'returned', note: 'Bổ sung dự toán chi phí đi lại.' },
];

/** Phê duyệt đơn từ — danh sách (↑/↓ để chuyển đơn) và chi tiết, quy trình, ý kiến */
@Component({
  selector: 'example-template-approval',
  imports: [HrmFrame, NxtAvatar, NxtButton, NxtCard, NxtEmptyState, NxtFormField, NxtInput, NxtIcon, NxtPageHeader, NxtCheckbox, NxtFilter, NxtFilterChips, NxtSearch, NxtTab, NxtTabs, NxtTag, NxtTimeline, NxtTimelineItem],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <example-hrm-frame>
      <div class="stack">
        <nxt-page-header title="Phê duyệt" description="Đơn từ của nhân viên trong các phòng bạn quản lý.">
          <nxt-tabs label="Lọc đơn theo trạng thái" [panels]="false" [value]="tab()" (valueChange)="setTab($event!)">
            <nxt-tab value="pending" label="Chờ tôi duyệt" [count]="count('pending')" />
            <nxt-tab value="done" label="Đã xử lý" [count]="count('done')" />
            <nxt-tab value="all" label="Tất cả" />
          </nxt-tabs>
        </nxt-page-header>

        <p class="status" role="status">{{ message() }}</p>

        <div class="split">
          <nxt-card padding="none" class="list">
            <div class="list__toolbar">
              <nxt-search class="list__search" label="Tìm đơn" placeholder="Tên người gửi, mã đơn, lý do" [value]="query()" (valueChange)="setQuery($event)" />
              <nxt-filter #filter title="Lọc đơn" [activeCount]="filters.activeCount()" (opened)="filters.edit()" (applied)="applyFilters()" (reset)="filters.resetDraft()">
                <fieldset class="group">
                  <legend class="group__title">Loại đơn</legend>
                  @for (t of typeOptions; track t) {
                    <nxt-checkbox [label]="t" [checked]="filters.draft().types.includes(t)" (checkedChange)="filters.toggle('types', t, $event)" />
                  }
                </fieldset>
                <fieldset class="group">
                  <legend class="group__title">Phòng ban</legend>
                  @for (d of deptOptions; track d) {
                    <nxt-checkbox [label]="d" [checked]="filters.draft().depts.includes(d)" (checkedChange)="filters.toggle('depts', d, $event)" />
                  }
                </fieldset>
              </nxt-filter>
            </div>
            @if (chips().length) {
              <div class="list__chips">
                <nxt-filter-chips [chips]="chips()" [returnFocusTo]="filter" (remove)="filters.clear($any($event))" (clearAll)="filters.clearAll()" />
              </div>
            }
            @if (visible().length) {
              <ul class="requests" role="list" aria-label="Danh sách đơn" (keydown)="onListKey($event)">
                @for (r of visible(); track r.id) {
                  <li>
                    <button type="button" class="request" [attr.data-id]="r.id" [attr.aria-current]="r.id === current()?.id ? 'true' : null" (click)="select(r.id)">
                      <nxt-avatar [name]="r.name" />
                      <span class="request__main">
                        <span class="request__name">{{ r.name }}</span>
                        <span class="request__meta">{{ r.type }} · {{ r.days }} · {{ r.from }}</span>
                      </span>
                      <span class="request__side">
                        <span class="request__time">{{ r.submitted }}</span>
                        <nxt-tag size="sm" dot [tone]="statusOf(r).tone">{{ statusOf(r).label }}</nxt-tag>
                      </span>
                    </button>
                  </li>
                }
              </ul>
            } @else {
              @if (query().trim() || filters.activeCount()) {
                <nxt-empty-state icon="search" title="Không có đơn phù hợp" description="Thử từ khoá khác, hoặc bỏ bớt bộ lọc." size="sm">
                  <button nxtEmptyActions nxtButton type="button" (click)="clearSearch()">Xoá tìm kiếm và bộ lọc</button>
                </nxt-empty-state>
              } @else {
                <nxt-empty-state icon="circle-check" title="Không còn đơn nào ở đây" description="Bạn đã xử lý hết đơn trong mục này. Đơn mới sẽ xuất hiện tự động." size="sm" />
              }
            }
          </nxt-card>

          @if (current(); as r) {
            <nxt-card padding="none" class="detail">
              <div class="detail__head">
                <nxt-avatar [name]="r.name" size="lg" />
                <div class="detail__who">
                  <h2 class="detail__title">{{ r.type }} · {{ r.name }}</h2>
                  <p class="detail__sub">{{ r.title }} · {{ r.dept }}</p>
                </div>
                <nxt-tag dot [tone]="statusOf(r).tone">{{ statusOf(r).label }}</nxt-tag>
              </div>
              <div class="detail__body">
                <dl class="facts">
                  <div><dt>Từ</dt><dd>{{ r.from }}</dd></div>
                  <div><dt>Đến</dt><dd>{{ r.to }}</dd></div>
                  <div><dt>Thời lượng</dt><dd>{{ r.days }}</dd></div>
                  <div><dt>Mã đơn</dt><dd class="nxt-tabular-nums">{{ r.id }}</dd></div>
                  <div><dt>Gửi lúc</dt><dd>{{ r.submitted }}</dd></div>
                  @if (r.substitute) {
                    <div><dt>Người thay thế</dt><dd>{{ r.substitute }}</dd></div>
                  }
                  <div class="facts__full"><dt>Lý do</dt><dd>{{ r.reason }}</dd></div>
                  @if (r.attachments?.length) {
                    <div class="facts__full">
                      <dt>Đính kèm</dt>
                      <dd>
                        <ul class="files" role="list">
                          @for (f of r.attachments; track f) {
                            <li><nxt-icon name="paperclip" size="sm" /><a [href]="'#' + f">{{ f }}</a></li>
                          }
                        </ul>
                      </dd>
                    </div>
                  }
                </dl>

                <h3 class="section-title">Quy trình duyệt</h3>
                <nxt-timeline>
                  <nxt-timeline-item title="Gửi đơn" [time]="r.submitted" icon="send" tone="brand">{{ r.name }}</nxt-timeline-item>
                  <nxt-timeline-item title="Trưởng phòng duyệt" [time]="r.status === 'pending' ? 'Đang chờ bạn' : 'Đã xử lý'" [icon]="stepIcon(r)" [tone]="stepTone(r)">
                    Đặng Anh (bạn){{ r.note ? ' · “' + r.note + '”' : '' }}
                  </nxt-timeline-item>
                  <nxt-timeline-item title="Phòng Nhân sự ghi nhận" time="Sau khi trưởng phòng duyệt" icon="clipboard-check" />
                </nxt-timeline>

                @if (r.status === 'pending') {
                  <nxt-form-field label="Ý kiến của bạn" hint="Bắt buộc khi từ chối hoặc trả lại, để người gửi biết cần sửa gì." [error]="commentError()">
                    <textarea nxtInput rows="3" [value]="comment()" (input)="setComment($event)"></textarea>
                  </nxt-form-field>
                }
              </div>
              @if (r.status === 'pending') {
                <div class="detail__actions">
                  <button nxtButton type="button" (click)="decide(r, 'rejected')"><nxt-icon name="x" />Từ chối</button>
                  <button nxtButton type="button" (click)="decide(r, 'returned')"><nxt-icon name="arrow-back-up" />Trả lại</button>
                  <span class="detail__spacer"></span>
                  <button nxtButton variant="primary" type="button" (click)="decide(r, 'approved')"><nxt-icon name="check" />Duyệt đơn</button>
                </div>
              }
            </nxt-card>
          } @else {
            <nxt-card class="detail">
              <nxt-empty-state icon="clipboard-check" title="Chọn một đơn để xem chi tiết" description="Dùng phím mũi tên lên/xuống để chuyển nhanh giữa các đơn." />
            </nxt-card>
          }
        </div>
      </div>
    </example-hrm-frame>
  `,
  styles: `
    .stack {
      grid-template-columns: minmax(0, 1fr);
      display: grid;
      gap: var(--nxt-space-gap-lg);
      container-type: inline-size;
    }
    .status {
      color: var(--nxt-color-text-success);
      font: var(--nxt-typography-label-sm);
    }
    .status:empty {
      display: none;
    }
    .split {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: var(--nxt-space-gap-lg);
      align-items: start;
    }
    @container (min-width: 960px) {
      .split {
        grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
      }
    }
    .list__toolbar {
      display: flex;
      align-items: center;
      gap: var(--nxt-space-gap-sm);
      padding: var(--nxt-space-inset-sm) var(--nxt-space-inset-md);
      border-block-end: var(--nxt-border-width-default) solid var(--nxt-color-border-default);
    }
    .list__search {
      flex: 1;
    }
    .list__chips {
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
    .requests {
      margin: 0;
      padding: var(--nxt-space-inset-xs);
      list-style: none;
    }
    .request {
      display: flex;
      align-items: center;
      gap: var(--nxt-space-gap-md);
      inline-size: 100%;
      padding: var(--nxt-space-inset-sm);
      border: 0;
      border-radius: var(--nxt-radius-control);
      background: transparent;
      color: inherit;
      font: inherit;
      text-align: start;
      cursor: pointer;
    }
    .request:hover {
      background: var(--nxt-color-bg-surface-hover);
    }
    .request[aria-current='true'] {
      background: var(--nxt-color-bg-selected);
    }
    .request:focus-visible {
      outline: var(--nxt-focus-ring-width) solid var(--nxt-focus-ring-color);
      outline-offset: calc(-1 * var(--nxt-focus-ring-width));
    }
    .request__main {
      display: grid;
      flex: 1;
      min-inline-size: 0;
    }
    .request__name {
      color: var(--nxt-color-text-strong);
      font: var(--nxt-typography-label-md);
    }
    .request__meta {
      overflow: hidden;
      color: var(--nxt-color-text-subtle);
      font: var(--nxt-typography-body-sm);
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .request__side {
      display: grid;
      justify-items: end;
      gap: var(--nxt-space-1);
    }
    .request__time {
      color: var(--nxt-color-text-subtle);
      font: var(--nxt-typography-caption);
      white-space: nowrap;
    }
    .detail__head {
      display: flex;
      align-items: center;
      gap: var(--nxt-space-gap-md);
      padding: var(--nxt-space-inset-lg);
      border-block-end: var(--nxt-border-width-default) solid var(--nxt-color-border-default);
    }
    .detail__who {
      display: grid;
      flex: 1;
      min-inline-size: 0;
    }
    .detail__title {
      color: var(--nxt-color-text-strong);
      font: var(--nxt-typography-heading-sm);
    }
    .detail__sub {
      color: var(--nxt-color-text-subtle);
      font: var(--nxt-typography-body-sm);
    }
    .detail__body {
      display: grid;
      gap: var(--nxt-space-gap-lg);
      padding: var(--nxt-space-inset-lg);
    }
    .facts {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, var(--nxt-layout-item-min-sm)), 1fr));
      gap: var(--nxt-space-gap-md) var(--nxt-space-gap-lg);
      margin: 0;
    }
    .facts > div {
      display: grid;
      gap: var(--nxt-space-0-5);
    }
    .facts__full {
      grid-column: 1 / -1;
    }
    .facts dt {
      color: var(--nxt-color-text-subtle);
      font: var(--nxt-typography-label-sm);
    }
    .facts dd {
      margin: 0;
      color: var(--nxt-color-text-default);
      font: var(--nxt-typography-body-md);
    }
    .files {
      display: grid;
      gap: var(--nxt-space-1);
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .files li {
      display: flex;
      align-items: center;
      gap: var(--nxt-space-1);
      color: var(--nxt-color-icon-subtle);
    }
    .section-title {
      color: var(--nxt-color-text-strong);
      font: var(--nxt-typography-label-md);
    }
    .detail__actions {
      display: flex;
      flex-wrap: wrap;
      gap: var(--nxt-space-gap-sm);
      padding: var(--nxt-space-inset-md) var(--nxt-space-inset-lg);
      border-block-start: var(--nxt-border-width-default) solid var(--nxt-color-border-default);
      background: var(--nxt-color-bg-subtle);
    }
    .detail__spacer {
      flex: 1;
    }
  `,
})
export class TemplateApprovalExample {
  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  protected readonly requests = signal<LeaveRequest[]>(REQUESTS);
  protected readonly tab = signal<'pending' | 'done' | 'all'>('pending');
  protected readonly query = signal('');
  protected readonly filters = new NxtFilterState({ types: [] as string[], depts: [] as string[] });
  protected readonly selectedId = signal<string | null>(REQUESTS[0].id);
  protected readonly comment = signal('');
  protected readonly commentError = signal<string | null>(null);
  protected readonly message = signal('');

  protected readonly typeOptions: RequestType[] = ['Nghỉ phép', 'Tăng ca', 'Công tác'];
  protected readonly deptOptions = [...new Set(REQUESTS.map((r) => r.dept))].sort((a, b) => a.localeCompare(b, 'vi'));

  protected readonly visible = computed(() => {
    const { types, depts } = this.filters.applied();
    return this.requests().filter(
      (r) =>
        (this.tab() === 'all' || (this.tab() === 'pending' ? r.status === 'pending' : r.status !== 'pending')) &&
        nxtMatches(this.query(), r.name, r.id, r.reason) &&
        (!types.length || types.includes(r.type)) &&
        (!depts.length || depts.includes(r.dept)),
    );
  });
  protected readonly chips = computed<NxtFilterChip[]>(() => {
    const { types, depts } = this.filters.applied();
    return [
      ...(types.length ? [{ key: 'types', label: `Loại đơn: ${types.join(', ')}` }] : []),
      ...(depts.length ? [{ key: 'depts', label: `Phòng ban: ${depts.join(', ')}` }] : []),
    ];
  });
  protected readonly current = computed<LeaveRequest | null>(() => this.visible().find((r) => r.id === this.selectedId()) ?? this.visible()[0] ?? null);

  protected count(which: 'pending' | 'done'): number {
    return this.requests().filter((r) => (which === 'pending' ? r.status === 'pending' : r.status !== 'pending')).length;
  }
  protected statusOf(r: LeaveRequest) {
    return STATUS[r.status];
  }
  protected stepIcon(r: LeaveRequest) {
    return r.status === 'pending' ? 'hourglass' : r.status === 'approved' ? 'check' : r.status === 'rejected' ? 'x' : 'arrow-back-up';
  }
  protected stepTone(r: LeaveRequest) {
    return r.status === 'pending' ? 'warning' : r.status === 'approved' ? 'success' : r.status === 'rejected' ? 'danger' : 'neutral';
  }

  protected setTab(tab: string) {
    this.tab.set(tab as 'pending' | 'done' | 'all');
    this.selectedId.set(null);
  }
  protected setQuery(query: string) {
    this.query.set(query);
    this.selectedId.set(null);
  }
  protected clearSearch() {
    this.query.set('');
    this.filters.clearAll();
  }
  protected applyFilters() {
    this.filters.apply();
    this.selectedId.set(null);
  }
  protected setComment(event: Event) {
    this.comment.set((event.target as HTMLTextAreaElement).value);
    if (this.comment().trim()) this.commentError.set(null);
  }

  protected select(id: string) {
    this.selectedId.set(id);
    this.comment.set('');
    this.commentError.set(null);
  }

  /** ↑/↓ moves through the list (one Tab stop per item, arrows for speed). */
  protected onListKey(event: KeyboardEvent) {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    event.preventDefault();
    const list = this.visible();
    const i = list.findIndex((r) => r.id === this.current()?.id);
    const next = list[Math.max(0, Math.min(list.length - 1, i + (event.key === 'ArrowDown' ? 1 : -1)))];
    if (!next) return;
    this.select(next.id);
    queueMicrotask(() => this.host.querySelector<HTMLElement>(`[data-id="${next.id}"]`)?.focus());
  }

  protected decide(r: LeaveRequest, status: Status) {
    if (status !== 'approved' && !this.comment().trim()) {
      this.commentError.set(status === 'rejected' ? 'Nhập lý do từ chối để người gửi biết.' : 'Nhập nội dung cần bổ sung để người gửi sửa lại.');
      queueMicrotask(() => this.host.querySelector<HTMLElement>('textarea')?.focus());
      return;
    }
    const index = this.visible().findIndex((x) => x.id === r.id);
    this.requests.update((list) => list.map((x) => (x.id === r.id ? { ...x, status, note: this.comment().trim() || undefined } : x)));
    const verb = status === 'approved' ? 'Đã duyệt' : status === 'rejected' ? 'Đã từ chối' : 'Đã trả lại';
    this.message.set(`${verb} đơn ${r.type.toLowerCase()} của ${r.name}.`);
    // Move on to the next pending item in the same list, so a reviewer can work through the queue.
    const after = this.visible();
    const next = after.slice(Math.max(index, 0)).find((x) => x.status === 'pending') ?? after.find((x) => x.status === 'pending');
    this.select(next?.id ?? r.id);
  }
}
