import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, Injector, afterNextRender, computed, inject, signal, viewChild } from '@angular/core';
import { NxtActionBar, NxtMessage } from '@nxt/ui/action-bar';
import { NxtAlert, NxtAlertTone, NxtLiveRegion } from '@nxt/ui/alert';
import { NxtAvatar } from '@nxt/ui/avatar';
import { NxtButton } from '@nxt/ui/button';
import { NxtDescription, NxtDescriptions } from '@nxt/ui/descriptions';
import { NxtDialog } from '@nxt/ui/dialog';
import { NxtFormField, NxtInput } from '@nxt/ui/form-field';
import { NxtIcon } from '@nxt/ui/icon';
import { NxtMenu, NxtMenuItem, NxtMenuSeparator, NxtMenuTrigger } from '@nxt/ui/menu';
import { NxtObjectPage, NxtObjectPageSection, NxtObjectPageSubsection } from '@nxt/ui/object-page';
import { NxtBreadcrumbItem, NxtPageHeader } from '@nxt/ui/page-header';
import { NxtSkeleton, nxtDeferredLoading } from '@nxt/ui/skeleton';
import { NxtTable, NxtTableScroll } from '@nxt/ui/table';
import { NxtTag } from '@nxt/ui/tag';
import { NxtTimeline, NxtTimelineItem } from '@nxt/ui/timeline';
import { NxtTooltip } from '@nxt/ui/tooltip';
import { HrmFrame } from './hrm-frame';
import {
  CONTRACTS,
  Contract,
  DEPARTMENTS,
  DRAFT_SAVED_AT,
  EMPLOYEE,
  Employee,
  EmployeeForm,
  FIELD_ORDER,
  GENDERS,
  GRADES,
  HISTORY,
  HistoryEntry,
  LOCATIONS,
  MANAGERS,
  MARITAL,
  REQUIRED,
  STATUS_META,
  TITLES,
  copyForm,
  formFrom,
  formatMoney,
  sameForm,
  seniority,
  validate,
} from './object-data';

type Mode = 'view' | 'edit' | 'create';

interface Notice {
  text: string;
  tone: NxtAlertTone;
  undo?: () => void;
}

/** Hồ sơ nhân viên — trang chi tiết đối tượng: header co gọn, thanh neo, xem / sửa / tạo trên cùng bố cục, thanh chân dính, đang tải */
@Component({
  selector: 'example-template-object',
  imports: [
    HrmFrame,
    NgTemplateOutlet,
    NxtActionBar,
    NxtAlert,
    NxtAvatar,
    NxtButton,
    NxtDescription,
    NxtDescriptions,
    NxtFormField,
    NxtIcon,
    NxtInput,
    NxtLiveRegion,
    NxtMenu,
    NxtMenuItem,
    NxtMenuSeparator,
    NxtMenuTrigger,
    NxtObjectPage,
    NxtObjectPageSection,
    NxtObjectPageSubsection,
    NxtPageHeader,
    NxtSkeleton,
    NxtTable,
    NxtTableScroll,
    NxtTag,
    NxtTimeline,
    NxtTimelineItem,
    NxtTooltip,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <example-hrm-frame>
      <!-- Title row of the Dynamic Page = the top bar: breadcrumb, title, status, non-finishing actions. -->
      <nxt-page-header placement="topbar" [title]="title()" [breadcrumb]="breadcrumb()" (navigate)="requestLeave()">
        <nxt-tag nxtPageMeta dot [tone]="creating() ? 'info' : statusMeta().tone">{{ creating() ? 'Bản nháp' : statusMeta().label }}</nxt-tag>
        <ng-container ngProjectAs="[nxtPageActions]">
          @if (!editing()) {
            <button nxtIconButton variant="ghost" type="button" aria-label="Thêm hành động cho hồ sơ" nxtTooltip="Thêm hành động" nxtTooltipPosition="bottom" [nxtMenuTriggerFor]="more">
              <nxt-icon name="dots" />
            </button>
            <button nxtButton variant="primary" type="button" data-edit (click)="edit()"><nxt-icon name="pencil" />Sửa</button>
          }
        </ng-container>
      </nxt-page-header>
      <ng-template #more>
        <div nxtMenu>
          <button nxtMenuItem (triggered)="duplicate()"><nxt-icon name="copy" />Nhân bản</button>
          <button nxtMenuItem (triggered)="reload()"><nxt-icon name="refresh" />Tải lại hồ sơ</button>
          @if (employee().status !== 'left') {
            <div nxtMenuSeparator></div>
            <button nxtMenuItem (triggered)="terminate()"><nxt-icon name="user-x" />Ngừng làm việc…</button>
          }
        </div>
      </ng-template>

      <div class="notice" nxtLiveRegion>
        @if (notice(); as n) {
          <nxt-alert [tone]="n.tone" dismissible (dismissed)="notice.set(null)">
            {{ n.text }}
            @if (n.undo) {
              <button nxtAlertActions nxtButton variant="ghost" size="sm" type="button" (click)="undo(n)">Hoàn tác</button>
            }
          </nxt-alert>
        }
      </div>
      <p class="nxt-visually-hidden" nxtLiveRegion>{{ loadStatus() }}</p>

      <nxt-object-page navLabel="Các phần của hồ sơ" pinnable>
        <!-- Content header: context only, never edited in place (it collapses while scrolling). -->
        <div nxtObjectPageHeader [attr.aria-busy]="loading() || null">
          @if (showSkeleton()) {
            <nxt-skeleton variant="circle" size="lg" />
            <div class="lead lead--loading">
              <nxt-skeleton variant="heading" width="long" />
              <nxt-skeleton width="medium" />
            </div>
            <div class="facts facts--loading"><ng-container [ngTemplateOutlet]="factsSkeleton" /></div>
          } @else {
            <nxt-avatar [name]="title()" size="lg" />
            <div class="lead">
              <p class="lead__title">{{ shown().title || 'Chưa chọn chức danh' }}</p>
              <p class="lead__sub">{{ shown().department }} · {{ shown().location }}</p>
            </div>
            <dl nxtDescriptions class="facts">
              <div nxtDescription label="Mã nhân viên"><span class="nxt-tabular-nums">{{ creating() ? 'Tự cấp khi tạo' : employee().code }}</span></div>
              <div nxtDescription label="Ngày vào làm"><span class="nxt-tabular-nums">{{ shown().startDate || '—' }}</span></div>
              <div nxtDescription label="Thâm niên">{{ creating() ? '—' : seniorityText() }}</div>
              <div nxtDescription label="Quản lý trực tiếp">{{ shown().manager }}</div>
              <div nxtDescription label="Loại nhân viên">{{ creating() ? 'Thử việc' : employee().type }}</div>
            </dl>
          }
        </div>
        <div nxtObjectPageSummary>
          <nxt-avatar [name]="title()" size="sm" />
          <span class="nxt-truncate">{{ creating() ? 'Nhân viên mới' : employee().code }} · {{ shown().title }} · {{ shown().department }}</span>
        </div>

        <nxt-object-page-section id="profile-general" title="Thông tin chung" [busy]="loading()">
          <nxt-object-page-subsection title="Thông tin cá nhân">
            @if (showSkeleton()) {
              <div class="facts-grid"><ng-container [ngTemplateOutlet]="factsSkeleton" /></div>
            } @else if (editing()) {
              <div class="form">
                <nxt-form-field label="Họ và tên" required [error]="shownErrors().name">
                  <input nxtInput data-field="name" autocomplete="off" [value]="form().name" (input)="set('name', $event)" />
                </nxt-form-field>
                <nxt-form-field label="Ngày sinh" required hint="Ngày/tháng/năm, ví dụ 08/09/1990" [error]="shownErrors().birthDate">
                  <input nxtInput data-field="birthDate" inputmode="numeric" autocomplete="off" [value]="form().birthDate" (input)="set('birthDate', $event)" />
                </nxt-form-field>
                <nxt-form-field label="Giới tính">
                  <select nxtInput data-field="gender" (change)="set('gender', $event)">
                    <option value="" [selected]="!form().gender">Chưa chọn</option>
                    @for (g of genders; track g) {
                      <option [value]="g" [selected]="form().gender === g">{{ g }}</option>
                    }
                  </select>
                </nxt-form-field>
                <nxt-form-field label="Số CCCD" required [error]="shownErrors().idNumber">
                  <input nxtInput data-field="idNumber" inputmode="numeric" autocomplete="off" [value]="form().idNumber" (input)="set('idNumber', $event)" />
                </nxt-form-field>
                <nxt-form-field label="Tình trạng hôn nhân">
                  <select nxtInput data-field="marital" (change)="set('marital', $event)">
                    <option value="" [selected]="!form().marital">Chưa chọn</option>
                    @for (m of marital; track m) {
                      <option [value]="m" [selected]="form().marital === m">{{ m }}</option>
                    }
                  </select>
                </nxt-form-field>
              </div>
            } @else {
              <dl nxtDescriptions>
                <div nxtDescription label="Họ và tên">{{ employee().name }}</div>
                <div nxtDescription label="Ngày sinh"><span class="nxt-tabular-nums">{{ employee().birthDate }}</span></div>
                <div nxtDescription label="Giới tính">{{ employee().gender || '—' }}</div>
                <div nxtDescription label="Số CCCD"><span class="nxt-tabular-nums">{{ employee().idNumber }}</span></div>
                <div nxtDescription label="Tình trạng hôn nhân">{{ employee().marital || '—' }}</div>
              </dl>
            }
          </nxt-object-page-subsection>

          <nxt-object-page-subsection title="Liên hệ">
            @if (showSkeleton()) {
              <div class="facts-grid"><ng-container [ngTemplateOutlet]="factsSkeleton" /></div>
            } @else if (editing()) {
              <div class="form">
                <nxt-form-field label="Điện thoại" required [error]="shownErrors().phone">
                  <input nxtInput data-field="phone" type="tel" autocomplete="off" [value]="form().phone" (input)="set('phone', $event)" />
                </nxt-form-field>
                <nxt-form-field label="Email cá nhân" [error]="shownErrors().personalEmail">
                  <input nxtInput data-field="personalEmail" type="email" autocomplete="off" [value]="form().personalEmail" (input)="set('personalEmail', $event)" />
                </nxt-form-field>
                <nxt-form-field label="Email công ty" hint="Cấp tự động theo họ tên khi tạo hồ sơ.">
                  <input nxtInput readonly [value]="creating() ? 'Cấp sau khi tạo' : employee().workEmail" />
                </nxt-form-field>
                <nxt-form-field label="Địa chỉ thường trú" class="full">
                  <textarea nxtInput data-field="address" rows="2" [value]="form().address" (input)="set('address', $event)"></textarea>
                </nxt-form-field>
              </div>
            } @else {
              <dl nxtDescriptions>
                <div nxtDescription label="Điện thoại"><span class="nxt-tabular-nums">{{ employee().phone }}</span></div>
                <div nxtDescription label="Email cá nhân">{{ employee().personalEmail || '—' }}</div>
                <div nxtDescription label="Email công ty">{{ employee().workEmail }}</div>
                <div nxtDescription label="Địa chỉ thường trú" full>{{ employee().address || '—' }}</div>
              </dl>
            }
          </nxt-object-page-subsection>
        </nxt-object-page-section>

        <nxt-object-page-section id="profile-job" title="Công việc" [busy]="loading()">
          @if (showSkeleton()) {
            <div class="facts-grid"><ng-container [ngTemplateOutlet]="factsSkeleton" /></div>
          } @else if (editing()) {
            <div class="form">
              <nxt-form-field label="Chức danh">
                <select nxtInput data-field="title" (change)="set('title', $event)">
                  @for (t of titles; track t) {
                    <option [value]="t" [selected]="form().title === t">{{ t }}</option>
                  }
                </select>
              </nxt-form-field>
              <nxt-form-field label="Cấp bậc">
                <select nxtInput data-field="grade" (change)="set('grade', $event)">
                  @for (g of grades; track g) {
                    <option [value]="g" [selected]="form().grade === g">{{ g }}</option>
                  }
                </select>
              </nxt-form-field>
              <nxt-form-field label="Phòng ban">
                <select nxtInput data-field="department" (change)="set('department', $event)">
                  @for (d of departments; track d) {
                    <option [value]="d" [selected]="form().department === d">{{ d }}</option>
                  }
                </select>
              </nxt-form-field>
              <nxt-form-field label="Nơi làm việc">
                <select nxtInput data-field="location" (change)="set('location', $event)">
                  @for (l of locations; track l) {
                    <option [value]="l" [selected]="form().location === l">{{ l }}</option>
                  }
                </select>
              </nxt-form-field>
              <nxt-form-field label="Quản lý trực tiếp">
                <select nxtInput data-field="manager" (change)="set('manager', $event)">
                  @for (m of managers; track m) {
                    <option [value]="m" [selected]="form().manager === m">{{ m }}</option>
                  }
                </select>
              </nxt-form-field>
              @if (creating()) {
                <nxt-form-field label="Ngày vào làm" required hint="Ngày/tháng/năm, ví dụ 01/12/2026" [error]="shownErrors().startDate">
                  <input nxtInput data-field="startDate" inputmode="numeric" autocomplete="off" [value]="form().startDate" (input)="set('startDate', $event)" />
                </nxt-form-field>
              } @else {
                <nxt-form-field label="Ngày vào làm" hint="Không sửa ở đây: ngày vào làm gắn với hợp đồng đầu tiên.">
                  <input nxtInput readonly [value]="employee().startDate" />
                </nxt-form-field>
              }
            </div>
          } @else {
            <dl nxtDescriptions>
              <div nxtDescription label="Chức danh">{{ employee().title }}</div>
              <div nxtDescription label="Cấp bậc">{{ employee().grade }}</div>
              <div nxtDescription label="Phòng ban">{{ employee().department }}</div>
              <div nxtDescription label="Nơi làm việc">{{ employee().location }}</div>
              <div nxtDescription label="Quản lý trực tiếp">{{ employee().manager }}</div>
              <div nxtDescription label="Loại nhân viên">{{ employee().type }}</div>
              <div nxtDescription label="Ngày vào làm"><span class="nxt-tabular-nums">{{ employee().startDate }}</span></div>
              <div nxtDescription label="Ngày chính thức"><span class="nxt-tabular-nums">{{ employee().confirmedDate || '—' }}</span></div>
            </dl>
          }
        </nxt-object-page-section>

        <!-- One table in the section: it carries the section's name (no extra table title). -->
        <nxt-object-page-section id="profile-contracts" title="Hợp đồng" [busy]="loading()">
          @if (showSkeleton()) {
            <nxt-skeleton [lines]="4" />
          } @else if (contracts().length) {
            @if (editing()) {
              <p class="note"><nxt-icon name="info-circle" />Hợp đồng lập và gia hạn ở phân hệ Hợp đồng lao động, không sửa trong hồ sơ.</p>
            }
            <nxt-table-scroll label="Hợp đồng lao động">
              <table nxtTable>
                <caption class="nxt-visually-hidden">Hợp đồng lao động của {{ employee().name }}</caption>
                <thead>
                  <tr>
                    <th scope="col">Số hợp đồng</th>
                    <th scope="col">Loại hợp đồng</th>
                    <th scope="col" class="nxt-table__num">Từ ngày</th>
                    <th scope="col" class="nxt-table__num">Đến ngày</th>
                    <th scope="col" class="nxt-table__num">Lương cơ bản</th>
                    <th scope="col">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  @for (c of contracts(); track c.number) {
                    <tr>
                      <th scope="row" class="code">{{ c.number }}</th>
                      <td>{{ c.type }}</td>
                      <td class="nxt-table__num">{{ c.from }}</td>
                      <td class="nxt-table__num">{{ c.to || 'Không thời hạn' }}</td>
                      <td class="nxt-table__num">{{ money(c.salary) }}</td>
                      <td><nxt-tag size="sm" [tone]="c.current ? 'success' : 'neutral'">{{ c.current ? 'Đang hiệu lực' : 'Đã kết thúc' }}</nxt-tag></td>
                    </tr>
                  }
                </tbody>
              </table>
            </nxt-table-scroll>
          } @else {
            <p class="empty">Chưa có hợp đồng. Lập hợp đồng ở phân hệ Hợp đồng lao động sau khi tạo hồ sơ.</p>
          }
        </nxt-object-page-section>

        <nxt-object-page-section id="profile-history" title="Lịch sử" [busy]="loading()">
          @if (showSkeleton()) {
            <nxt-skeleton [lines]="3" />
          } @else if (history().length) {
            <nxt-timeline>
              @for (h of history(); track h.title + h.time) {
                <nxt-timeline-item [title]="h.title" [time]="h.time" [icon]="h.icon" [tone]="h.tone">{{ h.note }}</nxt-timeline-item>
              }
            </nxt-timeline>
          } @else {
            <p class="empty">Chưa có lịch sử. Lịch sử bắt đầu từ ngày vào làm.</p>
          }
        </nxt-object-page-section>

        <!-- Edit / create: finishing actions always in view, at the bottom (Fiori footer toolbar + message popover). -->
        @if (editing()) {
          <nxt-action-bar nxtObjectPageFooter label="Thao tác hồ sơ" [messages]="messages()">
            <span nxtActionBarStatus class="footer__state" nxtLiveRegion>
              @if (checked() && errorCount()) {
                <span class="footer__errors">{{ errorCount() }} trường cần sửa</span>
              } @else if (dirty()) {
                Bản nháp · đã lưu lúc {{ draftTime }}
              } @else {
                Chưa có thay đổi
              }
            </span>
            <button nxtButton type="button" data-cancel (click)="cancel()">Huỷ</button>
            <button nxtButton variant="primary" type="button" (click)="save()"><nxt-icon name="device-floppy" />{{ creating() ? 'Tạo hồ sơ' : 'Lưu' }}</button>
          </nxt-action-bar>
        }
      </nxt-object-page>
    </example-hrm-frame>

    <ng-template #factsSkeleton>
      @for (i of skeletonPairs; track i) {
        <div class="pair">
          <nxt-skeleton width="short" />
          <nxt-skeleton width="long" />
        </div>
      }
    </ng-template>
  `,
  styles: `
    .notice:not(:empty) {
      margin-block-end: var(--nxt-space-gap-md);
    }
    .lead {
      display: grid;
      align-content: start;
      gap: var(--nxt-space-gap-xs);
      min-inline-size: 0;
      max-inline-size: var(--nxt-layout-item-min-lg);
    }
    .lead--loading {
      flex: 0 1 var(--nxt-layout-item-min-md);
    }
    .lead__title {
      color: var(--nxt-color-text-strong);
      font: var(--nxt-typography-heading-sm);
    }
    .lead__sub {
      color: var(--nxt-color-text-subtle);
      font: var(--nxt-typography-body-sm);
    }
    .facts {
      flex: 1 1 var(--nxt-layout-item-min-lg);
    }
    .facts--loading,
    .facts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(min(100%, var(--nxt-layout-item-min-sm)), 1fr));
      gap: var(--nxt-space-gap-md) var(--nxt-space-gap-lg);
    }
    .pair {
      display: grid;
      gap: var(--nxt-space-gap-xs);
    }
    .form {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(min(100%, var(--nxt-layout-item-min-md)), 1fr));
      gap: var(--nxt-space-gap-md) var(--nxt-space-gap-lg);
      align-items: start;
    }
    .form .full {
      grid-column: 1 / -1;
    }
    .code {
      font: var(--nxt-typography-code);
      white-space: nowrap;
    }
    .note,
    .empty {
      display: flex;
      align-items: center;
      gap: var(--nxt-space-gap-xs);
      color: var(--nxt-color-text-subtle);
      font: var(--nxt-typography-body-sm);
      --nxt-icon-size: var(--nxt-size-icon-sm);
    }
    .footer__state {
      color: var(--nxt-color-text-subtle);
      font: var(--nxt-typography-body-sm);
    }
    .footer__errors {
      color: var(--nxt-color-text-danger);
    }
  `,
})
export class TemplateObjectExample {
  private readonly dialog = inject(NxtDialog);
  private readonly injector = inject(Injector);
  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  private readonly header = viewChild.required(NxtPageHeader);

  protected readonly genders = GENDERS;
  protected readonly marital = MARITAL;
  protected readonly titles = TITLES;
  protected readonly grades = GRADES;
  protected readonly departments = DEPARTMENTS;
  protected readonly locations = LOCATIONS;
  protected readonly managers = MANAGERS;
  protected readonly draftTime = DRAFT_SAVED_AT;
  protected readonly skeletonPairs = [0, 1, 2, 3];
  protected readonly money = formatMoney;

  protected readonly employee = signal<Employee>(EMPLOYEE);
  protected readonly contracts = signal<Contract[]>(CONTRACTS);
  protected readonly history = signal<HistoryEntry[]>(HISTORY);
  protected readonly mode = signal<Mode>('view');
  protected readonly form = signal<EmployeeForm>(formFrom(EMPLOYEE));
  /** The values the edit / create session started from: "dirty" compares against them. */
  private readonly start = signal<EmployeeForm>(formFrom(EMPLOYEE));
  /** Errors show after the first "Lưu" (not while the user is still typing). */
  protected readonly checked = signal(false);
  protected readonly notice = signal<Notice | null>(null);
  protected readonly loading = signal(false);
  /** Skeleton only when loading lasts longer than ~1 s; once shown, at least 0.5 s (no flash). */
  protected readonly showSkeleton = nxtDeferredLoading(this.loading);
  protected readonly loadStatus = signal('');

  protected readonly editing = computed(() => this.mode() !== 'view');
  protected readonly creating = computed(() => this.mode() === 'create');
  protected readonly dirty = computed(() => this.editing() && !sameForm(this.form(), this.start()));
  private readonly errors = computed(() => validate(this.form(), this.creating()));
  protected readonly shownErrors = computed(() => (this.checked() ? this.errors() : {}));
  protected readonly errorCount = computed(() => Object.keys(this.errors()).length);
  private readonly actionBar = viewChild(NxtActionBar);
  /** Errors after the first "Lưu", in form order, for the action bar's message list (each one focuses its field). */
  protected readonly messages = computed<NxtMessage[]>(() => {
    const errors = this.shownErrors();
    return FIELD_ORDER.filter((f) => errors[f]).map((f) => ({
      id: f,
      type: 'error' as const,
      title: errors[f]!,
      target: this.host.querySelector<HTMLElement>(`[data-field="${f}"]`) ?? undefined,
    }));
  });
  /** Create mode: "Nhân viên mới" until a name is typed (Fiori: "<Đối tượng> mới"). */
  protected readonly title = computed(() => (this.creating() ? this.form().name.trim() || 'Nhân viên mới' : this.employee().name));
  protected readonly breadcrumb = computed<NxtBreadcrumbItem[]>(() => [
    { label: 'Nhân sự' },
    { label: 'Danh sách nhân viên', navigable: true },
    { label: this.title() },
  ]);
  protected readonly statusMeta = computed(() => STATUS_META[this.employee().status]);
  /** Header shows the saved record; while creating, what has been entered so far. */
  protected readonly shown = computed<EmployeeForm>(() => (this.creating() ? this.form() : this.employee()));
  protected readonly seniorityText = computed(() => seniority(this.employee().startDate));

  private source: Employee = EMPLOYEE;
  private timer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    const destroyRef = inject(DestroyRef);
    destroyRef.onDestroy(() => clearTimeout(this.timer));
    // Closing the tab or reloading with unsaved changes: only the browser's own prompt can ask (Fiori draft handling).
    afterNextRender(() => {
      const guard = (event: BeforeUnloadEvent) => {
        if (!this.dirty()) return;
        event.preventDefault();
        event.returnValue = '';
      };
      window.addEventListener('beforeunload', guard);
      destroyRef.onDestroy(() => window.removeEventListener('beforeunload', guard));
    });
  }

  protected set(field: keyof EmployeeForm, event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.form.update((f) => ({ ...f, [field]: value }));
  }

  protected edit() {
    this.notice.set(null);
    this.begin('edit', formFrom(this.employee()));
  }

  /** "Nhân bản": a new record with the job copied and personal fields empty; nothing is saved until "Tạo hồ sơ". */
  protected duplicate() {
    this.notice.set(null);
    this.source = this.employee();
    this.begin('create', copyForm(this.employee()));
  }

  protected save(): boolean {
    this.checked.set(true);
    const errors = this.errors();
    const first = FIELD_ORDER.find((f) => errors[f]);
    if (first) {
      // One error: straight to the field. Several: open the action bar's message list (Fiori message popover);
      // choosing a message focuses its field. aria-invalid and the messages render first either way.
      if (Object.keys(errors).length > 1 && this.actionBar()) this.actionBar()!.openMessages();
      else this.focusLater(`[data-field="${first}"]`);
      return false;
    }
    const f = this.form();
    if (this.creating()) {
      const created: Employee = {
        ...f,
        code: 'NV-00186',
        status: 'probation',
        workEmail: 'Cấp trong ngày làm việc tiếp theo',
        type: 'Thử việc',
        confirmedDate: '',
      };
      this.employee.set(created);
      this.contracts.set([]);
      this.history.set([{ title: 'Tạo hồ sơ', time: '06/11/2026', icon: 'user-plus', tone: 'brand', note: `Nhân bản từ hồ sơ ${this.source.code}` }]);
      this.finish({ text: `Đã tạo hồ sơ ${created.code} · ${created.name}.`, tone: 'success' });
      return true;
    }
    if (!this.dirty()) {
      this.finish({ text: 'Không có thay đổi nào cần lưu.', tone: 'info' });
      return true;
    }
    const before = this.employee();
    this.employee.set({ ...before, ...f });
    this.finish({ text: `Đã lưu thay đổi hồ sơ “${f.name}”.`, tone: 'success', undo: () => this.employee.set(before) });
    return true;
  }

  /** "Huỷ": nothing changed → leave edit mode at once; otherwise ask before losing the changes. */
  protected cancel() {
    if (!this.dirty()) {
      this.exit();
      return;
    }
    const creating = this.creating();
    this.dialog
      .confirm({
        title: creating ? 'Bỏ hồ sơ đang tạo?' : 'Bỏ mọi thay đổi?',
        message: creating
          ? `Thông tin đã nhập cho “${this.title()}” sẽ mất. Hồ sơ chưa được tạo.`
          : `Các thay đổi chưa lưu trong hồ sơ “${this.employee().name}” sẽ mất.`,
        confirmLabel: creating ? 'Bỏ hồ sơ' : 'Bỏ thay đổi',
        cancelLabel: creating ? 'Tiếp tục nhập' : 'Tiếp tục sửa',
        tone: 'danger',
      })
      .subscribe((answer) => {
        if (answer !== 'confirm') return;
        this.exit({ text: creating ? 'Đã bỏ hồ sơ đang tạo.' : 'Đã bỏ các thay đổi.', tone: 'info' });
      });
  }

  /** Breadcrumb "Danh sách nhân viên": same guard as the workflow editor (save / discard / stay). */
  protected requestLeave() {
    if (!this.dirty()) {
      if (this.editing()) this.exit();
      this.leave();
      return;
    }
    this.dialog
      .confirm({
        title: 'Rời trang khi chưa lưu?',
        message: `Các thay đổi trong hồ sơ “${this.title()}” sẽ mất nếu rời trang bây giờ.`,
        confirmLabel: this.creating() ? 'Tạo hồ sơ' : 'Lưu thay đổi',
        alternateLabel: 'Bỏ thay đổi',
        alternateTone: 'danger',
        cancelLabel: 'Ở lại',
      })
      .subscribe((answer) => {
        if (answer === 'confirm' && this.save()) this.leave();
        if (answer === 'alternate') {
          this.exit();
          this.leave();
        }
      });
  }

  /** Ngừng làm việc: locks the login and reaches payroll (effects outside this page) → ask first, name the person. */
  protected terminate() {
    const before = this.employee();
    this.dialog
      .confirm({
        title: `Ngừng làm việc với ${before.name}?`,
        message: 'Hồ sơ chuyển sang “Đã nghỉ việc” từ ngày 06/11/2026 và tài khoản đăng nhập bị khoá. Bảng công và lương tháng 11 vẫn tính đến hết ngày này.',
        confirmLabel: 'Ngừng làm việc',
        tone: 'danger',
      })
      .subscribe((answer) => {
        if (answer !== 'confirm') return;
        this.employee.set({ ...before, status: 'left' });
        this.notice.set({ text: `Đã chuyển ${before.name} sang “Đã nghỉ việc”. Tài khoản đăng nhập đã bị khoá.`, tone: 'success' });
        this.focusTitle();
      });
  }

  /** Simulated slow request (fixed 1.6 s): the skeleton appears after 1 s, the old content stays until then. */
  protected reload() {
    clearTimeout(this.timer);
    this.loading.set(true);
    this.loadStatus.set('Đang tải lại hồ sơ…');
    this.timer = setTimeout(() => {
      this.loading.set(false);
      this.loadStatus.set('Đã tải xong hồ sơ.');
    }, 1600);
  }

  protected undo(n: Notice) {
    n.undo?.();
    this.notice.set({ text: 'Đã hoàn tác.', tone: 'info' });
  }

  private begin(mode: Mode, values: EmployeeForm) {
    this.form.set(values);
    this.start.set(values);
    this.checked.set(false);
    this.mode.set(mode);
    // Fiori initial focus in edit / create: the first empty required field, else the first editable field.
    afterNextRender(
      () => {
        const fields = Array.from(this.host.querySelectorAll<HTMLInputElement>('[data-field]'));
        const empty = fields.find((el) => REQUIRED.includes(el.dataset['field'] as keyof EmployeeForm) && !el.value.trim());
        (empty ?? fields[0])?.focus();
      },
      { injector: this.injector },
    );
  }

  private finish(notice: Notice) {
    this.mode.set('view');
    this.checked.set(false);
    this.notice.set(notice);
    this.focusTitle();
  }

  private exit(notice?: Notice) {
    this.mode.set('view');
    this.checked.set(false);
    if (notice) this.notice.set(notice);
    // The footer (and its buttons) is gone: put focus back on "Sửa", where editing started.
    this.focusLater('[data-edit]');
  }

  private leave() {
    this.notice.set({ text: 'Màn Danh sách nhân viên chưa có trong bản demo, nên hồ sơ vẫn mở.', tone: 'info' });
  }

  private focusTitle() {
    afterNextRender(() => this.header().focusTitle(), { injector: this.injector });
  }

  private focusLater(selector: string) {
    afterNextRender(() => this.host.querySelector<HTMLElement>(selector)?.focus(), { injector: this.injector });
  }
}
