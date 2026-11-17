import { DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, Injector, afterNextRender, inject, signal, viewChild } from '@angular/core';
import { NxtButton } from '@nxt/ui/button';
import { NxtComboboxOption, NxtCombobox } from '@nxt/ui/combobox';
import { NxtDrawer, NxtDrawerLayout } from '@nxt/ui/drawer';
import { NxtFormField, NxtInput } from '@nxt/ui/form-field';
import { NxtValueHelp } from '@nxt/ui/value-help';
import { EMPLOYEE_COLUMNS, HRM_EMPLOYEES, HrmEmployee, employeeByCode, employeeKey, employeeLabel, employeeOption, findEmployees } from './hrm-employees';

/** Chọn trong drawer: danh sách đầy đủ mở thành một bước ngay trong drawer (không mở dialog chồng lên drawer) */
@Component({
  selector: 'example-value-help-drawer-step',
  imports: [NxtButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button nxtButton variant="primary" type="button" (click)="open()">Thêm bước duyệt</button>
    <p class="docs-demo-label status" role="status">{{ message() }}</p>
  `,
  styles: `
    .status {
      margin-block-start: var(--nxt-space-gap-sm);
    }
  `,
})
export class ValueHelpDrawerStepExample {
  private readonly drawer = inject(NxtDrawer);
  protected readonly message = signal('');

  protected open() {
    const ref = this.drawer.open<ApprovalStep>(ApprovalStepForm, { title: 'Thêm bước duyệt' });
    ref.closed.subscribe((step) => {
      if (!step) return;
      const e = employeeByCode(step.approver)!;
      this.message.set(`Đã thêm bước “${step.name}”, người duyệt ${e.name} (${e.code}).`);
    });
  }
}

interface ApprovalStep {
  name: string;
  approver: string;
}

/** Drawer content: the form, or the "Chọn người duyệt" step in its place. */
@Component({
  selector: 'example-approval-step-form',
  imports: [NxtButton, NxtCombobox, NxtDrawerLayout, NxtFormField, NxtInput, NxtValueHelp],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-drawer-layout [title]="picking() ? 'Chọn người duyệt' : 'Thêm bước duyệt'" [description]="picking() ? undefined : 'Các trường có dấu * là bắt buộc.'">
      <!-- Hidden, not removed, while picking: what the user typed stays as it is. -->
      <form class="form" novalidate [hidden]="picking()" (submit)="save($event)">
        <nxt-form-field label="Tên bước" required [error]="tried() && !name() ? 'Hãy nhập tên bước, ví dụ “Trưởng phòng duyệt”.' : null">
          <input nxtInput [value]="name()" (input)="name.set($any($event.target).value)" placeholder="VD: Trưởng phòng duyệt" />
        </nxt-form-field>
        <nxt-form-field label="Người duyệt" required [error]="tried() && !approver() ? 'Hãy chọn người duyệt.' : null">
          <nxt-combobox
            searchMode="server"
            valueHelp
            [debounce]="0"
            [options]="suggestions()"
            [(value)]="approver"
            (query)="suggest($event)"
            (valueHelpRequested)="startPicking($event)"
            placeholder="Gõ tên hoặc mã nhân viên"
          />
        </nxt-form-field>
      </form>
      @if (picking()) {
        <nxt-value-help
          step
          caption="Nhân viên"
          hint="Chỉ hiện nhân viên đang làm việc."
          [items]="employees"
          [columns]="columns"
          [itemKey]="key"
          [itemLabel]="label"
          [value]="approver()"
          [query]="pickQuery()"
          (picked)="onPicked($event)"
          (cancelled)="back()"
        />
      }
      <div nxtDrawerFooter>
        @if (picking()) {
          <button nxtButton type="button" (click)="back()">Huỷ</button>
        } @else {
          <button nxtButton type="button" (click)="ref.close()">Huỷ</button>
          <button nxtButton variant="primary" type="button" (click)="save()">Thêm bước</button>
        }
      </div>
    </nxt-drawer-layout>
  `,
  styles: `
    .form {
      display: grid;
      gap: var(--nxt-space-gap-lg);
    }
  `,
})
class ApprovalStepForm {
  protected readonly ref = inject<DialogRef<ApprovalStep>>(DialogRef);
  private readonly injector = inject(Injector);
  private readonly approverBox = viewChild.required(NxtCombobox);

  protected readonly employees = HRM_EMPLOYEES;
  protected readonly columns = EMPLOYEE_COLUMNS;
  protected readonly key = employeeKey;
  protected readonly label = employeeLabel;

  protected readonly name = signal('');
  protected readonly approver = signal<string | null>(null);
  protected readonly suggestions = signal<NxtComboboxOption[]>([]);
  protected readonly tried = signal(false);
  protected readonly picking = signal(false);
  protected readonly pickQuery = signal('');

  protected suggest(query: string) {
    this.suggestions.set(findEmployees(query, 8).items.map(employeeOption));
  }

  /** The step replaces the form; its search box gets focus and starts with what was typed. */
  protected startPicking(typed: string) {
    this.pickQuery.set(typed);
    this.picking.set(true);
  }

  protected onPicked(employee: HrmEmployee) {
    this.suggestions.set([employeeOption(employee)]);
    this.approver.set(employee.code);
    this.back();
  }

  /** Back to the form; focus returns to the field that opened the step. */
  protected back() {
    this.picking.set(false);
    afterNextRender(() => this.approverBox().focus(), { injector: this.injector });
  }

  protected save(event?: Event) {
    event?.preventDefault();
    this.tried.set(true);
    const approver = this.approver();
    if (!this.name().trim() || !approver) return;
    this.ref.close({ name: this.name().trim(), approver });
  }
}
