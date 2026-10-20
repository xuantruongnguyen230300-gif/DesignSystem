import { Component, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
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
