import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NxtAlert, NxtAlertTone, NxtLiveRegion } from './alert';

@Component({
  imports: [NxtAlert, NxtLiveRegion],
  template: `
    <div nxtLiveRegion data-testid="polite">
      @if (shown()) {
        <nxt-alert [tone]="tone()" [title]="title()" [dismissible]="dismissible()" (dismissed)="dismissals = dismissals + 1">
          Đã xoá 3 chức danh.
          <button nxtAlertActions type="button">Hoàn tác</button>
        </nxt-alert>
      }
    </div>
    <div nxtLiveRegion="assertive" data-testid="assertive"></div>
  `,
})
class Host {
  readonly shown = signal(true);
  readonly tone = signal<NxtAlertTone>('success');
  readonly title = signal<string | undefined>(undefined);
  readonly dismissible = signal(false);
  dismissals = 0;
}

describe('NxtAlert', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    return { fixture, host: fixture.componentInstance, el, alert: () => el.querySelector<HTMLElement>('nxt-alert')! };
  }

  it('reflects the tone and picks the icon for it', () => {
    const { fixture, host, alert } = setup();
    expect(alert().getAttribute('data-tone')).toBe('success');
    const before = alert().querySelector('.nxt-alert__icon')!.innerHTML;
    host.tone.set('danger');
    fixture.detectChanges();
    expect(alert().getAttribute('data-tone')).toBe('danger');
    expect(alert().querySelector('.nxt-alert__icon')!.innerHTML).not.toBe(before);
  });

  it('has no role of its own; the text and the actions are inside', () => {
    const { alert } = setup();
    expect(alert().hasAttribute('role')).toBe(false);
    expect(alert().querySelector('.nxt-alert__message')!.textContent).toContain('Đã xoá 3 chức danh.');
    expect(alert().querySelector('.nxt-alert__actions button')!.textContent).toBe('Hoàn tác');
  });

  it('shows a title without leaving a native title attribute', () => {
    const { fixture, host, alert } = setup();
    expect(alert().querySelector('.nxt-alert__title')).toBeNull();
    host.title.set('Chưa áp dụng được');
    fixture.detectChanges();
    expect(alert().querySelector('.nxt-alert__title')!.textContent).toBe('Chưa áp dụng được');
    expect(alert().hasAttribute('title')).toBe(false);
  });

  it('dismissible: a named close button emits dismissed', () => {
    const { fixture, host, alert } = setup();
    expect(alert().querySelector('button[aria-label="Đóng thông báo"]')).toBeNull();
    host.dismissible.set(true);
    fixture.detectChanges();
    alert().querySelector<HTMLButtonElement>('button[aria-label="Đóng thông báo"]')!.click();
    expect(host.dismissals).toBe(1);
  });

  it('nxtLiveRegion: status by default, alert when assertive; stays in the DOM when empty', () => {
    const { fixture, host, el } = setup();
    const polite = el.querySelector('[data-testid="polite"]')!;
    expect(polite.getAttribute('role')).toBe('status');
    expect(polite.classList).toContain('nxt-live-region');
    expect(el.querySelector('[data-testid="assertive"]')!.getAttribute('role')).toBe('alert');
    host.shown.set(false);
    fixture.detectChanges();
    expect(el.querySelector('[data-testid="polite"]')).toBe(polite);
    expect(polite.querySelector('nxt-alert')).toBeNull();
  });
});
