import { InteractivityChecker } from '@angular/cdk/a11y';
import { Component, Injectable, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NxtButton } from '@nxt/ui/button';
import { NxtPopover, NxtPopoverTrigger } from './popover';

/** jsdom has no layout, so the CDK thinks every element is invisible (and not focusable). */
@Injectable()
class LayoutlessChecker extends InteractivityChecker {
  override isVisible(): boolean {
    return true;
  }
}

@Component({
  imports: [NxtButton, NxtPopover, NxtPopoverTrigger],
  template: `
    <button nxtButton id="card-trigger" [nxtPopoverTriggerFor]="card" [disabled]="disabled()">Nguyễn Thị Ngọc Diệp</button>
    <nxt-popover #card title="Nguyễn Thị Ngọc Diệp" (opened)="opened = opened + 1" (closed)="closed = closed + 1">
      <a id="profile" href="#ho-so">Xem hồ sơ</a>
      <button nxtPopoverFooter type="button" id="last" (click)="card.close()">Gửi email</button>
    </nxt-popover>

    <button nxtButton id="note-trigger" [nxtPopoverTriggerFor]="note">Ghi chú</button>
    <nxt-popover #note label="Ghi chú của quản lý"><p>Đã duyệt nghỉ phép năm 2026.</p></nxt-popover>

    <button type="button" id="elsewhere">Nút khác</button>
    <p id="text">Đoạn văn</p>
  `,
})
class Host {
  readonly disabled = signal(false);
  opened = 0;
  closed = 0;
}

const panel = () => document.querySelector<HTMLElement>('.nxt-popover');
const key = (target: Element, k: string, init: KeyboardEventInit = {}) =>
  target.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...init }));

describe('NxtPopover', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [{ provide: InteractivityChecker, useClass: LayoutlessChecker }] }));
  afterEach(() => document.querySelectorAll('.cdk-overlay-container').forEach((c) => (c.innerHTML = '')));

  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const q = (id: string) => (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>(`#${id}`)!;
    const render = () => fixture.detectChanges();
    return { fixture, host: fixture.componentInstance, q, render, trigger: q('card-trigger') };
  }

  it('trigger: aria-haspopup="dialog", aria-expanded, aria-controls only while open', () => {
    const { trigger, render } = setup();
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.hasAttribute('aria-controls')).toBe(false);
    trigger.click();
    render();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(trigger.getAttribute('aria-controls')).toBe(panel()!.id);
  });

  it('Enter/Space/click opens a non-modal dialog named by its title and focuses the first focusable element', () => {
    const { trigger, host, render } = setup();
    trigger.click();
    render();
    const p = panel()!;
    expect(p.getAttribute('role')).toBe('dialog');
    expect(p.hasAttribute('aria-modal')).toBe(false);
    expect(document.getElementById(p.getAttribute('aria-labelledby')!)!.textContent).toBe('Nguyễn Thị Ngọc Diệp');
    expect(document.activeElement!.id).toBe('profile');
    expect(host.opened).toBe(1);
    // Footer content is projected into the footer slot.
    expect(p.querySelector('.nxt-popover__footer #last')).toBeTruthy();
  });

  it('without a title it is named by label, and focuses the panel when nothing inside is focusable', () => {
    const { q, render } = setup();
    q('note-trigger').click();
    render();
    const p = panel()!;
    expect(p.getAttribute('aria-label')).toBe('Ghi chú của quản lý');
    expect(p.querySelector('h2')).toBeNull();
    expect(document.activeElement).toBe(p);
  });

  it('Tab cycles inside the popover (focus trap anchors wrap around)', () => {
    const { trigger, render } = setup();
    trigger.click();
    render();
    const anchors = document.querySelectorAll<HTMLElement>('.nxt-popover-pane .cdk-focus-trap-anchor');
    expect(anchors.length).toBe(2);
    // Tab past the last element lands on the end anchor, which sends focus to the first element.
    anchors[1].focus();
    expect(document.activeElement!.id).toBe('profile');
    // Shift+Tab before the first element lands on the start anchor, which sends focus to the last element.
    anchors[0].focus();
    expect(document.activeElement!.id).toBe('last');
  });

  it('Escape closes and returns focus to the trigger', () => {
    const { trigger, host, render } = setup();
    trigger.click();
    render();
    key(document.activeElement!, 'Escape');
    render();
    expect(panel()).toBeNull();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(trigger);
    expect(host.closed).toBe(1);
  });

  it('clicking the trigger again closes it, focus stays on the trigger', () => {
    const { trigger, render } = setup();
    trigger.click();
    render();
    trigger.click();
    render();
    expect(panel()).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('a click outside closes it; focus goes back to the trigger unless another control took it', () => {
    const { trigger, q, render } = setup();
    trigger.click();
    render();
    // Click on plain text: focus was still inside the popover → back to the trigger.
    q('text').dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
    q('text').click();
    render();
    expect(panel()).toBeNull();
    expect(document.activeElement).toBe(trigger);

    trigger.click();
    render();
    // Click on another button: the browser moved focus there; leave it.
    q('elsewhere').focus();
    q('elsewhere').dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
    q('elsewhere').click();
    render();
    expect(panel()).toBeNull();
    expect(document.activeElement!.id).toBe('elsewhere');
  });

  it('close() from inside closes and returns focus to the trigger', () => {
    const { trigger, render } = setup();
    trigger.click();
    render();
    (document.querySelector('#last') as HTMLElement).click();
    render();
    expect(panel()).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('a disabled trigger does not open', () => {
    const { trigger, host, render } = setup();
    host.disabled.set(true);
    render();
    trigger.click();
    render();
    expect(panel()).toBeNull();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('opening another popover closes the first one (a click outside it)', () => {
    const { trigger, q, render } = setup();
    trigger.click();
    render();
    q('note-trigger').click();
    render();
    expect(document.querySelectorAll('.nxt-popover').length).toBe(1);
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(panel()!.getAttribute('aria-label')).toBe('Ghi chú của quản lý');
    key(document.activeElement!, 'Escape');
    render();
    expect(panel()).toBeNull();
    expect(document.activeElement!.id).toBe('note-trigger');
  });
});
