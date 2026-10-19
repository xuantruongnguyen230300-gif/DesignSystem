import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Nxt{{Name}} } from '@nxt/ui/{{name}}';

/** {{title}} cơ bản */
@Component({
  selector: 'example-{{name}}-basic',
  imports: [Nxt{{Name}}],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Docs example + a11y fixture: realistic Vietnamese content, no random data or current time.
  template: `<{{tag}}>Lưu thay đổi</{{tagClose}}>`,
})
export class {{Name}}BasicExample {}
