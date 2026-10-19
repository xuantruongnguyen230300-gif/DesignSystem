import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  TemplateRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  contentChildren,
  inject,
  input,
  model,
  viewChild,
} from '@angular/core';
import { NxtIcon, NxtIconName } from '@nxt/ui/icon';

/** One tab. Only the selected tab's content is attached to the panel; switching tabs destroys the previous view, so keep unsaved input in the parent. */
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
  imports: [NgTemplateOutlet, NxtIcon],
  template: `
    <div class="nxt-tabs__list" role="tablist" [attr.aria-label]="label()" (keydown)="onKeydown($event)">
      @for (tab of tabs(); track tab.value(); let i = $index) {
        <button
          type="button"
          role="tab"
          class="nxt-tabs__tab"
          [id]="uid + '-tab-' + i"
          [attr.aria-selected]="tab.value() === current()"
          [attr.aria-controls]="panels() ? uid + '-panel' : null"
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

  protected select(tab: NxtTab) {
    if (!tab.disabled()) this.value.set(tab.value());
  }

  protected onKeydown(event: KeyboardEvent) {
    const enabled = this.tabs().filter((t) => !t.disabled());
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
