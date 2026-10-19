import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { NxtNavItem, NxtSidenav } from './app-shell';

@Component({ template: '' })
class Blank {}

@Component({
  imports: [NxtSidenav],
  template: `<nxt-sidenav label="Điều hướng chính" [items]="items" [(collapsed)]="collapsed" />`,
})
class Host {
  readonly collapsed = signal(false);
  readonly items: NxtNavItem[] = [
    { label: 'Tổng quan', icon: 'layout-dashboard', link: '/tong-quan', exact: true },
    { label: 'Phê duyệt', icon: 'clipboard-check', link: '/phe-duyet', badge: 12 },
    {
      label: 'Nhân sự',
      icon: 'users',
      children: [
        { label: 'Hồ sơ', heading: true },
        { label: 'Danh sách nhân viên', link: '/nhan-su/danh-sach' },
        { label: 'Hợp đồng', link: '/nhan-su/hop-dong' },
      ],
    },
    { label: 'Thiết lập', heading: true },
    { label: 'Danh mục', icon: 'database', badge: 2, children: [{ label: 'Chức danh', link: '/danh-muc/chuc-danh' }] },
    { label: 'Tiền lương', icon: 'wallet', disabled: true, hint: 'Bạn chưa có quyền xem bảng lương' },
  ];
}

describe('NxtSidenav', () => {
  async function setup(url = '/tong-quan') {
    TestBed.configureTestingModule({ providers: [provideRouter([{ path: '**', component: Blank }])] });
    await TestBed.inject(Router).navigateByUrl(url);
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    const button = (name: string) =>
      [...el.querySelectorAll<HTMLButtonElement>('button')].find((b) => (b.getAttribute('aria-label') ?? b.textContent!.trim()).startsWith(name))!;
    return { fixture, host: fixture.componentInstance, el, button };
  }

  it('is a named navigation landmark with a collapse button', async () => {
    const { el, button } = await setup();
    expect(el.querySelector('nav')!.getAttribute('aria-label')).toBe('Điều hướng chính');
    const toggle = button('Thu gọn menu');
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
  });

  it('collapses to an icon rail and back (two-way collapsed)', async () => {
    const { fixture, host, el, button } = await setup();
    button('Thu gọn menu').click();
    await fixture.whenStable();
    expect(host.collapsed()).toBe(true);
    expect(el.querySelector('nxt-sidenav')!.hasAttribute('data-rail')).toBe(true);
    const expand = button('Mở rộng menu');
    expect(expand.getAttribute('aria-expanded')).toBe('false');
    // Labels stay in the DOM so links keep their accessible names in the rail.
    expect(el.querySelector('a[href="/tong-quan"]')!.textContent).toContain('Tổng quan');
    expand.click();
    await fixture.whenStable();
    expect(host.collapsed()).toBe(false);
  });

  it('groups are disclosure buttons controlling their sub-list', async () => {
    const { fixture, el, button } = await setup();
    const group = button('Danh mục');
    expect(group.getAttribute('aria-expanded')).toBe('false');
    const list = el.querySelector<HTMLElement>(`#${group.getAttribute('aria-controls')}`)!;
    expect(list.hidden).toBe(true);
    group.click();
    await fixture.whenStable();
    expect(group.getAttribute('aria-expanded')).toBe('true');
    expect(list.hidden).toBe(false);
  });

  it('opens the group that contains the current page and marks the link as current', async () => {
    const { el, button } = await setup('/nhan-su/hop-dong');
    expect(button('Nhân sự').getAttribute('aria-expanded')).toBe('true');
    expect(el.querySelector('a[href="/nhan-su/hop-dong"]')!.getAttribute('aria-current')).toBe('page');
    expect(el.querySelector('a[href="/tong-quan"]')!.hasAttribute('aria-current')).toBe(false);
    expect(el.querySelector('.nxt-sidenav__heading')!.textContent).toContain('Hồ sơ');
  });

  it('disabled items stay focusable and announce that they are unavailable', async () => {
    const { el } = await setup();
    const item = [...el.querySelectorAll<HTMLElement>('[aria-disabled="true"]')].find((e) => e.textContent!.includes('Tiền lương'))!;
    expect(item.getAttribute('role')).toBe('link');
    expect(item.tabIndex).toBe(0);
    expect(item.hasAttribute('href')).toBe(false);
  });

  it('shows badges, and in the rail groups become menu buttons', async () => {
    const { fixture, host, el, button } = await setup();
    expect(el.querySelector('a[href="/phe-duyet"] .nxt-sidenav__badge')!.textContent).toContain('12');
    host.collapsed.set(true);
    await fixture.whenStable();
    expect(button('Nhân sự').getAttribute('aria-haspopup')).toBe('menu');
    expect(el.querySelector('.nxt-sidenav__heading')).toBeNull();
    // A list may only contain list items: the rail divider is a hidden li, not role="separator".
    const divider = el.querySelector('.nxt-sidenav__divider')!;
    expect(divider.tagName).toBe('LI');
    expect(divider.getAttribute('aria-hidden')).toBe('true');
    expect(divider.hasAttribute('role')).toBe(false);
    expect(button('Danh mục').querySelector('.nxt-sidenav__badge')!.textContent).toContain('2');
  });
});
