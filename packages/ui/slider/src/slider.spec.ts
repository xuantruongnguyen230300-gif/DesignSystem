import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NxtSlider } from './slider';

const PRIORITIES = ['Rất thấp', 'Thấp', 'Trung bình', 'Cao', 'Rất cao'];

@Component({
  imports: [NxtSlider],
  template: `
    <nxt-slider
      label="Ngưỡng cảnh báo quá hạn"
      hint="Kéo sang phải để cảnh báo sớm hơn."
      unit="%"
      showValue
      minLabel="Muộn"
      maxLabel="Sớm"
      minIcon="moon"
      maxIcon="sun"
      [(value)]="threshold"
      [disabled]="disabled()"
      [readonly]="readonly()"
    />
    <nxt-slider label="Mức ưu tiên" showValue min="1" max="5" [formatValue]="priorityText" [(value)]="priority" />
    <nxt-slider label="Tỉ trọng" [min]="0" [max]="10" [step]="3" [(value)]="weight" />
    <nxt-slider label="Hệ số" [min]="0" [max]="1" [step]="0.1" [(value)]="factor" />
  `,
})
class Host {
  readonly threshold = signal(40);
  readonly priority = signal(3);
  readonly weight = signal(0);
  readonly factor = signal(0.5);
  readonly disabled = signal(false);
  readonly readonly = signal(false);
  readonly priorityText = (value: number) => PRIORITIES[value - 1];
}

/** Track 100 → 320 (220 wide) with a 20 thumb leaves 200 to travel: value 0 at x = 110, 100 at x = 310. */
const TRACK = { left: 100, width: 220 };
const THUMB = 20;

describe('NxtSlider', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    const hosts = [...el.querySelectorAll<HTMLElement>('nxt-slider')];
    const control = (i: number) => hosts[i].querySelector<HTMLElement>('[role=slider]')!;
    const thumb = (i: number) => hosts[i].querySelector<HTMLElement>('.nxt-slider__thumb')!;
    const settle = () => fixture.whenStable();

    // jsdom has no layout: give each slider a known geometry, and put the thumb where its value says it is.
    hosts.forEach((h, i) => {
      const track = h.querySelector<HTMLElement>('.nxt-slider__track')!;
      track.getBoundingClientRect = () =>
        ({ left: TRACK.left, right: TRACK.left + TRACK.width, width: TRACK.width, top: 0, bottom: 0, height: 0, x: TRACK.left, y: 0 }) as DOMRect;
      Object.defineProperty(thumb(i), 'offsetWidth', { value: THUMB, configurable: true });
    });
    const placeThumb = (i: number, centreX: number) => {
      thumb(i).getBoundingClientRect = () =>
        ({ left: centreX - THUMB / 2, right: centreX + THUMB / 2, width: THUMB, top: 0, bottom: 0, height: 0, x: 0, y: 0 }) as DOMRect;
    };

    const press = async (i: number, key: string, init: KeyboardEventInit = {}) => {
      const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init });
      control(i).dispatchEvent(event);
      await settle();
      return event;
    };
    const pointer = async (i: number, type: string, clientX: number, init: MouseEventInit = {}, target: HTMLElement = control(i)) => {
      target.dispatchEvent(new MouseEvent(type, { clientX, button: 0, bubbles: true, cancelable: true, ...init }));
      await settle();
    };
    return { fixture, host: fixture.componentInstance, hosts, control, thumb, placeThumb, settle, press, pointer };
  }

  describe('semantics', () => {
    it('is a focusable div with role slider, named by its label, with value attributes', async () => {
      const { hosts, control } = await setup();
      const slider = control(0);
      expect(slider.tagName).toBe('DIV');
      expect(slider.tabIndex).toBe(0);
      expect(slider.getAttribute('aria-orientation')).toBe('horizontal');
      expect(slider.getAttribute('aria-valuenow')).toBe('40');
      expect(slider.getAttribute('aria-valuemin')).toBe('0');
      expect(slider.getAttribute('aria-valuemax')).toBe('100');
      // Number + no-break space + unit, so a screen reader reads "40 %".
      expect(slider.getAttribute('aria-valuetext')).toBe('40 %');
      const label = hosts[0].querySelector('.nxt-slider__label')!;
      expect(slider.getAttribute('aria-labelledby')).toBe(label.id);
      expect(label.textContent!.trim()).toBe('Ngưỡng cảnh báo quá hạn');
    });

    it('describes the slider with its hint', async () => {
      const { hosts, control } = await setup();
      const hint = hosts[0].querySelector('.nxt-slider__hint')!;
      expect(control(0).getAttribute('aria-describedby')).toBe(hint.id);
      expect(control(1).hasAttribute('aria-describedby')).toBe(false);
    });

    it('draws the track and thumb as decoration only', async () => {
      const { hosts } = await setup();
      expect(hosts[0].querySelector('.nxt-slider__track')!.getAttribute('aria-hidden')).toBe('true');
      expect(hosts[0].querySelector('[role=slider]')!.textContent!.trim()).toBe('');
    });

    it('shows the value readout only with showValue, hidden from screen readers (aria-valuetext says it)', async () => {
      const { hosts } = await setup();
      const readout = hosts[0].querySelector('.nxt-slider__value')!;
      expect(readout.getAttribute('aria-hidden')).toBe('true');
      expect(readout.textContent).toBe('40 %');
      expect(hosts[2].querySelector('.nxt-slider__value')).toBeNull();
    });

    it('shows labels and icons at both ends; the icons are decoration', async () => {
      const { hosts } = await setup();
      const min = hosts[0].querySelector('[data-end=min]')!;
      const max = hosts[0].querySelector('[data-end=max]')!;
      expect(min.textContent!.trim()).toBe('Muộn');
      expect(max.textContent!.trim()).toBe('Sớm');
      expect(min.querySelector('nxt-icon svg')!.getAttribute('aria-hidden')).toBe('true');
      expect(max.querySelector('nxt-icon svg')!.getAttribute('aria-hidden')).toBe('true');
      expect(hosts[2].querySelector('.nxt-slider__end')).toBeNull();
    });

    it('uses formatValue for the words next to it and for aria-valuetext', async () => {
      const { hosts, control, host, settle } = await setup();
      expect(control(1).getAttribute('aria-valuetext')).toBe('Trung bình');
      expect(hosts[1].querySelector('.nxt-slider__value')!.textContent).toBe('Trung bình');
      host.priority.set(5);
      await settle();
      expect(control(1).getAttribute('aria-valuetext')).toBe('Rất cao');
      expect(control(1).getAttribute('aria-valuenow')).toBe('5');
    });

    it('shows decimals the Vietnamese way', async () => {
      const { control } = await setup();
      expect(control(3).getAttribute('aria-valuenow')).toBe('0.5');
      expect(control(3).getAttribute('aria-valuetext')).toBe('0,5');
    });

    it('puts the thumb by --_pct (0 at min, 1 at max) and clamps a value outside the range', async () => {
      const { control, host, settle } = await setup();
      expect(control(0).style.getPropertyValue('--_pct')).toBe('0.4');
      host.threshold.set(150);
      await settle();
      expect(control(0).getAttribute('aria-valuenow')).toBe('100');
      expect(control(0).style.getPropertyValue('--_pct')).toBe('1');
      host.threshold.set(-20);
      await settle();
      expect(control(0).getAttribute('aria-valuenow')).toBe('0');
      expect(control(0).style.getPropertyValue('--_pct')).toBe('0');
    });
  });

  describe('keyboard', () => {
    it('→ and ↑ increase by a step; ← and ↓ decrease', async () => {
      const { host, control, press } = await setup();
      const right = await press(0, 'ArrowRight');
      expect(right.defaultPrevented).toBe(true);
      expect(host.threshold()).toBe(41);
      await press(0, 'ArrowUp');
      expect(host.threshold()).toBe(42);
      await press(0, 'ArrowLeft');
      await press(0, 'ArrowDown');
      await press(0, 'ArrowDown');
      expect(host.threshold()).toBe(40 + 2 - 3);
      expect(control(0).getAttribute('aria-valuenow')).toBe('39');
    });

    it('Page Up and Page Down move ten steps', async () => {
      const { host, press } = await setup();
      await press(0, 'PageUp');
      expect(host.threshold()).toBe(50);
      await press(0, 'PageDown');
      await press(0, 'PageDown');
      expect(host.threshold()).toBe(30);
      // Steps of 3: ten steps is 30, and clamping applies.
      await press(2, 'PageUp');
      expect(host.weight()).toBe(10);
    });

    it('Home goes to min and End to max', async () => {
      const { host, press } = await setup();
      await press(0, 'End');
      expect(host.threshold()).toBe(100);
      await press(0, 'Home');
      expect(host.threshold()).toBe(0);
    });

    it('never leaves the range', async () => {
      const { host, press } = await setup();
      await press(0, 'End');
      await press(0, 'ArrowRight');
      await press(0, 'PageUp');
      expect(host.threshold()).toBe(100);
      await press(0, 'Home');
      await press(0, 'ArrowLeft');
      await press(0, 'PageDown');
      expect(host.threshold()).toBe(0);
    });

    it('uses a custom step and has no floating-point drift', async () => {
      const { host, control, press } = await setup();
      await press(3, 'ArrowRight');
      await press(3, 'ArrowRight');
      await press(3, 'ArrowRight');
      expect(host.factor()).toBe(0.8);
      expect(control(3).getAttribute('aria-valuetext')).toBe('0,8');
    });

    it('works from the lowest value when min is not 0', async () => {
      const { host, press } = await setup();
      await press(1, 'ArrowLeft');
      await press(1, 'ArrowLeft');
      await press(1, 'ArrowLeft');
      expect(host.priority()).toBe(1);
      await press(1, 'End');
      expect(host.priority()).toBe(5);
    });

    it('follows what the eye sees in a right-to-left page: ← increases, → decreases', async () => {
      const { hosts, host, press } = await setup();
      hosts[0].style.direction = 'rtl';
      await press(0, 'ArrowLeft');
      expect(host.threshold()).toBe(41);
      await press(0, 'ArrowRight');
      await press(0, 'ArrowRight');
      expect(host.threshold()).toBe(39);
      // Up and Down mean more and less in either direction.
      await press(0, 'ArrowUp');
      expect(host.threshold()).toBe(40);
    });

    it('ignores other keys (and keys with Ctrl, Meta or Alt held) without blocking them', async () => {
      const { host, press } = await setup();
      const tab = await press(0, 'Tab');
      const letter = await press(0, 'a');
      const ctrl = await press(0, 'ArrowRight', { ctrlKey: true });
      await press(0, 'ArrowRight', { altKey: true });
      await press(0, 'ArrowRight', { metaKey: true });
      expect([tab.defaultPrevented, letter.defaultPrevented, ctrl.defaultPrevented]).toEqual([false, false, false]);
      expect(host.threshold()).toBe(40);
    });
  });

  describe('pointer', () => {
    it('a press on the track takes focus and jumps the value to that point', async () => {
      const { host, control, pointer } = await setup();
      await pointer(0, 'pointerdown', 210);
      expect(host.threshold()).toBe(50);
      expect(document.activeElement).toBe(control(0));
      await pointer(0, 'pointerup', 210);
      await pointer(0, 'pointerdown', 110);
      expect(host.threshold()).toBe(0);
      await pointer(0, 'pointerdown', 310);
      expect(host.threshold()).toBe(100);
    });

    it('stays inside the range when pressed beyond the ends', async () => {
      const { host, pointer } = await setup();
      await pointer(0, 'pointerdown', 40);
      expect(host.threshold()).toBe(0);
      await pointer(0, 'pointerdown', 900);
      expect(host.threshold()).toBe(100);
    });

    it('follows the pointer while dragging and stops after release', async () => {
      const { host, pointer } = await setup();
      await pointer(0, 'pointerdown', 110);
      await pointer(0, 'pointermove', 160);
      expect(host.threshold()).toBe(25);
      await pointer(0, 'pointermove', 260);
      expect(host.threshold()).toBe(75);
      await pointer(0, 'pointerup', 260);
      await pointer(0, 'pointermove', 110);
      expect(host.threshold()).toBe(75);
    });

    it('does not move without a press first (hover)', async () => {
      const { host, pointer } = await setup();
      await pointer(0, 'pointermove', 250);
      expect(host.threshold()).toBe(40);
    });

    it('stops dragging on pointercancel (the browser took over a scroll)', async () => {
      const { host, pointer } = await setup();
      await pointer(0, 'pointerdown', 110);
      await pointer(0, 'pointercancel', 110);
      await pointer(0, 'pointermove', 310);
      expect(host.threshold()).toBe(0);
    });

    it('snaps to the step and can reach an upper limit that is off the grid', async () => {
      const { host, pointer } = await setup();
      // Steps of 3 over 0–10: 0, 3, 6, 9 and the limit 10. x = 110 + 200 × (value / 10).
      await pointer(2, 'pointerdown', 110 + 200 * 0.45);
      expect(host.weight()).toBe(6);
      await pointer(2, 'pointerdown', 110 + 200 * 0.8);
      expect(host.weight()).toBe(9);
      await pointer(2, 'pointerdown', 110 + 200 * 0.97);
      expect(host.weight()).toBe(10);
      await pointer(2, 'pointerdown', 110 + 200 * 0.1);
      expect(host.weight()).toBe(0);
    });

    it('grabbing the thumb itself does not make the value jump to the pointer', async () => {
      const { host, thumb, placeThumb, pointer } = await setup();
      // Value 40 puts the thumb centre at 110 + 0.4 × 200 = 190. Grab 6 px to its right.
      placeThumb(0, 190);
      await pointer(0, 'pointerdown', 196, {}, thumb(0));
      expect(host.threshold()).toBe(40);
      await pointer(0, 'pointermove', 226);
      expect(host.threshold()).toBe(55);
    });

    it('ignores presses with a secondary button', async () => {
      const { host, pointer } = await setup();
      await pointer(0, 'pointerdown', 310, { button: 2 });
      expect(host.threshold()).toBe(40);
    });

    it('measures from the right in a right-to-left page', async () => {
      const { hosts, host, pointer } = await setup();
      hosts[0].style.direction = 'rtl';
      // Low end on the right: 0 at x = 310 (right − 10), 100 at x = 110.
      await pointer(0, 'pointerdown', 310);
      expect(host.threshold()).toBe(0);
      await pointer(0, 'pointerdown', 110);
      expect(host.threshold()).toBe(100);
      await pointer(0, 'pointerdown', 210);
      expect(host.threshold()).toBe(50);
    });

    it('does nothing when the track has no room for the thumb (not laid out)', async () => {
      const { hosts, host, pointer } = await setup();
      const track = hosts[0].querySelector<HTMLElement>('.nxt-slider__track')!;
      track.getBoundingClientRect = () => ({ left: 0, right: 10, width: 10 }) as DOMRect;
      await pointer(0, 'pointerdown', 5);
      expect(host.threshold()).toBe(40);
    });
  });

  describe('disabled and read-only', () => {
    it('disabled: aria-disabled, out of the tab order, shows its position, nothing changes', async () => {
      const { hosts, host, control, settle, press, pointer } = await setup();
      host.disabled.set(true);
      await settle();
      const slider = control(0);
      expect(slider.getAttribute('aria-disabled')).toBe('true');
      expect(slider.hasAttribute('tabindex')).toBe(false);
      expect(hosts[0].hasAttribute('data-disabled')).toBe(true);
      expect(slider.getAttribute('aria-valuenow')).toBe('40');
      await press(0, 'ArrowRight');
      await pointer(0, 'pointerdown', 310);
      expect(host.threshold()).toBe(40);
    });

    it('readonly: aria-readonly, still focusable, keys and pointer change nothing', async () => {
      const { hosts, host, control, settle, press, pointer } = await setup();
      host.readonly.set(true);
      await settle();
      const slider = control(0);
      expect(slider.getAttribute('aria-readonly')).toBe('true');
      expect(slider.hasAttribute('aria-disabled')).toBe(false);
      expect(slider.tabIndex).toBe(0);
      expect(hosts[0].hasAttribute('data-readonly')).toBe(true);
      const event = await press(0, 'ArrowRight');
      // The page still must not scroll with the arrow keys while the slider has focus.
      expect(event.defaultPrevented).toBe(true);
      await press(0, 'End');
      await pointer(0, 'pointerdown', 310);
      await pointer(0, 'pointermove', 110);
      expect(host.threshold()).toBe(40);
      expect(document.activeElement).toBe(slider);
    });
  });

  it('focuses the slider when its label is clicked', async () => {
    const { hosts, control } = await setup();
    hosts[0].querySelector<HTMLElement>('.nxt-slider__label')!.click();
    expect(document.activeElement).toBe(control(0));
  });
});

@Component({
  imports: [NxtSlider, ReactiveFormsModule],
  template: `<nxt-slider label="Tỉ trọng KPI" [min]="10" [max]="50" [step]="5" [formControl]="weight" />`,
})
class Forms {
  readonly weight = new FormControl<number | null>(20);
}

describe('NxtSlider with Angular forms', () => {
  it('writes, reads, disables and marks touched through the form control', async () => {
    const fixture = TestBed.createComponent(Forms);
    fixture.detectChanges();
    await fixture.whenStable();
    const host = fixture.componentInstance;
    const slider = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('[role=slider]')!;
    expect(slider.getAttribute('aria-valuenow')).toBe('20');

    // From the user: the control gets the number.
    slider.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }));
    expect(host.weight.value).toBe(25);
    slider.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true, cancelable: true }));
    expect(host.weight.value).toBe(50);

    // From the form: shown, and not echoed back (an echo would add a second change event per set).
    const changes: unknown[] = [];
    host.weight.valueChanges.subscribe((v) => changes.push(v));
    host.weight.setValue(35);
    await fixture.whenStable();
    expect(slider.getAttribute('aria-valuenow')).toBe('35');
    // Reset gives `null`: the slider falls back to its lowest value.
    host.weight.reset();
    await fixture.whenStable();
    expect(slider.getAttribute('aria-valuenow')).toBe('10');
    expect(changes).toEqual([35, null]);

    host.weight.disable();
    await fixture.whenStable();
    expect(slider.getAttribute('aria-disabled')).toBe('true');
    host.weight.enable();
    await fixture.whenStable();
    expect(slider.hasAttribute('aria-disabled')).toBe(false);

    expect(host.weight.touched).toBe(false);
    slider.dispatchEvent(new FocusEvent('blur'));
    expect(host.weight.touched).toBe(true);
  });
});
