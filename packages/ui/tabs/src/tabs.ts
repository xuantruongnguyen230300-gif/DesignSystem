import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  TemplateRef,
  ViewEncapsulation,
  afterNextRender,
  afterRenderEffect,
  booleanAttribute,
  computed,
  contentChildren,
  inject,
  input,
  model,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { NxtIcon, NxtIconName } from '@nxt/ui/icon';
import { NxtMenu, NxtMenuItem, NxtMenuTrigger } from '@nxt/ui/menu';

/** One tab. Only the selected tab's content is attached to the panel; other tabs' content stays alive (detached), so typed input survives switching. */
@Component({
  selector: 'nxt-tab',
  template: '<ng-template #content><ng-content /></ng-template>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NxtTab {
  readonly value = input.required<string>();
  readonly label = input.required<string>();
  readonly icon = input<NxtIconName>();
  /** Count shown next to the label, e.g. pending items. */
  readonly count = input<number | string>();
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly content = viewChild.required<TemplateRef<unknown>>('content');
}

let nextId = 0;

/**
 * Tabs (WAI-ARIA tabs, automatic activation): ←/→ move and select, Home/End jump, one Tab stop.
 * With `panels` off, tabs only drive `value` and the page renders the content (filter tabs over a list).
 */
@Component({
  selector: 'nxt-tabs',
  imports: [NgTemplateOutlet, NxtIcon, NxtMenu, NxtMenuItem, NxtMenuTrigger],
  template: `
    <div class="nxt-tabs__bar">
      <div #list class="nxt-tabs__list" role="tablist" [attr.aria-label]="label()" (keydown)="onKeydown($event)">
        @for (tab of tabs(); track tab.value(); let i = $index) {
          <button
            type="button"
            role="tab"
            class="nxt-tabs__tab"
            [id]="uid + '-tab-' + i"
            [attr.aria-selected]="tab.value() === current()"
            [attr.aria-controls]="panels() ? uid + '-panel' : null"
            [attr.data-overflow]="overflow().has(i) || null"
            [tabIndex]="tab.value() === focusValue() ? 0 : -1"
            [disabled]="tab.disabled()"
            (click)="select(tab)"
          >
            @if (tab.icon(); as name) {
              <nxt-icon [name]="name" />
            }
            <span>{{ tab.label() }}</span>
            @if (tab.count() != null) {
              <span class="nxt-tabs__count">{{ tab.count() }}</span>
            }
          </button>
        }
      </div>
      <!-- Outside the tablist (it may only contain tabs). Always rendered so it can be measured. -->
      <button
        #more
        type="button"
        class="nxt-tabs__more"
        [attr.data-hidden]="!overflow().size || null"
        [attr.aria-label]="'Xem thêm ' + overflow().size + ' tab'"
        [nxtMenuTriggerFor]="moreMenu"
      >
        <span>Xem thêm</span>
        <nxt-icon name="chevron-down" />
      </button>
      <ng-template #moreMenu>
        <div nxtMenu>
          @for (tab of tabs(); track tab.value(); let i = $index) {
            @if (overflow().has(i)) {
              <button nxtMenuItem [disabled]="tab.disabled()" (triggered)="selectFromMenu(tab)">
                {{ tab.label() }}{{ tab.count() != null ? ' (' + tab.count() + ')' : '' }}
              </button>
            }
          }
        </div>
      </ng-template>
    </div>
    @if (panels()) {
      <div role="tabpanel" class="nxt-tabs__panel" [id]="uid + '-panel'" [attr.aria-labelledby]="uid + '-tab-' + currentIndex()" tabindex="0">
        <ng-container *ngTemplateOutlet="activeTab()?.content() ?? null" />
      </div>
    }
  `,
  styleUrl: './tabs.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'nxt-tabs' },
})
export class NxtTabs {
  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  private readonly destroyRef = inject(DestroyRef);
  /** Accessible name of the tab list. */
  readonly label = input.required<string>();
  /** Selected tab value (two-way). Defaults to the first tab. */
  readonly value = model<string>();
  /** Render the selected tab's content in a tabpanel. Turn off for filter tabs. */
  readonly panels = input(true, { transform: booleanAttribute });

  protected readonly tabs = contentChildren(NxtTab);
  protected readonly uid = `nxt-tabs-${nextId++}`;
  protected readonly current = computed(() => this.value() ?? this.tabs()[0]?.value());
  protected readonly activeTab = computed(() => this.tabs().find((t) => t.value() === this.current()));
  /** Element ids use the index: tab values are free text ("Nghỉ phép") and would make invalid id references. */
  protected readonly currentIndex = computed(() => Math.max(0, this.tabs().findIndex((t) => t.value() === this.current())));
  /** The one Tab stop: the selected tab, or the first enabled one if the selection is missing or disabled (WCAG 2.1.1). */
  protected readonly focusValue = computed(() => {
    const enabled = this.tabs().filter((t) => !t.disabled());
    return (enabled.find((t) => t.value() === this.current()) ?? enabled[0])?.value();
  });

  /** Indexes of tabs that do not fit and are listed under "Xem thêm" instead. The selected tab is never one. */
  protected readonly overflow = signal<ReadonlySet<number>>(new Set());
  private readonly list = viewChild.required<ElementRef<HTMLElement>>('list');
  private readonly more = viewChild.required<ElementRef<HTMLElement>>('more');

  constructor() {
    afterNextRender(() => {
      if (typeof ResizeObserver === 'undefined') return;
      const observer = new ResizeObserver(() => this.layout());
      observer.observe(this.host);
      this.destroyRef.onDestroy(() => observer.disconnect());
    });
    // Labels, counts and the selection change widths and which tab must stay visible. After render:
    // tabs created by @for only have their inputs once they have rendered.
    afterRenderEffect(() => {
      for (const t of this.tabs()) {
        t.label();
        t.count();
      }
      this.current();
      untracked(() => this.layout());
    });
  }

  protected select(tab: NxtTab) {
    if (!tab.disabled()) this.value.set(tab.value());
  }

  /** Picked under "Xem thêm": select it (it moves into view) and continue with arrow keys from there. */
  protected selectFromMenu(tab: NxtTab) {
    this.select(tab);
    // After the menu has closed and returned focus to its trigger.
    setTimeout(() => this.host.querySelector<HTMLElement>(`#${this.uid}-tab-${this.tabs().indexOf(tab)}`)?.focus());
  }

  /**
   * Priority-plus overflow: show tabs in order while they fit, keep the selected one visible,
   * list the rest under "Xem thêm" (PatternFly / ServiceNow / Coloplast practice; labels are never truncated).
   */
  private layout() {
    const list = this.list().nativeElement;
    const buttons = Array.from(list.querySelectorAll<HTMLElement>(':scope > .nxt-tabs__tab'));
    if (!buttons.length) return;
    this.host.setAttribute('data-measuring', '');
    const gap = parseFloat(getComputedStyle(list).columnGap) || 0;
    const widths = buttons.map((b) => b.getBoundingClientRect().width);
    const moreWidth = this.more().nativeElement.getBoundingClientRect().width;
    const available = (list.parentElement ?? list).clientWidth;
    this.host.removeAttribute('data-measuring');

    const total = widths.reduce((sum, w) => sum + w, 0) + gap * (widths.length - 1);
    let hidden: number[] = [];
    if (total > available) {
      const selected = this.currentIndex();
      const room = available - moreWidth - gap;
      let used = widths[selected] ?? 0;
      const visible = new Set([selected]);
      for (let i = 0; i < widths.length; i++) {
        if (i === selected) continue;
        if (used + gap + widths[i] > room) break;
        used += gap + widths[i];
        visible.add(i);
      }
      hidden = widths.map((_, i) => i).filter((i) => !visible.has(i));
    }
    const current = this.overflow();
    if (hidden.length !== current.size || hidden.some((i) => !current.has(i))) this.overflow.set(new Set(hidden));
  }

  protected onKeydown(event: KeyboardEvent) {
    const enabled = this.tabs().filter((t, i) => !t.disabled() && !this.overflow().has(i));
    const index = enabled.findIndex((t) => t.value() === this.current());
    let next: NxtTab | undefined;
    if (event.key === 'ArrowRight') next = enabled[(index + 1) % enabled.length];
    else if (event.key === 'ArrowLeft') next = enabled[(index - 1 + enabled.length) % enabled.length];
    else if (event.key === 'Home') next = enabled[0];
    else if (event.key === 'End') next = enabled[enabled.length - 1];
    if (!next) return;
    event.preventDefault();
    this.select(next);
    this.host.querySelector<HTMLElement>(`#${this.uid}-tab-${this.tabs().indexOf(next)}`)?.focus();
  }
}
