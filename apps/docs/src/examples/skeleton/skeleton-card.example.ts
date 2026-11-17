import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { NxtLiveRegion } from '@nxt/ui/alert';
import { NxtAvatar } from '@nxt/ui/avatar';
import { NxtButton } from '@nxt/ui/button';
import { NxtCard } from '@nxt/ui/card';
import { NxtDescription, NxtDescriptions } from '@nxt/ui/descriptions';
import { NxtIcon } from '@nxt/ui/icon';
import { NxtSkeleton, nxtDeferredLoading } from '@nxt/ui/skeleton';

/** Thẻ đang tải: aria-busy, câu trạng thái, chỉ hiện skeleton khi tải lâu hơn 1 giây */
@Component({
  selector: 'example-skeleton-card',
  imports: [NxtAvatar, NxtButton, NxtCard, NxtDescription, NxtDescriptions, NxtIcon, NxtLiveRegion, NxtSkeleton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Docs example + a11y fixture: loaded at first (stable for screenshots); the buttons simulate a slow and a fast server.
  template: `
    <div class="bar">
      <button nxtButton size="sm" type="button" [loading]="loading()" (click)="reload(1800)"><nxt-icon name="refresh" />Tải lại (chậm, 1,8 giây)</button>
      <button nxtButton size="sm" variant="ghost" type="button" [disabled]="loading()" (click)="reload(400)">Tải lại (nhanh, 0,4 giây)</button>
    </div>
    <p class="nxt-visually-hidden" nxtLiveRegion>{{ status() }}</p>

    <nxt-card title="Người quản lý trực tiếp" class="card">
      <div class="body" [attr.aria-busy]="loading() || null">
        @if (showSkeleton()) {
          <div class="person">
            <nxt-skeleton variant="circle" size="lg" />
            <div class="person__text">
              <nxt-skeleton width="long" />
              <nxt-skeleton width="medium" />
            </div>
          </div>
          <nxt-skeleton [lines]="2" />
        } @else if (!loading()) {
          <div class="person">
            <nxt-avatar name="Trần Văn Bình" size="lg" />
            <div class="person__text">
              <p class="name">Trần Văn Bình</p>
              <p class="sub">Trưởng phòng Tài chính – Kế toán</p>
            </div>
          </div>
          <dl nxtDescriptions [columns]="2">
            <div nxtDescription label="Điện thoại"><span class="nxt-tabular-nums">0903 112 245</span></div>
            <div nxtDescription label="Email">binh.tv&#64;nxt.vn</div>
          </dl>
        } @else {
          <!-- Under one second: keep the room, show nothing (no flash). -->
          <div class="hold"></div>
        }
      </div>
    </nxt-card>
  `,
  styles: `
    :host {
      display: grid;
      gap: var(--nxt-space-gap-md);
    }
    .bar {
      display: flex;
      flex-wrap: wrap;
      gap: var(--nxt-space-gap-sm);
    }
    .card {
      max-inline-size: var(--nxt-layout-content-narrow);
    }
    .body {
      display: grid;
      gap: var(--nxt-space-gap-md);
    }
    .person {
      display: flex;
      align-items: center;
      gap: var(--nxt-space-gap-md);
    }
    .person__text {
      display: grid;
      flex: 1;
      gap: var(--nxt-space-gap-xs);
      min-inline-size: 0;
    }
    .name {
      color: var(--nxt-color-text-strong);
      font: var(--nxt-typography-label-md);
    }
    .sub {
      color: var(--nxt-color-text-subtle);
      font: var(--nxt-typography-body-sm);
    }
    .hold {
      min-block-size: var(--nxt-layout-item-min-sm);
    }
  `,
})
export class SkeletonCardExample {
  protected readonly loading = signal(false);
  /** Skeleton only when the load takes longer than 1 s; once shown, at least 0.5 s. */
  protected readonly showSkeleton = nxtDeferredLoading(this.loading);
  protected readonly status = signal('');
  private timer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
  }

  /** Simulated request (fixed duration, no randomness). */
  protected reload(ms: number) {
    clearTimeout(this.timer);
    this.loading.set(true);
    this.status.set('Đang tải thông tin người quản lý…');
    this.timer = setTimeout(() => {
      this.loading.set(false);
      this.status.set('Đã tải xong thông tin người quản lý.');
    }, ms);
  }
}
