import { ChangeDetectionStrategy, Component, ElementRef, Injector, afterNextRender, computed, inject, signal } from '@angular/core';
import { NxtButton } from '@nxt/ui/button';
import { NxtCheckbox, NxtCheckboxGroup } from '@nxt/ui/checkbox';
import { NxtInline, NxtStack } from '@nxt/ui/layout';

/** Lỗi cấp nhóm: thông điệp đặt dưới nhóm, mọi ô trong nhóm vào trạng thái lỗi */
@Component({
  selector: 'example-checkbox-validation',
  imports: [NxtButton, NxtCheckbox, NxtCheckboxGroup, NxtInline, NxtStack],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form novalidate (submit)="submit($event)">
      <nxt-stack gap="md">
        <nxt-checkbox-group
          label="Loại hợp đồng áp dụng (chọn ít nhất một)"
          hint="Chính sách phụ cấp chỉ áp dụng cho các loại hợp đồng được chọn."
          required
          [error]="error()"
        >
          @for (c of contracts; track c.id) {
            <nxt-checkbox [label]="c.label" [checked]="selected().has(c.id)" (checkedChange)="toggle(c.id, $event)" />
          }
        </nxt-checkbox-group>
        <nxt-inline>
          <button nxtButton variant="primary" type="submit">Lưu chính sách</button>
        </nxt-inline>
        <p class="docs-demo-label" role="status">{{ message() }}</p>
      </nxt-stack>
    </form>
  `,
})
export class CheckboxValidationExample {
  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  private readonly injector = inject(Injector);

  protected readonly contracts = [
    { id: 'indefinite', label: 'Không xác định thời hạn' },
    { id: 'fixed', label: 'Xác định thời hạn (12–36 tháng)' },
    { id: 'probation', label: 'Thử việc' },
    { id: 'seasonal', label: 'Thời vụ, dưới 12 tháng' },
  ];
  protected readonly selected = signal(new Set<string>());
  private readonly submitted = signal(false);
  protected readonly error = computed(() =>
    this.submitted() && this.selected().size === 0 ? 'Chọn ít nhất một loại hợp đồng áp dụng.' : null,
  );
  protected readonly message = signal('');

  protected toggle(id: string, checked: boolean) {
    const next = new Set(this.selected());
    if (checked) next.add(id);
    else next.delete(id);
    this.selected.set(next);
  }

  protected submit(event: Event) {
    event.preventDefault();
    this.submitted.set(true);
    if (this.selected().size === 0) {
      this.message.set('Chưa lưu: còn 1 mục cần sửa.');
      afterNextRender(() => this.host.querySelector<HTMLInputElement>('input[aria-invalid="true"]')?.focus(), { injector: this.injector });
      return;
    }
    this.message.set(`Đã lưu chính sách cho ${this.selected().size} loại hợp đồng.`);
  }
}
