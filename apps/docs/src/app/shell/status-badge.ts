import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { STATUS_LABEL } from '../core/nav';
import type { DocStatus } from '../core/types';

@Component({
  selector: 'docs-status',
  template: `<span class="docs-status" [attr.data-status]="status()">{{ label[status()] }}</span>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusBadge {
  readonly status = input.required<DocStatus>();
  protected readonly label = STATUS_LABEL;
}
