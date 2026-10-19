import { ChangeDetectionStrategy, Component, ElementRef, Injector, afterNextRender, computed, inject, signal } from '@angular/core';
import { NxtButton } from '@nxt/ui/button';
import { NxtCheckbox } from '@nxt/ui/checkbox';
import { NxtIcon } from '@nxt/ui/icon';
import { NxtSelection, NxtTable } from '@nxt/ui/table';
import { NxtTag, NxtTone } from '@nxt/ui/tag';

interface Contract {
  code: string;
  name: string;
  type: string;
  expires: string;
  status: { label: string; tone: NxtTone };
}

/** Chọn nhiều hàng với NxtSelection: ô chọn tất cả, Shift+click chọn một dải, thanh thao tác hàng loạt */
@Component({
  selector: 'example-table-selection',
  imports: [NxtButton, NxtCheckbox, NxtIcon, NxtTable, NxtTag],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="frame">
      @if (selection.count()) {
        <div class="bar bar--bulk" role="group" aria-label="Thao tác với hợp đồng đã chọn">
          <span class="bar__count">Đã chọn {{ selection.count() }} hợp đồng</span>
          <button nxtButton size="sm" type="button" (click)="remind()"><nxt-icon name="send" />Gửi nhắc gia hạn</button>
          <button nxtButton size="sm" type="button" (click)="exportSelected()"><nxt-icon name="download" />Xuất Excel</button>
          <span class="bar__spacer"></span>
          <button nxtButton size="sm" variant="ghost" type="button" (click)="clear()">Bỏ chọn</button>
        </div>
      } @else {
        <div class="bar">
          <span class="docs-demo-label">Chọn hợp đồng để gửi nhắc gia hạn hoặc xuất file. Giữ Shift khi chọn để chọn cả dải hàng.</span>
        </div>
      }
      <div class="wrap" role="region" aria-label="Hợp đồng sắp hết hạn" tabindex="0">
        <table nxtTable>
          <caption class="nxt-visually-hidden">Hợp đồng hết hạn trong 60 ngày tới</caption>
          <thead>
            <tr>
              <th scope="col" class="nxt-table__select">
                <nxt-checkbox
                  class="select-all"
                  label="Chọn tất cả hợp đồng"
                  hideLabel
                  [checked]="selection.allSelected(keys())"
                  [indeterminate]="selection.someSelected(keys())"
                  (checkedChange)="selection.setMany(keys(), $event)"
                />
              </th>
              <th scope="col">Họ và tên</th>
              <th scope="col">Loại hợp đồng</th>
              <th scope="col">Hết hạn</th>
              <th scope="col">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            @for (r of rows(); track r.code) {
              <tr [attr.aria-selected]="selection.has(r.code)">
                <td class="nxt-table__select">
                  <nxt-checkbox
                    [label]="'Chọn ' + r.name"
                    hideLabel
                    [checked]="selection.has(r.code)"
                    (toggled)="selection.select(r.code, $event.checked, { range: $event.shiftKey, order: keys() })"
                  />
                </td>
                <th scope="row">{{ r.name }}</th>
                <td>{{ r.type }}</td>
                <td class="nxt-tabular-nums">{{ r.expires }}</td>
                <td><nxt-tag size="sm" dot [tone]="r.status.tone">{{ r.status.label }}</nxt-tag></td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
    <p class="docs-demo-label status" role="status">{{ message() }}</p>
  `,
  styles: `
    .frame {
      overflow: hidden;
      border: var(--nxt-border-width-default) solid var(--nxt-color-border-default);
      border-radius: var(--nxt-radius-container);
    }
    .bar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--nxt-space-gap-sm);
      min-block-size: calc(var(--nxt-size-control-sm) + 2 * var(--nxt-space-inset-sm));
      padding: var(--nxt-space-inset-sm) var(--nxt-space-inset-md);
      border-block-end: var(--nxt-border-width-default) solid var(--nxt-color-border-default);
    }
    .bar--bulk {
      background: var(--nxt-color-bg-selected);
    }
    .bar__count {
      margin-inline-end: var(--nxt-space-gap-sm);
      color: var(--nxt-color-text-strong);
      font: var(--nxt-typography-label-md);
    }
    .bar__spacer {
      flex: 1;
    }
    .wrap {
      overflow-x: auto;
    }
    .wrap:focus-visible {
      outline: var(--nxt-focus-ring-width) solid var(--nxt-focus-ring-color);
      outline-offset: calc(-1 * var(--nxt-focus-ring-width));
    }
    .status {
      margin-block-start: var(--nxt-space-gap-sm);
    }
  `,
})
export class TableSelectionExample {
  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  private readonly injector = inject(Injector);

  protected readonly rows = signal<Contract[]>([
    { code: 'HD-2024-118', name: 'Phạm Thị Lan', type: 'Xác định thời hạn 24 tháng', expires: '28/10/2026', status: { label: 'Chưa gửi nhắc', tone: 'warning' } },
    { code: 'HD-2025-031', name: 'Lê Hoàng Nam', type: 'Thử việc 2 tháng', expires: '02/11/2026', status: { label: 'Chưa gửi nhắc', tone: 'warning' } },
    { code: 'HD-2024-207', name: 'Đỗ Minh Thư', type: 'Xác định thời hạn 12 tháng', expires: '15/11/2026', status: { label: 'Đã gửi nhắc', tone: 'info' } },
    { code: 'HD-2023-094', name: 'Bùi Quang Huy', type: 'Xác định thời hạn 36 tháng', expires: '30/11/2026', status: { label: 'Đã gia hạn', tone: 'success' } },
    { code: 'HD-2025-112', name: 'Vũ Thanh Tâm', type: 'Thử việc 2 tháng', expires: '12/12/2026', status: { label: 'Chưa gửi nhắc', tone: 'warning' } },
    { code: 'HD-2024-163', name: 'Nguyễn Thị Hồng Nhung', type: 'Xác định thời hạn 24 tháng', expires: '18/12/2026', status: { label: 'Chưa gửi nhắc', tone: 'warning' } },
    { code: 'HD-2025-140', name: 'Trương Đình Khang', type: 'Thử việc 2 tháng', expires: '21/12/2026', status: { label: 'Chưa gửi nhắc', tone: 'warning' } },
  ]);
  /** Selection by contract code, so it survives sorting and filtering. */
  protected readonly selection = new NxtSelection<string>();
  /** Visible rows in display order: Shift range and "select all" work on these. */
  protected readonly keys = computed(() => this.rows().map((r) => r.code));
  protected readonly message = signal('');

  constructor() {
    this.selection.setMany(['HD-2024-118', 'HD-2025-031'], true);
  }

  protected clear() {
    this.endBulk('Đã bỏ chọn tất cả hợp đồng.');
  }

  protected remind() {
    const count = this.selection.count();
    this.rows.update((list) => list.map((r): Contract => (this.selection.has(r.code) ? { ...r, status: { label: 'Đã gửi nhắc', tone: 'info' } } : r)));
    this.endBulk(`Đã gửi nhắc gia hạn tới ${count} nhân viên.`);
  }

  protected exportSelected() {
    this.message.set(`Đang xuất ${this.selection.count()} hợp đồng ra Excel.`);
  }

  /** Clearing the selection removes the bulk bar (and the focused button): put focus back on "select all". */
  private endBulk(message: string) {
    this.selection.clear();
    this.message.set(message);
    afterNextRender(() => this.host.querySelector<HTMLElement>('.select-all input')?.focus(), { injector: this.injector });
  }
}
