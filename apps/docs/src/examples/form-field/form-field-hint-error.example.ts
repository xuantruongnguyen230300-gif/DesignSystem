import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NxtFormField, NxtInput } from '@nxt/ui/form-field';
import { NxtGrid, NxtSpan, NxtStack } from '@nxt/ui/layout';

/** Gợi ý ở trạng thái thường; lỗi thay chỗ gợi ý và nói cách sửa */
@Component({
  selector: 'example-form-field-hint-error',
  imports: [NxtFormField, NxtInput, NxtGrid, NxtSpan, NxtStack],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-stack gap="md">
      <nxt-grid gap="md">
        <nxt-form-field label="Số CCCD" required hint="12 chữ số, in ở mặt trước thẻ." [error]="cccdError()" [nxtSpan]="{ base: 12, md: 6 }">
          <input nxtInput inputmode="numeric" autocomplete="off" class="nxt-tabular-nums" [value]="cccd()" (input)="cccd.set(text($event))" />
        </nxt-form-field>
        <nxt-form-field label="Mã số thuế cá nhân" hint="10 chữ số. Bỏ trống nếu chưa có, phòng Nhân sự sẽ đăng ký giúp." [nxtSpan]="{ base: 12, md: 6 }">
          <input nxtInput inputmode="numeric" autocomplete="off" class="nxt-tabular-nums" />
        </nxt-form-field>
      </nxt-grid>
      <p class="docs-demo-label">Nhập đủ 12 chữ số vào ô Số CCCD: lỗi biến mất và gợi ý hiện lại.</p>
    </nxt-stack>
  `,
})
export class FormFieldHintErrorExample {
  /** Pre-filled as if the user had just submitted an 11-digit number. */
  protected readonly cccd = signal('07909501234');

  protected readonly cccdError = computed(() => {
    const value = this.cccd().replace(/\s/g, '');
    if (!value) return 'Nhập số CCCD.';
    if (!/^\d+$/.test(value)) return 'Số CCCD chỉ gồm chữ số. Bỏ chữ cái và ký tự đặc biệt.';
    if (value.length !== 12) return `Số CCCD gồm 12 chữ số, bạn đã nhập ${value.length}.`;
    return null;
  });

  protected text(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }
}
