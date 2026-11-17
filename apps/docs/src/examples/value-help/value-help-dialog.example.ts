import { DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, TemplateRef, computed, inject, signal, viewChild } from '@angular/core';
import { NxtButton } from '@nxt/ui/button';
import { NxtComboboxOption, NxtCombobox } from '@nxt/ui/combobox';
import { NxtDialog, NxtDialogLayout } from '@nxt/ui/dialog';
import { NxtFormField } from '@nxt/ui/form-field';
import { NxtValueHelp } from '@nxt/ui/value-help';
import { EMPLOYEE_COLUMNS, HrmEmployee, employeeByCode, employeeKey, employeeLabel, employeeOption, fetchEmployees, findEmployees } from './hrm-employees';

/** Người phê duyệt: gợi ý khi gõ, nút “Mở danh sách đầy đủ” mở bảng nhân viên trong dialog; chọn một hàng là xong */
@Component({
  selector: 'example-value-help-dialog',
  imports: [NxtButton, NxtCombobox, NxtDialogLayout, NxtFormField, NxtValueHelp],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="box">
      <nxt-form-field label="Người phê duyệt" required hint="Gõ tên hoặc mã. Cần tìm theo phòng ban, chức danh thì mở danh sách đầy đủ.">
        <nxt-combobox
          searchMode="server"
          valueHelp
          [options]="suggestions()"
          [loading]="suggesting()"
          [(value)]="approver"
          (query)="suggest($event)"
          (valueHelpRequested)="openPicker($event)"
          placeholder="VD: Nguyễn Văn An hoặc NV-0012"
        />
      </nxt-form-field>
    </div>
    <p class="docs-demo-label" role="status">{{ chosen() }}</p>

    <ng-template #picker>
      <!-- No close button: the search box is the first thing that gets focus; Escape or "Huỷ" cancels. -->
      <nxt-dialog-layout title="Chọn người phê duyệt" [closable]="false">
        <nxt-value-help
          caption="Nhân viên"
          searchMode="server"
          hint="Chỉ hiện nhân viên đang làm việc."
          [debounce]="250"
          [items]="results()"
          [total]="total()"
          [loading]="searching()"
          [columns]="columns"
          [itemKey]="key"
          [itemLabel]="label"
          [value]="approver()"
          [query]="pickQuery()"
          (queryChange)="load($event)"
          (picked)="onPicked($event)"
        />
        <div nxtDialogFooter>
          <button nxtButton type="button" (click)="ref?.close()">Huỷ</button>
        </div>
      </nxt-dialog-layout>
    </ng-template>
  `,
  styles: `
    .box {
      max-inline-size: var(--nxt-size-400);
      margin-block-end: var(--nxt-space-gap-sm);
    }
  `,
})
export class ValueHelpDialogExample {
  private readonly dialog = inject(NxtDialog);
  private readonly picker = viewChild.required<TemplateRef<unknown>>('picker');
  protected ref: DialogRef | null = null;

  protected readonly columns = EMPLOYEE_COLUMNS;
  protected readonly key = employeeKey;
  protected readonly label = employeeLabel;

  protected readonly approver = signal<string | null>(null);
  protected readonly chosen = computed(() => {
    const e = this.approver() ? employeeByCode(this.approver()!) : undefined;
    return e ? `Người phê duyệt: ${e.name} (${e.code}) · ${e.title}, ${e.dept}` : 'Chưa chọn người phê duyệt.';
  });

  // Suggestions under the box (top 8).
  protected readonly suggestions = signal<NxtComboboxOption[]>([]);
  protected readonly suggesting = signal(false);
  private suggestRequest = 0;

  // The full list in the dialog (50 rows per search; "Hiện 50 / 1.250 kết quả").
  protected readonly pickQuery = signal('');
  protected readonly results = signal<HrmEmployee[]>([]);
  protected readonly total = signal(0);
  protected readonly searching = signal(false);
  private searchRequest = 0;

  protected async suggest(query: string) {
    const id = ++this.suggestRequest;
    this.suggesting.set(true);
    const { items } = await fetchEmployees(query, 8);
    if (id !== this.suggestRequest) return;
    this.suggestions.set(items.map(employeeOption));
    this.suggesting.set(false);
  }

  /** The text typed in the box moves to the dialog's search box; results are there when it opens. */
  protected openPicker(typed: string) {
    this.pickQuery.set(typed);
    const first = findEmployees(typed, 50);
    this.results.set(first.items);
    this.total.set(first.total);
    this.ref = this.dialog.open(this.picker(), { size: 'lg' });
    this.ref.closed.subscribe(() => (this.ref = null));
  }

  protected async load(query: string) {
    this.pickQuery.set(query);
    const id = ++this.searchRequest;
    this.searching.set(true);
    const { items, total } = await fetchEmployees(query, 50);
    if (id !== this.searchRequest) return;
    this.results.set(items);
    this.total.set(total);
    this.searching.set(false);
  }

  /** Give the box the chosen person as an option first, so it can show the name. Focus returns to the button. */
  protected onPicked(employee: HrmEmployee) {
    this.suggestions.set([employeeOption(employee)]);
    this.approver.set(employee.code);
    this.ref?.close();
  }
}
