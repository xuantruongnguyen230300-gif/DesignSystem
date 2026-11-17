import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NxtButton } from '@nxt/ui/button';
import { NxtDialog } from '@nxt/ui/dialog';
import { NxtDrawer, NxtDrawerCanClose, NxtDrawerLayout } from '@nxt/ui/drawer';
import { NxtFormField, NxtInput } from '@nxt/ui/form-field';
import { NxtGrid, NxtSpan } from '@nxt/ui/layout';
import { NxtToast } from '@nxt/ui/toast';
import { map } from 'rxjs';

interface Contact {
  phone: string;
  email: string;
}

/** Chặn đóng khi còn thay đổi chưa lưu: Esc, bấm ngoài, nút Đóng và "Huỷ" đều hỏi "Rời khỏi biểu mẫu khi chưa lưu?" */
@Component({
  selector: 'example-drawer-unsaved',
  imports: [NxtButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p class="nxt-text-body-md">Lê Minh Anh · {{ contact().phone }} · {{ contact().email }}</p>
    <button nxtButton type="button" class="edit" (click)="edit()">Sửa thông tin liên hệ</button>
  `,
  styles: `
    .edit {
      margin-block-start: var(--nxt-space-gap-sm);
    }
  `,
})
export class DrawerUnsavedExample {
  private readonly drawer = inject(NxtDrawer);
  private readonly toast = inject(NxtToast);
  protected readonly contact = signal<Contact>({ phone: '0912 241 008', email: 'anh.lm@congty.vn' });

  protected edit() {
    const ref = this.drawer.open<Contact, Contact>(ContactForm, { title: 'Sửa thông tin liên hệ', size: 'sm', data: this.contact() });
    ref.closed.subscribe((saved) => {
      if (!saved) return;
      this.contact.set(saved);
      // The drawer is gone: confirm with a toast.
      this.toast.show('Đã lưu thông tin liên hệ của Lê Minh Anh.');
    });
  }
}

/** Form trong drawer: hỏi trước khi đóng khi đã sửa mà chưa lưu. */
@Component({
  selector: 'example-drawer-unsaved-content',
  imports: [NxtButton, NxtDrawerLayout, NxtFormField, NxtInput, NxtGrid, NxtSpan],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-drawer-layout title="Sửa thông tin liên hệ" description="Lê Minh Anh · NV-00241" [canClose]="canClose">
      <form id="drawer-unsaved-form" novalidate (submit)="save($event)">
        <nxt-grid gap="md">
          <nxt-form-field label="Điện thoại di động" nxtSpan="full">
            <input nxtInput cdkFocusInitial inputmode="tel" autocomplete="off" [value]="phone()" (input)="phone.set(text($event))" />
          </nxt-form-field>
          <nxt-form-field label="Email công việc" nxtSpan="full">
            <input nxtInput type="email" autocomplete="off" [value]="email()" (input)="email.set(text($event))" />
          </nxt-form-field>
        </nxt-grid>
      </form>
      <ng-container ngProjectAs="[nxtDrawerFooter]">
        <!-- "Huỷ" closes without a result, so it goes through canClose too. -->
        <button nxtButton variant="ghost" type="button" (click)="ref.close()">Huỷ</button>
        <button nxtButton variant="primary" type="submit" form="drawer-unsaved-form">Lưu</button>
      </ng-container>
    </nxt-drawer-layout>
  `,
})
class ContactForm {
  protected readonly ref = inject<DialogRef<Contact>>(DialogRef);
  private readonly data = inject<Contact>(DIALOG_DATA);
  private readonly dialog = inject(NxtDialog);
  protected readonly phone = signal(this.data.phone);
  protected readonly email = signal(this.data.email);
  private readonly dirty = computed(() => this.phone() !== this.data.phone || this.email() !== this.data.email);

  /** Nothing changed: close right away. Changed: ask (the drawer stays open until the answer). */
  protected readonly canClose: NxtDrawerCanClose = () =>
    !this.dirty() ||
    this.dialog
      .confirm({
        title: 'Rời khỏi biểu mẫu khi chưa lưu?',
        message: 'Số điện thoại và email vừa sửa sẽ mất.',
        confirmLabel: 'Rời khỏi',
        cancelLabel: 'Ở lại',
      })
      .pipe(map((answer) => answer === 'confirm'));

  protected text(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  protected save(event: Event) {
    event.preventDefault();
    this.ref.close({ phone: this.phone().trim(), email: this.email().trim() });
  }
}
