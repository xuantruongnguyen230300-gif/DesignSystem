import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, ElementRef, Injector, afterNextRender, inject, signal } from '@angular/core';
import { NxtButton } from '@nxt/ui/button';
import { NxtCheckbox } from '@nxt/ui/checkbox';
import { NxtDrawerLayout } from '@nxt/ui/drawer';
import { NxtFormField, NxtInput } from '@nxt/ui/form-field';
import { NxtGrid, NxtSpan } from '@nxt/ui/layout';
import { CatalogDef, CatalogField, CatalogItem, TODAY } from './catalog-data';

export interface CatalogFormData {
  def: CatalogDef;
  /** Record being edited (code becomes read-only: other records refer to it). */
  item?: CatalogItem;
  /** Initial values for a new record, e.g. when duplicating. */
  prefill?: Partial<CatalogItem>;
  existingCodes: string[];
}

type Errors = Record<string, string>;

/** Add / edit form for any catalog, in a drawer: validates on save, focuses the first invalid field. */
@Component({
  selector: 'example-catalog-form',
  imports: [NxtDrawerLayout, NxtFormField, NxtInput, NxtButton, NxtCheckbox, NxtGrid, NxtSpan],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-drawer-layout [title]="(data.item ? 'Sửa ' : 'Thêm ') + data.def.noun" description="Các trường có dấu * là bắt buộc.">
      <form id="catalog-form" novalidate (submit)="submit($event)">
        <nxt-grid gap="md">
          <nxt-form-field label="Mã" required [hint]="data.item ? 'Không đổi được vì dữ liệu khác đang tham chiếu.' : data.def.codeHint" [error]="errors()['code']" [nxtSpan]="{ base: 12, md: 5 }">
            <input nxtInput autocomplete="off" [value]="code()" [readOnly]="!!data.item" (input)="code.set(text($event).toUpperCase())" />
          </nxt-form-field>
          <nxt-form-field label="Tên" required [error]="errors()['name']" [nxtSpan]="{ base: 12, md: 7 }">
            <input nxtInput autocomplete="off" [value]="name()" (input)="name.set(text($event))" />
          </nxt-form-field>
          @for (f of fields; track f.key) {
            <nxt-form-field [label]="f.label" [error]="errors()[f.key]" [nxtSpan]="{ base: 12, md: 6 }">
              @if (f.type === 'select') {
                <select nxtInput (change)="setExtra(f, text($event))">
                  @for (o of f.options; track o) {
                    <option [value]="o" [selected]="o === extra()[f.key]">{{ o }}</option>
                  }
                </select>
              } @else {
                <input nxtInput type="text" inputmode="numeric" autocomplete="off" [value]="extra()[f.key]" (input)="setExtra(f, text($event))" />
                @if (f.type === 'money') {
                  <span nxtSuffix>₫</span>
                }
              }
            </nxt-form-field>
          }
          <nxt-form-field label="Mô tả" hint="Tối đa 500 ký tự." [error]="errors()['description']" nxtSpan="full">
            <textarea nxtInput rows="3" [value]="description()" (input)="description.set(text($event))"></textarea>
          </nxt-form-field>
          <div nxtSpan="full">
            <nxt-checkbox [label]="'Đang sử dụng (chọn được trong các màn hình khác)'" [(checked)]="active" />
          </div>
        </nxt-grid>
      </form>
      <ng-container ngProjectAs="[nxtDrawerFooter]">
        <button nxtButton variant="ghost" type="button" (click)="ref.close()">Huỷ</button>
        <button nxtButton variant="primary" type="submit" form="catalog-form">Lưu</button>
      </ng-container>
    </nxt-drawer-layout>
  `,
})
export class CatalogForm {
  protected readonly ref = inject<DialogRef<CatalogItem>>(DialogRef);
  protected readonly data = inject<CatalogFormData>(DIALOG_DATA);
  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  private readonly injector = inject(Injector);

  /** Usage counts (employees holding a job title…) are computed by the system, never typed in. */
  protected readonly fields = this.data.def.fields.filter((f) => !f.usage);
  private readonly source: Partial<CatalogItem> = this.data.item ?? this.data.prefill ?? {};
  protected readonly code = signal(this.source.code ?? '');
  protected readonly name = signal(this.source.name ?? '');
  protected readonly description = signal(this.source.description ?? '');
  protected readonly active = signal(this.source.active ?? true);
  protected readonly extra = signal<Record<string, string | number>>({
    ...Object.fromEntries(this.data.def.fields.map((f) => [f.key, f.type === 'select' ? (f.options?.[0] ?? '') : ''])),
    ...this.source.extra,
  });
  protected readonly errors = signal<Errors>({});

  protected text(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  protected setExtra(field: CatalogField, value: string) {
    this.extra.update((e) => ({ ...e, [field.key]: value }));
  }

  protected submit(event: Event) {
    event.preventDefault();
    const code = this.code().trim();
    const name = this.name().trim();
    const errors: Errors = {};
    if (!code) errors['code'] = 'Nhập mã.';
    else if (!/^[A-Z0-9-]{2,12}$/.test(code)) errors['code'] = 'Mã gồm 2–12 ký tự: chữ in hoa không dấu, số hoặc dấu gạch ngang.';
    else if (!this.data.item && this.data.existingCodes.includes(code)) errors['code'] = `Mã ${code} đã tồn tại. Chọn mã khác.`;
    if (!name) errors['name'] = `Nhập tên ${this.data.def.noun}.`;
    const extra: Record<string, string | number> = {};
    for (const f of this.fields) {
      const raw = this.extra()[f.key];
      if (f.type === 'select') {
        extra[f.key] = raw;
        continue;
      }
      const n = String(raw ?? '').trim() === '' ? 0 : Number(String(raw).replace(/\./g, '').replace(',', '.'));
      if (Number.isNaN(n) || n < 0) errors[f.key] = `Nhập số không âm, ví dụ ${f.type === 'money' ? '500000' : '12'}.`;
      extra[f.key] = n;
    }
    if (this.description().length > 500) errors['description'] = `Mô tả đang có ${this.description().length} ký tự, tối đa 500.`;
    this.errors.set(errors);
    if (Object.keys(errors).length) {
      // aria-invalid is set during the next render — wait for it before looking for the first invalid field.
      afterNextRender(() => this.host.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(), { injector: this.injector });
      return;
    }
    this.ref.close({
      code,
      name,
      description: this.description().trim() || undefined,
      active: this.active(),
      updated: TODAY,
      extra: { ...Object.fromEntries(this.data.def.fields.filter((f) => f.usage).map((f) => [f.key, 0])), ...this.data.item?.extra, ...extra },
    });
  }
}
