import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Nxt{{Name}} } from '@nxt/ui/{{name}}';

/** Docs example + a11y/visual-regression fixture. Keep realistic Vietnamese content. */
@Component({
  selector: 'nxt-example-{{name}}-basic',
  imports: [Nxt{{Name}}],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<{{tag}}>Lưu thay đổi</{{tagClose}}>`,
})
export class {{Name}}BasicExample {}
