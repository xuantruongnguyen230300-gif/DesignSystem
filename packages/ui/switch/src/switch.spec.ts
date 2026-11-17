import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NxtSwitch } from './switch';

@Component({
  imports: [NxtSwitch],
  template: `
    <nxt-switch
      label="Nhận thông báo qua email"
      hint="Áp dụng ngay cho mọi đơn đang chờ bạn duyệt."
      [(checked)]="email"
      [readonly]="readonly()"
      [disabled]="disabled()"
    />
    <nxt-switch label="Chế độ duyệt nhanh" labelPosition="top" showState [onText]="on()" offText="Off" />
  `,
})
class Host {
  readonly email = signal(false);
  readonly readonly = signal(false);
  readonly disabled = signal(false);
  readonly on = signal('Bật');
}

describe('NxtSwitch', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const hosts = [...el.querySelectorAll<HTMLElement>('nxt-switch')];
    const button = (i: number) => hosts[i].querySelector<HTMLButtonElement>('button')!;
    return { fixture, host: fixture.componentInstance, hosts, button };
  }

  it('is a button with role switch and aria-checked, named by its visible label', () => {
    const { hosts, button } = setup();
    const b = button(0);
    expect(b.type).toBe('button');
    expect(b.getAttribute('role')).toBe('switch');
    expect(b.getAttribute('aria-checked')).toBe('false');
    const label = hosts[0].querySelector('label')!;
    expect(label.htmlFor).toBe(b.id);
    expect(label.textContent).toBe('Nhận thông báo qua email');
    // Nothing readable inside the track.
    expect(b.textContent!.trim()).toBe('');
    expect(b.querySelector('.nxt-switch__track')!.getAttribute('aria-hidden')).toBe('true');
  });

  it('toggles on click (mouse, touch, and Space / Enter, which a native button turns into a click)', async () => {
    const { fixture, host, hosts, button } = setup();
    button(0).click();
    await fixture.whenStable();
    expect(host.email()).toBe(true);
    expect(button(0).getAttribute('aria-checked')).toBe('true');
    expect(hosts[0].hasAttribute('data-checked')).toBe(true);
    button(0).click();
    await fixture.whenStable();
    expect(host.email()).toBe(false);
    expect(button(0).getAttribute('aria-checked')).toBe('false');
  });

  it('toggles when the label is clicked', async () => {
    const { fixture, host, hosts } = setup();
    hosts[0].querySelector('label')!.click();
    await fixture.whenStable();
    expect(host.email()).toBe(true);
  });

  it('describes the switch with its hint', () => {
    const { hosts, button } = setup();
    const hint = hosts[0].querySelector('.nxt-switch__hint')!;
    expect(button(0).getAttribute('aria-describedby')).toBe(hint.id);
    expect(button(1).hasAttribute('aria-describedby')).toBe(false);
  });

  it('readonly: aria-readonly, still focusable, clicks change nothing', async () => {
    const { fixture, host, hosts, button } = setup();
    host.readonly.set(true);
    await fixture.whenStable();
    const b = button(0);
    expect(b.getAttribute('aria-readonly')).toBe('true');
    expect(hosts[0].hasAttribute('data-readonly')).toBe(true);
    expect(b.disabled).toBe(false);
    b.focus();
    expect(document.activeElement).toBe(b);
    b.click();
    hosts[0].querySelector('label')!.click();
    await fixture.whenStable();
    expect(host.email()).toBe(false);
    expect(b.getAttribute('aria-checked')).toBe('false');
  });

  it('disabled: native disabled, value still shown', async () => {
    const { fixture, host, hosts, button } = setup();
    host.email.set(true);
    host.disabled.set(true);
    await fixture.whenStable();
    expect(button(0).disabled).toBe(true);
    expect(button(0).getAttribute('aria-checked')).toBe('true');
    expect(hosts[0].hasAttribute('data-disabled')).toBe(true);
  });

  it('state word after the switch is hidden from screen readers, follows the value and can be translated', async () => {
    const { fixture, host, hosts, button } = setup();
    const state = () => hosts[1].querySelector<HTMLElement>('.nxt-switch__state')!;
    expect(hosts[0].querySelector('.nxt-switch__state')).toBeNull();
    expect(state().getAttribute('aria-hidden')).toBe('true');
    expect(state().textContent).toBe('Off');
    button(1).click();
    await fixture.whenStable();
    expect(state().textContent).toBe('Bật');
    host.on.set('On');
    await fixture.whenStable();
    expect(state().textContent).toBe('On');
    expect(hosts[1].getAttribute('data-label-position')).toBe('top');
  });
});

@Component({
  imports: [NxtSwitch, ReactiveFormsModule],
  template: `<nxt-switch label="Tự chuyển sang đơn kế tiếp sau khi duyệt" [formControl]="next" />`,
})
class Forms {
  readonly next = new FormControl(true, { nonNullable: true });
}

describe('NxtSwitch with Angular forms', () => {
  it('writes, reads, disables and marks touched through the form control', async () => {
    const fixture = TestBed.createComponent(Forms);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    const button = (fixture.nativeElement as HTMLElement).querySelector('button')!;
    expect(button.getAttribute('aria-checked')).toBe('true');
    button.click();
    expect(host.next.value).toBe(false);
    button.dispatchEvent(new FocusEvent('blur'));
    expect(host.next.touched).toBe(true);
    host.next.setValue(true);
    await fixture.whenStable();
    expect(button.getAttribute('aria-checked')).toBe('true');
    host.next.disable();
    await fixture.whenStable();
    expect(button.disabled).toBe(true);
  });
});
