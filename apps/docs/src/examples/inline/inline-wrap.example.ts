import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NxtInline, NxtStack } from '@nxt/ui/layout';

/** Inline tự xuống dòng khi hết chỗ: danh sách kỹ năng */
@Component({
  selector: 'example-inline-wrap',
  imports: [NxtInline, NxtStack],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-stack gap="sm">
      <p class="nxt-text-label-md">Kỹ năng</p>
      <nxt-inline gap="xs">
        @for (s of skills; track s) {
          <span class="docs-status" data-status="draft">{{ s }}</span>
        }
      </nxt-inline>
    </nxt-stack>
  `,
})
export class InlineWrapExample {
  protected readonly skills = [
    'Quản lý dự án',
    'Phân tích nghiệp vụ',
    'Excel nâng cao',
    'Đàm phán',
    'Tiếng Anh B2',
    'Lãnh đạo nhóm',
    'Luật lao động',
    'Tuyển dụng',
    'Đánh giá năng lực',
  ];
}
