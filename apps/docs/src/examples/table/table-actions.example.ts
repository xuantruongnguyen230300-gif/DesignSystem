import { ChangeDetectionStrategy, Component, ElementRef, Injector, afterNextRender, inject, signal } from '@angular/core';
import { NxtButton } from '@nxt/ui/button';
import { NxtIcon } from '@nxt/ui/icon';
import { NxtTable } from '@nxt/ui/table';
import { NxtTag, NxtTone } from '@nxt/ui/tag';
import { NxtTooltip } from '@nxt/ui/tooltip';

interface Candidate {
  code: string;
  name: string;
  position: string;
  stage: { label: string; tone: NxtTone };
}

const CANDIDATES: Candidate[] = [
  { code: 'UV-301', name: 'Nguyễn Văn An', position: 'Kỹ sư kiểm thử', stage: { label: 'Phỏng vấn vòng 2', tone: 'info' } },
  { code: 'UV-302', name: 'Trần Thị Bích', position: 'Chuyên viên tuyển dụng', stage: { label: 'Chờ đề nghị', tone: 'warning' } },
  { code: 'UV-303', name: 'Lê Minh Châu', position: 'Kế toán thuế', stage: { label: 'Đã nhận việc', tone: 'success' } },
  { code: 'UV-304', name: 'Phạm Quốc Dũng', position: 'Kỹ sư kiểm thử', stage: { label: 'Không đạt', tone: 'neutral' } },
];

/** Thao tác trên hàng: nút icon có tên gồm cả đối tượng của hàng */
@Component({
  selector: 'example-table-actions',
  imports: [NxtButton, NxtIcon, NxtTable, NxtTag, NxtTooltip],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="wrap" role="region" aria-label="Ứng viên đang theo dõi" tabindex="0">
      <table nxtTable>
        <caption class="nxt-visually-hidden">Ứng viên đang theo dõi, {{ rows().length }} người</caption>
        <thead>
          <tr>
            <th scope="col">Họ và tên</th>
            <th scope="col">Vị trí ứng tuyển</th>
            <th scope="col">Giai đoạn</th>
            <th scope="col" class="nxt-table__actions"><span class="nxt-visually-hidden">Thao tác</span></th>
          </tr>
        </thead>
        <tbody>
          @for (r of rows(); track r.code) {
            <tr>
              <th scope="row">{{ r.name }}</th>
              <td>{{ r.position }}</td>
              <td><nxt-tag size="sm" dot [tone]="r.stage.tone">{{ r.stage.label }}</nxt-tag></td>
              <td class="nxt-table__actions">
                <button nxtIconButton size="sm" variant="ghost" type="button" [attr.aria-label]="'Sửa ' + r.name" nxtTooltip="Sửa" (click)="edit(r)">
                  <nxt-icon name="pencil" />
                </button>
                <button nxtIconButton size="sm" variant="ghost" type="button" data-remove [attr.aria-label]="'Xoá ' + r.name" nxtTooltip="Xoá" (click)="remove(r, $index)">
                  <nxt-icon name="trash" />
                </button>
              </td>
            </tr>
          } @empty {
            <tr>
              <td colspan="4" class="empty">Không còn ứng viên nào trong danh sách.</td>
            </tr>
          }
        </tbody>
      </table>
    </div>
    <div class="footer">
      <p class="docs-demo-label" role="status">{{ message() }}</p>
      @if (rows().length < all.length) {
        <button nxtButton size="sm" variant="ghost" type="button" (click)="restore()"><nxt-icon name="restore" />Khôi phục dữ liệu mẫu</button>
      }
    </div>
  `,
  styles: `
    .wrap {
      overflow-x: auto;
      border: var(--nxt-border-width-default) solid var(--nxt-color-border-default);
      border-radius: var(--nxt-radius-container);
    }
    .wrap:focus-visible {
      outline: var(--nxt-focus-ring-width) solid var(--nxt-focus-ring-color);
      outline-offset: var(--nxt-focus-ring-offset);
    }
    .empty {
      color: var(--nxt-color-text-subtle);
      text-align: center;
    }
    .footer {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: var(--nxt-space-gap-sm);
      margin-block-start: var(--nxt-space-gap-sm);
    }
  `,
})
export class TableActionsExample {
  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  private readonly injector = inject(Injector);
  protected readonly all = CANDIDATES;
  protected readonly rows = signal(CANDIDATES);
  protected readonly message = signal('');

  protected edit(r: Candidate) {
    this.message.set(`Mở form sửa hồ sơ ứng viên ${r.name}.`);
  }

  protected remove(r: Candidate, index: number) {
    this.rows.update((list) => list.filter((x) => x.code !== r.code));
    this.message.set(`Đã xoá ứng viên ${r.name} khỏi danh sách theo dõi.`);
    // The focused button is gone: move focus to the same action on the next row (or the region when empty).
    afterNextRender(
      () => {
        const buttons = this.host.querySelectorAll<HTMLElement>('[data-remove]');
        (buttons[Math.min(index, buttons.length - 1)] ?? this.host.querySelector<HTMLElement>('[role="region"]'))?.focus();
      },
      { injector: this.injector },
    );
  }

  protected restore() {
    this.rows.set(CANDIDATES);
    this.message.set('Đã khôi phục danh sách ứng viên.');
    // This button disappears once the list is full again: keep focus inside the example.
    afterNextRender(() => this.host.querySelector<HTMLElement>('[role="region"]')?.focus(), { injector: this.injector });
  }
}
