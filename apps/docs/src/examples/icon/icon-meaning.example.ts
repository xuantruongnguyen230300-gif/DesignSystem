import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NxtButton } from '@nxt/ui/button';
import { NxtIcon } from '@nxt/ui/icon';
import { NxtInline, NxtStack } from '@nxt/ui/layout';
import { NxtTooltip } from '@nxt/ui/tooltip';

interface Doc {
  name: string;
  signed: boolean;
}

const DOCS: Doc[] = [
  { name: 'Hợp đồng lao động HĐ-2024-0311', signed: true },
  { name: 'Phụ lục điều chỉnh lương 01/2026', signed: true },
  { name: 'Cam kết bảo mật thông tin', signed: false },
];

/** Icon trang trí, icon tự mang nghĩa (label), và nút chỉ có icon */
@Component({
  selector: 'example-icon-meaning',
  imports: [NxtButton, NxtIcon, NxtInline, NxtStack, NxtTooltip],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-stack gap="lg">
      <nxt-stack gap="xs">
        <p class="docs-demo-label">Trang trí: có chữ đi kèm, icon bị ẩn khỏi screen reader (mặc định).</p>
        <nxt-inline>
          <button nxtButton><nxt-icon name="printer" />In hồ sơ</button>
        </nxt-inline>
      </nxt-stack>

      <nxt-stack gap="xs">
        <p class="docs-demo-label">Mang nghĩa: không có chữ đi kèm, đặt label để screen reader đọc.</p>
        <ul class="docs" role="list">
          @for (d of docs; track d.name) {
            <li class="doc">
              <nxt-icon class="doc__file" name="file-text" />
              <span class="doc__name">{{ d.name }}</span>
              @if (d.signed) {
                <nxt-icon class="doc__state doc__state--done" name="circle-check" label="Đã ký" />
              } @else {
                <nxt-icon class="doc__state" name="clock-hour-4" label="Chờ ký" />
              }
              <button nxtIconButton variant="ghost" size="sm" [attr.aria-label]="'Tải xuống ' + d.name" nxtTooltip="Tải xuống">
                <nxt-icon name="download" />
              </button>
            </li>
          }
        </ul>
      </nxt-stack>
    </nxt-stack>
  `,
  styles: `
    .docs {
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .doc {
      display: flex;
      align-items: center;
      gap: var(--nxt-space-gap-sm);
      padding-block: var(--nxt-space-inset-xs);
    }
    .doc + .doc {
      border-block-start: var(--nxt-border-width-default) solid var(--nxt-color-border-subtle);
    }
    .doc__file {
      color: var(--nxt-color-icon-subtle);
    }
    .doc__name {
      flex: 1;
      min-inline-size: 0;
    }
    .doc__state {
      color: var(--nxt-color-icon-warning);
    }
    .doc__state--done {
      color: var(--nxt-color-icon-success);
    }
  `,
})
export class IconMeaningExample {
  protected readonly docs = DOCS;
}
