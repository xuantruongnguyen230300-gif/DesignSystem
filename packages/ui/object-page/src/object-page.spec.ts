import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NxtObjectPage, NxtObjectPageNavigation, NxtObjectPageSection, NxtObjectPageSubsection } from './object-page';

@Component({
  imports: [NxtObjectPage, NxtObjectPageSection, NxtObjectPageSubsection],
  template: `
    <div class="scroller" style="overflow-y: auto; height: 400px">
      <nxt-object-page
        navLabel="Các phần của hồ sơ"
        [navigation]="navigation()"
        [(section)]="section"
        [(expanded)]="expanded"
        [(pinned)]="pinned"
        pinnable
      >
        @if (withHeader()) {
          <div nxtObjectPageHeader><p>Trưởng nhóm Kế toán tổng hợp · Phòng Tài chính – Kế toán</p></div>
        }
        @if (withHeader()) {
          <div nxtObjectPageSummary>NV-00123 · Trưởng nhóm Kế toán tổng hợp</div>
        }
        <nxt-object-page-section id="general" title="Thông tin chung">
          <button nxtSectionActions type="button" class="edit">Sửa</button>
          <nxt-object-page-subsection title="Liên hệ"><input class="phone" aria-label="Điện thoại" /></nxt-object-page-subsection>
        </nxt-object-page-section>
        @if (!single()) {
          <nxt-object-page-section id="job" title="Công việc" [busy]="busy()"><p>Chức danh</p></nxt-object-page-section>
          <nxt-object-page-section id="contracts" title="Hợp đồng" [count]="3"><p>Hợp đồng lao động</p></nxt-object-page-section>
          <nxt-object-page-section id="history" title="Lịch sử"><p>Vào làm</p></nxt-object-page-section>
        }
        @if (editing()) {
          <div nxtObjectPageFooter><button type="button">Lưu</button></div>
        }
      </nxt-object-page>
    </div>
  `,
})
class Host {
  readonly navigation = signal<NxtObjectPageNavigation>('anchors');
  readonly section = signal<string | undefined>(undefined);
  readonly expanded = signal(true);
  readonly pinned = signal(false);
  readonly withHeader = signal(true);
  readonly single = signal(false);
  readonly busy = signal(false);
  readonly editing = signal(false);
}

/** Own property, so it wins over the prototype mock below (vi.spyOn would reuse that mock for every element). */
function place(el: HTMLElement, top: number, height = 100) {
  el.getBoundingClientRect = () => rect(top, height);
}

function rect(top: number, height = 100): DOMRect {
  return { top, bottom: top + height, left: 0, right: 800, width: 800, height, x: 0, y: top, toJSON: () => ({}) } as DOMRect;
}

describe('NxtObjectPage', () => {
  // jsdom has no layout: give sections increasing tops (a page scrolled to the top); tests override per element.
  beforeEach(() => {
    const original = HTMLElement.prototype.getBoundingClientRect;
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
      if (this.matches('section.nxt-object-page-section')) {
        const index = Array.from(this.parentElement!.children).indexOf(this);
        return rect(300 + index * 500, 400);
      }
      return original.call(this);
    });
  });
  afterEach(() => vi.restoreAllMocks());

  async function setup(configure?: (host: Host) => void) {
    const fixture = TestBed.createComponent(Host);
    configure?.(fixture.componentInstance);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const scroller = el.querySelector<HTMLElement>('.scroller')!;
    const page = el.querySelector<HTMLElement>('nxt-object-page')!;
    const anchors = () => [...el.querySelectorAll<HTMLButtonElement>('.nxt-object-page-nav__item')];
    const sections = () => [...el.querySelectorAll<HTMLElement>('section.nxt-object-page-section')];
    const stable = async () => {
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
    };
    return { fixture, host: fixture.componentInstance, el, scroller, page, anchors, sections, stable };
  }

  describe('anchor bar', () => {
    it('is a named navigation landmark with one button per section; the first is current', async () => {
      const { el, anchors } = await setup();
      const nav = el.querySelector('nav.nxt-object-page-nav')!;
      expect(nav.getAttribute('aria-label')).toBe('Các phần của hồ sơ');
      expect(el.querySelector('[role="tablist"]')).toBeNull();
      expect(anchors().map((a) => a.textContent!.trim())).toEqual(['Thông tin chung', 'Công việc', 'Hợp đồng', 'Lịch sử']);
      expect(anchors().map((a) => a.getAttribute('aria-current'))).toEqual(['true', null, null, null]);
      // Every anchor is its own Tab stop (native buttons, no roving tabindex).
      expect(anchors().every((a) => a.tabIndex === 0)).toBe(true);
    });

    it('renders each section as a named region with an h2 that can take focus', async () => {
      const { sections } = await setup();
      const list = sections();
      expect(list.map((s) => s.id)).toEqual(['general', 'job', 'contracts', 'history']);
      for (const s of list) {
        const h2 = s.querySelector('h2')!;
        expect(s.getAttribute('aria-labelledby')).toBe(h2.id);
        expect(h2.getAttribute('tabindex')).toBe('-1');
        expect(h2.classList.contains('nxt-visually-hidden')).toBe(false);
      }
      expect(list[0].querySelector('.nxt-object-page-section__actions .edit')).not.toBeNull();
      expect(list[0].querySelector('h3')!.textContent).toBe('Liên hệ');
    });

    it('Enter / Space (button activation) scrolls to the section under the sticky bar and focuses its title', async () => {
      const { scroller, sections, anchors, host, stable } = await setup();
      const scrollTo = vi.fn();
      scroller.scrollTo = scrollTo as typeof scroller.scrollTo;
      place(scroller, 100, 400);
      place(sections()[2], 900);
      anchors()[2].click();
      await stable();
      expect(scrollTo).toHaveBeenCalledTimes(1);
      const arg = scrollTo.mock.calls[0][0] as ScrollToOptions;
      // scrollTop 0 + (900 − 100) − sticky offset (0 in jsdom: no layout).
      expect(arg.top).toBe(800);
      expect(document.activeElement).toBe(sections()[2].querySelector('h2'));
      expect(host.section()).toBe('contracts');
      expect(anchors()[2].getAttribute('aria-current')).toBe('true');
    });

    it('goTo() with focus off scrolls without moving focus', async () => {
      const { fixture, scroller, anchors, stable } = await setup();
      scroller.scrollTo = vi.fn() as typeof scroller.scrollTo;
      anchors()[0].focus();
      const page = fixture.debugElement.children[0].children[0].componentInstance as NxtObjectPage;
      page.goTo('history', { focus: false });
      await stable();
      expect(scroller.scrollTo).toHaveBeenCalled();
      expect(document.activeElement).toBe(anchors()[0]);
      expect(anchors()[3].getAttribute('aria-current')).toBe('true');
    });

    it('→ / ← move focus between anchors and wrap, without scrolling', async () => {
      const { scroller, anchors, host } = await setup();
      scroller.scrollTo = vi.fn() as typeof scroller.scrollTo;
      const key = (k: string) => document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
      anchors()[0].focus();
      key('ArrowRight');
      expect(document.activeElement).toBe(anchors()[1]);
      key('ArrowLeft');
      key('ArrowLeft');
      expect(document.activeElement).toBe(anchors()[3]);
      key('ArrowRight');
      expect(document.activeElement).toBe(anchors()[0]);
      expect(scroller.scrollTo).not.toHaveBeenCalled();
      expect(host.section()).toBeUndefined();
    });

    it('Home / End focus the first / last anchor', async () => {
      const { anchors } = await setup();
      anchors()[1].focus();
      document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true, cancelable: true }));
      expect(document.activeElement).toBe(anchors()[3]);
      document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true, cancelable: true }));
      expect(document.activeElement).toBe(anchors()[0]);
    });

    it('scroll-spy: the current anchor follows the section that reached the top, and the last one at the bottom', async () => {
      const { scroller, sections, anchors, stable } = await setup();
      place(scroller, 0, 400);
      const tops = [-600, -10, 300, 700];
      sections().forEach((s, i) => place(s, tops[i]));
      scroller.dispatchEvent(new Event('scroll'));
      await stable();
      expect(anchors().map((a) => a.getAttribute('aria-current'))).toEqual([null, 'true', null, null]);

      Object.defineProperty(scroller, 'scrollTop', { configurable: true, value: 1200 });
      Object.defineProperty(scroller, 'clientHeight', { configurable: true, value: 400 });
      Object.defineProperty(scroller, 'scrollHeight', { configurable: true, value: 1600 });
      scroller.dispatchEvent(new Event('scroll'));
      await stable();
      expect(anchors()[3].getAttribute('aria-current')).toBe('true');
    });

    it('hides the anchor bar when there is only one section', async () => {
      const { el, sections } = await setup((h) => h.single.set(true));
      expect(el.querySelector('.nxt-object-page-nav')).toBeNull();
      expect(sections().length).toBe(1);
    });
  });

  describe('tabs', () => {
    it('renders an APG tablist; only the selected section shows, its h2 hidden visually', async () => {
      const { el, anchors, sections } = await setup((h) => h.navigation.set('tabs'));
      const list = el.querySelector('[role="tablist"]')!;
      expect(list.getAttribute('aria-label')).toBe('Các phần của hồ sơ');
      expect(anchors().map((t) => t.getAttribute('role'))).toEqual(['tab', 'tab', 'tab', 'tab']);
      expect(anchors().map((t) => t.getAttribute('aria-selected'))).toEqual(['true', 'false', 'false', 'false']);
      expect(anchors().map((t) => t.tabIndex)).toEqual([0, -1, -1, -1]);
      expect(anchors()[2].textContent!.replace(/\s+/g, ' ').trim()).toBe('Hợp đồng (3)');
      // Lazy: only visited sections are rendered.
      expect(sections().map((s) => s.id)).toEqual(['general']);
      const panel = sections()[0];
      expect(panel.getAttribute('role')).toBe('tabpanel');
      expect(panel.getAttribute('aria-labelledby')).toBe(anchors()[0].id);
      expect(anchors()[0].getAttribute('aria-controls')).toBe('general');
      expect(anchors()[1].getAttribute('aria-controls')).toBeNull();
      expect(panel.querySelector('h2')!.classList.contains('nxt-visually-hidden')).toBe(true);
    });

    it('→ selects and focuses the next tab (wrapping); the visited panel stays alive but hidden', async () => {
      const { anchors, sections, host, stable } = await setup((h) => h.navigation.set('tabs'));
      const input = sections()[0].querySelector<HTMLInputElement>('.phone')!;
      input.value = '0912 345 678';
      anchors()[0].focus();
      anchors()[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }));
      await stable();
      expect(host.section()).toBe('job');
      expect(document.activeElement).toBe(anchors()[1]);
      expect(anchors()[1].getAttribute('aria-selected')).toBe('true');
      const general = sections().find((s) => s.id === 'general')!;
      expect(general.hidden).toBe(true);
      expect(general.querySelector<HTMLInputElement>('.phone')!.value).toBe('0912 345 678');
      anchors()[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true, cancelable: true }));
      await stable();
      expect(host.section()).toBe('history');
      anchors()[3].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }));
      await stable();
      expect(host.section()).toBe('general');
    });
  });

  describe('content header', () => {
    it('collapse button: aria-expanded / aria-controls; collapsing hides the header and shows the summary line', async () => {
      const { el, page, host, stable } = await setup();
      const toggle = el.querySelector<HTMLButtonElement>('[data-header-toggle]')!;
      const header = el.querySelector<HTMLElement>('.nxt-object-page__header')!;
      const summary = el.querySelector<HTMLElement>('.nxt-object-page__summary')!;
      expect(toggle.getAttribute('aria-expanded')).toBe('true');
      expect(toggle.getAttribute('aria-controls')).toBe(header.id);
      expect(toggle.getAttribute('aria-label')).toBe('Thu gọn phần tóm tắt');
      expect(page.getAttribute('data-header')).toBe('expanded');
      expect(summary.hasAttribute('data-visible')).toBe(false);

      toggle.click();
      await stable();
      expect(host.expanded()).toBe(false);
      expect(header.hidden).toBe(true);
      expect(toggle.getAttribute('aria-expanded')).toBe('false');
      expect(toggle.getAttribute('aria-label')).toBe('Mở rộng phần tóm tắt');
      expect(page.getAttribute('data-header')).toBe('collapsed');
      expect(summary.hasAttribute('data-visible')).toBe(true);

      toggle.click();
      await stable();
      expect(host.expanded()).toBe(true);
      expect(header.hidden).toBe(false);
    });

    it('pin button toggles aria-pressed and pins header + bar together', async () => {
      const { el, page, host, stable } = await setup();
      const pin = el.querySelector<HTMLButtonElement>('[data-header-pin]')!;
      expect(pin.getAttribute('aria-pressed')).toBe('false');
      expect(pin.getAttribute('aria-label')).toBe('Ghim phần tóm tắt');
      pin.click();
      await stable();
      expect(host.pinned()).toBe(true);
      expect(pin.getAttribute('aria-pressed')).toBe('true');
      expect(page.getAttribute('data-header')).toBe('pinned');
      expect(el.querySelector('.nxt-object-page__top')!.getAttribute('data-sticky')).toBe('pin');
    });

    it('has no header buttons and no header state without a header slot', async () => {
      const { el, page } = await setup((h) => h.withHeader.set(false));
      expect(el.querySelector('[data-header-toggle]')).toBeNull();
      expect(el.querySelector('[data-header-pin]')).toBeNull();
      expect(page.getAttribute('data-header')).toBeNull();
    });
  });

  it('marks a loading section aria-busy', async () => {
    const { sections, host, stable } = await setup();
    expect(sections()[1].getAttribute('aria-busy')).toBeNull();
    host.busy.set(true);
    await stable();
    expect(sections()[1].getAttribute('aria-busy')).toBe('true');
  });

  it('projects the footer slot only when the page provides it', async () => {
    const { el, host, stable } = await setup();
    const footer = el.querySelector<HTMLElement>('.nxt-object-page__footer')!;
    expect(footer.childElementCount).toBe(0);
    host.editing.set(true);
    await stable();
    expect(footer.querySelector('[nxtObjectPageFooter] button')!.textContent).toBe('Lưu');
  });
});
