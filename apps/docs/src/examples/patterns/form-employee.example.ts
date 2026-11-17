import { ChangeDetectionStrategy, Component, ElementRef, Injector, afterNextRender, computed, inject, signal } from '@angular/core';
import { NxtButton } from '@nxt/ui/button';
import { NxtCard } from '@nxt/ui/card';
import { NxtCheckbox } from '@nxt/ui/checkbox';
import { NxtDatePicker } from '@nxt/ui/date-picker';
import { NxtDescription, NxtDescriptions } from '@nxt/ui/descriptions';
import { NxtFormField, NxtInput } from '@nxt/ui/form-field';
import { NxtGrid, NxtInline, NxtSpan, NxtStack } from '@nxt/ui/layout';
import { NxtRadio, NxtRadioGroup } from '@nxt/ui/radio-group';

type Gender = 'female' | 'male' | 'other';
type WorkMode = 'office' | 'hybrid' | 'remote';

interface Employee {
  code: string;
  name: string;
  birthday: string | null;
  gender: Gender | null;
  idNumber: string;
  email: string;
  phone: string;
  department: string;
  title: string;
  startDate: string | null;
  workMode: WorkMode;
  /** VND per month; null = not agreed yet (not 0). */
  salary: number | null;
  manager: string;
  socialInsurance: boolean;
}

type Errors = Partial<Record<'name' | 'idNumber' | 'email' | 'department' | 'title' | 'startDate' | 'salary', string>>;

const GENDERS: Record<Gender, string> = { female: 'Nữ', male: 'Nam', other: 'Khác' };
const WORK_MODES: Record<WorkMode, string> = { office: 'Tại văn phòng', hybrid: 'Kết hợp', remote: 'Từ xa' };
/** Regional minimum wage, zone I (fictional reference figure for the example). */
const MIN_WAGE = 4_960_000;
const money = new Intl.NumberFormat('vi-VN');

/** Hồ sơ nhân viên: xem bằng danh sách mô tả, sửa bằng form hai nhóm (1 → 2 → 3 cột theo bề rộng form) */
@Component({
  selector: 'example-form-employee',
  imports: [
    NxtButton,
    NxtCard,
    NxtCheckbox,
    NxtDatePicker,
    NxtDescription,
    NxtDescriptions,
    NxtFormField,
    NxtGrid,
    NxtInline,
    NxtInput,
    NxtRadio,
    NxtRadioGroup,
    NxtSpan,
    NxtStack,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Docs example + a11y fixture: fictional data, "today" fixed at 06/11/2026.
  template: `
    <nxt-card [title]="saved().name" [subtitle]="saved().code + ' · ' + saved().title">
      <div nxtCardActions>
        @if (!editing()) {
          <button nxtButton type="button" (click)="edit()">Sửa hồ sơ</button>
        }
      </div>

      @if (editing()) {
        <form novalidate (submit)="save($event)">
          <nxt-stack gap="lg">
            <p class="docs-demo-label">Các trường có dấu * là bắt buộc.</p>

            <section class="group" aria-labelledby="employee-personal">
              <h3 id="employee-personal" class="group__title">Thông tin cá nhân</h3>
              <nxt-grid gap="md">
                <nxt-form-field label="Họ và tên" required [error]="errors().name" [nxtSpan]="span">
                  <input nxtInput autocomplete="off" [value]="draft().name" (input)="set('name', text($event))" />
                </nxt-form-field>
                <nxt-form-field label="Ngày sinh" hint="Gõ 18031994 hoặc chọn trên lịch." [nxtSpan]="span">
                  <nxt-date-picker today="2026-11-06" max="2026-11-06" [value]="draft().birthday" (valueChange)="set('birthday', $event)" />
                </nxt-form-field>
                <nxt-form-field label="Số CCCD" required hint="12 chữ số." [error]="errors().idNumber" [nxtSpan]="span">
                  <input nxtInput inputmode="numeric" autocomplete="off" class="nxt-tabular-nums" [value]="draft().idNumber" (input)="set('idNumber', text($event))" />
                </nxt-form-field>
                <nxt-form-field label="Email công ty" required [error]="errors().email" [nxtSpan]="span">
                  <input nxtInput type="email" autocomplete="off" [value]="draft().email" (input)="set('email', text($event))" />
                </nxt-form-field>
                <nxt-form-field label="Số điện thoại" [nxtSpan]="span">
                  <input nxtInput type="tel" inputmode="tel" autocomplete="off" placeholder="0912 345 678" [value]="draft().phone" (input)="set('phone', text($event))" />
                </nxt-form-field>
                <nxt-radio-group label="Giới tính" [value]="draft().gender" (valueChange)="set('gender', $event)" [nxtSpan]="span">
                  @for (g of genders; track g[0]) {
                    <nxt-radio [value]="g[0]" [label]="g[1]" />
                  }
                </nxt-radio-group>
              </nxt-grid>
            </section>

            <section class="group" aria-labelledby="employee-job">
              <h3 id="employee-job" class="group__title">Công việc</h3>
              <nxt-grid gap="md">
                <nxt-form-field label="Mã nhân viên" readonly hint="Do hệ thống cấp, không đổi được." [nxtSpan]="span">
                  <input nxtInput class="nxt-tabular-nums" [value]="draft().code" />
                </nxt-form-field>
                <nxt-form-field label="Phòng ban" required [error]="errors().department" [nxtSpan]="span">
                  <select nxtInput (change)="set('department', text($event))">
                    <option value="" [selected]="!draft().department">Chọn phòng ban</option>
                    @for (d of departments; track d) {
                      <option [value]="d" [selected]="draft().department === d">{{ d }}</option>
                    }
                  </select>
                </nxt-form-field>
                <nxt-form-field label="Chức danh" required [error]="errors().title" [nxtSpan]="span">
                  <input nxtInput autocomplete="off" [value]="draft().title" (input)="set('title', text($event))" />
                </nxt-form-field>
                <nxt-form-field label="Ngày vào làm" required [error]="errors().startDate" [nxtSpan]="span">
                  <nxt-date-picker today="2026-11-06" [value]="draft().startDate" (valueChange)="set('startDate', $event)" />
                </nxt-form-field>
                <nxt-form-field
                  label="Lương cơ bản (đồng/tháng)"
                  [error]="errors().salary"
                  [warning]="salaryWarning()"
                  hint="Bỏ trống nếu chưa thoả thuận."
                  [nxtSpan]="span"
                >
                  <input nxtInput numeric inputmode="numeric" autocomplete="off" [value]="salaryText()" (input)="setSalary(text($event))" />
                  <span nxtSuffix>₫</span>
                </nxt-form-field>
                <nxt-radio-group label="Hình thức làm việc" [value]="draft().workMode" (valueChange)="$event && set('workMode', $event)" [nxtSpan]="span">
                  @for (m of workModes; track m[0]) {
                    <nxt-radio [value]="m[0]" [label]="m[1]" />
                  }
                </nxt-radio-group>
                <nxt-checkbox
                  label="Đóng bảo hiểm xã hội"
                  hint="Bắt buộc với hợp đồng từ 1 tháng trở lên."
                  [checked]="draft().socialInsurance"
                  (checkedChange)="set('socialInsurance', $event)"
                  [nxtSpan]="span"
                />
              </nxt-grid>
            </section>

            <nxt-inline>
              <button nxtButton variant="primary" type="submit">Lưu</button>
              <button nxtButton type="button" (click)="cancel()">Huỷ</button>
            </nxt-inline>
          </nxt-stack>
        </form>
      } @else {
        <nxt-stack gap="lg">
          <section class="group" aria-labelledby="employee-personal-view">
            <h3 id="employee-personal-view" class="group__title">Thông tin cá nhân</h3>
            <dl nxtDescriptions>
              <div nxtDescription label="Họ và tên">{{ saved().name }}</div>
              <div nxtDescription label="Ngày sinh"><span class="nxt-tabular-nums">{{ date(saved().birthday) }}</span></div>
              <div nxtDescription label="Số CCCD"><span class="nxt-tabular-nums">{{ saved().idNumber }}</span></div>
              <div nxtDescription label="Email công ty">{{ saved().email }}</div>
              <div nxtDescription label="Số điện thoại">{{ saved().phone || '—' }}</div>
              <div nxtDescription label="Giới tính">{{ saved().gender ? genderLabel[saved().gender!] : '—' }}</div>
            </dl>
          </section>
          <section class="group" aria-labelledby="employee-job-view">
            <h3 id="employee-job-view" class="group__title">Công việc</h3>
            <dl nxtDescriptions>
              <div nxtDescription label="Mã nhân viên"><span class="nxt-tabular-nums">{{ saved().code }}</span></div>
              <div nxtDescription label="Phòng ban">{{ saved().department }}</div>
              <div nxtDescription label="Chức danh">{{ saved().title }}</div>
              <div nxtDescription label="Ngày vào làm"><span class="nxt-tabular-nums">{{ date(saved().startDate) }}</span></div>
              <div nxtDescription label="Lương cơ bản">
                <span class="nxt-tabular-nums">{{ saved().salary === null ? 'Chưa thoả thuận' : money(saved().salary!) + ' ₫' }}</span>
              </div>
              <div nxtDescription label="Hình thức làm việc">{{ workModeLabel[saved().workMode] }}</div>
              <div nxtDescription label="Quản lý trực tiếp">{{ saved().manager || '—' }}</div>
              <div nxtDescription label="Bảo hiểm xã hội">{{ saved().socialInsurance ? 'Có đóng' : 'Không đóng' }}</div>
            </dl>
          </section>
        </nxt-stack>
      }
      <p class="docs-demo-label" role="status">{{ message() }}</p>
    </nxt-card>
  `,
  styles: `
    .group {
      display: flex;
      flex-direction: column;
      gap: var(--nxt-space-gap-md);
      min-inline-size: 0;
    }
    .group__title {
      margin: 0;
      color: var(--nxt-color-text-strong);
      font: var(--nxt-typography-heading-sm);
    }
  `,
})
export class FormEmployeeExample {
  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  private readonly injector = inject(Injector);

  /** 1 column below 640px of form width (drawer, dialog), 2 up to 1024px, 3 from there on. */
  protected readonly span = { base: 12, sm: 6, lg: 4 } as const;
  protected readonly departments = ['Kế toán tổng hợp', 'Kinh doanh miền Bắc', 'Kinh doanh miền Nam', 'Nhân sự', 'Vận hành kho'];
  protected readonly genders = Object.entries(GENDERS) as [Gender, string][];
  protected readonly workModes = Object.entries(WORK_MODES) as [WorkMode, string][];
  protected readonly genderLabel = GENDERS;
  protected readonly workModeLabel = WORK_MODES;

  protected readonly saved = signal<Employee>({
    code: 'NV-02417',
    name: 'Nguyễn Thị Ngọc Diệp',
    birthday: '1994-03-18',
    gender: 'female',
    idNumber: '079194001234',
    email: 'diep.nguyen@congty.vn',
    phone: '',
    department: 'Kế toán tổng hợp',
    title: 'Kế toán viên',
    startDate: '2023-03-03',
    workMode: 'hybrid',
    salary: 18_500_000,
    manager: '',
    socialInsurance: true,
  });
  protected readonly editing = signal(false);
  protected readonly draft = signal<Employee>(this.saved());
  protected readonly errors = signal<Errors>({});
  protected readonly message = signal('');
  /** What the user typed in the salary box, kept as typed until the value is valid. */
  private readonly salaryInput = signal<string | null>(null);
  /** Validate on save first; after that, re-validate as the user fixes each field. */
  private submitted = false;

  protected readonly salaryText = computed(() => {
    const typed = this.salaryInput();
    if (typed !== null) return typed;
    const salary = this.draft().salary;
    return salary === null ? '' : money.format(salary);
  });
  protected readonly salaryWarning = computed(() => {
    const salary = this.draft().salary;
    return salary !== null && salary < MIN_WAGE
      ? `Thấp hơn lương tối thiểu vùng I (${money.format(MIN_WAGE)} ₫). Kiểm tra lại nếu nhân viên làm toàn thời gian.`
      : null;
  });

  protected edit() {
    this.draft.set(this.saved());
    this.salaryInput.set(null);
    this.errors.set({});
    this.submitted = false;
    this.message.set('');
    this.editing.set(true);
  }

  protected cancel() {
    this.editing.set(false);
    this.message.set('Đã huỷ, hồ sơ không thay đổi.');
  }

  protected set<K extends keyof Employee>(key: K, value: Employee[K]) {
    this.draft.update((d) => ({ ...d, [key]: value }));
    if (this.submitted) this.errors.set(this.validate());
  }

  protected setSalary(text: string) {
    this.salaryInput.set(text);
    const digits = text.replace(/[.\s]/g, '');
    this.set('salary', digits === '' ? null : /^\d+$/.test(digits) ? Number(digits) : Number.NaN);
  }

  protected save(event: Event) {
    event.preventDefault();
    this.submitted = true;
    const errors = this.validate();
    this.errors.set(errors);
    const count = Object.keys(errors).length;
    if (count) {
      this.message.set(`Chưa lưu: còn ${count} trường cần sửa.`);
      // Zoneless: aria-invalid lands on the next render, so wait for it before moving focus.
      afterNextRender(() => this.host.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(), { injector: this.injector });
      return;
    }
    this.saved.set(this.draft());
    this.editing.set(false);
    this.message.set(`Đã lưu hồ sơ ${this.draft().name}.`);
  }

  protected text(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  protected date(iso: string | null): string {
    if (!iso) return '—';
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  }

  protected money(value: number): string {
    return money.format(value);
  }

  private validate(): Errors {
    const d = this.draft();
    const errors: Errors = {};
    const id = d.idNumber.replace(/\s/g, '');
    if (!d.name.trim()) errors.name = 'Nhập họ và tên.';
    if (!id) errors.idNumber = 'Nhập số CCCD.';
    else if (!/^\d{12}$/.test(id)) errors.idNumber = `Số CCCD gồm 12 chữ số, bạn đã nhập ${id.length} ký tự.`;
    if (!d.email.trim()) errors.email = 'Nhập email công ty.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.trim())) errors.email = 'Email chưa đúng định dạng. Ví dụ: ten@example.com';
    if (!d.department) errors.department = 'Chọn phòng ban.';
    if (!d.title.trim()) errors.title = 'Nhập chức danh.';
    if (!d.startDate) errors.startDate = 'Chọn ngày vào làm.';
    if (d.salary !== null && Number.isNaN(d.salary)) errors.salary = 'Lương chỉ gồm chữ số, ví dụ 18.500.000.';
    return errors;
  }
}
