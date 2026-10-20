import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, ElementRef, Injector, afterNextRender, inject, signal } from '@angular/core';
import { NxtButton } from '@nxt/ui/button';
import { NxtDrawer, NxtDrawerLayout } from '@nxt/ui/drawer';
import { NxtFormField, NxtInput } from '@nxt/ui/form-field';
import { NxtIcon } from '@nxt/ui/icon';
import { NxtGrid, NxtInline, NxtSpan, NxtStack } from '@nxt/ui/layout';

interface Dependent {
  name: string;
  relation: string;
  birthYear: string;
  taxCode: string;
}

interface DependentFormData {
  employee: string;
  existingNames: string[];
}

const RELATIONS = ['Con', 'Vợ hoặc chồng', 'Cha hoặc mẹ', 'Người khác mình nuôi dưỡng'];

/** Form trong drawer: kiểm lỗi khi lưu, focus ô lỗi đầu tiên, trả giá trị về danh sách */
@Component({
  selector: 'example-drawer-form',
  imports: [NxtButton, NxtIcon, NxtInline, NxtStack],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-stack gap="sm">
      <nxt-inline justify="between">
        <p class="nxt-text-label-md">Người phụ thuộc của Đặng Anh ({{ items().length }})</p>
        <button nxtButton variant="primary" (click)="add()"><nxt-icon name="plus" />Thêm người phụ thuộc</button>
      </nxt-inline>
      <ul class="list" role="list">
        @for (d of items(); track d.name) {
          <li class="item">
            <span class="item__name">{{ d.name }}</span>
            <span class="item__meta">{{ d.relation }} · sinh năm {{ d.birthYear }} · MST {{ d.taxCode || 'chưa có' }}</span>
          </li>
        }
      </ul>
      <p class="docs-demo-label" role="status">{{ message() }}</p>
    </nxt-stack>
  `,
  styles: `
    .list {
      display: grid;
      margin: 0;
      padding: 0;
      list-style: none;
      border: var(--nxt-border-width-default) solid var(--nxt-color-border-default);
      border-radius: var(--nxt-radius-container);
    }
    .item {
      display: grid;
      gap: var(--nxt-space-0-5);
      padding: var(--nxt-space-inset-sm) var(--nxt-space-inset-md);
    }
    .item + .item {
      border-block-start: var(--nxt-border-width-default) solid var(--nxt-color-border-subtle);
    }
    .item__name {
      color: var(--nxt-color-text-strong);
      font: var(--nxt-typography-label-md);
    }
    .item__meta {
      color: var(--nxt-color-text-subtle);
      font: var(--nxt-typography-body-sm);
    }
  `,
})
export class DrawerFormExample {
  private readonly drawer = inject(NxtDrawer);
  protected readonly items = signal<Dependent[]>([{ name: 'Đặng Gia Bảo', relation: 'Con', birthYear: '2019', taxCode: '' }]);
  protected readonly message = signal('');

  protected add() {
    const ref = this.drawer.open<Dependent, DependentFormData>(DependentForm, {
      title: 'Thêm người phụ thuộc',
      size: 'md',
      data: { employee: 'Đặng Anh', existingNames: this.items().map((d) => d.name) },
    });
    // undefined = người dùng huỷ (nút Huỷ, Đóng, Esc hoặc bấm ra ngoài): không đổi gì.
    ref.closed.subscribe((saved) => {
      if (!saved) return;
      this.items.update((list) => [...list, saved]);
      this.message.set(`Đã thêm người phụ thuộc “${saved.name}”.`);
    });
  }
}

/** Form tạo mới: kiểm tra khi bấm Lưu, không kiểm tra khi đang gõ. */
@Component({
  selector: 'example-drawer-form-content',
  imports: [NxtButton, NxtDrawerLayout, NxtFormField, NxtInput, NxtGrid, NxtSpan],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-drawer-layout title="Thêm người phụ thuộc" [description]="'Giảm trừ gia cảnh cho ' + data.employee + '. Trường có dấu * là bắt buộc.'">
      <form id="drawer-form-dependent" novalidate (submit)="submit($event)">
        <nxt-grid gap="md">
          <nxt-form-field label="Họ và tên" required [error]="errors().name" nxtSpan="full">
            <!-- cdkFocusInitial: focus vào ô đầu tiên thay vì nút Đóng khi drawer mở. -->
            <input nxtInput cdkFocusInitial autocomplete="off" [value]="name()" (input)="name.set(text($event))" />
          </nxt-form-field>
          <nxt-form-field label="Quan hệ với nhân viên" [nxtSpan]="{ base: 12, md: 6 }">
            <select nxtInput (change)="relation.set(text($event))">
              @for (r of relations; track r) {
                <option [value]="r" [selected]="r === relation()">{{ r }}</option>
              }
            </select>
          </nxt-form-field>
          <nxt-form-field label="Năm sinh" required hint="4 chữ số, ví dụ 2019." [error]="errors().birthYear" [nxtSpan]="{ base: 12, md: 6 }">
            <input nxtInput inputmode="numeric" autocomplete="off" [value]="birthYear()" (input)="birthYear.set(text($event))" />
          </nxt-form-field>
          <nxt-form-field label="Mã số thuế" hint="Không bắt buộc. 10 hoặc 12 chữ số." [error]="errors().taxCode" nxtSpan="full">
            <input nxtInput inputmode="numeric" autocomplete="off" [value]="taxCode()" (input)="taxCode.set(text($event))" />
          </nxt-form-field>
        </nxt-grid>
      </form>
      <ng-container ngProjectAs="[nxtDrawerFooter]">
        <button nxtButton variant="ghost" (click)="ref.close()">Huỷ</button>
        <button nxtButton variant="primary" type="submit" form="drawer-form-dependent">Lưu người phụ thuộc</button>
      </ng-container>
    </nxt-drawer-layout>
  `,
})
class DependentForm {
  protected readonly ref = inject<DialogRef<Dependent>>(DialogRef);
  protected readonly data = inject<DependentFormData>(DIALOG_DATA);
  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  private readonly injector = inject(Injector);
  protected readonly relations = RELATIONS;

  protected readonly name = signal('');
  protected readonly relation = signal(RELATIONS[0]);
  protected readonly birthYear = signal('');
  protected readonly taxCode = signal('');
  protected readonly errors = signal<{ name?: string; birthYear?: string; taxCode?: string }>({});

  protected text(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  protected submit(event: Event) {
    event.preventDefault();
    const name = this.name().trim().replace(/\s+/g, ' ');
    const year = this.birthYear().trim();
    const taxCode = this.taxCode().replace(/\s/g, '');
    const thisYear = new Date().getFullYear();
    const errors: { name?: string; birthYear?: string; taxCode?: string } = {};

    if (!name) errors.name = 'Nhập họ và tên người phụ thuộc.';
    else if (this.data.existingNames.includes(name)) errors.name = `${name} đã có trong danh sách người phụ thuộc.`;
    if (!year) errors.birthYear = 'Nhập năm sinh.';
    else if (!/^\d{4}$/.test(year) || +year < 1900 || +year > thisYear) errors.birthYear = `Năm sinh gồm 4 chữ số, từ 1900 đến ${thisYear}.`;
    if (taxCode && !/^(\d{10}|\d{12})$/.test(taxCode)) errors.taxCode = `Mã số thuế đang có ${taxCode.length} ký tự. Nhập đúng 10 hoặc 12 chữ số.`;

    this.errors.set(errors);
    if (Object.keys(errors).length) {
      // App chạy zoneless: aria-invalid chỉ có sau lần render kế tiếp, nên chờ render xong rồi mới tìm ô lỗi đầu tiên.
      afterNextRender(() => this.host.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(), { injector: this.injector });
      return;
    }
    this.ref.close({ name, relation: this.relation(), birthYear: year, taxCode });
  }
}
