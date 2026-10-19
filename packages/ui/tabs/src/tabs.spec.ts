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

@Component({
  imports: [NxtTabs, NxtTab],
  template: `
    <nxt-tabs label="Danh mục tổ chức" [panels]="false" [(value)]="value">
      @for (c of catalogs; track c) {
        <nxt-tab [value]="c" [label]="c" />
      }
    </nxt-tabs>
  `,
})
class ManyTabs {
  readonly catalogs = ['Chức danh', 'Cấp bậc', 'Phòng ban', 'Loại hợp đồng', 'Ca làm việc', 'Lý do nghỉ việc'];
  readonly value = signal<string | undefined>(undefined);
}

describe('NxtTabs overflow', () => {
  // No layout engine in the test DOM: give every tab 100px, the "Xem thêm" button 80px, the bar 350px.
  beforeEach(() => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
      const width = this.classList.contains('nxt-tabs__more') ? 80 : this.classList.contains('nxt-tabs__tab') ? 100 : 0;
      return { width, height: 40, top: 0, left: 0, right: width, bottom: 40, x: 0, y: 0, toJSON: () => ({}) } as DOMRect;
    });
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(function (this: HTMLElement) {
      return this.classList.contains('nxt-tabs__bar') ? 350 : 0;
    });
  });
  afterEach(() => vi.restoreAllMocks());

  async function setup() {
    const fixture = TestBed.createComponent(ManyTabs);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const tabs = () => [...el.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
    const more = el.querySelector<HTMLButtonElement>('.nxt-tabs__more')!;
    return { fixture, host: fixture.componentInstance, el, tabs, more };
  }

  it('moves the tabs that do not fit under "Xem thêm", outside the tablist', async () => {
    const { tabs, more } = await setup();
    expect(tabs().filter((t) => t.hasAttribute('data-overflow')).map((t) => t.textContent!.trim())).toEqual([
      'Phòng ban',
      'Loại hợp đồng',
      'Ca làm việc',
      'Lý do nghỉ việc',
    ]);
    expect(more.hasAttribute('data-hidden')).toBe(false);
    expect(more.getAttribute('aria-label')).toBe('Xem thêm 4 tab');
    expect(more.closest('[role="tablist"]')).toBeNull();
  });

  it('keeps the selected tab visible, and arrow keys only visit visible tabs', async () => {
    const { fixture, host, tabs, el } = await setup();
    host.value.set('Lý do nghỉ việc');
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
    const visible = tabs().filter((t) => !t.hasAttribute('data-overflow')).map((t) => t.textContent!.trim());
    expect(visible).toEqual(['Chức danh', 'Lý do nghỉ việc']);
    el.querySelector('[role="tablist"]')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await fixture.whenStable();
    expect(host.value()).toBe('Chức danh');
  });
});

@Component({
  imports: [NxtTabs, NxtTab],
  template: `
    <nxt-tabs label="Hồ sơ" [(value)]="value">
      <nxt-tab value="a" label="Thông tin chung"><input class="note" aria-label="Ghi chú" /></nxt-tab>
      <nxt-tab value="b" label="Hợp đồng">Hợp đồng lao động</nxt-tab>
    </nxt-tabs>
  `,
})
class TabWithInput {
  readonly value = signal<string | undefined>('a');
}

describe('NxtTabs panel content', () => {
  it('keeps the content of a tab (and what was typed) when switching away and back', async () => {
    const fixture = TestBed.createComponent(TabWithInput);
    fixture.detectChanges();
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    el.querySelector<HTMLInputElement>('input.note')!.value = 'Đang nhập dở';
    fixture.componentInstance.value.set('b');
    await fixture.whenStable();
    expect(el.querySelector('input.note')).toBeNull();
    fixture.componentInstance.value.set('a');
    await fixture.whenStable();
    expect(el.querySelector<HTMLInputElement>('input.note')!.value).toBe('Đang nhập dở');
  });
});
