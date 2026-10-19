import { NgComponentOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, Type, computed, effect, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EXAMPLES } from '../../generated/examples';
import type { ExampleEntry } from '../core/types';
import { CopyButton } from '../shell/copy-button';
import { DocsIcon } from '../shell/icons';

let nextId = 0;

/**
 * Live example. The canvas can switch color/density *locally* — this exercises the token engine's
 * nested modes (a dark example on a light page) exactly like a product would.
 */
@Component({
  selector: 'docs-example',
  imports: [NgComponentOutlet, RouterLink, CopyButton, DocsIcon],
  template: `
    <div class="docs-example" role="group" [attr.aria-labelledby]="uid + '-title'">
      <div class="docs-example__bar">
        <span class="docs-example__title" [id]="uid + '-title'">{{ entry()?.title ?? id() }}</span>
        <div class="docs-example__tools">
          <label class="docs-select docs-select--sm">
            <span class="nxt-visually-hidden">Màu của ví dụ</span>
            <select [value]="color()" (change)="color.set(pick($event))">
              <option value="">Màu: theo trang</option>
              <option value="light">Màu: sáng</option>
              <option value="dark">Màu: tối</option>
            </select>
          </label>
          <label class="docs-select docs-select--sm">
            <span class="nxt-visually-hidden">Mật độ của ví dụ</span>
            <select [value]="density()" (change)="density.set(pick($event))">
              <option value="">Mật độ: theo trang</option>
              <option value="compact">Mật độ: gọn</option>
              <option value="comfortable">Mật độ: vừa</option>
              <option value="spacious">Mật độ: rộng</option>
            </select>
          </label>
          <button type="button" class="docs-tool" [attr.aria-expanded]="showCode()" [attr.aria-controls]="uid + '-code'" (click)="showCode.set(!showCode())">
            {{ showCode() ? 'Ẩn code' : 'Xem code' }}
          </button>
          <a class="docs-tool" [routerLink]="['/examples', id()]" target="_blank">
            <docs-icon name="external" /><span>Mở riêng</span><span class="nxt-visually-hidden">(tab mới)</span>
          </a>
        </div>
      </div>
      <div class="docs-example__canvas" data-example-root [attr.data-nxt-color]="color() || null" [attr.data-nxt-density]="density() || null">
        @if (component(); as c) {
          <ng-container *ngComponentOutlet="c" />
        } @else if (failed()) {
          <p class="docs-example__state" role="alert">Không tải được ví dụ “{{ id() }}”.</p>
        } @else {
          <p class="docs-example__state">Đang tải ví dụ…</p>
        }
      </div>
      @if (showCode() && entry(); as e) {
        <div class="docs-example__code" [id]="uid + '-code'">
          <div class="docs-example__code-bar"><docs-copy [text]="e.source" label="Sao chép code" /></div>
          <pre tabindex="0"><code>{{ e.source }}</code></pre>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExampleFrame {
  readonly id = input.required<string>();
  protected readonly uid = `docs-example-${nextId++}`;
  protected readonly entry = computed<ExampleEntry | undefined>(() => EXAMPLES[this.id()]);
  protected readonly component = signal<Type<unknown> | null>(null);
  protected readonly failed = signal(false);
  protected readonly color = signal('');
  protected readonly density = signal('');
  protected readonly showCode = signal(false);

  constructor() {
    effect(() => {
      const e = this.entry();
      this.component.set(null);
      this.failed.set(!e);
      e?.load().then(
        (c) => this.component.set(c),
        () => this.failed.set(true),
      );
    });
  }

  protected pick(event: Event): string {
    return (event.target as HTMLSelectElement).value;
  }
}
