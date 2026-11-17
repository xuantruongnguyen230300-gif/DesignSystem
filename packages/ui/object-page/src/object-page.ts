import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  TemplateRef,
  ViewEncapsulation,
  afterEveryRender,
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
import { NxtButton } from '@nxt/ui/button';
import { NxtIcon } from '@nxt/ui/icon';
import { NxtTooltip } from '@nxt/ui/tooltip';

/** Keep in sync with packages/ui/object-page/SPEC.md → "Variants". */
export type NxtObjectPageNavigation = 'anchors' | 'tabs';
/** Header state reflected as `data-header` on the host (SPEC §5). */
export type NxtObjectPageHeaderState = 'expanded' | 'scrolled' | 'collapsed' | 'pinned' | 'peek';

/** Fiori: never pin when the header takes more than 60% of the scroll area. */
const PIN_MAX_SHARE = 0.6;
/** Scroll distance (px) that ends a temporary "peek" at the header — layout nudges from scroll anchoring stay below it. */
const PEEK_TOLERANCE = 8;

/**
 * One part of an object page: an `h2` title, optional actions on the title row (`[nxtSectionActions]`) and content.
 * Rendered by `nxt-object-page` as a named `section` with this `id` (anchor target); not placed in the DOM by itself.
 */
@Component({
  selector: 'nxt-object-page-section',
  template: `
    <ng-template #actions><ng-content select="[nxtSectionActions]" /></ng-template>
    <ng-template #content><ng-content /></ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // The host is never attached; keep its static id/title attributes from turning into duplicates or tooltips.
  host: { '[attr.id]': 'null', '[attr.title]': 'null' },
})
export class NxtObjectPageSection {
  /** Id of the rendered `section`: anchor target and deep-link fragment. Unique in the document. */
  readonly id = input.required<string>();
  /** Section title (`h2`), also the anchor / tab label. */
  readonly title = input.required<string>();
  /** Count next to the tab label ("Hợp đồng (3)"), tabs mode only. For numbers that need attention. */
  readonly count = input<number | string>();
  /** The section is loading: `aria-busy="true"` on the section. Place skeletons in its content. */
  readonly busy = input(false, { transform: booleanAttribute });
  readonly actions = viewChild.required<TemplateRef<unknown>>('actions');
  readonly content = viewChild.required<TemplateRef<unknown>>('content');
}

/** A block inside a section: optional `h3` title with actions (`[nxtSubsectionActions]`) on the same row, then content. */
@Component({
  selector: 'nxt-object-page-subsection',
  template: `
    <div class="nxt-object-page-subsection__head">
      @if (title()) {
        <h3 class="nxt-object-page-subsection__title">{{ title() }}</h3>
      }
      <div class="nxt-object-page-subsection__actions"><ng-content select="[nxtSubsectionActions]" /></div>
    </div>
    <ng-content />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'nxt-object-page-subsection', '[attr.title]': 'null' },
})
export class NxtObjectPageSubsection {
  /** Block title (`h3`). Leave empty when the section has only this block (the section title already names it). */
  readonly title = input<string>();
}

let nextId = 0;

/**
 * Object page (SAP Fiori Object Page on a Dynamic Page): content header that scrolls away and collapses
 * (`[nxtObjectPageHeader]`, compact line `[nxtObjectPageSummary]`), sticky anchor bar with scroll-spy or tabs,
 * sections (`nxt-object-page-section`) and a sticky footer slot (`[nxtObjectPageFooter]`). The page title row is
 * the top bar: put `nxt-page-header placement="topbar"` right before it.
 */
@Component({
  selector: 'nxt-object-page',
  imports: [NgTemplateOutlet, NxtButton, NxtIcon, NxtTooltip],
  template: `
    <div #top class="nxt-object-page__top" [attr.data-sticky]="stickyMode()">
      <div #header class="nxt-object-page__header" [id]="uid + '-header'" [hidden]="!expanded()">
        <ng-content select="[nxtObjectPageHeader]" />
      </div>

      <div #bar class="nxt-object-page__bar" [hidden]="!showBar()">
        <div #summary class="nxt-object-page__summary" [attr.data-visible]="summaryVisible() || null">
          <ng-content select="[nxtObjectPageSummary]" />
        </div>
        <div #barRow class="nxt-object-page__bar-row">
          @if (navVisible()) {
            @if (tabsMode()) {
              <div #nav class="nxt-object-page-nav" role="tablist" [attr.aria-label]="navLabel()" (keydown)="onNavKeydown($event)">
                @for (s of sections(); track s; let i = $index) {
                  <button
                    type="button"
                    role="tab"
                    class="nxt-object-page-nav__item"
                    [id]="uid + '-tab-' + i"
                    [attr.aria-selected]="s.id() === current()"
                    [attr.aria-controls]="rendered().has(s.id()) ? s.id() : null"
                    [tabIndex]="s.id() === current() ? 0 : -1"
                    (click)="selectTab(s.id())"
                  >
                    {{ s.title() }}@if (s.count() != null) {<span class="nxt-object-page-nav__count"> ({{ s.count() }})</span>}
                  </button>
                }
              </div>
            } @else {
              <nav #nav class="nxt-object-page-nav" [attr.aria-label]="navLabel()">
                <ul role="list" class="nxt-object-page-nav__list" (keydown)="onNavKeydown($event)">
                  @for (s of sections(); track s) {
                    <li>
                      <button
                        type="button"
                        class="nxt-object-page-nav__item"
                        [attr.aria-current]="s.id() === current() ? 'true' : null"
                        (click)="goTo(s.id())"
                      >
                        {{ s.title() }}
                      </button>
                    </li>
                  }
                </ul>
              </nav>
            }
          }
          <div class="nxt-object-page__tools">
            @if (showToggle()) {
              <button
                nxtIconButton
                variant="ghost"
                size="sm"
                type="button"
                class="nxt-object-page__toggle"
                data-header-toggle
                [attr.aria-label]="headerShown() ? collapseLabel() : expandLabel()"
                [attr.aria-expanded]="headerShown()"
                [attr.aria-controls]="uid + '-header'"
                [nxtTooltip]="headerShown() ? collapseLabel() : expandLabel()"
                (click)="toggleHeader()"
              >
                <nxt-icon [name]="headerShown() ? 'chevron-up' : 'chevron-down'" />
              </button>
            }
            @if (showPin()) {
              <button
                nxtIconButton
                variant="ghost"
                size="sm"
                type="button"
                class="nxt-object-page__pin"
                data-header-pin
                [attr.aria-label]="pinLabel()"
                [pressed]="pinned()"
                [nxtTooltip]="pinLabel()"
                (click)="togglePin()"
              >
                <nxt-icon [name]="pinned() ? 'pinned' : 'pin'" />
              </button>
            }
          </div>
        </div>
      </div>
    </div>

    <div #content class="nxt-object-page__content">
      @for (s of sections(); track s; let i = $index) {
        @if (!tabsMode() || rendered().has(s.id())) {
          <section
            class="nxt-object-page-section"
            [id]="s.id()"
            [attr.role]="tabsMode() ? 'tabpanel' : null"
            [attr.aria-labelledby]="tabsMode() ? uid + '-tab-' + i : uid + '-h-' + i"
            [attr.tabindex]="tabsMode() ? 0 : null"
            [attr.aria-busy]="s.busy() || null"
            [hidden]="tabsMode() && s.id() !== current()"
          >
            <div class="nxt-object-page-section__head">
              <h2 class="nxt-object-page-section__title" [class.nxt-visually-hidden]="tabsMode()" [id]="uid + '-h-' + i" tabindex="-1">{{ s.title() }}</h2>
              <div class="nxt-object-page-section__actions"><ng-container [ngTemplateOutlet]="s.actions()" /></div>
            </div>
            <ng-container [ngTemplateOutlet]="s.content()" />
          </section>
        }
      }
    </div>

    <div #footer class="nxt-object-page__footer"><ng-content select="[nxtObjectPageFooter]" /></div>
  `,
  styleUrl: './object-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'nxt-object-page',
    '[attr.data-header]': 'headerState()',
    '[attr.data-navigation]': "tabsMode() ? 'tabs' : 'anchors'",
    '[attr.data-scrolled]': 'scrolled() || null',
    '(focusin)': 'onFocusIn($event)',
  },
})
export class NxtObjectPage {
  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  private readonly injector = inject(Injector);

  /** `anchors`: sections in one scroll with a scroll-spy anchor bar (default). `tabs`: one section at a time. */
  readonly navigation = input<NxtObjectPageNavigation>('anchors');
  /** Id of the selected (tabs) / visible (anchors) section, two-way. Empty → the first one. Use `goTo()` to scroll. */
  readonly section = model<string>();
  /** Accessible name of the anchor bar / tab list. */
  readonly navLabel = input('Các phần của trang');
  /** Content header open (two-way). `false` hides it and shows the compact summary line. */
  readonly expanded = model(true);
  /** Keep the header and the anchor bar in view while scrolling. Ignored while the header is taller than 60% of the scroll area. */
  readonly pinned = model(false);
  /** Show the collapse / expand button for the content header. */
  readonly collapsible = input(true, { transform: booleanAttribute });
  /** Show the pin button. */
  readonly pinnable = input(false, { transform: booleanAttribute });
  /** Name + tooltip of the collapse button. */
  readonly collapseLabel = input('Thu gọn phần tóm tắt');
  /** Name + tooltip of the expand button. */
  readonly expandLabel = input('Mở rộng phần tóm tắt');
  /** Name + tooltip of the pin toggle button (state in `aria-pressed`). */
  readonly pinLabel = input('Ghim phần tóm tắt');

  protected readonly sections = contentChildren(NxtObjectPageSection);
  protected readonly uid = `nxt-object-page-${nextId++}`;

  private readonly topRef = viewChild.required<ElementRef<HTMLElement>>('top');
  private readonly headerRef = viewChild.required<ElementRef<HTMLElement>>('header');
  private readonly barRef = viewChild.required<ElementRef<HTMLElement>>('bar');
  private readonly barRowRef = viewChild.required<ElementRef<HTMLElement>>('barRow');
  private readonly summaryRef = viewChild.required<ElementRef<HTMLElement>>('summary');
  private readonly contentRef = viewChild.required<ElementRef<HTMLElement>>('content');
  private readonly footerRef = viewChild.required<ElementRef<HTMLElement>>('footer');
  private readonly navRef = viewChild<ElementRef<HTMLElement>>('nav');

  /** Slots are detected from the DOM (they are plain attributes, no directive to import). */
  protected readonly hasHeader = signal(false);
  protected readonly hasSummary = signal(false);
  /** The page has scrolled: content passes under the sticky bar. */
  protected readonly scrolled = signal(false);
  /** The content header has scrolled out of view (snap on scroll). */
  private readonly scrolledPast = signal(false);
  /** Header opened while scrolled away: shown on top until the next scroll. */
  private readonly peeking = signal(false);
  private readonly pinAllowed = signal(true);

  protected readonly tabsMode = computed(() => this.navigation() === 'tabs' && this.sections().length > 1);
  protected readonly navVisible = computed(() => this.sections().length > 1);
  protected readonly current = computed(() => {
    const list = this.sections();
    const value = this.section();
    return (list.find((s) => s.id() === value) ?? list[0])?.id();
  });
  /** Tabs mode renders a section the first time it is opened and keeps it (typed input survives switching). */
  private readonly visited = new Set<string>();
  protected readonly rendered = computed(() => {
    const id = this.current();
    if (id) this.visited.add(id);
    return new Set(this.visited);
  });

  private readonly pinActive = computed(() => this.hasHeader() && this.expanded() && this.pinned() && this.pinAllowed());
  protected readonly stickyMode = computed<'pin' | 'peek' | null>(() =>
    this.pinActive() ? 'pin' : this.hasHeader() && this.expanded() && this.peeking() ? 'peek' : null,
  );
  protected readonly headerShown = computed(() => this.hasHeader() && this.expanded() && (this.stickyMode() !== null || !this.scrolledPast()));
  protected readonly headerState = computed<NxtObjectPageHeaderState | null>(() => {
    if (!this.hasHeader()) return null;
    if (!this.expanded()) return 'collapsed';
    const sticky = this.stickyMode();
    if (sticky === 'pin') return 'pinned';
    if (sticky === 'peek') return 'peek';
    return this.scrolledPast() ? 'scrolled' : 'expanded';
  });
  protected readonly summaryVisible = computed(() => this.hasSummary() && !this.headerShown());
  protected readonly showToggle = computed(() => this.collapsible() && this.hasHeader());
  protected readonly showPin = computed(() => this.pinnable() && this.hasHeader() && this.pinAllowed());
  protected readonly showBar = computed(() => this.navVisible() || this.showToggle() || this.showPin() || this.hasSummary());

  private root: HTMLElement | null = null;
  /** Section the user asked for: the spy keeps it current until the scroll gets there (no flicker through the ones in between). */
  private pending: string | null = null;
  private peekBaseline: number | null = null;
  private programmaticFocus = false;
  private lastHeaderHeight = 0;

  constructor() {
    const destroyRef = inject(DestroyRef);

    // Cheap slot checks after every render: content of the slots may come and go with the page's own @if.
    afterEveryRender({
      read: () => {
        const header = this.headerRef().nativeElement.childElementCount > 0;
        const summary = this.summaryRef().nativeElement.childElementCount > 0;
        if (header !== this.hasHeader()) this.hasHeader.set(header);
        if (summary !== this.hasSummary()) this.hasSummary.set(summary);
      },
    });

    afterNextRender(() => {
      this.root = scrollParent(this.host);
      const target: HTMLElement | Window = this.root ?? window;
      const onScroll = () => this.onScroll();
      target.addEventListener('scroll', onScroll, { passive: true });
      const onScrollEnd = () => (this.pending = null);
      target.addEventListener('scrollend', onScrollEnd);
      let observer: ResizeObserver | undefined;
      if (typeof ResizeObserver !== 'undefined') {
        observer = new ResizeObserver(() => this.update());
        observer.observe(this.host);
        observer.observe(this.headerRef().nativeElement);
        if (this.root) observer.observe(this.root);
      }
      destroyRef.onDestroy(() => {
        target.removeEventListener('scroll', onScroll);
        target.removeEventListener('scrollend', onScrollEnd);
        observer?.disconnect();
      });
      this.update();
    });

    // Header / pin / tab changes move things around: measure again after they have rendered.
    afterRenderEffect(() => {
      this.expanded();
      this.pinned();
      this.peeking();
      this.hasHeader();
      this.hasSummary();
      this.tabsMode();
      untracked(() => this.update());
    });

    // The current anchor / tab always stays in view inside a bar that scrolls sideways.
    afterRenderEffect(() => {
      this.current();
      untracked(() => this.revealCurrentNavItem());
    });
  }

  /**
   * Anchors: scroll to the section (its title lands right under the sticky bar) and, by default, focus its `h2`.
   * Tabs: select the section's tab (and focus the tab).
   */
  goTo(id: string, options: { focus?: boolean } = {}): void {
    const index = this.sections().findIndex((s) => s.id() === id);
    if (index < 0) return;
    const focus = options.focus ?? true;
    if (this.tabsMode()) {
      this.selectTab(id);
      if (focus) afterNextRender(() => this.host.querySelector<HTMLElement>(`#${this.uid}-tab-${index}`)?.focus(), { injector: this.injector });
      return;
    }
    this.pending = id;
    if (id !== this.current()) this.section.set(id);
    const el = this.sectionEl(id);
    if (el) {
      const top = this.rootScrollTop() + el.getBoundingClientRect().top - this.rootTop() - this.offsetAfterJump();
      this.scrollRootTo(Math.max(0, top), this.reducedMotion() ? 'auto' : 'smooth');
    }
    if (focus) {
      const heading = this.host.querySelector<HTMLElement>(`#${this.uid}-h-${index}`);
      this.programmaticFocus = true;
      heading?.focus({ preventScroll: true });
      this.programmaticFocus = false;
    }
  }

  protected selectTab(id: string) {
    if (id === this.current()) return;
    this.section.set(id);
    // Scrolled down past the start of the content: start the new tab under the bar, not in the middle.
    afterNextRender(
      () => {
        const line = this.rootTop() + this.stickyHeight();
        const top = this.contentRef().nativeElement.getBoundingClientRect().top;
        if (top < line) this.scrollRootBy(top - line);
      },
      { injector: this.injector },
    );
  }

  protected toggleHeader() {
    if (this.headerShown()) {
      this.expanded.set(false);
      this.peeking.set(false);
      return;
    }
    const away = this.scrolledPast();
    this.expanded.set(true);
    if (away) this.startPeek();
  }

  protected togglePin() {
    this.pinned.update((v) => !v);
    this.peeking.set(false);
  }

  /** Arrow keys: anchors move focus only (each anchor is a Tab stop); tabs also select (APG tabs, automatic activation). */
  protected onNavKeydown(event: KeyboardEvent) {
    const nav = this.navRef()?.nativeElement;
    if (!nav) return;
    const items = Array.from(nav.querySelectorAll<HTMLButtonElement>('.nxt-object-page-nav__item'));
    const index = items.indexOf(event.target as HTMLButtonElement);
    if (index < 0) return;
    const last = items.length - 1;
    let next: number | undefined;
    if (event.key === 'ArrowRight') next = index === last ? 0 : index + 1;
    else if (event.key === 'ArrowLeft') next = index === 0 ? last : index - 1;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = last;
    if (next === undefined) return;
    event.preventDefault();
    items[next].focus();
    if (this.tabsMode()) this.selectTab(this.sections()[next].id());
  }

  /** WCAG 2.4.11: a focused control must not hide under the sticky bar or the sticky footer. */
  protected onFocusIn(event: FocusEvent) {
    if (this.programmaticFocus) return;
    const target = event.target as HTMLElement | null;
    if (!target || !this.contentRef().nativeElement.contains(target)) return;
    const rect = target.getBoundingClientRect();
    // What may cover the top: the pinned / peeking group, else the sticky bar (below the content start when not stuck).
    const cover = this.stickyMode() ? this.topRef().nativeElement : this.showBar() ? this.barRef().nativeElement : null;
    const topLimit = Math.max(this.rootTop(), cover ? cover.getBoundingClientRect().bottom : 0);
    const footer = this.footerRef().nativeElement;
    const bottomLimit = footer.offsetHeight ? Math.min(footer.getBoundingClientRect().top, this.rootBottom()) : this.rootBottom();
    const gap = this.tokenPx('--nxt-space-gap-sm');
    if (rect.top < topLimit) this.scrollRootBy(rect.top - topLimit - gap);
    else if (rect.bottom > bottomLimit && rect.height < bottomLimit - topLimit) this.scrollRootBy(rect.bottom - bottomLimit + gap);
  }

  private startPeek() {
    this.peekBaseline = null;
    this.peeking.set(true);
    afterNextRender(() => (this.peekBaseline = this.rootScrollTop()), { injector: this.injector });
  }

  private onScroll() {
    if (this.peeking() && this.peekBaseline !== null && Math.abs(this.rootScrollTop() - this.peekBaseline) > PEEK_TOLERANCE) {
      this.peeking.set(false);
      this.peekBaseline = null;
    }
    this.update();
  }

  /** Measure: scrolled / header out of view / pin allowed, then the scroll-spy. */
  private update() {
    const rootTop = this.rootTop();
    const hostTop = this.host.getBoundingClientRect().top;
    const header = this.headerRef().nativeElement;
    const height = header.offsetHeight;
    if (height) this.lastHeaderHeight = height;
    const above = rootTop - hostTop;
    const scrolled = above > 0.5;
    if (scrolled !== this.scrolled()) this.scrolled.set(scrolled);
    // The host never sticks, so its top tells how far the in-flow header has scrolled, pinned or not.
    const past = height ? above >= height - 1 : scrolled;
    if (past !== this.scrolledPast()) this.scrolledPast.set(past);
    // Fiori: no pinning on phones, nor when the header would take more than 60% of the scroll area.
    const rootHeight = this.rootClientHeight();
    const allowed =
      this.host.clientWidth >= this.tokenPx('--nxt-breakpoint-md') && (!rootHeight || this.lastHeaderHeight <= rootHeight * PIN_MAX_SHARE);
    if (allowed !== this.pinAllowed()) this.pinAllowed.set(allowed);
    if (!this.tabsMode()) this.spy();
  }

  /** Current section = the last one whose top has reached the line under the sticky bar; the last one at the very bottom. */
  private spy() {
    const list = this.sections();
    if (list.length < 2) return;
    const line = this.rootTop() + this.stickyHeight() + 1;
    let active = list[0].id();
    for (const s of list) {
      const el = this.sectionEl(s.id());
      if (el && el.getBoundingClientRect().top <= line) active = s.id();
    }
    if (this.rootScrollTop() > 0 && this.atBottom()) active = list[list.length - 1].id();
    if (this.pending) {
      if (active === this.pending) this.pending = null;
      return;
    }
    if (active !== this.current()) this.section.set(active);
  }

  private revealCurrentNavItem() {
    const nav = this.navRef()?.nativeElement;
    const item = nav?.querySelector<HTMLElement>('[aria-current="true"], [aria-selected="true"]');
    const scroller = nav?.matches('[role="tablist"]') ? nav : nav?.querySelector<HTMLElement>('.nxt-object-page-nav__list');
    if (!item || !scroller || scroller.scrollWidth <= scroller.clientWidth) return;
    const box = scroller.getBoundingClientRect();
    const rect = item.getBoundingClientRect();
    const delta = rect.left < box.left ? rect.left - box.left : rect.right > box.right ? rect.right - box.right : 0;
    if (delta) scroller.scrollLeft += delta;
  }

  /** Height of what is stuck at the top of the scroll area right now. */
  private stickyHeight(): number {
    if (this.stickyMode()) return this.topRef().nativeElement.offsetHeight;
    return this.showBar() ? this.barRef().nativeElement.offsetHeight : 0;
  }

  /** Sticky height once a jump below the header has landed: the summary line shows by then, unless pinned. */
  private offsetAfterJump(): number {
    const row = this.showBar() ? this.barRowRef().nativeElement.offsetHeight : 0;
    if (this.pinActive()) return this.lastHeaderHeight + row;
    return row + (this.hasSummary() ? this.summaryRef().nativeElement.scrollHeight : 0);
  }

  private sectionEl(id: string): HTMLElement | null {
    return Array.from(this.contentRef().nativeElement.children).find((el) => el.id === id) as HTMLElement | null;
  }

  private atBottom(): boolean {
    const r = this.root;
    const scrollTop = this.rootScrollTop();
    const client = r ? r.clientHeight : window.innerHeight;
    const height = r ? r.scrollHeight : document.documentElement.scrollHeight;
    return scrollTop + client >= height - 1;
  }

  private rootTop(): number {
    return this.root ? this.root.getBoundingClientRect().top : 0;
  }

  private rootBottom(): number {
    return this.root ? this.root.getBoundingClientRect().bottom : window.innerHeight;
  }

  private rootScrollTop(): number {
    return this.root ? this.root.scrollTop : window.scrollY;
  }

  private rootClientHeight(): number {
    return this.root ? this.root.clientHeight : window.innerHeight;
  }

  private scrollRootTo(top: number, behavior: ScrollBehavior) {
    const target = this.root ?? window;
    if (typeof target.scrollTo === 'function') target.scrollTo({ top, behavior });
    else if (this.root) this.root.scrollTop = top;
  }

  private scrollRootBy(top: number) {
    if (!top) return;
    const target = this.root ?? window;
    if (typeof target.scrollBy === 'function') target.scrollBy({ top });
    else if (this.root) this.root.scrollTop += top;
  }

  /** Reduced motion follows the motion tokens: `--nxt-motion-duration-normal` is 0 in the reduced mode. */
  private reducedMotion(): boolean {
    return parseFloat(getComputedStyle(this.host).getPropertyValue('--nxt-motion-duration-normal')) === 0;
  }

  private tokenPx(name: string): number {
    return parseFloat(getComputedStyle(this.host).getPropertyValue(name)) || 0;
  }
}

/** Nearest ancestor that scrolls vertically (the shell's content area), or null when the document scrolls. */
function scrollParent(el: HTMLElement): HTMLElement | null {
  let node = el.parentElement;
  while (node && node !== document.body && node !== document.documentElement) {
    if (/(auto|scroll|overlay)/.test(getComputedStyle(node).overflowY)) return node;
    node = node.parentElement;
  }
  return null;
}
