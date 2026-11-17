import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NxtStepper } from './stepper';

@Component({
  imports: [NxtStepper],
  template: `
    <nxt-stepper
      label="Số ngày nghỉ phép"
      hint="Tối đa 30 ngày mỗi năm."
      unit="ngày"
      required
      [min]="0"
      [max]="30"
      [(value)]="days"
      [disabled]="disabled()"
      [readonly]="readonly()"
      [error]="error()"
    />
    <nxt-stepper label="Hệ số lương" [min]="1" [max]="10" [step]="0.1" [(value)]="factor" />
    <nxt-stepper label="Số lượng" [(value)]="free" />
  `,
})
class Host {
  readonly days = signal<number | null>(12);
  readonly factor = signal<number | null>(1.5);
  readonly free = signal<number | null>(null);
  readonly disabled = signal(false);
  readonly readonly = signal(false);
  readonly error = signal<string | null>(null);
}

describe('NxtStepper', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    const hosts = [...el.querySelectorAll<HTMLElement>('nxt-stepper')];
    const field = (i: number) => hosts[i].querySelector<HTMLInputElement>('input')!;
    const buttons = (i: number) => {
      const [down, up] = [...hosts[i].querySelectorAll<HTMLButtonElement>('button')];
      return { down, up };
    };
    const settle = () => fixture.whenStable();
    const press = async (i: number, key: string, init: KeyboardEventInit = {}) => {
      const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init });
      field(i).dispatchEvent(event);
      await settle();
      return event;
    };
    const type = async (i: number, text: string) => {
      field(i).value = text;
      field(i).dispatchEvent(new Event('input', { bubbles: true }));
      await settle();
    };
    const blur = async (i: number) => {
      field(i).dispatchEvent(new FocusEvent('blur'));
      await settle();
    };
    return { fixture, host: fixture.componentInstance, hosts, field, buttons, settle, press, type, blur };
  }

  describe('semantics', () => {
    it('is a text input with role spinbutton, named by its label, with value attributes', async () => {
      const { hosts, field } = await setup();
      const input = field(0);
      expect(input.type).toBe('text');
      expect(input.getAttribute('role')).toBe('spinbutton');
      expect(input.getAttribute('aria-valuenow')).toBe('12');
      expect(input.getAttribute('aria-valuemin')).toBe('0');
      expect(input.getAttribute('aria-valuemax')).toBe('30');
      // Number + no-break space + unit, so a screen reader reads "12 ngày".
      expect(input.getAttribute('aria-valuetext')).toBe('12 ngày');
      expect(input.value).toBe('12');
      const label = hosts[0].querySelector('label')!;
      expect(label.htmlFor).toBe(input.id);
      expect(label.textContent).toContain('Số ngày nghỉ phép');
      expect(input.getAttribute('aria-required')).toBe('true');
      expect(label.querySelector('.nxt-stepper__required')!.getAttribute('aria-hidden')).toBe('true');
    });

    it('leaves out value limits and text when there is nothing to say', async () => {
      const { field } = await setup();
      const input = field(2);
      expect(input.value).toBe('');
      expect(input.hasAttribute('aria-valuenow')).toBe(false);
      expect(input.hasAttribute('aria-valuetext')).toBe(false);
      expect(input.hasAttribute('aria-valuemin')).toBe(false);
      expect(input.hasAttribute('aria-valuemax')).toBe(false);
    });

    it('describes the value with its hint; the unit is hidden from screen readers', async () => {
      const { hosts, field } = await setup();
      const hint = hosts[0].querySelector('.nxt-stepper__hint')!;
      expect(field(0).getAttribute('aria-describedby')).toBe(hint.id);
      expect(hosts[0].querySelector('.nxt-stepper__unit')!.getAttribute('aria-hidden')).toBe('true');
      expect(field(1).hasAttribute('aria-describedby')).toBe(false);
    });

    it('has two buttons outside the tab order, named after the label, controlling the value', async () => {
      const { buttons, field } = await setup();
      const { down, up } = buttons(0);
      expect(down.type).toBe('button');
      expect(down.tabIndex).toBe(-1);
      expect(down.getAttribute('aria-label')).toBe('Giảm, Số ngày nghỉ phép');
      expect(up.getAttribute('aria-label')).toBe('Tăng, Số ngày nghỉ phép');
      expect(down.getAttribute('aria-controls')).toBe(field(0).id);
      expect(up.getAttribute('aria-controls')).toBe(field(0).id);
      expect(field(0).tabIndex).toBe(0);
    });

    it('shows numbers the Vietnamese way and sets the soft keyboard from the limits', async () => {
      const { field } = await setup();
      expect(field(1).value).toBe('1,5');
      expect(field(1).getAttribute('inputmode')).toBe('decimal');
      expect(field(0).getAttribute('inputmode')).toBe('numeric');
      // No lower limit: a negative number is possible and the numeric pad has no minus sign.
      expect(field(2).getAttribute('inputmode')).toBe('text');
    });
  });

  describe('keyboard', () => {
    it('ArrowUp / ArrowDown change the value by one step', async () => {
      const { host, field, press } = await setup();
      const up = await press(0, 'ArrowUp');
      expect(up.defaultPrevented).toBe(true);
      expect(host.days()).toBe(13);
      expect(field(0).getAttribute('aria-valuenow')).toBe('13');
      expect(field(0).value).toBe('13');
      await press(0, 'ArrowDown');
      await press(0, 'ArrowDown');
      expect(host.days()).toBe(11);
    });

    it('Page Up / Page Down change the value by ten steps', async () => {
      const { host, press } = await setup();
      await press(0, 'PageUp');
      expect(host.days()).toBe(22);
      await press(0, 'PageDown');
      await press(0, 'PageDown');
      expect(host.days()).toBe(2);
      // 0.1 steps: ten steps is 1.0, and the sum has no floating-point tail.
      await press(1, 'PageUp');
      expect(host.factor()).toBe(2.5);
    });

    it('Home goes to min and End to max', async () => {
      const { host, press } = await setup();
      await press(0, 'End');
      expect(host.days()).toBe(30);
      await press(0, 'Home');
      expect(host.days()).toBe(0);
    });

    it('Home and End keep their text-field job when there is no limit', async () => {
      const { host, press } = await setup();
      const home = await press(2, 'Home');
      const end = await press(2, 'End');
      expect(home.defaultPrevented).toBe(false);
      expect(end.defaultPrevented).toBe(false);
      expect(host.free()).toBeNull();
    });

    it('clamps at the limits and never leaves the range', async () => {
      const { host, press } = await setup();
      await press(0, 'End');
      await press(0, 'ArrowUp');
      await press(0, 'PageUp');
      expect(host.days()).toBe(30);
      await press(0, 'Home');
      await press(0, 'ArrowDown');
      await press(0, 'PageDown');
      expect(host.days()).toBe(0);
    });

    it('starts from 0 when empty', async () => {
      const { host, press } = await setup();
      await press(2, 'ArrowUp');
      expect(host.free()).toBe(1);
      await press(2, 'ArrowDown');
      await press(2, 'ArrowDown');
      expect(host.free()).toBe(-1);
    });

    it('ignores keys with Ctrl, Meta or Alt held (browser and OS shortcuts)', async () => {
      const { host, press } = await setup();
      const event = await press(0, 'ArrowUp', { ctrlKey: true });
      expect(event.defaultPrevented).toBe(false);
      await press(0, 'ArrowUp', { altKey: true });
      await press(0, 'ArrowUp', { metaKey: true });
      expect(host.days()).toBe(12);
    });

    it('has no floating-point drift on decimal steps', async () => {
      const { host, field, press } = await setup();
      await press(1, 'ArrowUp');
      await press(1, 'ArrowUp');
      expect(host.factor()).toBe(1.7);
      expect(field(1).value).toBe('1,7');
    });
  });

  describe('typing', () => {
    it('applies typed text on Enter, and keeps Enter for the surrounding form', async () => {
      const { host, field, type, press } = await setup();
      await type(0, '25');
      expect(host.days()).toBe(12);
      const event = await press(0, 'Enter');
      expect(event.defaultPrevented).toBe(false);
      expect(host.days()).toBe(25);
      expect(field(0).getAttribute('aria-valuenow')).toBe('25');
    });

    it('applies typed text on blur', async () => {
      const { host, type, blur } = await setup();
      await type(0, '7');
      await blur(0);
      expect(host.days()).toBe(7);
    });

    it('clamps an out-of-range number and shows the clamped one', async () => {
      const { host, field, type, blur } = await setup();
      await type(0, '99');
      await blur(0);
      expect(host.days()).toBe(30);
      expect(field(0).value).toBe('30');
      expect(field(0).hasAttribute('aria-invalid')).toBe(false);
      await type(0, '-5');
      await blur(0);
      expect(host.days()).toBe(0);
      expect(field(0).value).toBe('0');
    });

    it('reads Vietnamese number format: comma or dot as decimal mark, dot as thousands', async () => {
      const { host, field, type, blur } = await setup();
      await type(1, '2,5');
      await blur(1);
      expect(host.factor()).toBe(2.5);
      expect(field(1).value).toBe('2,5');
      await type(1, '3.5');
      await blur(1);
      expect(host.factor()).toBe(3.5);
      await type(1, ' 4,2 ');
      await blur(1);
      expect(host.factor()).toBe(4.2);
      // "1.500": a dot followed by exactly three digits is a thousands mark in vi-VN.
      await type(2, '1.250');
      await blur(2);
      expect(host.free()).toBe(1250);
      expect(field(2).value).toBe('1.250');
      await type(2, '1.234.567,5');
      await blur(2);
      expect(host.free()).toBe(1234568);
      await type(2, '−3');
      await blur(2);
      expect(host.free()).toBe(-3);
    });

    it('rounds typed digits to the precision of the step', async () => {
      const { host, type, blur } = await setup();
      await type(1, '2,345');
      await blur(1);
      expect(host.factor()).toBe(2.3);
    });

    it('a text that is not a number keeps what was typed, shows the error and changes nothing', async () => {
      const { hosts, host, field, type, press, blur } = await setup();
      await type(0, 'abc');
      await press(0, 'Enter');
      expect(host.days()).toBe(12);
      expect(field(0).value).toBe('abc');
      expect(field(0).getAttribute('aria-invalid')).toBe('true');
      expect(hosts[0].hasAttribute('data-invalid')).toBe(true);
      const message = hosts[0].querySelector('.nxt-stepper__error')!;
      expect(message.textContent).toContain('Nhập một số từ 0 đến 30.');
      expect(field(0).getAttribute('aria-describedby')).toContain(message.id);
      // Blur does not throw the text away either.
      await blur(0);
      expect(field(0).value).toBe('abc');
      // Typing again clears the error until the next apply.
      await type(0, '1');
      expect(field(0).hasAttribute('aria-invalid')).toBe(false);
      await type(0, '1,2,3');
      await blur(0);
      expect(field(0).getAttribute('aria-invalid')).toBe('true');
    });

    it('Escape drops the typed text and restores the value; it is left alone when nothing was typed', async () => {
      const { host, field, type, press } = await setup();
      await type(0, 'abc');
      await press(0, 'Enter');
      const escape = await press(0, 'Escape');
      expect(escape.defaultPrevented).toBe(true);
      expect(field(0).value).toBe('12');
      expect(field(0).hasAttribute('aria-invalid')).toBe(false);
      expect(host.days()).toBe(12);
      const idle = await press(0, 'Escape');
      expect(idle.defaultPrevented).toBe(false);
    });

    it('typed text counts before an arrow key moves it', async () => {
      const { host, type, press } = await setup();
      await type(0, '7');
      await press(0, 'ArrowUp');
      expect(host.days()).toBe(8);
    });

    it('typing nothing clears the value', async () => {
      const { host, field, type, blur } = await setup();
      await type(0, '   ');
      await blur(0);
      expect(host.days()).toBeNull();
      expect(field(0).value).toBe('');
      expect(field(0).hasAttribute('aria-valuenow')).toBe(false);
    });
  });

  describe('buttons', () => {
    it('step with the keyboard click (Enter / Space / assistive technology)', async () => {
      const { host, buttons, settle } = await setup();
      buttons(0).up.click();
      await settle();
      expect(host.days()).toBe(13);
      buttons(0).down.click();
      buttons(0).down.click();
      await settle();
      expect(host.days()).toBe(11);
    });

    it('are disabled at the limit, because the number shown already is the limit', async () => {
      const { host, buttons, settle, press } = await setup();
      expect(buttons(0).down.disabled).toBe(false);
      await press(0, 'End');
      expect(buttons(0).up.disabled).toBe(true);
      expect(buttons(0).down.disabled).toBe(false);
      await press(0, 'Home');
      expect(buttons(0).down.disabled).toBe(true);
      expect(buttons(0).up.disabled).toBe(false);
      buttons(0).down.click();
      await settle();
      expect(host.days()).toBe(0);
      // Without limits neither button is ever disabled.
      expect(buttons(2).down.disabled).toBe(false);
      expect(buttons(2).up.disabled).toBe(false);
    });

    it('a pointer press steps once, and the click after it does not step again', async () => {
      const { host, buttons, settle } = await setup();
      const { up } = buttons(0);
      up.dispatchEvent(new MouseEvent('pointerdown', { button: 0, bubbles: true }));
      up.dispatchEvent(new MouseEvent('pointerup', { button: 0, bubbles: true }));
      up.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
      await settle();
      expect(host.days()).toBe(13);
      // The next keyboard click steps normally.
      up.click();
      await settle();
      expect(host.days()).toBe(14);
    });

    it('a press that never gets its click does not swallow the next keyboard click', async () => {
      const { host, buttons, settle } = await setup();
      const { up } = buttons(0);
      up.dispatchEvent(new MouseEvent('pointerdown', { button: 0, bubbles: true }));
      up.dispatchEvent(new MouseEvent('pointerleave', { bubbles: true }));
      await settle();
      expect(host.days()).toBe(13);
      up.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      up.click();
      await settle();
      expect(host.days()).toBe(14);
    });

    it('ignore presses with a secondary mouse button', async () => {
      const { host, buttons } = await setup();
      buttons(0).up.dispatchEvent(new MouseEvent('pointerdown', { button: 2, bubbles: true }));
      expect(host.days()).toBe(12);
    });

    it('do not take focus from the field being typed in (mousedown is cancelled)', async () => {
      const { buttons } = await setup();
      const event = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
      buttons(0).up.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(true);
    });

    describe('holding', () => {
      // Fake timers go on after setup: the zoneless scheduler needs real ones to settle the first render.
      afterEach(() => vi.useRealTimers());

      it('repeats after a delay and stops on release', async () => {
        const { host, buttons } = await setup();
        vi.useFakeTimers();
        const { up } = buttons(0);
        up.dispatchEvent(new MouseEvent('pointerdown', { button: 0, bubbles: true }));
        expect(host.days()).toBe(13);
        vi.advanceTimersByTime(300);
        expect(host.days()).toBe(13);
        vi.advanceTimersByTime(100);
        vi.advanceTimersByTime(100);
        expect(host.days()).toBe(14);
        vi.advanceTimersByTime(300);
        expect(host.days()).toBe(17);
        up.dispatchEvent(new MouseEvent('pointerup', { button: 0, bubbles: true }));
        vi.advanceTimersByTime(1000);
        expect(host.days()).toBe(17);
      });

      it('stops by itself at the limit', async () => {
        const { fixture, host, buttons } = await setup();
        host.days.set(28);
        fixture.detectChanges();
        vi.useFakeTimers();
        buttons(0).up.dispatchEvent(new MouseEvent('pointerdown', { button: 0, bubbles: true }));
        vi.advanceTimersByTime(2000);
        expect(host.days()).toBe(30);
      });

      it('does not repeat when autoRepeat is off', async () => {
        const fixture = TestBed.createComponent(NoRepeat);
        fixture.detectChanges();
        await fixture.whenStable();
        vi.useFakeTimers();
        const up = fixture.nativeElement.querySelectorAll('button')[1] as HTMLButtonElement;
        up.dispatchEvent(new MouseEvent('pointerdown', { button: 0, bubbles: true }));
        vi.advanceTimersByTime(2000);
        expect(fixture.componentInstance.count()).toBe(1);
      });
    });
  });

  describe('value outside the range, set from outside', () => {
    it('is not changed on its own, shown as an error, and the buttons bring it back', async () => {
      const { hosts, host, field, buttons, settle } = await setup();
      host.days.set(40);
      await settle();
      expect(host.days()).toBe(40);
      expect(field(0).value).toBe('40');
      expect(field(0).getAttribute('aria-invalid')).toBe('true');
      expect(hosts[0].hasAttribute('data-invalid')).toBe(true);
      expect(hosts[0].querySelector('.nxt-stepper__error')!.textContent).toContain('Nhập số từ 0 đến 30.');
      expect(buttons(0).up.disabled).toBe(true);
      buttons(0).down.click();
      await settle();
      expect(host.days()).toBe(30);
      expect(field(0).hasAttribute('aria-invalid')).toBe(false);
    });

    it('says only the side that is limited', async () => {
      const fixture = TestBed.createComponent(OneSided);
      fixture.detectChanges();
      await fixture.whenStable();
      const messages = [...(fixture.nativeElement as HTMLElement).querySelectorAll('.nxt-stepper__error')].map((m) => m.textContent!.trim());
      expect(messages).toEqual(['Nhập số từ 1 trở lên.', 'Nhập số không quá 5.']);
    });
  });

  describe('error and text overrides', () => {
    it('shows an error from the app with an icon, and marks the field invalid', async () => {
      const { hosts, host, field, settle } = await setup();
      host.error.set('Số ngày nghỉ vượt quá số ngày còn lại. Hãy nhập tối đa 5 ngày.');
      await settle();
      const message = hosts[0].querySelector('.nxt-stepper__error')!;
      expect(message.textContent).toContain('Số ngày nghỉ vượt quá số ngày còn lại.');
      expect(message.querySelector('nxt-icon')).not.toBeNull();
      expect(field(0).getAttribute('aria-invalid')).toBe('true');
      expect(hosts[0].hasAttribute('data-invalid')).toBe(true);
      host.error.set(null);
      await settle();
      expect(hosts[0].querySelector('.nxt-stepper__error')).toBeNull();
      expect(field(0).hasAttribute('aria-invalid')).toBe(false);
    });

    it('lets invalidText replace the default message', async () => {
      const fixture = TestBed.createComponent(Custom);
      fixture.detectChanges();
      await fixture.whenStable();
      const el: HTMLElement = fixture.nativeElement;
      const input = el.querySelector('input')!;
      input.value = 'x';
      input.dispatchEvent(new Event('input'));
      input.dispatchEvent(new FocusEvent('blur'));
      await fixture.whenStable();
      expect(el.querySelector('.nxt-stepper__error')!.textContent).toContain('Enter a number.');
      expect(el.querySelector('button')!.getAttribute('aria-label')).toBe('Less, Days');
    });
  });

  describe('disabled and read-only', () => {
    it('disabled: field and buttons are disabled, the value stays visible, nothing changes', async () => {
      const { hosts, host, field, buttons, settle, press } = await setup();
      host.disabled.set(true);
      await settle();
      expect(field(0).disabled).toBe(true);
      expect(buttons(0).up.disabled).toBe(true);
      expect(buttons(0).down.disabled).toBe(true);
      expect(hosts[0].hasAttribute('data-disabled')).toBe(true);
      expect(field(0).value).toBe('12');
      await press(0, 'ArrowUp');
      expect(host.days()).toBe(12);
    });

    it('readonly: aria-readonly, focusable, keys and buttons change nothing', async () => {
      const { hosts, host, field, buttons, settle, press } = await setup();
      host.readonly.set(true);
      await settle();
      const input = field(0);
      expect(input.getAttribute('aria-readonly')).toBe('true');
      expect(input.readOnly).toBe(true);
      expect(input.disabled).toBe(false);
      expect(input.tabIndex).toBe(0);
      expect(hosts[0].hasAttribute('data-readonly')).toBe(true);
      expect(buttons(0).up.disabled).toBe(true);
      expect(buttons(0).down.disabled).toBe(true);
      await press(0, 'ArrowUp');
      await press(0, 'PageDown');
      await press(0, 'End');
      expect(host.days()).toBe(12);
      input.focus();
      expect(document.activeElement).toBe(input);
    });
  });
});

@Component({
  imports: [NxtStepper],
  template: `<nxt-stepper label="Số lượng" [autoRepeat]="false" [(value)]="count" />`,
})
class NoRepeat {
  readonly count = signal<number | null>(0);
}

@Component({
  imports: [NxtStepper],
  template: `
    <nxt-stepper label="Từ" min="1" [value]="0" />
    <nxt-stepper label="Đến" max="5" [value]="9" />
  `,
})
class OneSided {}

@Component({
  imports: [NxtStepper],
  template: `<nxt-stepper label="Days" invalidText="Enter a number." decreaseLabel="Less" increaseLabel="More" [value]="1" />`,
})
class Custom {}

@Component({
  imports: [NxtStepper, ReactiveFormsModule],
  template: `<nxt-stepper label="Số ngày nghỉ phép" [min]="0" [max]="30" [formControl]="days" />`,
})
class Forms {
  readonly days = new FormControl<number | null>(5);
}

describe('NxtStepper with Angular forms', () => {
  it('writes, reads, disables and marks touched through the form control', async () => {
    const fixture = TestBed.createComponent(Forms);
    fixture.detectChanges();
    await fixture.whenStable();
    const host = fixture.componentInstance;
    const input = (fixture.nativeElement as HTMLElement).querySelector('input')!;
    expect(input.value).toBe('5');
    expect(input.getAttribute('aria-valuenow')).toBe('5');

    // From the user: the control gets the number, and a typed value is clamped.
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, cancelable: true }));
    expect(host.days.value).toBe(6);
    input.value = '99';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new FocusEvent('blur'));
    expect(host.days.value).toBe(30);

    // From the form: shown, and not echoed back (an echo would add a second change event per set).
    const changes: unknown[] = [];
    host.days.valueChanges.subscribe((v) => changes.push(v));
    host.days.setValue(9);
    await fixture.whenStable();
    expect(input.value).toBe('9');
    host.days.reset();
    await fixture.whenStable();
    expect(input.value).toBe('');
    expect(changes).toEqual([9, null]);

    host.days.disable();
    await fixture.whenStable();
    expect(input.disabled).toBe(true);
    host.days.enable();
    await fixture.whenStable();
    expect(input.disabled).toBe(false);
  });

  it('is touched once focus leaves the whole control, not when it moves to a button inside', async () => {
    const fixture = TestBed.createComponent(Forms);
    fixture.detectChanges();
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    const input = el.querySelector('input')!;
    const button = el.querySelector('button')!;
    input.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: button }));
    expect(fixture.componentInstance.days.touched).toBe(false);
    input.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: null }));
    expect(fixture.componentInstance.days.touched).toBe(true);
  });
});
