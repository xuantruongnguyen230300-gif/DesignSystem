import { ChangeDetectionStrategy, Component, ElementRef, Injector, afterNextRender, computed, inject, signal } from '@angular/core';
import { NxtButton } from '@nxt/ui/button';
import { NxtCheckbox } from '@nxt/ui/checkbox';
import { NxtIcon } from '@nxt/ui/icon';
import { NxtTable } from '@nxt/ui/table';
import { NxtTag, NxtTone } from '@nxt/ui/tag';

interface Contract {
  code: string;
  name: string;
  type: string;
  expires: string;
  status: { label: string; tone: NxtTone };
}

/** Chọn nhiều hàng: ô chọn tất cả, hàng đã chọn, thanh thao tác hàng loạt */
@Component({
  selector: 'example-table-selection',
  imports: [NxtButton, NxtCheckbox, NxtIcon, NxtTable, NxtTag],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="frame">
      @if (selected().size) {
        <div class="bar bar--bulk" role="group" aria-label="Thao tác với hợp đồng đã chọn">
          <span class="bar__count">Đã chọn {{ selected().size }} hợp đồng</span>
          <button nxtButton size="sm" type="button" (click)="remind()"><nxt-icon name="send" />Gửi nhắc gia hạn</button>
          <button nxtButton size="sm" type="button" (click)="exportSelected()"><nxt-icon name="download" />Xuất Excel</button>
          <span class="bar__spacer"></span>
          <button nxtButton size="sm" variant="ghost" type="button" (click)="clear()">Bỏ chọn</button>
        </div>
      } @else {
        <div class="bar">
          <span class="docs-demo-label">Chọn hợp đồng để gửi nhắc gia hạn hoặc xuất file.</span>
        </div>
      }
      <div class="wrap" role="region" aria-label="Hợp đồng sắp hết hạn" tabindex="0">
        <table nxtTable>
          <caption class="nxt-visually-hidden">Hợp đồng hết hạn trong 60 ngày tới</caption>
          <thead>
            <tr>
              <th scope="col" class="nxt-table__select">
                <nxt-checkbox class="select-all" label="Chọn tất cả hợp đồng" hideLabel [checked]="all()" [indeterminate]="some()" (checkedChange)="toggleAll($event)" />
              </th>
              <th scope="col">Họ và tên</th>
              <th scope="col">Loại hợp đồng</th>
              <th scope="col">Hết hạn</th>
              <th scope="col">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            @for (r of rows(); track r.code) {
              <tr [attr.aria-selected]="selected().has(r.code)">
                <td class="nxt-table__select">
                  <nxt-checkbox [label]="'Chọn ' + r.name" hideLabel [checked]="selected().has(r.code)" (checkedChange)="toggle(r.code, $event)" />
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
  ]);
  protected readonly selected = signal(new Set<string>(['HD-2024-118', 'HD-2025-031']));
  protected readonly message = signal('');

  protected readonly all = computed(() => this.selected().size === this.rows().length);
  protected readonly some = computed(() => this.selected().size > 0 && !this.all());

  protected toggle(code: string, checked: boolean) {
    const next = new Set(this.selected());
    if (checked) next.add(code);
    else next.delete(code);
    this.selected.set(next);
  }

  protected toggleAll(checked: boolean) {
    this.selected.set(new Set(checked ? this.rows().map((r) => r.code) : []));
  }

  protected clear() {
    this.endBulk('Đã bỏ chọn tất cả hợp đồng.');
  }

  protected remind() {
    const codes = this.selected();
    this.rows.update((list) => list.map((r): Contract => (codes.has(r.code) ? { ...r, status: { label: 'Đã gửi nhắc', tone: 'info' } } : r)));
    this.endBulk(`Đã gửi nhắc gia hạn tới ${codes.size} nhân viên.`);
  }

  protected exportSelected() {
    this.message.set(`Đang xuất ${this.selected().size} hợp đồng ra Excel.`);
  }

  /** Clearing the selection removes the bulk bar (and the focused button): put focus back on "select all". */
  private endBulk(message: string) {
    this.selected.set(new Set());
    this.message.set(message);
    afterNextRender(() => this.host.querySelector<HTMLElement>('.select-all input')?.focus(), { injector: this.injector });
  }
}
