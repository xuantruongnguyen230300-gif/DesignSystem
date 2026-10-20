import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NxtButton } from '@nxt/ui/button';
import { NxtInline } from '@nxt/ui/layout';

/** Icon đi kèm nhãn (icon luôn aria-hidden) */
@Component({
  selector: 'example-button-icons',
  imports: [NxtButton, NxtInline],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-inline>
      <button nxtButton variant="primary">
        <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14" /></svg>
        Thêm nhân viên
      </button>
      <button nxtButton>
        <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11M7 10l5 5 5-5M5 20h14" /></svg>
        Xuất Excel
      </button>
      <button nxtButton variant="ghost">
        Thêm bộ lọc
        <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6" /></svg>
      </button>
    </nxt-inline>
  `,
})
export class ButtonIconsExample {}
