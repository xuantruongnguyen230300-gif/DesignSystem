import { InteractivityChecker } from '@angular/cdk/a11y';
import { Component, Injectable, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NxtButton } from '@nxt/ui/button';
import { NxtActionBar, NxtMessage, NxtMessageLabels, NxtMessageList, nxtFocusMessageTarget } from './action-bar';

/** jsdom has no layout, so the CDK thinks every element is invisible (and not focusable). */
@Injectable()
class LayoutlessChecker extends InteractivityChecker {
  override isVisible(): boolean {
    return true;
  }
}

const ERRORS: NxtMessage[] = [
  { id: 'end', type: 'error', title: 'Nhập ngày kết thúc hợp đồng.', description: 'Hợp đồng · Ngày kết thúc', target: 'end-date' },
  { id: 'warn', type: 'warning', title: 'Lương cơ bản thấp hơn mức của bậc 3.', description: 'Lương · Lương cơ bản', target: 'salary' },
  { id: 'name', type: 'error', title: 'Nhập họ và tên.', target: 'full-name' },
  { id: 'server', type: 'info', title: 'Bản nháp được lưu lúc 10:24.' },
];

@Component({
  imports: [NxtActionBar, NxtButton],
  template: `
    <form>
      <input id="full-name" aria-label="Họ và tên" />
      <input id="end-date" aria-label="Ngày kết thúc" />
      <div id="salary"><label>Lương cơ bản <input id="salary-input" /></label></div>
    </form>
    <nxt-action-bar [messages]="messages()" [labels]="labels()" (messageSelect)="chosen.push($event.id)">
      <span nxtActionBarStatus>Có thay đổi chưa lưu</span>
      <button nxtButton variant="ghost" type="button">Huỷ</button>
      <button nxtButton variant="primary" type="button">Lưu hồ sơ</button>
    </nxt-action-bar>
  `,
})
class Host {
  readonly bar = viewChild.required(NxtActionBar);
  readonly messages = signal<NxtMessage[]>([]);
  readonly labels = signal<Partial<NxtMessageLabels>>({});
  readonly chosen: string[] = [];
}

const pane = () => document.querySelector<HTMLElement>('.nxt-popover');
const key = (target: Element, k: string) => target.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));

describe('NxtActionBar', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [{ provide: InteractivityChecker, useClass: LayoutlessChecker }] }));
  afterEach(() => document.querySelectorAll('.cdk-overlay-container').forEach((c) => (c.innerHTML = '')));

  async function setup(messages: NxtMessage[] = []) {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.messages.set(messages);
    fixture.detectChanges();
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    const bar = el.querySelector<HTMLElement>('nxt-action-bar')!;
    const button = () => bar.querySelector<HTMLButtonElement>('.nxt-action-bar__messages');
    const settle = async () => {
      fixture.detectChanges();
      await fixture.whenStable();
    };
    return { fixture, host: fixture.componentInstance, el, bar, button, settle };
  }

  it('is a named region landmark; the actions keep their order (primary last) next to the status text', async () => {
    const { bar } = await setup();
    expect(bar.getAttribute('role')).toBe('region');
    expect(bar.getAttribute('aria-label')).toBe('Thanh thao tác');
    expect(bar.querySelector('.nxt-action-bar__status')!.textContent).toContain('Có thay đổi chưa lưu');
    const actions = [...bar.querySelectorAll('.nxt-action-bar__actions button')].map((b) => b.textContent!.trim());
    expect(actions).toEqual(['Huỷ', 'Lưu hồ sơ']);
  });

  it('no messages: no message button', async () => {
    const { button } = await setup();
    expect(button()).toBeNull();
  });

  it('the message button shows icon, colour and count of the most severe type, and names every type', async () => {
    const { button } = await setup(ERRORS);
    const b = button()!;
    expect(b.dataset['type']).toBe('error');
    expect(b.querySelector('.nxt-action-bar__count')!.textContent!.trim()).toBe('2');
    expect(b.getAttribute('aria-label')).toBe('Thông báo: 2 lỗi, 1 cảnh báo, 1 thông tin');
    expect(b.getAttribute('aria-haspopup')).toBe('dialog');
    expect(b.getAttribute('aria-expanded')).toBe('false');
    expect(b.querySelector('nxt-icon svg')!.getAttribute('aria-hidden')).toBe('true');
  });

  it('warnings only: warning colour and count', async () => {
    const { button } = await setup(ERRORS.filter((m) => m.type === 'warning'));
    expect(button()!.dataset['type']).toBe('warning');
    expect(button()!.getAttribute('aria-label')).toBe('Thông báo: 1 cảnh báo');
  });

  it('Enter/Space/click opens the list (a dialog titled with the total) and focuses the first message', async () => {
    const { button, settle } = await setup(ERRORS);
    button()!.click();
    await settle();
    expect(button()!.getAttribute('aria-expanded')).toBe('true');
    const p = pane()!;
    expect(document.getElementById(p.getAttribute('aria-labelledby')!)!.textContent).toBe('Thông báo (4)');
    expect(document.activeElement!.textContent).toContain('Nhập ngày kết thúc hợp đồng.');
  });

  it('groups by type, errors first; each group is a named list; items say their type to screen readers', async () => {
    const { button, settle } = await setup(ERRORS);
    button()!.click();
    await settle();
    const lists = [...pane()!.querySelectorAll('ul')];
    const names = lists.map((ul) => document.getElementById(ul.getAttribute('aria-labelledby')!)!.textContent!.trim());
    expect(names).toEqual(['Lỗi (2)', 'Cảnh báo (1)', 'Thông tin (1)']);
    expect(lists[0].querySelector('button')!.textContent).toContain('Lỗi: Nhập ngày kết thúc hợp đồng.');
    // A message without a target is plain text, not a button.
    expect(lists[2].querySelector('button')).toBeNull();
    expect(lists[2].textContent).toContain('Bản nháp được lưu lúc 10:24.');
  });

  it('choosing a message closes the list, emits messageSelect and focuses its field', async () => {
    const { host, button, settle } = await setup(ERRORS);
    button()!.click();
    await settle();
    const item = [...pane()!.querySelectorAll('button')].find((b) => b.textContent!.includes('Lương cơ bản thấp hơn'))!;
    item.click();
    await settle();
    expect(pane()).toBeNull();
    expect(host.chosen).toEqual(['warn']);
    // The target is a wrapper: focus goes to the first control inside it.
    expect(document.activeElement!.id).toBe('salary-input');
  });

  it('Escape closes the list and returns focus to the message button', async () => {
    const { button, settle } = await setup(ERRORS);
    button()!.click();
    await settle();
    key(document.activeElement!, 'Escape');
    await settle();
    expect(pane()).toBeNull();
    expect(document.activeElement).toBe(button());
  });

  it('openMessages() after setting messages in the same turn (Lưu found errors) opens the list', async () => {
    const { host, settle } = await setup();
    host.messages.set(ERRORS);
    host.bar().openMessages();
    await settle();
    expect(pane()).not.toBeNull();
    expect(document.activeElement!.closest('.nxt-popover')).toBe(pane());
    host.bar().closeMessages();
    await settle();
    expect(pane()).toBeNull();
  });

  it('texts can be overridden (i18n)', async () => {
    const { host, button, settle } = await setup(ERRORS);
    host.labels.set({ title: 'Messages', error: 'Errors', warning: 'Warnings', info: 'Information', summary: (c) => `${c.error} errors` });
    await settle();
    expect(button()!.getAttribute('aria-label')).toBe('2 errors');
    button()!.click();
    await settle();
    expect(pane()!.textContent).toContain('Messages (4)');
    expect(pane()!.textContent).toContain('Errors (2)');
  });
});

describe('NxtMessageList', () => {
  @Component({
    imports: [NxtMessageList],
    template: `<nxt-message-list [messages]="messages" (select)="picked = $event.id" />`,
  })
  class ListHost {
    messages = ERRORS;
    picked = '';
  }

  it('emits select for an item with a target', () => {
    const fixture = TestBed.createComponent(ListHost);
    fixture.detectChanges();
    (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('button')!.click();
    expect(fixture.componentInstance.picked).toBe('end');
  });
});

describe('nxtFocusMessageTarget', () => {
  it('focuses by id, falls back to a control inside, and returns false when the target is missing', () => {
    document.body.insertAdjacentHTML('beforeend', '<input id="t-a" /><fieldset id="t-b"><input id="t-b-input" /></fieldset><p id="t-c">Mục</p>');
    expect(nxtFocusMessageTarget('t-a')).toBe(true);
    expect(document.activeElement!.id).toBe('t-a');
    expect(nxtFocusMessageTarget(document.getElementById('t-b')!)).toBe(true);
    expect(document.activeElement!.id).toBe('t-b-input');
    expect(nxtFocusMessageTarget('t-c')).toBe(true);
    expect(document.activeElement!.id).toBe('t-c');
    expect(nxtFocusMessageTarget('missing')).toBe(false);
    ['t-a', 't-b', 't-c'].forEach((id) => document.getElementById(id)!.remove());
  });
});
