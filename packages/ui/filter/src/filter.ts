import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { Overlay } from '@angular/cdk/overlay';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  TemplateRef,
  ViewEncapsulation,
  WritableSignal,
  afterNextRender,
  computed,
  inject,
  input,
  numberAttribute,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { NxtButton } from '@nxt/ui/button';
import { NxtIcon } from '@nxt/ui/icon';

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
/** Element type of the array members of V (distributes over unions such as `string | string[]`). */
type ArrayItem<V> = V extends readonly (infer U)[] ? U : never;

/**
 * Applied + draft filter values for a list. The panel edits the draft; "Áp dụng" copies it to applied.
 * A criterion counts as active when it differs from its default ('' and [] mean "no filter").
 *
 *   readonly filters = new NxtFilterState({ status: 'all', groups: [] as string[] });
 */
export class NxtFilterState<T extends object> {
  readonly applied: WritableSignal<T>;
  readonly draft: WritableSignal<T>;
  readonly activeCount = computed(() => this.keys().filter((k) => this.isActive(k)).length);

  constructor(readonly defaults: T) {
    this.applied = signal(defaults);
    this.draft = signal(defaults);
  }

  isActive(key: keyof T): boolean {
    return !same(this.applied()[key], this.defaults[key]);
  }

  /** Panel opened: start the draft from what is applied. */
  edit() {
    this.draft.set(this.applied());
  }

  set<K extends keyof T>(key: K, value: T[K]) {
    this.draft.update((d) => ({ ...d, [key]: value }));
  }

  /** Add or remove one value of an array criterion in the draft (checkbox groups). */
  toggle<K extends keyof T>(key: K, item: ArrayItem<T[K]>, on: boolean) {
    this.draft.update((d) => {
      const list = (d[key] as unknown[]).filter((x) => x !== item);
      return { ...d, [key]: on ? [...list, item] : list };
    });
  }

  apply() {
    this.applied.set(this.draft());
  }

  /** "Đặt lại" inside the panel: the draft goes back to defaults; nothing is applied until "Áp dụng". */
  resetDraft() {
    this.draft.set(this.defaults);
  }

  /** Remove one applied criterion (chip ×). */
  clear(key: keyof T) {
    this.applied.update((a) => ({ ...a, [key]: this.defaults[key] }));
  }

  clearAll() {
    this.applied.set(this.defaults);
  }

  private keys(): (keyof T)[] {
    return Object.keys(this.defaults) as (keyof T)[];
  }
}

let nextId = 0;

/**
 * "Bộ lọc" button with a panel of filter fields (projected content), applied with "Áp dụng".
 * The toolbar stays: search + this button. Escape, "Huỷ" or a click outside close without applying.
 */
@Component({
  selector: 'nxt-filter',
  imports: [NxtButton, NxtIcon],
  template: `
    <button
      #trigger
      nxtButton
      type="button"
      class="nxt-filter__trigger"
      aria-haspopup="dialog"
      [size]="size()"
      [attr.data-active]="activeCount() > 0 || null"
      [attr.aria-expanded]="isOpen()"
      (click)="isOpen() ? close() : open()"
    >
      <nxt-icon name="filter" />
      <span>Bộ lọc</span>
      @if (activeCount() > 0) {
        <span class="nxt-filter__count" aria-hidden="true">{{ activeCount() }}</span>
        <span class="nxt-visually-hidden">, đang áp dụng {{ activeCount() }}</span>
      }
    </button>
    <ng-template #panel>
      <form class="nxt-filter__panel" novalidate (submit)="apply($event)">
        <h2 class="nxt-filter__title" [id]="titleId">{{ title() }}</h2>
        <div class="nxt-filter__body"><ng-content /></div>
        <div class="nxt-filter__footer">
          <button nxtButton variant="ghost" size="sm" type="button" (click)="reset.emit()">Đặt lại</button>
          <span class="nxt-filter__spacer"></span>
          <button nxtButton size="sm" type="button" (click)="close()">Huỷ</button>
          <button nxtButton variant="primary" size="sm" type="submit">Áp dụng</button>
        </div>
      </form>
    </ng-template>
  `,
  styleUrl: './filter.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  // The title input must not leave a native title attribute (browser tooltip over the button).
  host: { class: 'nxt-filter', '[attr.title]': 'null' },
})
export class NxtFilter {
  private readonly dialog = inject(Dialog);
  private readonly overlay = inject(Overlay);
  /** Title and accessible name of the panel: "Lọc chức danh". */
  readonly title = input('Bộ lọc');
  /** Number of applied criteria, shown on the button. */
  readonly activeCount = input(0, { transform: numberAttribute });
  /** Match the search box next to it. */
  readonly size = input<'sm' | 'md'>('md');
  /** Panel opened — copy the applied filters into the draft. */
  readonly opened = output<void>();
  /** "Áp dụng" (or Enter in the panel). */
  readonly applied = output<void>();
  /** "Đặt lại" — put the draft back to defaults; the panel stays open. */
  readonly reset = output<void>();

  protected readonly titleId = `nxt-filter-${nextId++}-title`;
  protected readonly isOpen = signal(false);
  private readonly trigger = viewChild.required('trigger', { read: ElementRef });
  private readonly panel = viewChild.required<TemplateRef<unknown>>('panel');
  private ref: DialogRef | null = null;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.ref?.close());
  }

  open() {
    if (this.ref) return;
    this.opened.emit();
    this.ref = this.dialog.open(this.panel(), {
      ariaLabelledBy: this.titleId,
      ariaModal: true,
      autoFocus: 'first-tabbable',
      restoreFocus: true,
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      panelClass: 'nxt-filter-pane',
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(this.trigger())
        .withPush(true)
        .withPositions([
          { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' },
          { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top' },
          { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom' },
        ]),
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
    });
    this.isOpen.set(true);
    this.ref.closed.subscribe(() => {
      this.ref = null;
      this.isOpen.set(false);
    });
  }

  close() {
    this.ref?.close();
  }

  focus() {
    (this.trigger().nativeElement as HTMLElement).focus();
  }

  protected apply(event: Event) {
    event.preventDefault();
    this.applied.emit();
    this.close();
  }
}

export interface NxtFilterChip {
  key: string;
  /** "Tên tiêu chí: giá trị", e.g. "Nhóm: Quản lý, Hỗ trợ". */
  label: string;
}

/**
 * Applied filters as removable chips under the toolbar (SAP Fiori calls it the infobar), plus "Xoá bộ lọc".
 * Focus moves to the next chip after a removal, or to `returnFocusTo` when none is left.
 */
@Component({
  selector: 'nxt-filter-chips',
  imports: [NxtIcon],
  template: `
    @if (chips().length) {
      <div class="nxt-filter-chips" role="group" aria-label="Bộ lọc đang áp dụng">
        <ul class="nxt-filter-chips__list" role="list">
          @for (c of chips(); track c.key; let i = $index) {
            <li>
              <button type="button" class="nxt-filter-chip" [title]="c.label" [attr.aria-label]="'Bỏ lọc ' + c.label" (click)="removeAt(i, c.key)">
                <span class="nxt-filter-chip__text">{{ c.label }}</span>
                <nxt-icon name="x" />
              </button>
            </li>
          }
        </ul>
        <button type="button" class="nxt-filter-chips__clear" (click)="clear()">Xoá bộ lọc</button>
      </div>
    }
  `,
  styleUrl: './filter.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class NxtFilterChips {
  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  private readonly injector = inject(Injector);
  readonly chips = input<NxtFilterChip[]>([]);
  /** Receives focus when the last chip is removed — usually the `nxt-filter`. */
  readonly returnFocusTo = input<{ focus(): void }>();
  readonly remove = output<string>();
  readonly clearAll = output<void>();

  protected removeAt(index: number, key: string) {
    // Last chip: move focus first — the page usually removes this component with @if (chips().length).
    if (this.chips().length === 1) {
      this.returnFocusTo()?.focus();
      this.remove.emit(key);
      return;
    }
    this.remove.emit(key);
    afterNextRender(
      () => {
        const chips = this.host.querySelectorAll<HTMLElement>('.nxt-filter-chip');
        const next = chips[Math.min(index, chips.length - 1)];
        if (next) next.focus();
        else this.returnFocusTo()?.focus();
      },
      { injector: this.injector },
    );
  }

  protected clear() {
    this.returnFocusTo()?.focus();
    this.clearAll.emit();
  }
}
