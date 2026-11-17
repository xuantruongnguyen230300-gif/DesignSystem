import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, ElementRef, Injector, ViewEncapsulation, afterNextRender, computed, inject, input, signal } from '@angular/core';
import { NxtButton } from '@nxt/ui/button';
import { NxtCheckbox } from '@nxt/ui/checkbox';
import { NxtDialog, NxtDialogLayout } from '@nxt/ui/dialog';
import { NxtFormField, NxtInput } from '@nxt/ui/form-field';
import { NxtIcon } from '@nxt/ui/icon';
import { NxtMenu, NxtMenuGroup, NxtMenuItem, NxtMenuItemRadio, NxtMenuLabel, NxtMenuSeparator, NxtMenuTrigger } from '@nxt/ui/menu';
import { NxtTable } from '@nxt/ui/table';
import { NxtTag } from '@nxt/ui/tag';
import { NxtViews } from './views';

/** Every text of the view manager. `{name}` is replaced with a view name. */
export interface NxtViewManagerLabels {
  /** Hidden prefix of the button's name: "Chế độ xem: Tiêu chuẩn". */
  trigger: string;
  /** Shown after the name when the screen differs from the saved view. */
  modified: string;
  menu: string;
  defaultMark: string;
  save: string;
  /** Hidden reason added to "Lưu" when it cannot be used on a standard view. */
  saveStandardReason: string;
  /** Hidden reason added to "Lưu" when nothing changed. */
  saveUnchangedReason: string;
  saveAs: string;
  manage: string;
  saveTitle: string;
  saveDescription: string;
  nameLabel: string;
  nameHint: string;
  makeDefault: string;
  nameRequired: string;
  nameTaken: string;
  manageTitle: string;
  manageDescription: string;
  manageCaption: string;
  columnDefault: string;
  columnName: string;
  columnActions: string;
  standardTag: string;
  setDefault: string;
  rename: string;
  remove: string;
  cancel: string;
  confirm: string;
  applied: string;
  saved: string;
  managed: string;
  failed: string;
}

export const NXT_VIEW_MANAGER_LABELS: NxtViewManagerLabels = {
  trigger: 'Chế độ xem',
  modified: 'Đã sửa',
  menu: 'Chế độ xem',
  defaultMark: 'Mặc định',
  save: 'Lưu',
  saveStandardReason: 'chế độ xem chuẩn không ghi đè được, hãy lưu thành chế độ xem mới',
  saveUnchangedReason: 'chưa có thay đổi',
  saveAs: 'Lưu thành chế độ xem mới…',
  manage: 'Quản lý chế độ xem…',
  saveTitle: 'Lưu chế độ xem',
  saveDescription: 'Lưu tìm kiếm, bộ lọc, sắp xếp và cột đang dùng để mở lại bằng một cú bấm.',
  nameLabel: 'Tên chế độ xem',
  nameHint: 'Nói phạm vi dữ liệu, ví dụ “Khối Kinh doanh đang sử dụng”.',
  makeDefault: 'Đặt làm mặc định khi mở trang',
  nameRequired: 'Nhập tên chế độ xem.',
  nameTaken: 'Đã có chế độ xem tên này. Đặt tên khác.',
  manageTitle: 'Quản lý chế độ xem',
  manageDescription: 'Đổi tên, xoá, hoặc chọn chế độ xem mở mặc định. Chế độ xem chuẩn không sửa được.',
  manageCaption: 'Danh sách chế độ xem',
  columnDefault: 'Mặc định',
  columnName: 'Tên',
  columnActions: 'Thao tác',
  standardTag: 'Chuẩn',
  setDefault: 'Đặt {name} làm mặc định',
  rename: 'Tên chế độ xem {name}',
  remove: 'Xoá chế độ xem {name}',
  cancel: 'Huỷ',
  confirm: 'Lưu',
  applied: 'Đang xem: {name}.',
  saved: 'Đã lưu chế độ xem {name}.',
  managed: 'Đã cập nhật danh sách chế độ xem.',
  failed: 'Không lưu được chế độ xem. Thử lại.',
};

const fill = (text: string, name: string) => text.replace(/\{name\}/g, name);
const NAME_MAX = 60;

interface DialogData {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  views: NxtViews<any>;
  labels: NxtViewManagerLabels;
}

/**
 * "Chế độ xem" at the head of a list: the name of the view in use ("Đã sửa" when the screen differs from it),
 * the number of records, a menu to pick a view, "Lưu", "Lưu thành…", "Quản lý…". State lives in `NxtViews`.
 */
@Component({
  selector: 'nxt-view-manager',
  imports: [NxtButton, NxtIcon, NxtMenu, NxtMenuGroup, NxtMenuItem, NxtMenuItemRadio, NxtMenuLabel, NxtMenuSeparator, NxtMenuTrigger],
  template: `
    <button nxtButton variant="ghost" type="button" class="nxt-view-manager__trigger" [nxtMenuTriggerFor]="menu">
      <span class="nxt-visually-hidden">{{ l().trigger }}: </span>
      <span class="nxt-view-manager__name">{{ views().selected().name }}</span>
      @if (views().modified()) {
        <span class="nxt-visually-hidden">, </span>
        <span class="nxt-view-manager__modified">{{ l().modified }}</span>
      }
      <nxt-icon name="chevron-down" />
    </button>
    @if (count() !== undefined) {
      <span class="nxt-view-manager__count">{{ countText() }}</span>
    }
    <span class="nxt-visually-hidden" role="status">{{ status() }}</span>

    <ng-template #menu>
      <div nxtMenu class="nxt-view-manager__menu">
        <div nxtMenuLabel>{{ l().menu }}</div>
        <div nxtMenuGroup [label]="l().menu">
          @for (v of views().views(); track v.id) {
            <button nxtMenuItemRadio [checked]="v.id === views().selectedId()" (triggered)="choose(v.id)">
              <span class="nxt-view-manager__item">{{ v.name }}</span>
              @if (v.id === views().defaultId()) {
                <span class="nxt-view-manager__default">{{ l().defaultMark }}</span>
              }
            </button>
          }
        </div>
        <div nxtMenuSeparator></div>
        <button nxtMenuItem [disabled]="!canSave()" (triggered)="save()">
          <nxt-icon name="device-floppy" />{{ l().save }}
          @if (!canSave()) {
            <span class="nxt-visually-hidden">, {{ views().selected().standard ? l().saveStandardReason : l().saveUnchangedReason }}</span>
          }
        </button>
        <button nxtMenuItem (triggered)="openSaveAs()"><nxt-icon name="bookmark" />{{ l().saveAs }}</button>
        <button nxtMenuItem (triggered)="openManage()"><nxt-icon name="settings" />{{ l().manage }}</button>
      </div>
    </ng-template>
  `,
  styleUrl: './view-manager.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'nxt-view-manager', '[attr.data-modified]': 'views().modified() || null' },
})
export class NxtViewManager {
  private readonly dialog = inject(NxtDialog);
  /** Saved views of this list (one instance per list or tab). */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly views = input.required<NxtViews<any>>();
  /** Records shown (after search and filters). Leave empty to hide the count. */
  readonly count = input<number | undefined>(undefined);
  /** Noun after the count: "29 chức danh". */
  readonly itemLabel = input('bản ghi');
  /** Override any text (translations). */
  readonly labels = input<Partial<NxtViewManagerLabels>>({});

  protected readonly l = computed(() => ({ ...NXT_VIEW_MANAGER_LABELS, ...this.labels() }));
  protected readonly countText = computed(() => `${new Intl.NumberFormat('vi-VN').format(this.count() ?? 0)} ${this.itemLabel()}`);
  protected readonly canSave = computed(() => !this.views().selected().standard && this.views().modified());
  protected readonly status = signal('');

  protected choose(id: string) {
    this.views().select(id);
    this.status.set(fill(this.l().applied, this.views().selected().name));
  }

  protected async save() {
    if (!this.canSave()) return;
    try {
      await this.views().save();
      this.status.set(fill(this.l().saved, this.views().selected().name));
    } catch {
      this.status.set(this.l().failed);
    }
  }

  protected openSaveAs() {
    this.afterMenu(() =>
      this.dialog
        .open<string, DialogData>(NxtViewSaveDialog, { size: 'sm', data: { views: this.views(), labels: this.l() } })
        .closed.subscribe((name) => name && this.status.set(fill(this.l().saved, name))),
    );
  }

  protected openManage() {
    this.afterMenu(() =>
      this.dialog
        .open<boolean, DialogData>(NxtViewManageDialog, { size: 'md', data: { views: this.views(), labels: this.l() } })
        .closed.subscribe((done) => done && this.status.set(this.l().managed)),
    );
  }

  /**
   * The menu closes and puts focus back on the trigger right after an item fires. Open the dialog after that
   * (one microtask), so CDK Dialog records the trigger as the element to return focus to.
   */
  private afterMenu(open: () => void) {
    queueMicrotask(open);
  }
}

/** "Lưu thành chế độ xem mới…": name (required, unique) + "Đặt làm mặc định". Closes with the saved name. */
@Component({
  selector: 'nxt-view-save-dialog',
  imports: [NxtButton, NxtCheckbox, NxtDialogLayout, NxtFormField, NxtInput],
  template: `
    <nxt-dialog-layout [title]="l.saveTitle" [description]="l.saveDescription">
      <form id="nxt-view-save-form" class="nxt-view-dialog__form" novalidate (submit)="submit($event)">
        <nxt-form-field [label]="l.nameLabel" [hint]="l.nameHint" [error]="error()" required>
          <input nxtInput type="text" autocomplete="off" [attr.maxlength]="max" [value]="name()" (input)="setName($event)" />
        </nxt-form-field>
        <nxt-checkbox [label]="l.makeDefault" [(checked)]="makeDefault" />
      </form>
      <ng-container ngProjectAs="[nxtDialogFooter]">
        <button nxtButton type="button" (click)="ref.close()">{{ l.cancel }}</button>
        <button nxtButton variant="primary" type="submit" form="nxt-view-save-form" [loading]="busy()">{{ l.confirm }}</button>
      </ng-container>
    </nxt-dialog-layout>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class NxtViewSaveDialog {
  protected readonly ref = inject<DialogRef<string>>(DialogRef);
  private readonly data = inject<DialogData>(DIALOG_DATA);
  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  private readonly injector = inject(Injector);
  protected readonly l = this.data.labels;
  protected readonly max = NAME_MAX;
  protected readonly name = signal('');
  protected readonly makeDefault = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly busy = signal(false);

  protected setName(event: Event) {
    this.name.set((event.target as HTMLInputElement).value);
    if (this.error()) this.error.set(null);
  }

  protected async submit(event: Event) {
    event.preventDefault();
    const name = this.name().trim();
    const problem = !name ? this.l.nameRequired : this.data.views.nameTaken(name) ? this.l.nameTaken : null;
    if (problem) {
      this.error.set(problem);
      // aria-invalid and the message render first, then focus the field.
      afterNextRender(() => this.host.querySelector<HTMLInputElement>('input[nxtInput]')?.focus(), { injector: this.injector });
      return;
    }
    this.busy.set(true);
    try {
      await this.data.views.saveAs(name, { makeDefault: this.makeDefault() });
      this.ref.close(name);
    } catch {
      this.busy.set(false);
      this.error.set(this.l.failed);
    }
  }
}

interface ManageRow {
  id: string;
  name: string;
  standard: boolean;
}

/** "Quản lý chế độ xem…": rename, delete, choose the default. Nothing changes until "Lưu"; "Huỷ" undoes it all. */
@Component({
  selector: 'nxt-view-manage-dialog',
  imports: [NxtButton, NxtDialogLayout, NxtFormField, NxtIcon, NxtInput, NxtTable, NxtTag],
  template: `
    <nxt-dialog-layout [title]="l.manageTitle" [description]="l.manageDescription">
      @if (failure()) {
        <p class="nxt-view-dialog__failure" role="alert">{{ failure() }}</p>
      }
      <table nxtTable class="nxt-view-dialog__table">
        <caption class="nxt-visually-hidden">{{ l.manageCaption }}</caption>
        <thead>
          <tr>
            <th scope="col" class="nxt-view-dialog__default">{{ l.columnDefault }}</th>
            <th scope="col">{{ l.columnName }}</th>
            <th scope="col"><span class="nxt-visually-hidden">{{ l.columnActions }}</span></th>
          </tr>
        </thead>
        <tbody>
          @for (r of rows(); track r.id) {
            <tr [attr.data-id]="r.id">
              <td class="nxt-view-dialog__default">
                <input
                  type="radio"
                  name="nxt-view-default"
                  class="nxt-view-dialog__radio"
                  [checked]="r.id === defaultId()"
                  [attr.aria-label]="label(l.setDefault, r)"
                  (change)="defaultId.set(r.id)"
                />
              </td>
              <th scope="row" class="nxt-view-dialog__name">
                @if (r.standard) {
                  <span class="nxt-view-dialog__standard">{{ r.name }} <nxt-tag size="sm">{{ l.standardTag }}</nxt-tag></span>
                } @else {
                  <nxt-form-field size="sm" hideLabel [label]="label(l.rename, r)" [error]="errors()[r.id] || null">
                    <input nxtInput type="text" autocomplete="off" [attr.maxlength]="max" [value]="r.name" (input)="rename(r.id, $event)" />
                  </nxt-form-field>
                }
              </th>
              <td class="nxt-view-dialog__actions">
                @if (!r.standard) {
                  <button nxtIconButton variant="ghost" size="sm" type="button" data-remove [attr.aria-label]="label(l.remove, r)" (click)="remove(r.id)">
                    <nxt-icon name="trash" />
                  </button>
                }
              </td>
            </tr>
          }
        </tbody>
      </table>
      <ng-container ngProjectAs="[nxtDialogFooter]">
        <button nxtButton type="button" (click)="ref.close()">{{ l.cancel }}</button>
        <button nxtButton variant="primary" type="button" [loading]="busy()" (click)="submit()">{{ l.confirm }}</button>
      </ng-container>
    </nxt-dialog-layout>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class NxtViewManageDialog {
  protected readonly ref = inject<DialogRef<boolean>>(DialogRef);
  private readonly data = inject<DialogData>(DIALOG_DATA);
  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  private readonly injector = inject(Injector);
  protected readonly l = this.data.labels;
  protected readonly max = NAME_MAX;
  protected readonly rows = signal<ManageRow[]>(this.data.views.views().map((v) => ({ id: v.id, name: v.name, standard: !!v.standard })));
  protected readonly defaultId = signal<string>(this.data.views.defaultId());
  protected readonly errors = signal<Record<string, string>>({});
  protected readonly busy = signal(false);
  protected readonly failure = signal<string | null>(null);
  private readonly removed: string[] = [];

  protected label(text: string, r: ManageRow) {
    return fill(text, r.name || '…');
  }

  protected rename(id: string, event: Event) {
    const name = (event.target as HTMLInputElement).value;
    this.rows.update((rows) => rows.map((r) => (r.id === id ? { ...r, name } : r)));
    if (this.errors()[id]) this.errors.update(({ [id]: _, ...rest }) => rest);
  }

  protected remove(id: string) {
    const rows = this.rows();
    // Position among the user's rows (standard rows come first and have no delete button).
    const position = rows.filter((r) => !r.standard).findIndex((r) => r.id === id);
    this.removed.push(id);
    this.rows.set(rows.filter((r) => r.id !== id));
    if (this.defaultId() === id) this.defaultId.set(rows[0].id);
    // The button that had focus is gone: continue on the next row's delete button, else the default radio.
    afterNextRender(
      () => {
        const buttons = [...this.host.querySelectorAll<HTMLElement>('button[data-remove]')];
        (buttons[Math.min(position, buttons.length - 1)] ?? this.host.querySelector<HTMLElement>('input[type="radio"]:checked'))?.focus();
      },
      { injector: this.injector },
    );
  }

  protected async submit() {
    const rows = this.rows();
    const errors: Record<string, string> = {};
    for (const r of rows.filter((x) => !x.standard)) {
      const n = r.name.trim().toLocaleLowerCase('vi');
      if (!n) errors[r.id] = this.l.nameRequired;
      else if (rows.some((o) => o.id !== r.id && o.name.trim().toLocaleLowerCase('vi') === n)) errors[r.id] = this.l.nameTaken;
    }
    this.errors.set(errors);
    const first = Object.keys(errors)[0];
    if (first) {
      afterNextRender(() => this.host.querySelector<HTMLInputElement>(`tr[data-id="${CSS.escape(first)}"] input[nxtInput]`)?.focus(), { injector: this.injector });
      return;
    }
    this.busy.set(true);
    try {
      await this.data.views.manage({
        names: Object.fromEntries(rows.filter((r) => !r.standard).map((r) => [r.id, r.name])),
        removed: this.removed,
        defaultId: this.defaultId(),
      });
      this.ref.close(true);
    } catch {
      this.busy.set(false);
      this.failure.set(this.l.failed);
    }
  }
}
