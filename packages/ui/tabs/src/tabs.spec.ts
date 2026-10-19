import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NxtTab, NxtTabs } from './tabs';

@Component({
  imports: [NxtTabs, NxtTab],
  template: `
    <nxt-tabs label="Hồ sơ nhân viên" [(value)]="value" [panels]="panels()">
      <nxt-tab value="Thông tin chung" label="Thông tin chung">Họ tên, ngày sinh</nxt-tab>
      <nxt-tab value="Hợp đồng" label="Hợp đồng" [count]="2">Hợp đồng lao động</nxt-tab>
      <nxt-tab value="Bảo hiểm" label="Bảo hiểm" disabled>Sổ BHXH</nxt-tab>
      <nxt-tab value="Tài liệu" label="Tài liệu">CCCD, bằng cấp</nxt-tab>
    </nxt-tabs>
  `,
})
class Host {
  readonly value = signal<string | undefined>(undefined);
  readonly panels = signal(true);
}

describe('NxtTabs', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const tabs = () => [...el.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
    const key = async (k: string) => {
      el.querySelector('[role="tablist"]')!.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
      await fixture.whenStable();
    };
    return { fixture, host: fixture.componentInstance, el, tabs, key };
  }

  it('selects the first tab by default and has a single Tab stop', () => {
    const { el, tabs } = setup();
    expect(el.querySelector('[role="tablist"]')!.getAttribute('aria-label')).toBe('Hồ sơ nhân viên');
    expect(tabs().map((t) => t.getAttribute('aria-selected'))).toEqual(['true', 'false', 'false', 'false']);
    expect(tabs().map((t) => t.tabIndex)).toEqual([0, -1, -1, -1]);
    expect(el.querySelector('[role="tabpanel"]')!.textContent).toContain('Họ tên');
  });

  it('uses valid, space-free ids even when values are free text', () => {
    const { el, tabs } = setup();
    for (const t of tabs()) expect(t.id).toMatch(/^[\w-]+$/);
    const panel = el.querySelector('[role="tabpanel"]')!;
    expect(panel.getAttribute('aria-labelledby')).toBe(tabs()[0].id);
    expect(tabs()[0].getAttribute('aria-controls')).toBe(panel.id);
  });

  it('moves with arrow keys (skipping disabled tabs), wraps, and focuses the selected tab', async () => {
    const { host, tabs, key, el } = setup();
    await key('ArrowRight');
    expect(host.value()).toBe('Hợp đồng');
    await key('ArrowRight');
    expect(host.value()).toBe('Tài liệu');
    expect(document.activeElement).toBe(tabs()[3]);
    await key('ArrowRight');
    expect(host.value()).toBe('Thông tin chung');
    await key('ArrowLeft');
    expect(host.value()).toBe('Tài liệu');
    expect(el.querySelector('[role="tabpanel"]')!.getAttribute('aria-labelledby')).toBe(tabs()[3].id);
  });

  it('jumps with Home and End', async () => {
    const { host, key } = setup();
    await key('End');
    expect(host.value()).toBe('Tài liệu');
    await key('Home');
    expect(host.value()).toBe('Thông tin chung');
  });

  it('ignores clicks on a disabled tab and shows counts', async () => {
    const { fixture, host, tabs } = setup();
    expect(tabs()[2].disabled).toBe(true);
    tabs()[2].click();
    await fixture.whenStable();
    expect(host.value()).toBeUndefined();
    expect(tabs()[1].textContent).toContain('2');
  });

  it('keeps one Tab stop even when the value matches no tab or a disabled one', async () => {
    const { fixture, host, tabs } = setup();
    host.value.set('Không tồn tại');
    await fixture.whenStable();
    expect(tabs().filter((t) => t.tabIndex === 0)).toEqual([tabs()[0]]);
    host.value.set('Bảo hiểm');
    await fixture.whenStable();
    expect(tabs().filter((t) => t.tabIndex === 0)).toEqual([tabs()[0]]);
  });

  it('renders no tabpanel (and no aria-controls) when panels is off', async () => {
    const { fixture, host, el, tabs } = setup();
    host.panels.set(false);
    await fixture.whenStable();
    expect(el.querySelector('[role="tabpanel"]')).toBeNull();
    expect(tabs()[0].hasAttribute('aria-controls')).toBe(false);
  });
});
