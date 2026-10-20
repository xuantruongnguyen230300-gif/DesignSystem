import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { NxtButton } from '@nxt/ui/button';
import { NxtIcon } from '@nxt/ui/icon';
import { NxtInline, NxtStack } from '@nxt/ui/layout';
import { NxtProgress } from '@nxt/ui/progress';

/** Nhập file: valueText đọc số hồ sơ thay cho phần trăm */
@Component({
  selector: 'example-progress-import',
  imports: [NxtButton, NxtIcon, NxtInline, NxtProgress, NxtStack],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-stack gap="md" class="import">
      <nxt-stack gap="xs">
        <nxt-inline justify="between">
          <span class="import__file"><nxt-icon name="file-import" />nhan-vien-thang-10.xlsx</span>
          <span class="import__count nxt-tabular-nums">{{ done() }}/{{ total }} hồ sơ</span>
        </nxt-inline>
        <nxt-progress
          label="Nhập hồ sơ từ nhan-vien-thang-10.xlsx"
          [value]="percent()"
          [valueText]="done() + ' trên ' + total + ' hồ sơ'"
          [tone]="done() === total ? 'success' : 'brand'"
        />
      </nxt-stack>
      <nxt-inline>
        <button nxtButton type="button" [loading]="running()" (click)="run()">Nhập lại từ đầu</button>
      </nxt-inline>
      <p class="docs-demo-label" role="status">{{ message() }}</p>
    </nxt-stack>
  `,
  styles: `
    .import {
      max-inline-size: var(--nxt-layout-content-narrow);
    }
    .import__file {
      --nxt-icon-size: var(--nxt-size-icon-sm);
      display: inline-flex;
      align-items: center;
      gap: var(--nxt-space-1);
      color: var(--nxt-color-text-strong);
      font: var(--nxt-typography-label-md);
    }
    .import__count {
      color: var(--nxt-color-text-subtle);
      font: var(--nxt-typography-body-sm);
    }
  `,
})
export class ProgressImportExample {
  protected readonly total = 40;
  protected readonly done = signal(12);
  protected readonly running = signal(false);
  protected readonly message = signal('');
  protected readonly percent = computed(() => (this.done() / this.total) * 100);
  private timer: ReturnType<typeof setInterval> | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearInterval(this.timer));
  }

  protected run() {
    clearInterval(this.timer);
    this.done.set(0);
    this.running.set(true);
    // Announce start and end only — the progressbar itself carries the running value.
    this.message.set(`Đang nhập ${this.total} hồ sơ…`);
    this.timer = setInterval(() => {
      this.done.update((n) => n + 1);
      if (this.done() >= this.total) {
        clearInterval(this.timer);
        this.running.set(false);
        this.message.set(`Đã nhập xong ${this.total} hồ sơ, không có lỗi.`);
      }
    }, 80);
  }
}
