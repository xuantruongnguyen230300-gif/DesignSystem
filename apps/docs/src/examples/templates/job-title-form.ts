import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, ElementRef, Injector, afterNextRender, inject, signal } from '@angular/core';
import { NxtButton } from '@nxt/ui/button';
import { NxtCheckbox } from '@nxt/ui/checkbox';
import { NxtDrawerLayout } from '@nxt/ui/drawer';
import { NxtFormField, NxtInput } from '@nxt/ui/form-field';
import { NxtGrid, NxtSpan } from '@nxt/ui/layout';
import { JOB_GROUPS, JOB_LEVELS, JobGroup, JobTitle } from './catalog-data';

export interface JobTitleFormData {
  /** Record being edited (code becomes read-only). */
  item?: JobTitle;
  /** Initial values for a new record, e.g. when duplicating. */
  prefill?: Partial<JobTitle>;
  existingCodes: string[];
}

/** Create / edit form shown in a drawer: validates on submit, focuses the first invalid field. */
@Component({
  selector: 'example-job-title-form',
  imports: [NxtDrawerLayout, NxtFormField, NxtInput, NxtButton, NxtCheckbox, NxtGrid, NxtSpan],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-drawer-layout [title]="data.item ? 'Sửa chức danh' : 'Thêm chức danh'" description="Các trường có dấu * là bắt buộc.">
      <form id="job-title-form" novalidate (submit)="submit($event)">
        <nxt-grid gap="md">
          <nxt-form-field label="Mã chức danh" required hint="Viết hoa, không dấu, ví dụ KT-TH." [error]="errors().code" [nxtSpan]="{ base: 12, md: 5 }">
            <input nxtInput autocomplete="off" [value]="code()" [readOnly]="!!data.item" (input)="code.set(text($event).toUpperCase())" />
          </nxt-form-field>
          <nxt-form-field label="Tên chức danh" required [error]="errors().name" [nxtSpan]="{ base: 12, md: 7 }">
            <input nxtInput autocomplete="off" [value]="name()" (input)="name.set(text($event))" />
          </nxt-form-field>
          <nxt-form-field label="Nhóm chức danh" [nxtSpan]="{ base: 12, md: 6 }">
            <select nxtInput (change)="group.set($any(text($event)))">
              @for (g of groups; track g) {
                <option [value]="g" [selected]="g === group()">{{ g }}</option>
              }
            </select>
          </nxt-form-field>
          <nxt-form-field label="Cấp bậc" [nxtSpan]="{ base: 12, md: 6 }">
            <select nxtInput (change)="level.set(text($event))">
              @for (l of levels; track l) {
                <option [value]="l" [selected]="l === level()">{{ l }}</option>
              }
            </select>
          </nxt-form-field>
          <nxt-form-field label="Mô tả công việc" hint="Tối đa 500 ký tự." [error]="errors().description" nxtSpan="full">
            <textarea nxtInput rows="4" [value]="description()" (input)="description.set(text($event))"></textarea>
          </nxt-form-field>
          <div nxtSpan="full">
            <nxt-checkbox label="Đang sử dụng (chọn được trong hồ sơ nhân viên)" [(checked)]="active" />
          </div>
        </nxt-grid>
      </form>
      <ng-container ngProjectAs="[nxtDrawerFooter]">
        <button nxtButton variant="ghost" type="button" (click)="ref.close()">Huỷ</button>
        <button nxtButton variant="primary" type="submit" form="job-title-form">Lưu chức danh</button>
      </ng-container>
    </nxt-drawer-layout>
  `,
})
export class JobTitleForm {
  protected readonly ref = inject<DialogRef<JobTitle>>(DialogRef);
  protected readonly data = inject<JobTitleFormData>(DIALOG_DATA);
  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  private readonly injector = inject(Injector);
  protected readonly groups = JOB_GROUPS;
  protected readonly levels = JOB_LEVELS;

  private readonly source: Partial<JobTitle> = this.data.item ?? this.data.prefill ?? {};
  protected readonly code = signal(this.source.code ?? '');
  protected readonly name = signal(this.source.name ?? '');
  protected readonly group = signal<JobGroup>(this.source.group ?? 'Chuyên môn');
  protected readonly level = signal(this.source.level ?? JOB_LEVELS[1]);
  protected readonly description = signal(this.source.description ?? '');
  protected readonly active = signal(this.source.active ?? true);
  protected readonly errors = signal<{ code?: string; name?: string; description?: string }>({});

  protected text(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  protected submit(event: Event) {
    event.preventDefault();
    const code = this.code().trim();
    const name = this.name().trim();
    const errors: { code?: string; name?: string; description?: string } = {};
    if (!code) errors.code = 'Nhập mã chức danh.';
    else if (!/^[A-Z0-9-]{2,12}$/.test(code)) errors.code = 'Mã gồm 2–12 ký tự: chữ in hoa không dấu, số hoặc dấu gạch ngang.';
    else if (!this.data.item && this.data.existingCodes.includes(code)) errors.code = `Mã ${code} đã tồn tại. Chọn mã khác.`;
    if (!name) errors.name = 'Nhập tên chức danh.';
    if (this.description().length > 500) errors.description = `Mô tả đang có ${this.description().length} ký tự, tối đa 500.`;
    this.errors.set(errors);
    if (Object.keys(errors).length) {
      // aria-invalid is set during the next render — wait for it before looking for the first invalid field.
      afterNextRender(() => this.host.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(), { injector: this.injector });
      return;
    }
    this.ref.close({
      code,
      name,
      group: this.group(),
      level: this.level(),
      description: this.description(),
      active: this.active(),
      headcount: this.data.item?.headcount ?? 0,
      updated: new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    });
  }
}
