import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NxtSkeleton } from '@nxt/ui/skeleton';

/** Các hình giữ chỗ: dòng chữ, tiêu đề, khối, ô nhập, avatar */
@Component({
  selector: 'example-skeleton-variants',
  imports: [NxtSkeleton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Docs example + a11y fixture: the skeletons are aria-hidden; the visible labels name each shape for the reader.
  template: `
    <div class="grid">
      <figure class="cell">
        <nxt-skeleton variant="heading" />
        <nxt-skeleton [lines]="3" />
        <figcaption>heading + text (3 dòng)</figcaption>
      </figure>
      <figure class="cell">
        <div class="person">
          <nxt-skeleton variant="circle" size="lg" />
          <div class="person__text">
            <nxt-skeleton width="long" />
            <nxt-skeleton width="medium" />
          </div>
        </div>
        <figcaption>circle (avatar lg) + text theo bậc rộng</figcaption>
      </figure>
      <figure class="cell">
        <nxt-skeleton width="short" />
        <nxt-skeleton variant="control" />
        <nxt-skeleton width="short" />
        <nxt-skeleton variant="control" width="long" />
        <figcaption>control (ô nhập) kèm nhãn</figcaption>
      </figure>
      <figure class="cell">
        <nxt-skeleton variant="block" class="chart" />
        <figcaption>block (biểu đồ, ảnh)</figcaption>
      </figure>
    </div>
  `,
  styles: `
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(min(100%, var(--nxt-layout-item-min-md)), 1fr));
      gap: var(--nxt-space-gap-lg);
    }
    .cell {
      display: grid;
      align-content: start;
      gap: var(--nxt-space-gap-sm);
      margin: 0;
      padding: var(--nxt-space-inset-md);
      border: var(--nxt-border-width-default) solid var(--nxt-color-border-default);
      border-radius: var(--nxt-radius-container);
      background: var(--nxt-color-bg-surface);
    }
    figcaption {
      color: var(--nxt-color-text-subtle);
      font: var(--nxt-typography-caption);
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
    }
    .chart {
      block-size: var(--nxt-layout-item-min-sm);
    }
  `,
})
export class SkeletonVariantsExample {}
