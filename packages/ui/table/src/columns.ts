import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  Injector,
  Signal,
  ViewEncapsulation,
  WritableSignal,
  afterNextRender,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { NxtButton } from '@nxt/ui/button';
import { NxtCheckbox } from '@nxt/ui/checkbox';
import { NxtDialog, NxtDialogLayout } from '@nxt/ui/dialog';
import { NxtIcon } from '@nxt/ui/icon';
import { NxtSearch, nxtMatches } from '@nxt/ui/search';

/** A column the user can show, hide and reorder. */
export interface NxtColumnDef {
  key: string;
  /** Column header text, also the checkbox label in the settings panel. */
  label: string;
  /** Identifier column (code, name): always shown, always first, cannot be hidden or moved. */
  locked?: boolean;
  /** Hidden in the default layout. */
  hidden?: boolean;
}

/** What a view saves: the order of every column (hidden ones too), which are hidden, and the widths the user set. */
export interface NxtColumnsValue {
  readonly order: readonly string[];
  readonly hidden: readonly string[];
  /** Widths in px of the columns the user resized (`th[nxtResizable]`), by key. A column not listed has its natural width. */
  readonly widths?: Readonly<Record<string, number>>;
}

/** A column as the settings panel shows it (draft order). */
export interface NxtColumnItem {
  def: NxtColumnDef;
  visible: boolean;
}

/** Text of the column settings panel and dialog. `{column}`, `{position}`, `{total}`, `{visible}` are filled in. */
export interface NxtTableColumnsLabels {
  title: string;
  description: string;
  search: string;
  searchPlaceholder: string;
  showAll: string;
  list: string;
  moveUp: string;
  moveDown: string;
  moveUpColumn: string;
  moveDownColumn: string;
  locked: string;
  moved: string;
  noMatch: string;
  count: string;
  restore: string;
  restored: string;
  cancel: string;
  apply: string;
}

export const NXT_TABLE_COLUMNS_LABELS: NxtTableColumnsLabels = {
  title: 'Cài đặt bảng',
  description: 'Chọn cột hiển thị và thứ tự cột. Cột định danh luôn hiện.',
  search: 'Tìm cột',
  searchPlaceholder: 'Tên cột',
  showAll: 'Hiện tất cả cột',
  list: 'Cột của bảng',
  moveUp: 'Lên',
  moveDown: 'Xuống',
  moveUpColumn: 'Đưa cột {column} lên',
  moveDownColumn: 'Đưa cột {column} xuống',
  locked: 'Luôn hiện',
  moved: '{column}: vị trí {position} trên {total}',
  noMatch: 'Không có cột phù hợp',
  count: 'Đang hiện {visible} trên {total} cột',
  restore: 'Khôi phục mặc định',
  restored: 'Đã khôi phục cột mặc định',
  cancel: 'Huỷ',
  apply: 'Áp dụng',
};

const fill = (text: string, values: Record<string, string | number>) => text.replace(/\{(\w+)\}/g, (m, k) => (k in values ? String(values[k]) : m));

const NO_WIDTHS: Readonly<Record<string, number>> = Object.freeze({});

const sameWidths = (a: Readonly<Record<string, number>> = NO_WIDTHS, b: Readonly<Record<string, number>> = NO_WIDTHS) => {
  const keys = Object.keys(a);
  return keys.length === Object.keys(b).length && keys.every((k) => a[k] === b[k]);
};

const sameValue = (a: NxtColumnsValue, b: NxtColumnsValue) =>
  a.order.length === b.order.length &&
  a.order.every((k, i) => k === b.order[i]) &&
  a.hidden.length === b.hidden.length &&
  a.hidden.every((k) => b.hidden.includes(k)) &&
  sameWidths(a.widths, b.widths);

/** A usable width is a finite number above zero; px are whole numbers. */
const cleanWidth = (width: unknown): number | null => (typeof width === 'number' && Number.isFinite(width) && width > 0 ? Math.round(width) : null);

/** The value with these widths; no `widths` key at all when none is set (the shape saved views already have). */
const withWidths = (value: NxtColumnsValue, widths: Record<string, number>): NxtColumnsValue =>
  Object.keys(widths).length ? { order: value.order, hidden: value.hidden, widths } : { order: value.order, hidden: value.hidden };

/**
 * Which columns a table shows, and in what order (plain signals, no DOM). The table renders `visible()`;
 * the settings panel edits a draft that `apply()` commits (Cancel discards it).
 *
 *   readonly columns = new NxtColumnsState([{ key: 'name', label: 'Họ và tên', locked: true }, { key: 'dept', label: 'Phòng ban' }, …]);
 *   @for (c of columns.visible(); track c.key) { <th scope="col">{{ c.label }}</th> }
 */
export class NxtColumnsState {
  /** Column definitions, locked columns first. */
  readonly defs: readonly NxtColumnDef[];
  /** The default layout (definition order, `hidden` columns hidden). */
  readonly defaults: NxtColumnsValue;
  private readonly applied: WritableSignal<NxtColumnsValue>;
  private readonly draftValue: WritableSignal<NxtColumnsValue>;
  private readonly byKey: ReadonlyMap<string, NxtColumnDef>;

  /** Applied layout: what the table shows and what a view saves. */
  readonly value: Signal<NxtColumnsValue>;
  /** Widths (px) the user gave columns by dragging their borders, by key. Empty when none. */
  readonly widths: Signal<Readonly<Record<string, number>>>;
  /** Draft edited by the settings panel. */
  readonly draft: Signal<NxtColumnsValue>;
  /** Columns shown, in order. */
  readonly visible: Signal<NxtColumnDef[]>;
  readonly visibleKeys: Signal<string[]>;
  /** The applied layout differs from the default one. */
  readonly modified: Signal<boolean>;
  /** Every column in draft order, with its draft visibility (for the panel). */
  readonly draftColumns: Signal<NxtColumnItem[]>;

  constructor(defs: readonly NxtColumnDef[]) {
    this.defs = [...defs.filter((d) => d.locked), ...defs.filter((d) => !d.locked)];
    this.byKey = new Map(this.defs.map((d) => [d.key, d]));
    this.defaults = { order: this.defs.map((d) => d.key), hidden: this.defs.filter((d) => d.hidden && !d.locked).map((d) => d.key) };
    this.applied = signal(this.defaults);
    this.draftValue = signal(this.defaults);
    this.value = this.applied.asReadonly();
    this.widths = computed(() => this.applied().widths ?? NO_WIDTHS);
    this.draft = this.draftValue.asReadonly();
    this.visible = computed(() => this.items(this.applied()).filter((c) => c.visible).map((c) => c.def));
    this.visibleKeys = computed(() => this.visible().map((d) => d.key));
    this.modified = computed(() => !sameValue(this.applied(), this.defaults));
    this.draftColumns = computed(() => this.items(this.draftValue()));
  }

  def(key: string): NxtColumnDef | undefined {
    return this.byKey.get(key);
  }

  isVisible(key: string): boolean {
    return this.visibleKeys().includes(key);
  }

  /** Apply a saved layout (a view). Unknown keys are dropped, new columns take their default place, locked ones stay first and shown. */
  set(value: Partial<NxtColumnsValue> | null | undefined) {
    this.applied.set(this.normalize(value));
  }

  /** Back to the default layout: order, hidden columns and widths. */
  reset() {
    this.applied.set(this.defaults);
  }

  // ---------- widths (`th[nxtResizable]`) ----------
  /** The width (px) the user gave a column, `undefined` for its natural width. */
  width(key: string): number | undefined {
    return this.widths()[key];
  }

  /**
   * Give a column a width (px), or `null` for its natural width. Applies at once, not through the draft:
   * resizing is direct manipulation. Unknown keys and unusable numbers are ignored (a number is rounded).
   */
  setWidth(key: string, width: number | null) {
    if (!this.byKey.has(key)) return;
    const next: Record<string, number> = { ...this.widths() };
    const clean = cleanWidth(width);
    if (clean === null) delete next[key];
    else next[key] = clean;
    this.applied.update((v) => withWidths(v, next));
  }

  /** Every column back to its natural width; order and hidden columns stay. */
  resetWidths() {
    this.applied.update((v) => withWidths(v, {}));
  }

  // ---------- draft (settings panel) ----------
  /** Panel opened: start the draft from what is applied. */
  edit() {
    this.draftValue.set(this.applied());
  }

  apply() {
    this.applied.set(this.draftValue());
  }

  /** "Khôi phục mặc định": the draft goes back to the default layout; nothing applies until "Áp dụng". */
  resetDraft() {
    this.draftValue.set(this.defaults);
  }

  toggle(key: string, visible: boolean) {
    if (!this.byKey.has(key) || this.byKey.get(key)!.locked) return;
    this.draftValue.update((v) => ({ ...v, hidden: visible ? v.hidden.filter((k) => k !== key) : [...v.hidden.filter((k) => k !== key), key] }));
  }

  setAll(visible: boolean) {
    this.draftValue.update((v) => ({ ...v, hidden: visible ? [] : this.defs.filter((d) => !d.locked).map((d) => d.key) }));
  }

  canMove(key: string, delta: -1 | 1): boolean {
    const order = this.draftValue().order;
    const i = order.indexOf(key);
    const j = i + delta;
    return i >= 0 && !this.byKey.get(key)?.locked && j >= 0 && j < order.length && !this.byKey.get(order[j])?.locked;
  }

  /** Move a column one place in the draft. Returns false when it cannot move (edge, locked). */
  move(key: string, delta: -1 | 1): boolean {
    if (!this.canMove(key, delta)) return false;
    this.draftValue.update((v) => {
      const order = [...v.order];
      const i = order.indexOf(key);
      [order[i], order[i + delta]] = [order[i + delta], order[i]];
      return { ...v, order };
    });
    return true;
  }

  private items(value: NxtColumnsValue): NxtColumnItem[] {
    const hidden = new Set(value.hidden);
    return value.order.map((k) => this.byKey.get(k)!).map((def) => ({ def, visible: !!def.locked || !hidden.has(def.key) }));
  }

  private normalize(value: Partial<NxtColumnsValue> | null | undefined): NxtColumnsValue {
    if (!value) return this.defaults;
    const movable = (k: string) => this.byKey.has(k) && !this.byKey.get(k)!.locked;
    const given = [...new Set((value.order ?? []).filter(movable))];
    const missing = this.defaults.order.filter((k) => movable(k) && !given.includes(k));
    // A column the saved layout does not know goes right after its default predecessor.
    for (const k of missing) {
      const before = this.defaults.order.slice(0, this.defaults.order.indexOf(k)).reverse().find((p) => given.includes(p));
      given.splice(before ? given.indexOf(before) + 1 : 0, 0, k);
    }
    const locked = this.defs.filter((d) => d.locked).map((d) => d.key);
    const hidden = [
      ...new Set([...(value.hidden ?? this.defaults.hidden).filter(movable), ...missing.filter((k) => this.defaults.hidden.includes(k))]),
    ];
    // Any column can have a width, the identifier column too.
    const widths: Record<string, number> = {};
    for (const [k, w] of Object.entries(value.widths ?? {})) {
      const clean = cleanWidth(w);
      if (this.byKey.has(k) && clean !== null) widths[k] = clean;
    }
    return withWidths({ order: [...locked, ...given], hidden }, widths);
  }
}

/**
 * Column settings panel: search, "show all", Up / Down (Alt+↑ / Alt+↓ on a column), one checkbox per column in
 * table order, "Khôi phục mặc định". Edits `state.draft`; whoever opens it calls `state.edit()` first and
 * `state.apply()` on "Áp dụng". `[nxtTableColumnsFor]` does all of that in a dialog.
 */
@Component({
  selector: 'nxt-table-columns',
  imports: [NxtButton, NxtCheckbox, NxtIcon, NxtSearch],
  template: `
    <nxt-search class="nxt-table-columns__search" size="sm" cdkFocusInitial [label]="l().search" [placeholder]="l().searchPlaceholder" [(value)]="query" />
    <div class="nxt-table-columns__tools">
      <nxt-checkbox [label]="l().showAll" [checked]="allVisible()" [indeterminate]="someVisible()" (checkedChange)="state().setAll($event)" />
      <span class="nxt-table-columns__spacer"></span>
      <button nxtButton variant="ghost" size="sm" type="button" [disabled]="!canMove(-1)" [attr.aria-label]="moveLabel(-1)" (click)="moveActive(-1)">
        <nxt-icon name="arrow-up" />{{ l().moveUp }}
      </button>
      <button nxtButton variant="ghost" size="sm" type="button" [disabled]="!canMove(1)" [attr.aria-label]="moveLabel(1)" (click)="moveActive(1)">
        <nxt-icon name="arrow-down" />{{ l().moveDown }}
      </button>
    </div>
    <ul class="nxt-table-columns__list" [attr.aria-label]="l().list">
      @for (c of shown(); track c.def.key) {
        <li
          class="nxt-table-columns__item"
          [attr.data-key]="c.def.key"
          [attr.data-active]="c.def.key === active() || null"
          (focusin)="active.set(c.def.key)"
          (click)="active.set(c.def.key)"
          (keydown)="onKey($event, c.def.key)"
        >
          <nxt-checkbox [label]="c.def.label" [checked]="c.visible" [disabled]="!!c.def.locked" (checkedChange)="state().toggle(c.def.key, $event)" />
          @if (c.def.locked) {
            <span class="nxt-table-columns__locked">{{ l().locked }}</span>
          }
        </li>
      } @empty {
        <li class="nxt-table-columns__empty">{{ l().noMatch }}</li>
      }
    </ul>
    <div class="nxt-table-columns__footer">
      <button nxtButton variant="ghost" size="sm" type="button" (click)="restore()"><nxt-icon name="restore" />{{ l().restore }}</button>
      <span class="nxt-table-columns__count">{{ count() }}</span>
    </div>
    <span class="nxt-visually-hidden" role="status">{{ status() }}</span>
  `,
  styleUrl: './columns.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'nxt-table-columns' },
})
export class NxtTableColumns {
  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  private readonly injector = inject(Injector);
  /** The columns to edit (their draft). */
  readonly state = input.required<NxtColumnsState>();
  /** Override any text (translations). */
  readonly labels = input<Partial<NxtTableColumnsLabels>>({});

  protected readonly l = computed(() => ({ ...NXT_TABLE_COLUMNS_LABELS, ...this.labels() }));
  protected readonly query = signal('');
  /** The column Up / Down act on: the last one focused or clicked. */
  protected readonly active = signal<string | null>(null);
  protected readonly status = signal('');

  protected readonly shown = computed(() => this.state().draftColumns().filter((c) => nxtMatches(this.query(), c.def.label)));
  private readonly movable = computed(() => this.state().draftColumns().filter((c) => !c.def.locked));
  protected readonly allVisible = computed(() => this.movable().every((c) => c.visible));
  protected readonly someVisible = computed(() => !this.allVisible() && this.movable().some((c) => c.visible));
  protected readonly count = computed(() => {
    const all = this.state().draftColumns();
    return fill(this.l().count, { visible: all.filter((c) => c.visible).length, total: all.length });
  });

  protected canMove(delta: -1 | 1): boolean {
    const key = this.active();
    return !!key && this.state().canMove(key, delta);
  }

  protected moveLabel(delta: -1 | 1): string {
    const label = this.state().def(this.active() ?? '')?.label;
    const l = this.l();
    if (!label) return delta < 0 ? l.moveUp : l.moveDown;
    return fill(delta < 0 ? l.moveUpColumn : l.moveDownColumn, { column: label });
  }

  protected moveActive(delta: -1 | 1) {
    const key = this.active();
    if (key) this.move(key, delta, false);
  }

  /** Alt+↑ / Alt+↓ on a column's checkbox moves it; focus stays on it. */
  protected onKey(event: KeyboardEvent, key: string) {
    if (!event.altKey || (event.key !== 'ArrowUp' && event.key !== 'ArrowDown')) return;
    event.preventDefault();
    this.move(key, event.key === 'ArrowUp' ? -1 : 1, true);
  }

  protected restore() {
    this.state().resetDraft();
    this.status.set(this.l().restored);
  }

  private move(key: string, delta: -1 | 1, refocus: boolean) {
    const state = this.state();
    if (!state.move(key, delta)) return;
    const order = state.draft().order;
    this.status.set(fill(this.l().moved, { column: state.def(key)!.label, position: order.indexOf(key) + 1, total: order.length }));
    // The row is moved in the DOM, which drops focus: put it back on the same checkbox after the render.
    if (refocus) afterNextRender(() => this.host.querySelector<HTMLElement>(`li[data-key="${CSS.escape(key)}"] input`)?.focus(), { injector: this.injector });
  }
}

interface NxtTableColumnsDialogData {
  state: NxtColumnsState;
  labels: Partial<NxtTableColumnsLabels>;
}

/** Content of the dialog opened by `[nxtTableColumnsFor]`. Closes with `true` on "Áp dụng". */
@Component({
  selector: 'nxt-table-columns-dialog',
  imports: [NxtButton, NxtDialogLayout, NxtTableColumns],
  template: `
    <nxt-dialog-layout [title]="l.title" [description]="l.description">
      <nxt-table-columns [state]="data.state" [labels]="data.labels" />
      <ng-container ngProjectAs="[nxtDialogFooter]">
        <button nxtButton type="button" (click)="ref.close()">{{ l.cancel }}</button>
        <button nxtButton variant="primary" type="button" (click)="ref.close(true)">{{ l.apply }}</button>
      </ng-container>
    </nxt-dialog-layout>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class NxtTableColumnsDialog {
  protected readonly ref = inject<DialogRef<boolean>>(DialogRef);
  protected readonly data = inject<NxtTableColumnsDialogData>(DIALOG_DATA);
  protected readonly l = { ...NXT_TABLE_COLUMNS_LABELS, ...this.data.labels };
}

/**
 * On the "Cài đặt bảng" button (icon `adjustments`, tooltip): opens a dialog with the column settings panel,
 * "Huỷ" / "Áp dụng"; focus returns to the button when it closes.
 *
 *   <button nxtIconButton type="button" aria-label="Cài đặt bảng" nxtTooltip="Cài đặt bảng" [nxtTableColumnsFor]="columns"><nxt-icon name="adjustments" /></button>
 */
@Directive({
  selector: '[nxtTableColumnsFor]',
  host: { 'aria-haspopup': 'dialog', '(click)': 'open()' },
})
export class NxtTableColumnsTrigger {
  private readonly dialog = inject(NxtDialog);
  readonly state = input.required<NxtColumnsState>({ alias: 'nxtTableColumnsFor' });
  /** Override any text of the dialog and panel (translations). */
  readonly labels = input<Partial<NxtTableColumnsLabels>>({}, { alias: 'nxtTableColumnsLabels' });
  /** After "Áp dụng": the new layout (save it per user if the page does). */
  readonly applied = output<NxtColumnsValue>({ alias: 'nxtTableColumnsApplied' });

  open() {
    const state = this.state();
    state.edit();
    this.dialog
      .open<boolean, NxtTableColumnsDialogData>(NxtTableColumnsDialog, { size: 'sm', data: { state, labels: this.labels() } })
      .closed.subscribe((ok) => {
        if (!ok) return;
        state.apply();
        this.applied.emit(state.value());
      });
  }
}
