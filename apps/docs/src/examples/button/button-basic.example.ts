import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NxtButton } from '@nxt/ui/button';

/** Docs example + a11y/visual-regression fixture. Keep realistic Vietnamese content. */
@Component({
  selector: 'nxt-example-button-basic',
  imports: [NxtButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<button nxtButton>Lưu thay đổi</button>`,
})
export class ButtonBasicExample {}
