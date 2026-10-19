import { BreakpointObserver } from '@angular/cdk/layout';
import { ConnectedPosition } from '@angular/cdk/overlay';
import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injectable,
  ViewEncapsulation,
  afterNextRender,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  model,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IsActiveMatchOptions, NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { NxtButton } from '@nxt/ui/button';
import { NxtIcon, NxtIconName } from '@nxt/ui/icon';
import { NxtMenu, NxtMenuItem, NxtMenuLabel, NxtMenuSeparator, NxtMenuTrigger } from '@nxt/ui/menu';
import { NxtTooltip } from '@nxt/ui/tooltip';
import { filter } from 'rxjs';

/** One navigation entry. `heading` = non-interactive section caption. */
export interface NxtNavItem {
  label: string;
  icon?: NxtIconName;
  /** Router path. Items with `children` should not have a link. */
  link?: string;
  /** Exact route match (use for "/" or overview pages). */
  exact?: boolean;
  /** Count or short text, e.g. pending approvals. */
  badge?: string | number;
  children?: NxtNavItem[];
  heading?: boolean;
  /** Visible but not available (feature off, no permission). Explain why with `hint`. */
  disabled?: boolean;
  /** Tooltip for a disabled item, e.g. "Cần quyền Quản trị nhân sự". */
  hint?: string;
}

/** Viewport below primitive.breakpoint.lg (1024px): navigation becomes an off-canvas drawer. */
const MOBILE_QUERY = '(max-width: 1023.98px)';
const SUBSET: IsActiveMatchOptions = { paths: 'subset', queryParams: 'ignored', fragment: 'ignored', matrixParams: 'ignored' };
const EXACT: IsActiveMatchOptions = { ...SUBSET, paths: 'exact' };

/** Shared state between the shell, its side navigation and top bar. */
@Injectable()
export class NxtShellState {
  readonly mobile = signal(false);
  readonly mobileOpen = signal(false);
  returnFocus: HTMLElement | null = null;
  open(trigger?: HTMLElement | null) {
    this.returnFocus = trigger ?? null;
    this.mobileOpen.set(true);
  }
  close() {
    this.mobileOpen.set(false);
  }
}

let nextId = 0;

/**
 * Application frame: side navigation + top bar + scrolling content.
 * Fills its container (give it `height: 100dvh` in an app). Below 1024px the navigation becomes a drawer.
 * When rendered inside another `<main>` (e.g. a docs preview) it does not add a second main landmark.
 */
@Component({
  selector: 'nxt-app-shell',
  template: `
    @if (!nested() && !drawerOpen()) {
      <a class="nxt-app-shell__skip" [href]="'#' + mainId" (click)="focusMain($event)">Bỏ qua tới nội dung</a>
    }
    <div
      class="nxt-app-shell__nav"
      [attr.data-open]="state.mobileOpen() || null"
      [attr.role]="drawerOpen() ? 'dialog' : null"
      [attr.aria-modal]="drawerOpen() ? 'true' : null"
      [attr.aria-label]="drawerOpen() ? 'Menu điều hướng' : null"
      (keydown.escape)="closeMobile()"
    >
      <ng-content select="nxt-sidenav" />
    </div>
    @if (state.mobile() && state.mobileOpen()) {
      <div class="nxt-app-shell__backdrop" aria-hidden="true" (click)="closeMobile()"></div>
    }
    <!-- The open drawer is modal: the page behind it is inert (no Tab, no screen-reader browsing). -->
    <div class="nxt-app-shell__frame" [attr.inert]="drawerOpen() ? '' : null">
      <ng-content select="nxt-topbar" />
      <div class="nxt-app-shell__main" [id]="mainId" tabindex="-1" [attr.role]="nested() ? null : 'main'">
        <ng-content />
      </div>
    </div>
  `,
  styleUrl: './app-shell.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [NxtShellState],
  host: {
    class: 'nxt-app-shell',
    '[attr.data-mobile]': 'state.mobile() || null',
    '[attr.data-scroll]': 'scroll()',
  },
})
export class NxtAppShell {
  protected readonly state = inject(NxtShellState);
  /**
   * `container` (default): the shell fills its container and the content area scrolls (business apps).
   * `page`: the document scrolls, navigation and top bar stay sticky (docs, long reading pages,
   * browser find and anchor links keep working).
   */
  readonly scroll = input<'container' | 'page'>('container');
  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  protected readonly nested = signal(false);
  /** The mobile navigation drawer is open (modal). */
  protected readonly drawerOpen = computed(() => this.state.mobile() && this.state.mobileOpen());
  protected readonly mainId = `nxt-main-${nextId++}`;

  constructor() {
    const destroyRef = inject(DestroyRef);
    inject(BreakpointObserver)
      .observe(MOBILE_QUERY)
      .pipe(takeUntilDestroyed(destroyRef))
      .subscribe((r) => {
        this.state.mobile.set(r.matches);
        if (!r.matches) this.state.close();
      });
    inject(Router, { optional: true })
      ?.events.pipe(filter((e) => e instanceof NavigationEnd), takeUntilDestroyed(destroyRef))
      .subscribe(() => this.state.close());

    afterNextRender(() => this.nested.set(!!this.host.parentElement?.closest('main, [role="main"]')));

    // Move focus into the drawer when it opens; give it back to the trigger when it closes.
    effect(() => {
      const open = this.state.mobileOpen();
      if (!this.state.mobile()) return;
      queueMicrotask(() => {
        if (open) {
          this.host.querySelector<HTMLElement>('.nxt-app-shell__nav a[href], .nxt-app-shell__nav button')?.focus();
        } else {
          this.state.returnFocus?.focus();
          this.state.returnFocus = null;
        }
      });
    });
  }

  protected closeMobile() {
    if (this.state.mobileOpen()) this.state.close();
  }

  protected focusMain(event: Event) {
    event.preventDefault();
    this.host.querySelector<HTMLElement>(`#${this.mainId}`)?.focus();
  }
}

/** Top bar of the shell. Shows a menu button for the navigation drawer below 1024px. */
@Component({
  selector: 'nxt-topbar',
  imports: [NxtButton, NxtIcon],
  template: `
    <header class="nxt-topbar__bar">
      @if (state?.mobile()) {
        <button nxtIconButton variant="ghost" type="button" aria-label="Mở menu điều hướng" [attr.aria-expanded]="state?.mobileOpen()" (click)="state?.open($any($event.currentTarget))">
          <nxt-icon name="menu-2" />
        </button>
      }
      <div class="nxt-topbar__start"><ng-content select="[nxtTopbarStart]" /></div>
      <div class="nxt-topbar__center"><ng-content select="[nxtTopbarCenter]" /></div>
      <div class="nxt-topbar__end"><ng-content select="[nxtTopbarEnd]" /></div>
    </header>
  `,
  styleUrl: './app-shell.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'nxt-topbar' },
})
export class NxtTopbar {
  protected readonly state = inject(NxtShellState, { optional: true });
}

/**
 * Side navigation with clear hierarchy: groups with icons, indented children on a guide line,
 * section headings, badges. Collapses to an icon rail with tooltips; groups then open as fly-out menus.
 */
@Component({
  selector: 'nxt-sidenav',
  imports: [NgTemplateOutlet, RouterLink, RouterLinkActive, NxtIcon, NxtTooltip, NxtMenu, NxtMenuItem, NxtMenuLabel, NxtMenuSeparator, NxtMenuTrigger],
  templateUrl: './sidenav.html',
  styleUrl: './sidenav.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'nxt-sidenav',
    '[attr.data-rail]': 'rail() || null',
  },
})
export class NxtSidenav {
  private readonly router = inject(Router);
  private readonly shell = inject(NxtShellState, { optional: true });

  /** Navigation tree. */
  readonly items = input.required<NxtNavItem[]>();
  /** Icon-rail mode (two-way, persist it in the app). Ignored while the shell shows the mobile drawer. */
  readonly collapsed = model(false);
  /** Show the collapse/expand button. */
  readonly collapsible = input(true, { transform: booleanAttribute });
  /** Accessible name of the navigation landmark. */
  readonly label = input('Điều hướng chính');

  protected readonly mobile = computed(() => !!this.shell?.mobile());
  protected readonly rail = computed(() => this.collapsed() && !this.mobile());
  protected readonly uid = `nxt-sidenav-${nextId++}-`;
  protected readonly collapseLabel = 'Thu gọn menu';
  protected readonly expandLabel = 'Mở rộng menu';
  protected readonly closeLabel = 'Đóng menu điều hướng';
  protected readonly flyoutPositions: ConnectedPosition[] = [
    { originX: 'end', originY: 'top', overlayX: 'start', overlayY: 'top', offsetX: 8 },
    { originX: 'end', originY: 'bottom', overlayX: 'start', overlayY: 'bottom', offsetX: 8 },
  ];

  private readonly url = signal(this.router.url);
  private readonly toggled = signal<Record<string, boolean>>({});

  constructor() {
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd), takeUntilDestroyed())
      .subscribe(() => this.url.set(this.router.url));
  }

  protected toggleCollapsed() {
    this.collapsed.update((c) => !c);
  }

  protected closeDrawer() {
    this.shell?.close();
  }

  /** Disabled items explain why; in the rail the name comes first, since the label is not visible. */
  protected disabledTooltip(item: NxtNavItem, depth: number): string {
    const name = this.rail() && depth === 0 ? item.label : '';
    return [name, item.hint].filter(Boolean).join(' — ');
  }

  protected isLinkActive(item: NxtNavItem): boolean {
    this.url();
    return !!item.link && this.router.isActive(item.link, item.exact ? EXACT : SUBSET);
  }

  /** A group is "active" when any descendant link matches the current route. */
  protected hasActive(item: NxtNavItem): boolean {
    return this.isLinkActive(item) || (item.children ?? []).some((c) => this.hasActive(c));
  }

  /** Groups open automatically when they contain the current page, until the user toggles them. */
  protected isOpen(id: string, item: NxtNavItem): boolean {
    return this.toggled()[id] ?? this.hasActive(item);
  }

  protected toggleGroup(id: string, item: NxtNavItem) {
    const next = !this.isOpen(id, item);
    this.toggled.update((t) => ({ ...t, [id]: next }));
  }

  /** Fly-out lists one level: nested groups are flattened under their own caption. */
  protected flatten(items: NxtNavItem[]): NxtNavItem[] {
    return items.flatMap((i) => (i.children?.length ? [{ label: i.label, heading: true }, ...this.flatten(i.children)] : [i]));
  }
}
