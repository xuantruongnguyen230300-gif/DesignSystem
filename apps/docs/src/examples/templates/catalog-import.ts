import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, ElementRef, Injector, afterNextRender, computed, inject, signal } from '@angular/core';
import { NxtButton } from '@nxt/ui/button';
import { NxtDrawerLayout } from '@nxt/ui/drawer';
import { NxtIcon } from '@nxt/ui/icon';
import { NxtTable } from '@nxt/ui/table';
import { NxtTag } from '@nxt/ui/tag';
import { CatalogDef, CatalogItem } from './catalog-data';
import { ImportResult, download, fileDate, headers, parseCsv, sampleCsv, toCsv, validateImport } from './catalog-csv';

export interface CatalogImportData {
  def: CatalogDef;
  existingCodes: string[];
}

/**
 * Import in two steps (download template → choose file → review row errors → import valid rows).
 * The demo reads .csv; a product would send .xlsx to the server and show the same review step.
 */
@Component({
  selector: 'example-catalog-import',
  imports: [NxtDrawerLayout, NxtButton, NxtIcon, NxtTable, NxtTag],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-drawer-layout [title]="'Nhập ' + data.def.noun + ' từ Excel'" [description]="result() ? 'Bước 2/2 · Kiểm tra dữ liệu' : 'Bước 1/2 · Chọn file'">
      @if (!result()) {
        <div class="steps">
          <section class="step">
            <h3 class="step__title">1. Tải file mẫu</h3>
            <p class="step__text">File mẫu có sẵn các cột {{ columns }}. Giữ nguyên dòng tiêu đề.</p>
            <button nxtButton type="button" (click)="downloadTemplate()"><nxt-icon name="download" />Tải file mẫu</button>
          </section>
          <section class="step">
            <h3 class="step__title">2. Chọn file đã điền</h3>
            <label class="drop" [attr.data-over]="over() || null" (dragover)="onDragOver($event)" (dragleave)="over.set(false)" (drop)="onDrop($event)">
              <input class="nxt-visually-hidden" type="file" accept=".csv,.xlsx,.xls" (change)="onPick($event)" />
              <nxt-icon name="file-upload" size="lg" />
              <span class="drop__main">Kéo thả file vào đây, hoặc <span class="drop__link">chọn file</span></span>
              <span class="drop__hint">.csv (UTF-8), tối đa 1.000 dòng. Trong Excel: Tệp › Lưu thành › CSV UTF-8.</span>
            </label>
            @if (fileError()) {
              <p class="alert" role="alert"><nxt-icon name="alert-circle" />{{ fileError() }}</p>
            }
            <button nxtButton variant="ghost" size="sm" type="button" (click)="useSample()">Chưa có file? Thử với dữ liệu mẫu</button>
          </section>
        </div>
      } @else if (result(); as r) {
        <div class="review">
          <p class="review__file"><nxt-icon name="file-upload" />{{ fileName() }} · {{ r.total }} dòng dữ liệu</p>
          <div class="review__summary" role="status">
            <nxt-tag tone="success" icon="circle-check">{{ r.valid.length }} dòng hợp lệ</nxt-tag>
            @if (errorRows()) {
              <nxt-tag tone="danger" icon="alert-circle">{{ errorRows() }} dòng lỗi</nxt-tag>
            }
          </div>
          @if (r.issues.length) {
            <div class="review__head">
              <h3 class="step__title">Dòng cần sửa</h3>
              <button nxtButton variant="ghost" size="sm" type="button" (click)="downloadIssues(r)"><nxt-icon name="download" />Tải danh sách lỗi</button>
            </div>
            <div class="issues" role="region" aria-label="Danh sách lỗi" tabindex="0">
              <table nxtTable stickyHeader>
                <thead>
                  <tr>
                    <th scope="col" class="nxt-table__num">Dòng</th>
                    <th scope="col">Cột</th>
                    <th scope="col" class="nxt-table__wrap">Lỗi và cách sửa</th>
                  </tr>
                </thead>
                <tbody>
                  @for (i of r.issues; track $index) {
                    <tr>
                      <td class="nxt-table__num">{{ i.row }}</td>
                      <td>{{ i.column }}</td>
                      <td class="nxt-table__wrap">{{ i.message }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
            <p class="step__text">Bạn có thể nhập ngay các dòng hợp lệ, sửa các dòng lỗi trong file rồi nhập lại sau.</p>
          }
        </div>
      }
      <ng-container ngProjectAs="[nxtDrawerFooter]">
        @if (result(); as r) {
          <button nxtButton type="button" (click)="restart()">Chọn file khác</button>
          <button nxtButton variant="primary" type="button" [disabled]="!r.valid.length" [attr.aria-describedby]="r.valid.length ? null : 'import-nothing'" (click)="confirm(r)">
            Nhập {{ r.valid.length }} dòng
          </button>
          @if (!r.valid.length) {
            <span id="import-nothing" class="nxt-visually-hidden">Không có dòng hợp lệ để nhập.</span>
          }
        } @else {
          <button nxtButton variant="ghost" type="button" (click)="ref.close()">Huỷ</button>
        }
      </ng-container>
    </nxt-drawer-layout>
  `,
  styles: `
    .steps,
    .review {
      display: grid;
      gap: var(--nxt-space-gap-lg);
    }
    .step {
      display: grid;
      gap: var(--nxt-space-gap-sm);
      justify-items: start;
    }
    .step__title {
      color: var(--nxt-color-text-strong);
      font: var(--nxt-typography-label-md);
    }
    .step__text,
    .review__file {
      color: var(--nxt-color-text-subtle);
      font: var(--nxt-typography-body-sm);
    }
    .review__file {
      display: flex;
      align-items: center;
      gap: var(--nxt-space-gap-xs);
    }
    .drop {
      display: grid;
      justify-items: center;
      gap: var(--nxt-space-gap-xs);
      inline-size: 100%;
      padding: var(--nxt-space-inset-lg);
      border: var(--nxt-border-width-strong) dashed var(--nxt-color-border-input);
      border-radius: var(--nxt-radius-container);
      background: var(--nxt-color-bg-subtle);
      color: var(--nxt-color-icon-subtle);
      text-align: center;
      cursor: pointer;
    }
    .drop:hover,
    .drop[data-over] {
      border-color: var(--nxt-color-border-selected);
      background: var(--nxt-color-bg-selected);
    }
    .drop:focus-within {
      outline: var(--nxt-focus-ring-width) solid var(--nxt-focus-ring-color);
      outline-offset: var(--nxt-focus-ring-offset);
    }
    .drop__main {
      color: var(--nxt-color-text-default);
      font: var(--nxt-typography-body-md);
    }
    .drop__link {
      color: var(--nxt-color-text-link);
      text-decoration: underline;
    }
    .drop__hint {
      color: var(--nxt-color-text-subtle);
      font: var(--nxt-typography-caption);
    }
    .alert {
      display: flex;
      align-items: flex-start;
      gap: var(--nxt-space-gap-xs);
      padding: var(--nxt-space-inset-sm) var(--nxt-space-inset-md);
      border-radius: var(--nxt-radius-container);
      background: var(--nxt-color-bg-danger-subtle);
      color: var(--nxt-color-text-danger);
      font: var(--nxt-typography-body-sm);
    }
    .review__summary {
      display: flex;
      flex-wrap: wrap;
      gap: var(--nxt-space-gap-sm);
    }
    .review__head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--nxt-space-gap-sm);
    }
    .issues {
      max-block-size: var(--nxt-size-400);
      overflow: auto;
      border: var(--nxt-border-width-default) solid var(--nxt-color-border-default);
      border-radius: var(--nxt-radius-container);
    }
  `,
})
export class CatalogImport {
  protected readonly ref = inject<DialogRef<CatalogItem[]>>(DialogRef);
  protected readonly data = inject<CatalogImportData>(DIALOG_DATA);
  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  private readonly injector = inject(Injector);
  protected readonly columns = headers(this.data.def).join(', ');
  protected readonly over = signal(false);
  protected readonly fileName = signal('');
  protected readonly fileError = signal('');
  protected readonly result = signal<ImportResult | null>(null);
  protected readonly errorRows = computed(() => new Set(this.result()?.issues.map((i) => i.row)).size);

  protected downloadTemplate() {
    download(`mau-${this.data.def.id}.csv`, toCsv([headers(this.data.def)]));
  }

  protected onDragOver(event: DragEvent) {
    event.preventDefault();
    this.over.set(true);
  }

  protected onDrop(event: DragEvent) {
    event.preventDefault();
    this.over.set(false);
    const file = event.dataTransfer?.files[0];
    if (file) void this.read(file);
  }

  protected onPick(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) void this.read(file);
    input.value = '';
  }

  protected useSample() {
    this.review(`mau-${this.data.def.id}-du-lieu.csv`, sampleCsv(this.data.def));
  }

  protected restart() {
    this.result.set(null);
    this.fileError.set('');
  }

  protected downloadIssues(r: ImportResult) {
    download(`loi-nhap-${this.data.def.id}-${fileDate()}.csv`, toCsv([['Dòng', 'Cột', 'Lỗi và cách sửa'], ...r.issues.map((i) => [i.row, i.column, i.message])]));
  }

  protected confirm(r: ImportResult) {
    if (r.valid.length) this.ref.close(r.valid);
  }

  private async read(file: File) {
    this.fileError.set('');
    if (!/\.csv$/i.test(file.name)) {
      this.fileError.set(`Bản demo chỉ đọc được file .csv, “${file.name}” không phải file .csv. Trong Excel chọn Tệp › Lưu thành › CSV UTF-8 rồi chọn lại.`);
      return;
    }
    this.review(file.name, await file.text());
  }

  private review(name: string, text: string) {
    const r = validateImport(this.data.def, parseCsv(text), this.data.existingCodes);
    if (r.error) {
      this.fileError.set(r.error);
      return;
    }
    if (!r.total) {
      this.fileError.set('File không có dòng dữ liệu nào dưới dòng tiêu đề.');
      return;
    }
    this.fileName.set(name);
    this.result.set(r);
    // Start the review where it matters: the summary is announced; focus goes to the main action.
    afterNextRender(() => this.host.closest('[role="dialog"]')?.querySelector<HTMLElement>('.nxt-drawer__footer .nxt-button[data-variant="primary"]')?.focus(), { injector: this.injector });
  }
}
