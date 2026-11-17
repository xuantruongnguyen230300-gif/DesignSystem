import { DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, TemplateRef, inject, signal, viewChild } from '@angular/core';
import { NxtButton } from '@nxt/ui/button';
import { NxtComboboxOption, NxtCombobox } from '@nxt/ui/combobox';
import { NxtDialog, NxtDialogLayout } from '@nxt/ui/dialog';
import { NxtFormField } from '@nxt/ui/form-field';
import { NxtValueHelp } from '@nxt/ui/value-help';
import { EMPLOYEE_COLUMNS, HRM_EMPLOYEES, employeeByCode, employeeKey, employeeLabel, employeeOption, findEmployees } from './hrm-employees';

/** Chọn nhiều nhân viên: tick trong bảng, “Đã chọn: N”, Shift chọn cả dải; chỉ áp vào trường khi bấm “Chọn” */
@Component({
  selector: 'example-value-help-multiple',
  imports: [NxtButton, NxtCombobox, NxtDialogLayout, NxtFormField, NxtValueHelp],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="box">
      <nxt-form-field label="Nhân viên áp dụng" hint="Gõ để thêm từng người, hoặc mở danh sách đầy đủ để chọn nhiều người một lần.">
        <nxt-combobox
          multiple
          searchMode="server"
          valueHelp
          [debounce]="0"
          [options]="suggestions()"
          [(values)]="applied"
          (query)="suggest($event)"
          (valueHelpRequested)="openPicker($event)"
          placeholder="Gõ tên hoặc mã nhân viên"
        />
      </nxt-form-field>
    </div>
    <p class="docs-demo-label" role="status">Áp dụng cho {{ applied().length }} nhân viên.</p>

    <ng-template #picker>
      <nxt-dialog-layout title="Chọn các nhân viên áp dụng" [closable]="false">
        <nxt-value-help
          multiple
          caption="Nhân viên"
          hint="Chỉ hiện nhân viên đang làm việc."
          [items]="employees"
          [columns]="columns"
          [itemKey]="key"
          [itemLabel]="label"
          [(values)]="draft"
          [query]="pickQuery()"
        />
        <div nxtDialogFooter>
          <button nxtButton type="button" (click)="ref?.close()">Huỷ</button>
          <button nxtButton variant="primary" type="button" [disabled]="!draft().length" (click)="apply()">
            {{ draft().length ? 'Chọn ' + draft().length + ' nhân viên' : 'Chọn nhân viên' }}
          </button>
        </div>
      </nxt-dialog-layout>
    </ng-template>
  `,
  styles: `
    .box {
      max-inline-size: var(--nxt-layout-content-narrow);
      margin-block-end: var(--nxt-space-gap-sm);
    }
  `,
})
export class ValueHelpMultipleExample {
  private readonly dialog = inject(NxtDialog);
  private readonly picker = viewChild.required<TemplateRef<unknown>>('picker');
  protected ref: DialogRef | null = null;

  protected readonly employees = HRM_EMPLOYEES;
  protected readonly columns = EMPLOYEE_COLUMNS;
  protected readonly key = employeeKey;
  protected readonly label = employeeLabel;

  protected readonly applied = signal<string[]>(['NV-0012', 'NV-0027']);
  /** Options for the values already chosen, so the tokens show names before the first search. */
  protected readonly suggestions = signal<NxtComboboxOption[]>(this.applied().map((c) => employeeOption(employeeByCode(c)!)));
  /** Draft in the dialog: copied from the field on open, applied only with "Chọn". */
  protected readonly draft = signal<string[]>([]);
  protected readonly pickQuery = signal('');

  protected suggest(query: string) {
    this.suggestions.set(findEmployees(query, 8).items.map(employeeOption));
  }

  protected openPicker(typed: string) {
    this.draft.set(this.applied());
    this.pickQuery.set(typed);
    this.ref = this.dialog.open(this.picker(), { size: 'lg' });
    this.ref.closed.subscribe(() => (this.ref = null));
  }

  protected apply() {
    const chosen = this.draft();
    this.suggestions.set(chosen.map((c) => employeeOption(employeeByCode(c)!)));
    this.applied.set(chosen);
    this.ref?.close();
  }
}
