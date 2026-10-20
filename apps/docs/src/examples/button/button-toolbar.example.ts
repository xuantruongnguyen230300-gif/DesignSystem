import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NxtButton } from '@nxt/ui/button';
import { NxtIcon } from '@nxt/ui/icon';
import { NxtSearch } from '@nxt/ui/search';
import { NxtTooltip } from '@nxt/ui/tooltip';

/** Thanh công cụ trang danh sách: nhập/xuất Excel là hai nút icon, "Thêm mới" là primary ngoài cùng bên phải */
@Component({
  selector: 'example-button-toolbar',
  imports: [NxtButton, NxtIcon, NxtSearch, NxtTooltip],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="toolbar">
      <nxt-search class="toolbar__search" label="Tìm nhân viên" placeholder="Mã, họ tên hoặc phòng ban" />
      <div class="toolbar__actions">
        <button nxtIconButton type="button" aria-label="Nhập nhân viên từ Excel" nxtTooltip="Nhập nhân viên từ Excel">
          <nxt-icon name="file-upload" />
        </button>
        <button nxtIconButton type="button" aria-label="Xuất 1.284 nhân viên ra Excel" nxtTooltip="Xuất 1.284 nhân viên ra Excel">
          <nxt-icon name="file-download" />
        </button>
        <span class="toolbar__divider" aria-hidden="true"></span>
        <button nxtButton variant="primary" type="button" aria-label="Thêm mới nhân viên"><nxt-icon name="plus" />Thêm mới</button>
      </div>
    </div>
  `,
  styles: `
    .toolbar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--nxt-space-gap-sm);
      padding: var(--nxt-space-inset-sm) var(--nxt-space-inset-md);
      border: var(--nxt-border-width-default) solid var(--nxt-color-border-default);
      border-radius: var(--nxt-radius-container);
      background: var(--nxt-color-bg-surface);
    }
    .toolbar__search {
      flex: 1 1 var(--nxt-layout-item-min-sm);
      max-inline-size: var(--nxt-size-400);
    }
    .toolbar__actions {
      display: flex;
      align-items: center;
      gap: var(--nxt-space-gap-sm);
      margin-inline-start: auto;
    }
    .toolbar__divider {
      align-self: stretch;
      border-inline-start: var(--nxt-border-width-default) solid var(--nxt-color-border-default);
    }
  `,
})
export class ButtonToolbarExample {}
