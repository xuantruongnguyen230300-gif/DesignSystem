import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NxtButton } from '@nxt/ui/button';
import { NxtIcon, NxtIconSize } from '@nxt/ui/icon';
import { NxtInline, NxtStack } from '@nxt/ui/layout';

/** Ba kích thước, và kích thước kế thừa từ component cha qua --nxt-icon-size */
@Component({
  selector: 'example-icon-sizes',
  imports: [NxtButton, NxtIcon, NxtInline, NxtStack],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-stack gap="lg">
      <nxt-inline gap="xl" align="end">
        @for (s of sizes; track s.size) {
          <span class="specimen">
            <nxt-icon name="calendar-event" [size]="s.size" />
            <span class="docs-demo-label">{{ s.size }} · {{ s.use }}</span>
          </span>
        }
      </nxt-inline>

      <nxt-stack gap="xs">
        <p class="docs-demo-label">Không đặt size: icon lấy --nxt-icon-size do component cha đặt (Button dùng size.icon.sm ở mọi cỡ nút).</p>
        <nxt-inline gap="md">
          <button nxtButton size="sm"><nxt-icon name="download" />Xuất Excel</button>
          <button nxtButton size="lg"><nxt-icon name="download" />Xuất Excel</button>
          <span class="headcount"><nxt-icon name="users" />1.284 nhân viên</span>
        </nxt-inline>
      </nxt-stack>
    </nxt-stack>
  `,
  styles: `
    .specimen {
      display: grid;
      justify-items: center;
      gap: var(--nxt-space-gap-xs);
      color: var(--nxt-color-icon-default);
    }
    /* A custom parent sets the size once for every icon inside it. */
    .headcount {
      --nxt-icon-size: var(--nxt-size-icon-lg);
      display: inline-flex;
      align-items: center;
      gap: var(--nxt-space-gap-xs);
      color: var(--nxt-color-text-strong);
      font: var(--nxt-typography-heading-md);
    }
    .headcount nxt-icon {
      color: var(--nxt-color-icon-primary);
    }
  `,
})
export class IconSizesExample {
  protected readonly sizes: { size: NxtIconSize; use: string }[] = [
    { size: 'sm', use: 'trong control, bảng' },
    { size: 'md', use: 'đứng riêng, control lg' },
    { size: 'lg', use: 'minh hoạ, empty state nhỏ' },
  ];
}
