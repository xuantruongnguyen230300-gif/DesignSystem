import { LiveAnnouncer } from '@angular/cdk/a11y';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, signal } from '@angular/core';
import { DocsIcon } from './icons';

/** Copies text and announces the result to screen readers (WCAG 4.1.3 status messages). */
@Component({
  selector: 'docs-copy',
  imports: [DocsIcon],
  template: `
    <button type="button" class="docs-tool" (click)="copy()">
      <docs-icon [name]="copied() ? 'check' : 'copy'" />
      <span>{{ copied() ? 'Đã sao chép' : label() }}</span>
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CopyButton {
  readonly text = input.required<string>();
  readonly label = input('Sao chép');
  protected readonly copied = signal(false);
  private readonly announcer = inject(LiveAnnouncer);
  private timer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
  }

  async copy() {
    try {
      await navigator.clipboard.writeText(this.text());
      this.copied.set(true);
      void this.announcer.announce('Đã sao chép vào bộ nhớ tạm');
      clearTimeout(this.timer);
      this.timer = setTimeout(() => this.copied.set(false), 2000);
    } catch {
      void this.announcer.announce('Không sao chép được. Hãy chọn và sao chép thủ công.', 'assertive');
    }
  }
}
