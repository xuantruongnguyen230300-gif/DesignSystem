import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { NxtTheme } from '@nxt/ui';
import { NxtButton } from '@nxt/ui/button';
import { NxtInline, NxtStack } from '@nxt/ui/layout';
import { NxtSlider } from '@nxt/ui/slider';

/** Đổi màu chủ đạo lúc chạy bằng NxtTheme: kéo sắc độ và cả trang đổi theo (rời trang tự khôi phục) */
@Component({
  selector: 'example-theming-primary',
  imports: [NxtButton, NxtInline, NxtSlider, NxtStack],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-stack gap="md">
      <nxt-slider label="Sắc độ màu chủ đạo (độ)" [min]="0" [max]="360" [value]="hue()" showValue (valueChange)="pick($event)" />
      <nxt-inline gap="sm">
        <button nxtButton variant="primary" type="button">Lưu hồ sơ</button>
        <button nxtButton type="button">Gửi duyệt</button>
        <button nxtButton variant="ghost" type="button" (click)="reset()">Khôi phục màu mặc định</button>
      </nxt-inline>
    </nxt-stack>
  `,
})
export class ThemingPrimaryExample {
  private readonly theme = inject(NxtTheme);
  protected readonly hue = signal(257);

  constructor() {
    inject(DestroyRef).onDestroy(() => this.theme.resetPrimary());
  }

  protected pick(hue: number): void {
    this.hue.set(hue);
    // Màu gốc dựng từ độ sáng, độ đậm cố định và sắc độ người dùng chọn; NXT sinh cả thang 11 bậc từ đó.
    this.theme.setPrimary(`oklch(0.55 0.2 ${hue})`); // nxt-allow: color-literal
  }

  protected reset(): void {
    this.theme.resetPrimary();
    this.hue.set(257);
  }
}
