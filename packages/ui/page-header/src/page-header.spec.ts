import { NgTemplateOutlet } from '@angular/common';
import { Component, ElementRef, afterNextRender, inject, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NxtAppShell, NxtTopbar, nxtShellStateOf } from '@nxt/ui/app-shell';
import { NxtBreadcrumbItem, NxtPageHeader } from './page-header';

@Component({ template: '' })
class Blank {}

@Component({
  imports: [NxtPageHeader],
  template: `
    <nxt-page-header [title]="title()" [headingLevel]="level()" [breadcrumb]="crumbs" (navigate)="navigated.push($event)" />
  `,
})
class Host {
  readonly title = signal('Nghỉ phép · Khối Vận hành');
  readonly level = signal(1);
  readonly navigated: NxtBreadcrumbItem[] = [];
  readonly crumbs: NxtBreadcrumbItem[] = [
    // A navigation group without a page of its own → plain text.
    { label: 'Thiết lập' },
    { label: 'Tổng quan', link: '/tong-quan' },
    // Same component, other view: no route.
    { label: 'Quy trình duyệt', navigable: true },
    // The current page: never a link or a button, whatever it says.
    { label: 'Nghỉ phép · Khối Vận hành', link: '/quy-trinh/1', navigable: true },
  ];
  readonly header = viewChild.required(NxtPageHeader);
}

describe('NxtPageHeader & NxtBreadcrumb', () => {
  async function setup() {
    TestBed.configureTestingModule({ providers: [provideRouter([{ path: '**', component: Blank }])] });
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    const items = () => [...el.querySelectorAll<HTMLElement>('.nxt-breadcrumb__item')];
    return { fixture, host: fixture.componentInstance, el, items };
  }

  it('renders a named breadcrumb landmark with an ordered list', async () => {
    const { el, items } = await setup();
    const nav = el.querySelector('nav')!;
    expect(nav.getAttribute('aria-label')).toBe('Đường dẫn trang');
    expect(nav.querySelector('ol')).not.toBeNull();
    expect(items()).toHaveLength(4);
  });

  it('renders plain text, a router link, a navigable button and the current page', async () => {
    const { items } = await setup();
    const [group, routed, navigable, current] = items();
    expect(group.querySelector('a, button')).toBeNull();
    expect(group.textContent).toContain('Thiết lập');
    expect(routed.querySelector('a')!.getAttribute('href')).toBe('/tong-quan');
    const button = navigable.querySelector('button')!;
    expect(button.getAttribute('type')).toBe('button');
    expect(button.textContent).toBe('Quy trình duyệt');
    expect(current.querySelector('a, button')).toBeNull();
    expect(current.querySelector('[aria-current="page"]')!.textContent).toBe('Nghỉ phép · Khối Vận hành');
    // Only the current page carries aria-current.
    expect(group.querySelector('[aria-current]')).toBeNull();
  });

  it('a navigable item emits navigate with the item, forwarded by the page header', async () => {
    const { host, items } = await setup();
    items()[2].querySelector('button')!.click();
    expect(host.navigated).toEqual([{ label: 'Quy trình duyệt', navigable: true }]);
  });

  it('a router link does not emit navigate', async () => {
    const { host, items } = await setup();
    items()[1].querySelector('a')!.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    expect(host.navigated).toEqual([]);
  });

  it('the title is a heading outside the tab order that focusTitle() focuses', async () => {
    const { host, el } = await setup();
    const h1 = el.querySelector('h1')!;
    expect(h1.getAttribute('tabindex')).toBe('-1');
    expect(h1.textContent).toBe('Nghỉ phép · Khối Vận hành');
    host.header().focusTitle();
    expect(document.activeElement).toBe(h1);
  });

  it('focusTitle() follows headingLevel', async () => {
    const { fixture, host, el } = await setup();
    host.level.set(2);
    await fixture.whenStable();
    expect(el.querySelector('h1')).toBeNull();
    const h2 = el.querySelector('h2')!;
    expect(h2.getAttribute('tabindex')).toBe('-1');
    host.header().focusTitle({ preventScroll: true });
    expect(document.activeElement).toBe(h2);
  });

  it('does not leave a native title tooltip on the host', async () => {
    const { el } = await setup();
    expect(el.querySelector('nxt-page-header')!.hasAttribute('title')).toBe(false);
  });
});

/** A layout component that wraps the shell: the page reaches the shell through content projection, not DI. */
@Component({
  selector: 'test-layout',
  imports: [NxtAppShell, NxtTopbar],
  template: `
    <nxt-app-shell>
      <nxt-topbar><button nxtTopbarEnd type="button">Tài khoản</button></nxt-topbar>
      <ng-content />
    </nxt-app-shell>
  `,
})
class Layout {}

@Component({
  imports: [Layout, NgTemplateOutlet, NxtPageHeader],
  template: `
    @if (inShell()) {
      <test-layout>
        @if (shown()) {
          <ng-container *ngTemplateOutlet="page" />
        }
      </test-layout>
    } @else {
      <ng-container *ngTemplateOutlet="page" />
    }
    <ng-template #page>
      <nxt-page-header [placement]="placement()" title="Quy trình duyệt" description="Ai duyệt từng loại đơn." [breadcrumb]="crumbs">
        <button nxtPageBack type="button" aria-label="Quay lại danh sách"></button>
        <span nxtPageMeta>Phiên bản 3</span>
        <button nxtPageActions type="button">Áp dụng</button>
        <div class="tabs">Tabs của trang</div>
      </nxt-page-header>
    </ng-template>
  `,
})
class ShellHost {
  readonly placement = signal<'content' | 'topbar'>('topbar');
  readonly inShell = signal(true);
  readonly shown = signal(true);
  readonly crumbs: NxtBreadcrumbItem[] = [{ label: 'Thiết lập' }, { label: 'Quy trình duyệt' }];
  readonly header = viewChild(NxtPageHeader);
  focusOnRender = false;
  titleInTopbarAtCall: boolean | null = null;

  constructor() {
    const el: HTMLElement = inject(ElementRef).nativeElement;
    afterNextRender(() => {
      if (!this.focusOnRender) return;
      this.titleInTopbarAtCall = !!el.querySelector('.nxt-topbar h1');
      this.header()!.focusTitle();
    });
  }
}

describe('NxtPageHeader placement="topbar"', () => {
  async function setup(configure?: (host: ShellHost) => void) {
    TestBed.configureTestingModule({ providers: [provideRouter([{ path: '**', component: Blank }])] });
    const fixture = TestBed.createComponent(ShellHost);
    configure?.(fixture.componentInstance);
    const settle = async () => {
      // First render finds the shell (afterNextRender); the next one moves the header.
      for (let i = 0; i < 3; i++) {
        fixture.detectChanges();
        await fixture.whenStable();
      }
    };
    await settle();
    const el: HTMLElement = fixture.nativeElement;
    const topbar = () => el.querySelector<HTMLElement>('.nxt-topbar')!;
    const main = () => el.querySelector<HTMLElement>('.nxt-app-shell__main')!;
    return { fixture, host: fixture.componentInstance, el, topbar, main, settle };
  }

  it('renders breadcrumb, back button, title, meta and actions in the top bar; tabs stay in the page', async () => {
    const { topbar, main } = await setup();
    const bar = topbar();
    expect(bar.querySelector('h1')!.textContent).toBe('Quy trình duyệt');
    expect(bar.querySelector('nav[aria-label="Đường dẫn trang"]')).not.toBeNull();
    expect(bar.textContent).toContain('Phiên bản 3');
    expect([...bar.querySelectorAll('button')].map((b) => b.textContent!.trim() || b.getAttribute('aria-label'))).toEqual([
      'Quay lại danh sách',
      'Áp dụng',
      'Tài khoản',
    ]);
    expect(bar.querySelector('header')!.hasAttribute('data-page-header')).toBe(true);
    expect(main().querySelector('h1')).toBeNull();
    expect(main().querySelector('.tabs')).not.toBeNull();
  });

  it('the back button comes before the title', async () => {
    const { topbar } = await setup();
    const back = topbar().querySelector('[aria-label="Quay lại danh sách"]')!;
    const title = topbar().querySelector('h1')!;
    expect(back.compareDocumentPosition(title) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('does not show the description in the top bar', async () => {
    const { el } = await setup();
    expect(el.textContent).not.toContain('Ai duyệt từng loại đơn.');
  });

  it('focusTitle() focuses the title in the top bar', async () => {
    const { host, topbar } = await setup();
    host.header()!.focusTitle();
    expect(document.activeElement).toBe(topbar().querySelector('h1'));
  });

  it('focusTitle() called before the header reaches the top bar focuses the title once it is there', async () => {
    // An editor opened from a list calls focusTitle() in afterNextRender, while the header is still on its way.
    const { host, topbar } = await setup((h) => (h.focusOnRender = true));
    expect(host.titleInTopbarAtCall).toBe(false);
    expect(document.activeElement).toBe(topbar().querySelector('h1'));
  });

  it('goes back into the page below 1024px, with its description', async () => {
    const { el, topbar, main, settle } = await setup();
    nxtShellStateOf(el.querySelector('nxt-page-header')!)!.mobile.set(true);
    await settle();
    expect(topbar().querySelector('h1')).toBeNull();
    expect(topbar().querySelector('header')!.hasAttribute('data-page-header')).toBe(false);
    expect(main().querySelector('h1')!.textContent).toBe('Quy trình duyệt');
    expect(main().textContent).toContain('Ai duyệt từng loại đơn.');
  });

  it('placement="content" stays in the page', async () => {
    const { topbar, main } = await setup((h) => h.placement.set('content'));
    expect(topbar().querySelector('h1')).toBeNull();
    expect(main().querySelector('h1')).not.toBeNull();
  });

  it('clears the top bar when the page header is destroyed', async () => {
    const { host, topbar, settle } = await setup();
    host.shown.set(false);
    await settle();
    expect(topbar().querySelector('h1')).toBeNull();
    expect(topbar().querySelector('header')!.hasAttribute('data-page-header')).toBe(false);
  });

  it('outside an app shell it renders in place', async () => {
    const { el } = await setup((h) => h.inShell.set(false));
    expect(el.querySelector('.nxt-topbar')).toBeNull();
    expect(el.querySelector('nxt-page-header h1')!.textContent).toBe('Quy trình duyệt');
  });
});
