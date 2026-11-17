import { DOCUMENT } from '@angular/common';
import { DestroyRef, Directive, ElementRef, afterNextRender, effect, inject, input, output, untracked } from '@angular/core';
import type { NxtColumnsState } from './columns';

/** What `(nxtResized)` reports: a column got a new width (px), or went back to its default width (`null`). */
export interface NxtColumnResize {
  /** The column key (`nxtResizable="dept"`), `''` when the header has none. */
  key: string;
  width: number | null;
}

/** Arrow keys move the border by this much, Shift+Arrow by the large step (the numbers are CSS px). */
const STEP = 8;
const STEP_LARGE = 32;
/** Only when the stylesheet is missing: the real bounds are the `table.resize-min` / `resize-max` tokens. */
const FALLBACK_MIN = 48;
const FALLBACK_MAX = 640;

/** A column width is written as a number; the stylesheet turns it into a length (`calc(var(--_col-w) * 1px)`). */
const SIZED = 'data-sized';
const COL_W = '--_col-w';
const TABLE_W = '--_table-w';

/** `nxtResizeMin="96"` (a string) or `[nxtResizeMin]="96"`: a number; nothing or something else: no value. */
const numberAttributeOrNone = (value: unknown): number | undefined => {
  if (value === null || value === undefined || value === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

interface Measure {
  width: number;
  min: number;
  max: number;
}

/** What the sizer needs from a header cell with `nxtResizable`. */
interface Member {
  readonly host: HTMLElement;
  /** The width the user chose (px); `null`: the natural width. */
  width: number | null;
  measure(width: number): Measure;
  paint(info: Measure): void;
}

/**
 * Column widths of one table. A table lays its columns out by content (auto layout) until a column gets a
 * width; then every column keeps the width it had and the table switches to a fixed layout (`data-sized`), so
 * one column changes without the others reflowing. `layout()` does that switch: clear → measure the natural
 * widths → write each column's width and the table's total. While dragging only the delta is written.
 */
class TableSizer {
  private readonly members = new Set<Member>();
  private scheduled = false;
  private total = 0;

  constructor(private readonly table: HTMLElement) {}

  get engaged(): boolean {
    return this.table.hasAttribute(SIZED);
  }

  add(member: Member) {
    this.members.add(member);
    this.invalidate();
  }

  remove(member: Member) {
    this.members.delete(member);
    this.invalidate();
  }

  /** Columns came, went or got a saved width: sort it out once, after the current change detection. */
  invalidate() {
    if (this.scheduled) return;
    this.scheduled = true;
    queueMicrotask(() => {
      this.scheduled = false;
      if (this.table.isConnected) this.layout();
    });
  }

  /** A member got a new width. The fast path moves one border; the first width of a table lays all columns out. */
  apply(member: Member) {
    const previous = parseFloat(member.host.style.getPropertyValue(COL_W));
    if (!this.engaged || !Number.isFinite(previous) || member.width === null) {
      this.layout();
      return;
    }
    this.total += member.width - previous;
    member.host.style.setProperty(COL_W, String(member.width));
    this.table.style.setProperty(TABLE_W, String(this.total));
  }

  layout() {
    const row = [...this.members][0]?.host.parentElement;
    if (!row) return;
    const cells = [...row.children].filter((c): c is HTMLElement => c instanceof HTMLElement);
    const byHost = new Map([...this.members].map((m) => [m.host, m]));
    const sized = [...this.members].some((m) => m.width !== null);
    // Clearing shrinks the table for a moment: keep the scroll position of its region.
    const region = this.table.closest<HTMLElement>('nxt-table-scroll') ?? this.table.parentElement;
    const scroll = region ? { left: region.scrollLeft, top: region.scrollTop } : null;

    for (const cell of cells) {
      cell.removeAttribute(SIZED);
      cell.style.removeProperty(COL_W);
    }
    this.table.removeAttribute(SIZED);
    this.table.style.removeProperty(TABLE_W);

    if (sized && this.table.getBoundingClientRect().width > 0) {
      const natural = cells.map((c) => c.getBoundingClientRect().width);
      let total = 0;
      cells.forEach((cell, i) => {
        const width = byHost.get(cell)?.width ?? natural[i];
        total += width;
        // A column with no width (row actions that float over the row) stays as the stylesheet makes it.
        if (width > 0) {
          cell.setAttribute(SIZED, '');
          cell.style.setProperty(COL_W, String(width));
        }
      });
      this.total = total;
      this.table.setAttribute(SIZED, '');
      this.table.style.setProperty(TABLE_W, String(total));
    }

    if (region && scroll) {
      region.scrollLeft = scroll.left;
      region.scrollTop = scroll.top;
    }
    // Reads first, writes after: the ARIA values of every handle come from one layout.
    const members = [...this.members];
    const info = members.map((m) => m.measure(m.host.getBoundingClientRect().width));
    members.forEach((m, i) => m.paint(info[i]));
  }
}

const sizers = new WeakMap<HTMLElement, TableSizer>();

/**
 * Resizable column: `<th scope="col" nxtResizable="dept">Phòng ban</th>`. Adds a drag handle (a focusable
 * `role="separator"`) at the end edge of the header cell. Opt-in per column: a table without `nxtResizable`
 * behaves as before.
 *
 * Pointer: drag the handle. Keyboard (focus the handle): ← / → change the width by 8 (Shift: 32), Home / End go to the
 * minimum / maximum, Enter and double click go back to the default width, Escape cancels a drag.
 *
 * The default width is the one the browser gives the column by its content. Pass a `NxtColumnsState` and a key to
 * keep the widths in `NxtColumnsState.value().widths` (saved with the view); otherwise listen to `(nxtResized)`.
 *
 *   <th scope="col" nxtResizable="dept" [nxtResizeColumns]="columns" [nxtResizeMin]="96">Phòng ban</th>
 */
@Directive({
  selector: 'th[nxtResizable]',
  host: {
    'data-resizable': '',
    '[style.min-inline-size.px]': 'min()',
    '[style.max-inline-size.px]': 'max()',
  },
})
export class NxtResizable implements Member {
  /** The column key; with `nxtResizeColumns` it is where the width is saved. */
  readonly key = input('', { alias: 'nxtResizable' });
  /** Keep the width in this state (`state.widths()`), and take it from there (saved views, "Khôi phục mặc định"). */
  readonly columns = input<NxtColumnsState | undefined>(undefined, { alias: 'nxtResizeColumns' });
  /** Narrowest width (px). Default: the `table.resize-min` token. */
  readonly min = input(undefined, { alias: 'nxtResizeMin', transform: numberAttributeOrNone });
  /** Widest width (px). Default: the `table.resize-max` token. */
  readonly max = input(undefined, { alias: 'nxtResizeMax', transform: numberAttributeOrNone });
  /** The user chose a width (end of a drag, a key press) or went back to the default (`width: null`). */
  readonly resized = output<NxtColumnResize>({ alias: 'nxtResized' });

  /** @internal */
  readonly host: HTMLElement = inject(ElementRef).nativeElement;
  private readonly doc = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);

  /** @internal The width the user chose (px); `null`: natural. */
  width: number | null = null;
  private sizer: TableSizer | null = null;
  private handle: HTMLElement | null = null;
  private drag: { id: number; x0: number; w0: number; dir: 1 | -1; min: number; max: number; was: number | null; moved: boolean } | null = null;

  constructor() {
    // A width kept in the columns state (saved view, restore) becomes this column's width.
    effect(() => {
      const state = this.columns();
      const key = this.key();
      // A key the state does not know keeps its own width (the state ignores it).
      const stored = state && key && state.def(key) ? (state.width(key) ?? null) : undefined;
      untracked(() => {
        if (stored === undefined || stored === this.width) return;
        this.width = stored;
        this.sizer?.invalidate();
      });
    });

    // After the first render: the cell is in its table and its own content (a sort button) exists, so the handle
    // goes last in the Tab order.
    afterNextRender(() => {
      const table = this.host.closest<HTMLElement>('table');
      if (!table) return;
      const sizer = sizers.get(table) ?? new TableSizer(table);
      sizers.set(table, sizer);
      this.sizer = sizer;
      this.createHandle();
      sizer.add(this);
      this.destroyRef.onDestroy(() => {
        this.drag = null;
        this.doc.removeEventListener('keydown', this.onDragKey, true);
        this.handle?.remove();
        sizer.remove(this);
      });
    });
  }

  /** @internal */
  measure(width: number): Measure {
    const style = getComputedStyle(this.host);
    const px = (value: string) => (Number.isFinite(parseFloat(value)) ? parseFloat(value) : null);
    const min = this.min() ?? px(style.minInlineSize) ?? FALLBACK_MIN;
    const max = Math.max(this.max() ?? px(style.maxInlineSize) ?? FALLBACK_MAX, min);
    // A column already narrower than the minimum (or wider than the maximum) is not pushed to the bound by the first
    // move: the bounds always include the current width, so the value also stays inside its ARIA range.
    return { width, min: Math.min(min, width), max: Math.max(max, width) };
  }

  /** @internal ARIA values of the handle. */
  paint({ width, min, max }: Measure) {
    const handle = this.handle;
    if (!handle) return;
    const now = Math.round(width);
    handle.setAttribute('aria-valuenow', String(now));
    handle.setAttribute('aria-valuemin', String(Math.min(Math.round(min), now)));
    handle.setAttribute('aria-valuemax', String(Math.max(Math.round(max), now)));
    handle.setAttribute('aria-label', `Đổi độ rộng cột ${this.name()}`.trim());
  }

  private name(): string {
    return (this.host.textContent ?? '').replace(/\s+/g, ' ').trim() || this.key();
  }

  private current(): Measure {
    return this.measure(this.host.getBoundingClientRect().width);
  }

  private isRtl(): boolean {
    return (getComputedStyle(this.host).direction || this.host.closest('[dir]')?.getAttribute('dir')) === 'rtl';
  }

  private createHandle() {
    const handle = this.doc.createElement('span');
    handle.className = 'nxt-resize-handle';
    handle.setAttribute('role', 'separator');
    handle.setAttribute('aria-orientation', 'vertical');
    handle.tabIndex = 0;
    this.host.append(handle);
    this.handle = handle;

    const abort = new AbortController();
    const on = <K extends keyof HTMLElementEventMap>(type: K, fn: (e: HTMLElementEventMap[K]) => void) =>
      handle.addEventListener(type, fn, { signal: abort.signal });
    on('pointerdown', (e) => this.onPointerDown(e));
    on('pointermove', (e) => this.onPointerMove(e));
    on('pointerup', (e) => this.endDrag(e, true));
    on('pointercancel', (e) => this.endDrag(e, false));
    on('lostpointercapture', (e) => this.endDrag(e, true));
    on('keydown', (e) => this.onKeyDown(e));
    on('dblclick', () => this.reset());
    on('click', (e) => e.stopPropagation());
    on('focus', () => this.paint(this.current()));
    this.destroyRef.onDestroy(() => abort.abort());
  }

  // ---------- pointer ----------
  private onPointerDown(e: PointerEvent) {
    if (e.button !== 0 || this.drag || !this.handle) return;
    const { width, min, max } = this.current();
    if (!(width > 0)) return;
    // No default action: no text selection starts under the pointer while dragging.
    e.preventDefault();
    this.handle.focus({ preventScroll: true });
    this.handle.setPointerCapture?.(e.pointerId);
    this.drag = { id: e.pointerId, x0: e.clientX, w0: width, dir: this.isRtl() ? -1 : 1, min, max, was: this.width, moved: false };
    this.host.setAttribute('data-resizing', '');
    this.doc.addEventListener('keydown', this.onDragKey, true);
  }

  private onPointerMove(e: PointerEvent) {
    const d = this.drag;
    if (!d || e.pointerId !== d.id) return;
    // Only arithmetic on the pointer: the width is set from where the drag started, never read back.
    const width = clamp(d.w0 + d.dir * (e.clientX - d.x0), d.min, d.max);
    if (width === (this.width ?? d.w0) && !d.moved) return;
    d.moved = true;
    this.width = width;
    this.sizer?.apply(this);
  }

  private endDrag(e: PointerEvent, commit: boolean) {
    const d = this.drag;
    if (!d || e.pointerId !== d.id) return;
    this.finishDrag();
    if (!commit) {
      this.restore(d.was);
      return;
    }
    if (d.moved && this.width !== d.was) this.commit(this.width);
    this.paint(this.current());
  }

  /** Escape: the drag is dropped and the column gets the width it had. */
  private readonly onDragKey = (e: KeyboardEvent) => {
    const d = this.drag;
    if (e.key !== 'Escape' || !d) return;
    e.preventDefault();
    e.stopPropagation();
    this.finishDrag();
    this.restore(d.was);
  };

  private finishDrag() {
    const d = this.drag;
    this.drag = null;
    this.host.removeAttribute('data-resizing');
    this.doc.removeEventListener('keydown', this.onDragKey, true);
    if (d && this.handle?.hasPointerCapture?.(d.id)) this.handle.releasePointerCapture(d.id);
  }

  private restore(width: number | null) {
    this.width = width;
    this.sizer?.layout();
  }

  // ---------- keyboard ----------
  private onKeyDown(e: KeyboardEvent) {
    if (this.drag) return;
    if (e.key === 'Enter') {
      e.preventDefault();
      this.reset();
      return;
    }
    const { width, min, max } = this.current();
    // The arrows move the border where the pointer would: toward the start of the page in RTL, the width grows.
    const dir = this.isRtl() ? -1 : 1;
    const step = e.shiftKey ? STEP_LARGE : STEP;
    const target =
      e.key === 'ArrowRight' ? width + dir * step : e.key === 'ArrowLeft' ? width - dir * step : e.key === 'Home' ? min : e.key === 'End' ? max : null;
    if (target === null) return;
    e.preventDefault();
    const next = Math.round(clamp(target, min, max));
    if (next === Math.round(width)) return;
    this.width = next;
    this.sizer?.apply(this);
    this.commit(next);
    this.paint(this.current());
  }

  // ---------- default width ----------
  private reset() {
    if (this.width === null) return;
    this.width = null;
    this.sizer?.layout();
    this.commit(null);
    this.paint(this.current());
  }

  private commit(width: number | null) {
    const key = this.key();
    if (key) this.columns()?.setWidth(key, width);
    this.resized.emit({ key, width });
  }
}
