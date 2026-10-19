import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NxtButton } from '@nxt/ui/button';
import { NxtDescription, NxtDescriptions } from '@nxt/ui/descriptions';
import { NxtDrawerLayout } from '@nxt/ui/drawer';
import { NxtIcon } from '@nxt/ui/icon';
import { NxtTag } from '@nxt/ui/tag';
import { NxtTimeline, NxtTimelineItem } from '@nxt/ui/timeline';
import { NxtTooltip } from '@nxt/ui/tooltip';
import { CatalogDef, CatalogItem, formatValue, usageOf } from './catalog-data';

export interface CatalogDetailData {
  def: CatalogDef;
  /** The rows as the user sees them (search, filters, sort), to move to the previous / next record. */
  rows: CatalogItem[];
  index: number;
}

export interface CatalogDetailResult {
  action: 'edit' | 'duplicate' | 'toggle';
  item: CatalogItem;
}

/** Read-only detail of a catalog record, opened from a row; previous / next without closing (Alt+↑ / Alt+↓). */
@Component({
  selector: 'example-catalog-detail',
  imports: [NxtButton, NxtDescription, NxtDescriptions, NxtDrawerLayout, NxtIcon, NxtTag, NxtTimeline, NxtTimelineItem, NxtTooltip],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(keydown)': 'onKey($event)' },
  template: `
    <nxt-drawer-layout [title]="item().name" [description]="data.def.label + ' · ' + item().code">
      <div class="detail">
        <div class="pager" role="group" [attr.aria-label]="'Chuyển ' + data.def.noun">
          <button nxtIconButton size="sm" type="button" aria-label="Bản ghi trước" nxtTooltip="Bản ghi trước (Alt+↑)" aria-keyshortcuts="Alt+ArrowUp" [disabled]="index() === 0" (click)="move(-1)">
            <nxt-icon name="chevron-up" />
          </button>
          <button nxtIconButton size="sm" type="button" aria-label="Bản ghi sau" nxtTooltip="Bản ghi sau (Alt+↓)" aria-keyshortcuts="Alt+ArrowDown" [disabled]="index() === data.rows.length - 1" (click)="move(1)">
            <nxt-icon name="chevron-down" />
          </button>
          <span class="pager__pos nxt-tabular-nums">{{ index() + 1 }} / {{ data.rows.length }}</span>
          <span class="nxt-visually-hidden" role="status">Đang xem {{ item().name }}, {{ index() + 1 }} trên {{ data.rows.length }}</span>
        </div>

        <section class="section" aria-labelledby="detail-info">
          <h3 id="detail-info" class="section__title">Thông tin</h3>
          <dl nxtDescriptions>
            <div nxtDescription label="Mã"><span class="code">{{ item().code }}</span></div>
            <div nxtDescription label="Trạng thái">
              <nxt-tag [tone]="item().active ? 'success' : 'neutral'" dot>{{ item().active ? 'Đang sử dụng' : 'Ngừng sử dụng' }}</nxt-tag>
            </div>
            @for (f of data.def.fields; track f.key) {
              <div nxtDescription [label]="f.label">{{ format(f, item().extra[f.key]) }}</div>
            }
            <div nxtDescription label="Cập nhật lần cuối"><span class="nxt-tabular-nums">{{ item().updated }}</span></div>
            <div nxtDescription label="Mô tả" full>{{ item().description || '—' }}</div>
          </dl>
          @if (usage()) {
            <p class="note"><nxt-icon name="info-circle" size="sm" />Đang được dùng ở {{ usage() }} hồ sơ: không xoá được, chỉ có thể ngừng sử dụng.</p>
          }
        </section>

        <section class="section" aria-labelledby="detail-history">
          <h3 id="detail-history" class="section__title">Lịch sử thay đổi</h3>
          <nxt-timeline>
            <nxt-timeline-item title="Cập nhật thông tin" [time]="item().updated" icon="pencil" tone="brand">Phạm Thu Hà · Chuyên viên C&amp;B</nxt-timeline-item>
            <nxt-timeline-item title="Tạo mới" time="02/01/2026" icon="plus">Đặng Anh · Trưởng phòng Nhân sự</nxt-timeline-item>
          </nxt-timeline>
        </section>
      </div>
      <ng-container ngProjectAs="[nxtDrawerFooter]">
        <button nxtButton type="button" (click)="close('duplicate')"><nxt-icon name="copy" />Nhân bản</button>
        <button nxtButton type="button" (click)="close('toggle')">
          <nxt-icon [name]="item().active ? 'ban' : 'restore'" />{{ item().active ? 'Ngừng sử dụng' : 'Dùng lại' }}
        </button>
        <span class="spacer"></span>
        <button nxtButton variant="primary" type="button" (click)="close('edit')"><nxt-icon name="pencil" />Sửa</button>
      </ng-container>
    </nxt-drawer-layout>
  `,
  styles: `
    .detail {
      display: grid;
      gap: var(--nxt-space-gap-lg);
    }
    .pager {
      display: flex;
      align-items: center;
      gap: var(--nxt-space-gap-xs);
    }
    .pager__pos {
      color: var(--nxt-color-text-subtle);
      font: var(--nxt-typography-label-sm);
    }
    .section {
      display: grid;
      gap: var(--nxt-space-gap-md);
    }
    .section__title {
      color: var(--nxt-color-text-strong);
      font: var(--nxt-typography-label-md);
    }
    .code {
      font: var(--nxt-typography-code);
    }
    .note {
      --nxt-icon-size: var(--nxt-size-icon-sm);
      display: flex;
      align-items: flex-start;
      gap: var(--nxt-space-gap-xs);
      color: var(--nxt-color-text-subtle);
      font: var(--nxt-typography-body-sm);
    }
    .spacer {
      flex: 1;
    }
  `,
})
export class CatalogDetail {
  private readonly ref = inject<DialogRef<CatalogDetailResult>>(DialogRef);
  protected readonly data = inject<CatalogDetailData>(DIALOG_DATA);
  protected readonly index = signal(this.data.index);
  protected readonly item = computed(() => this.data.rows[this.index()]);
  protected readonly usage = computed(() => usageOf(this.data.def, this.item()));
  protected readonly format = formatValue;

  protected move(step: number) {
    const next = this.index() + step;
    if (next >= 0 && next < this.data.rows.length) this.index.set(next);
  }

  protected onKey(event: KeyboardEvent) {
    if (!event.altKey || (event.key !== 'ArrowUp' && event.key !== 'ArrowDown')) return;
    event.preventDefault();
    this.move(event.key === 'ArrowUp' ? -1 : 1);
  }

  protected close(action: CatalogDetailResult['action']) {
    this.ref.close({ action, item: this.item() });
  }
}
