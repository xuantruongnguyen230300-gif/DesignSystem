import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NxtAlert, NxtAlertTone, NxtLiveRegion } from '@nxt/ui/alert';
import { NxtButton } from '@nxt/ui/button';
import { NxtTag } from '@nxt/ui/tag';

interface Notice {
  text: string;
  tone: NxtAlertTone;
  undo?: () => void;
}

/** Kết quả sau thao tác: vùng nxtLiveRegion có sẵn, alert chèn vào đó được đọc lên; có Hoàn tác */
@Component({
  selector: 'example-alert-live',
  imports: [NxtAlert, NxtButton, NxtLiveRegion, NxtTag],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="demo">
      <div class="row">
        <span>Chức danh đã chọn:</span>
        @for (t of titles(); track t) {
          <nxt-tag>{{ t }}</nxt-tag>
        } @empty {
          <span class="none">không còn</span>
        }
      </div>
      <button nxtButton variant="danger" type="button" [disabled]="!titles().length" (click)="remove()">Xoá {{ titles().length }} chức danh</button>
      <div nxtLiveRegion>
        @if (notice(); as n) {
          <nxt-alert [tone]="n.tone">
            {{ n.text }}
            @if (n.undo) {
              <button nxtAlertActions nxtButton size="sm" variant="ghost" type="button" (click)="undo(n)">Hoàn tác</button>
            }
          </nxt-alert>
        }
      </div>
    </div>
  `,
  styles: `
    .demo {
      display: grid;
      justify-items: start;
      gap: var(--nxt-space-gap-md);
    }
    .demo > [nxtLiveRegion] {
      justify-self: stretch;
    }
    .row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--nxt-space-gap-xs);
    }
    .none {
      color: var(--nxt-color-text-subtle);
    }
  `,
})
export class AlertLiveExample {
  protected readonly titles = signal(['Lái xe', 'Bảo vệ']);
  protected readonly notice = signal<Notice | null>(null);

  protected remove() {
    const before = this.titles();
    this.titles.set([]);
    this.notice.set({ text: `Đã xoá ${before.length} chức danh: ${before.join(', ')}.`, tone: 'success', undo: () => this.titles.set(before) });
  }

  protected undo(n: Notice) {
    n.undo?.();
    this.notice.set({ text: 'Đã hoàn tác, khôi phục chức danh vừa xoá.', tone: 'info' });
  }
}
