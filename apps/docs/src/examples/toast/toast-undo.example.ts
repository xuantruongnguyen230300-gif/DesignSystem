import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NxtButton } from '@nxt/ui/button';
import { NxtTag } from '@nxt/ui/tag';
import { NxtToast } from '@nxt/ui/toast';

interface JobTitle {
  code: string;
  name: string;
  active: boolean;
}

/** Có một hành động "Hoàn tác": toast hiện 10 giây, dừng khi rê chuột hoặc focus; "Dùng lại" vẫn có trên hàng */
@Component({
  selector: 'example-toast-undo',
  imports: [NxtButton, NxtTag],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <table class="titles">
      <caption class="nxt-visually-hidden">Chức danh</caption>
      <thead>
        <tr>
          <th scope="col">Mã</th>
          <th scope="col">Chức danh</th>
          <th scope="col">Trạng thái</th>
          <th scope="col"><span class="nxt-visually-hidden">Thao tác</span></th>
        </tr>
      </thead>
      <tbody>
        @for (t of titles(); track t.code) {
          <tr>
            <td class="nxt-tabular-nums">{{ t.code }}</td>
            <td>{{ t.name }}</td>
            <td>
              <nxt-tag [tone]="t.active ? 'success' : 'neutral'" dot>{{ t.active ? 'Đang dùng' : 'Ngừng sử dụng' }}</nxt-tag>
            </td>
            <td class="actions">
              <!-- The other way back: "Dùng lại" stays on the row after the toast has gone. -->
              <button nxtButton size="sm" variant="ghost" type="button" [attr.aria-label]="(t.active ? 'Ngừng sử dụng ' : 'Dùng lại ') + t.name" (click)="toggle(t)">
                {{ t.active ? 'Ngừng sử dụng' : 'Dùng lại' }}
              </button>
            </td>
          </tr>
        }
      </tbody>
    </table>
    <p class="docs-demo-label">{{ activeCount() }} trong {{ titles().length }} chức danh đang dùng</p>
  `,
  styles: `
    .titles {
      inline-size: 100%;
      border-collapse: collapse;
      font: var(--nxt-typography-body-md);
    }
    th {
      color: var(--nxt-color-text-subtle);
      font: var(--nxt-typography-label-sm);
      text-align: start;
    }
    th,
    td {
      padding: var(--nxt-space-inset-xs) var(--nxt-space-inset-sm);
      border-block-end: var(--nxt-border-width-default) solid var(--nxt-color-border-subtle);
    }
    .actions {
      text-align: end;
    }
  `,
})
export class ToastUndoExample {
  private readonly toast = inject(NxtToast);
  protected readonly titles = signal<JobTitle[]>([
    { code: 'KT-01', name: 'Kế toán tổng hợp', active: true },
    { code: 'KD-04', name: 'Trưởng nhóm kinh doanh', active: true },
    { code: 'NS-02', name: 'Chuyên viên tuyển dụng', active: true },
  ]);
  protected readonly activeCount = computed(() => this.titles().filter((t) => t.active).length);

  protected toggle(title: JobTitle) {
    const next = !title.active;
    this.set(title.code, next);
    if (next) {
      this.toast.show(`Đã dùng lại chức danh “${title.name}”.`);
      return;
    }
    this.toast
      .show(`Đã ngừng sử dụng chức danh “${title.name}”.`, { action: 'Hoàn tác' })
      .onAction.subscribe(() => {
        this.set(title.code, true);
        this.toast.show(`Đã dùng lại chức danh “${title.name}”.`);
      });
  }

  private set(code: string, active: boolean) {
    this.titles.update((list) => list.map((t) => (t.code === code ? { ...t, active } : t)));
  }
}
