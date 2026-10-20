import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NxtCheckbox } from '@nxt/ui/checkbox';

/** Chọn tất cả: ô cha ở trạng thái indeterminate khi mới chọn một phần */
@Component({
  selector: 'example-checkbox-select-all',
  imports: [NxtCheckbox],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <fieldset class="group">
      <legend class="group__legend">Quyền trên phân hệ Nhân sự</legend>
      <nxt-checkbox label="Tất cả quyền" [checked]="all()" [indeterminate]="some()" (checkedChange)="setAll($event)" />
      <ul class="group__children" role="list">
        @for (p of permissions; track p.key) {
          <li>
            <nxt-checkbox [label]="p.label" [checked]="granted().has(p.key)" (checkedChange)="toggle(p.key, $event)" />
          </li>
        }
      </ul>
      <p class="docs-demo-label">Đã cấp {{ granted().size }}/{{ permissions.length }} quyền.</p>
    </fieldset>
  `,
  styles: `
    .group {
      display: grid;
      gap: var(--nxt-space-gap-xs);
      min-inline-size: 0;
      margin: 0;
      padding: 0;
      border: 0;
    }
    .group__legend {
      margin-block-end: var(--nxt-space-gap-sm);
      padding: 0;
      color: var(--nxt-color-text-strong);
      font: var(--nxt-typography-label-md);
    }
    .group__children {
      display: grid;
      gap: var(--nxt-space-gap-xs);
      margin: 0;
      padding-inline-start: var(--nxt-space-6);
      list-style: none;
    }
  `,
})
export class CheckboxSelectAllExample {
  protected readonly permissions = [
    { key: 'view', label: 'Xem hồ sơ nhân viên' },
    { key: 'edit', label: 'Sửa hồ sơ nhân viên' },
    { key: 'approve', label: 'Duyệt đơn nghỉ phép' },
    { key: 'export', label: 'Xuất báo cáo nhân sự' },
  ];
  protected readonly granted = signal(new Set(['view', 'approve']));
  protected readonly all = computed(() => this.granted().size === this.permissions.length);
  /** Mixed: some but not all children are checked. */
  protected readonly some = computed(() => this.granted().size > 0 && !this.all());

  protected setAll(checked: boolean) {
    this.granted.set(new Set(checked ? this.permissions.map((p) => p.key) : []));
  }

  protected toggle(key: string, checked: boolean) {
    const next = new Set(this.granted());
    if (checked) next.add(key);
    else next.delete(key);
    this.granted.set(next);
  }
}
