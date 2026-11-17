import { Component, Type, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NxtDateRange } from '@nxt/ui/calendar';
import { NxtFormField } from '@nxt/ui/form-field';
import { NxtDatePicker, NxtDateRangePicker } from './date-picker';

@Component({
  imports: [ReactiveFormsModule, NxtFormField, NxtDatePicker],
  template: `
    <nxt-form-field label="Ngày sinh" hint="Theo dạng dd/mm/yyyy">
      <nxt-date-picker
        [formControl]="ctrl"
        today="2026-11-06"
        [min]="min()"
        [max]="max()"
        [dateFilter]="filter()"
        [readonly]="readonly()"
        [todayButton]="true"
      />
    </nxt-form-field>
  `,
})
class SingleHost {
  readonly ctrl = new FormControl<string | null>(null);
  readonly min = signal<string | null>(null);
  readonly max = signal<string | null>(null);
  readonly filter = signal<((d: string) => boolean) | null>(null);
  readonly readonly = signal(false);
}

@Component({
  imports: [ReactiveFormsModule, NxtFormField, NxtDateRangePicker],
  template: `
    <nxt-form-field label="Thời gian nghỉ">
      <nxt-date-range-picker [formControl]="ctrl" today="2026-11-06" [max]="max()" />
    </nxt-form-field>
  `,
})
class RangeHost {
  readonly ctrl = new FormControl<NxtDateRange | null>(null);
  readonly max = signal<string | null>(null);
}

async function settle(fixture: { detectChanges(): void; whenStable(): Promise<unknown> }) {
  fixture.detectChanges();
  await fixture.whenStable();
  // CDK dialog moves focus in an afterNextRender of its own view.
  await new Promise((r) => setTimeout(r));
  fixture.detectChanges();
}

function harness<T>(type: Type<T>) {
  const fixture = TestBed.createComponent(type);
  fixture.detectChanges();
  const el: HTMLElement = fixture.nativeElement;
  const input = el.querySelector<HTMLInputElement>('input')!;
  const button = () => el.querySelector<HTMLButtonElement>('.nxt-date-picker__trigger');
  const dialog = () => document.querySelector<HTMLElement>('.nxt-date-picker-pane [role="dialog"], .cdk-dialog-container');
  const cell = (iso: string) => document.querySelector<HTMLElement>(`.nxt-date-picker__panel td[data-date="${iso}"]`)!;
  const type_ = async (text: string) => {
    input.focus();
    input.value = text;
    input.dispatchEvent(new Event('input'));
    await settle(fixture);
  };
  const key = async (target: HTMLElement, k: string, opts: KeyboardEventInit = {}) => {
    const event = new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...opts });
    target.dispatchEvent(event);
    await settle(fixture);
    return event;
  };
  const blur = async () => {
    input.dispatchEvent(new Event('blur'));
    await settle(fixture);
  };
  return { fixture, host: fixture.componentInstance, el, input, button, dialog, cell, type: type_, key, blur };
}

describe('NxtDatePicker', () => {
  afterEach(() => document.querySelectorAll('.cdk-overlay-container').forEach((c) => (c.innerHTML = '')));

  describe('inside nxt-form-field', () => {
    it('the field label names the input; the button is "Chọn ngày, <label>" and opens a dialog', () => {
      const { el, input, button } = harness(SingleHost);
      expect(el.querySelector('label')!.getAttribute('for')).toBe(input.id);
      expect(input.getAttribute('aria-describedby')).toBe(`${input.id}-hint`);
      expect(input.getAttribute('placeholder')).toBe('dd/mm/yyyy');
      expect(button()!.getAttribute('aria-label')).toBe('Chọn ngày, Ngày sinh');
      expect(button()!.getAttribute('aria-haspopup')).toBe('dialog');
      expect(button()!.getAttribute('aria-expanded')).toBe('false');
    });
  });

  describe('ControlValueAccessor + typing', () => {
    it('shows an ISO value as dd/MM/yyyy', async () => {
      const { fixture, host, input } = harness(SingleHost);
      host.ctrl.setValue('2026-01-05');
      await settle(fixture);
      expect(input.value).toBe('05/01/2026');
    });

    it('commits typed text on blur and normalizes it; marks the control touched', async () => {
      const { host, input, type, blur } = harness(SingleHost);
      await type('6/11/2026');
      expect(host.ctrl.value).toBeNull();
      await blur();
      expect(host.ctrl.value).toBe('2026-11-06');
      expect(input.value).toBe('06/11/2026');
      expect(host.ctrl.touched).toBe(true);
    });

    it('commits ddMMyyyy on Enter', async () => {
      const { host, input, type, key } = harness(SingleHost);
      await type('24122026');
      await key(input, 'Enter');
      expect(host.ctrl.value).toBe('2026-12-24');
    });

    it('text that is not a date: value null, text kept, nxtDateParse error; never guesses MM/dd', async () => {
      const { host, input, type, blur } = harness(SingleHost);
      host.ctrl.setValue('2026-11-06');
      await type('12/25/2026');
      await blur();
      expect(host.ctrl.value).toBeNull();
      expect(input.value).toBe('12/25/2026');
      expect(host.ctrl.errors).toEqual({ nxtDateParse: { text: '12/25/2026' } });
      await type('31/02/2026');
      await blur();
      expect(host.ctrl.errors).toEqual({ nxtDateParse: { text: '31/02/2026' } });
      await type('');
      await blur();
      expect(host.ctrl.errors).toBeNull();
    });

    it('reports nxtDateMin, nxtDateMax and nxtDateFilter', async () => {
      const { fixture, host, type, blur } = harness(SingleHost);
      host.min.set('2026-01-01');
      host.max.set('2026-11-06');
      host.filter.set((d) => d !== '2026-09-02');
      await settle(fixture);
      await type('31/12/2025');
      await blur();
      expect(host.ctrl.errors).toEqual({ nxtDateMin: { min: '2026-01-01', actual: '2025-12-31' } });
      await type('07/11/2026');
      await blur();
      expect(host.ctrl.errors).toEqual({ nxtDateMax: { max: '2026-11-06', actual: '2026-11-07' } });
      await type('02/09/2026');
      await blur();
      expect(host.ctrl.errors).toEqual({ nxtDateFilter: { actual: '2026-09-02' } });
    });

    it('re-validates when max changes', async () => {
      const { fixture, host } = harness(SingleHost);
      host.ctrl.setValue('2026-12-01');
      await settle(fixture);
      expect(host.ctrl.errors).toBeNull();
      host.max.set('2026-11-06');
      await settle(fixture);
      expect(host.ctrl.errors?.['nxtDateMax']).toBeTruthy();
    });

    it('disabled control: native input disabled, button aria-disabled', async () => {
      const { fixture, host, input, button } = harness(SingleHost);
      host.ctrl.disable();
      await settle(fixture);
      expect(input.disabled).toBe(true);
      expect(button()!.getAttribute('aria-disabled')).toBe('true');
    });

    it('readonly: no calendar button and PageUp does not change the value', async () => {
      const { fixture, host, input, button, key } = harness(SingleHost);
      host.ctrl.setValue('2026-11-06');
      host.readonly.set(true);
      await settle(fixture);
      expect(input.readOnly).toBe(true);
      expect(button()).toBeNull();
      await key(input, 'PageUp');
      expect(host.ctrl.value).toBe('2026-11-06');
    });
  });

  describe('keys in the input', () => {
    it('PageUp / PageDown: +1 / −1 day; empty starts from today', async () => {
      const { host, input, key } = harness(SingleHost);
      input.focus();
      await key(input, 'PageUp');
      expect(host.ctrl.value).toBe('2026-11-06');
      await key(input, 'PageUp');
      expect(host.ctrl.value).toBe('2026-11-07');
      expect(input.value).toBe('07/11/2026');
      await key(input, 'PageDown');
      await key(input, 'PageDown');
      expect(host.ctrl.value).toBe('2026-11-05');
    });

    it('Shift+PageUp / Shift+PageDown: ±1 month, clamped to the end of the month', async () => {
      const { fixture, host, input, key } = harness(SingleHost);
      host.ctrl.setValue('2026-01-31');
      await settle(fixture);
      await key(input, 'PageUp', { shiftKey: true });
      expect(host.ctrl.value).toBe('2026-02-28');
      await key(input, 'PageDown', { shiftKey: true });
      expect(host.ctrl.value).toBe('2026-01-28');
    });

    it('PageUp stops at max and skips days blocked by dateFilter', async () => {
      const { fixture, host, input, key } = harness(SingleHost);
      host.max.set('2026-11-10');
      host.filter.set((d) => d !== '2026-11-08');
      host.ctrl.setValue('2026-11-07');
      await settle(fixture);
      await key(input, 'PageUp');
      expect(host.ctrl.value).toBe('2026-11-09');
      await key(input, 'PageUp');
      await key(input, 'PageUp');
      expect(host.ctrl.value).toBe('2026-11-10');
    });

    it('Escape undoes unfinished typing and does not bubble; with nothing to undo it bubbles', async () => {
      const { fixture, host, input, type, key } = harness(SingleHost);
      host.ctrl.setValue('2026-11-06');
      await settle(fixture);
      await type('07/1');
      const undo = await key(input, 'Escape');
      expect(input.value).toBe('06/11/2026');
      expect(undo.defaultPrevented).toBe(true);
      const pass = await key(input, 'Escape');
      expect(pass.defaultPrevented).toBe(false);
    });
  });

  describe('calendar panel', () => {
    it('Alt+ArrowDown opens a named modal dialog with focus on the selected day', async () => {
      const { fixture, host, input, button, dialog, cell, key } = harness(SingleHost);
      host.ctrl.setValue('2026-10-20');
      await settle(fixture);
      input.focus();
      await key(input, 'ArrowDown', { altKey: true });
      const d = dialog()!;
      expect(d.getAttribute('role')).toBe('dialog');
      expect(d.getAttribute('aria-modal')).toBe('true');
      expect(d.getAttribute('aria-label')).toBe('Chọn ngày');
      expect(button()!.getAttribute('aria-expanded')).toBe('true');
      expect(document.activeElement).toBe(cell('2026-10-20'));
    });

    it('Enter on a day picks it, closes and returns focus to where it was opened', async () => {
      const { fixture, host, input, dialog, key } = harness(SingleHost);
      input.focus();
      await key(input, 'ArrowDown', { altKey: true });
      expect(document.activeElement!.getAttribute('data-date')).toBe('2026-11-06');
      await key(document.activeElement as HTMLElement, 'ArrowRight');
      await key(document.activeElement as HTMLElement, 'Enter');
      await settle(fixture);
      expect(host.ctrl.value).toBe('2026-11-07');
      expect(input.value).toBe('07/11/2026');
      expect(dialog()).toBeNull();
      expect(document.activeElement).toBe(input);
    });

    it('Escape closes without changing the value; focus back on the button', async () => {
      const { fixture, host, button, dialog, key } = harness(SingleHost);
      host.ctrl.setValue('2026-11-06');
      await settle(fixture);
      button()!.focus();
      button()!.click();
      await settle(fixture);
      expect(dialog()).not.toBeNull();
      await key(document.activeElement as HTMLElement, 'ArrowLeft');
      await key(document.activeElement as HTMLElement, 'Escape', { keyCode: 27 }); // CDK reads keyCode
      await settle(fixture);
      expect(dialog()).toBeNull();
      expect(host.ctrl.value).toBe('2026-11-06');
      expect(document.activeElement).toBe(button());
    });

    it('Alt+ArrowUp inside the panel closes it', async () => {
      const { input, dialog, key } = harness(SingleHost);
      input.focus();
      await key(input, 'ArrowDown', { altKey: true });
      await key(document.activeElement as HTMLElement, 'ArrowUp', { altKey: true });
      expect(dialog()).toBeNull();
    });

    it('"Hôm nay" picks today and closes', async () => {
      const { host, button, dialog, fixture } = harness(SingleHost);
      button()!.click();
      await settle(fixture);
      const today = [...document.querySelectorAll<HTMLButtonElement>('.nxt-date-picker__footer button')][0];
      expect(today.textContent!.trim()).toBe('Hôm nay');
      today.click();
      await settle(fixture);
      expect(host.ctrl.value).toBe('2026-11-06');
      expect(dialog()).toBeNull();
    });

    it('days after max are blocked in the calendar', async () => {
      const { fixture, host, button, cell } = harness(SingleHost);
      host.max.set('2026-11-06');
      await settle(fixture);
      button()!.click();
      await settle(fixture);
      expect(cell('2026-11-07').getAttribute('aria-disabled')).toBe('true');
      expect(cell('2026-11-06').getAttribute('aria-disabled')).toBeNull();
    });
  });
});

describe('NxtDateRangePicker', () => {
  afterEach(() => document.querySelectorAll('.cdk-overlay-container').forEach((c) => (c.innerHTML = '')));

  it('names the button and the panel for a range', async () => {
    const { fixture, button, dialog, input } = harness(RangeHost);
    expect(input.getAttribute('placeholder')).toBe('dd/mm/yyyy – dd/mm/yyyy');
    expect(button()!.getAttribute('aria-label')).toBe('Chọn khoảng ngày, Thời gian nghỉ');
    button()!.click();
    await settle(fixture);
    expect(dialog()!.getAttribute('aria-label')).toBe('Chọn khoảng ngày');
  });

  it('typed ranges: separators, swap when reversed, one day, normalized display', async () => {
    const { host, input, type, blur } = harness(RangeHost);
    await type('05/12/2026 - 1/12/2026');
    await blur();
    expect(host.ctrl.value).toEqual({ start: '2026-12-01', end: '2026-12-05' });
    expect(input.value).toBe('01/12/2026 – 05/12/2026');
    await type('24122026');
    await blur();
    expect(host.ctrl.value).toEqual({ start: '2026-12-24', end: '2026-12-24' });
    await type('01/12/2026 – 31/02/2027');
    await blur();
    expect(host.ctrl.value).toBeNull();
    expect(host.ctrl.errors).toEqual({ nxtDateParse: { text: '01/12/2026 – 31/02/2027' } });
  });

  it('picking start then an earlier end in the calendar swaps them and closes', async () => {
    const { fixture, host, button, cell, dialog } = harness(RangeHost);
    button()!.click();
    await settle(fixture);
    cell('2026-11-20').click();
    await settle(fixture);
    expect(dialog()).not.toBeNull();
    cell('2026-11-16').dispatchEvent(new MouseEvent('mouseenter'));
    await settle(fixture);
    expect(cell('2026-11-18').hasAttribute('data-in-range')).toBe(true);
    cell('2026-11-16').click();
    await settle(fixture);
    expect(host.ctrl.value).toEqual({ start: '2026-11-16', end: '2026-11-20' });
    expect(dialog()).toBeNull();
  });

  it('PageUp changes the date under the caret; the other end follows when they would cross', async () => {
    const { fixture, host, input, key } = harness(RangeHost);
    host.ctrl.setValue({ start: '2026-12-01', end: '2026-12-02' });
    await settle(fixture);
    input.focus();
    input.setSelectionRange(20, 20);
    await key(input, 'PageUp');
    expect(host.ctrl.value).toEqual({ start: '2026-12-01', end: '2026-12-03' });
    expect(input.selectionStart).toBe(20);
    input.setSelectionRange(2, 2);
    await key(input, 'PageUp', { shiftKey: true });
    expect(host.ctrl.value).toEqual({ start: '2027-01-01', end: '2027-01-01' });
  });

  it('nxtDateMax checks the end of the range', async () => {
    const { fixture, host } = harness(RangeHost);
    host.max.set('2026-12-31');
    await settle(fixture);
    host.ctrl.setValue({ start: '2026-12-29', end: '2027-01-02' });
    expect(host.ctrl.errors).toEqual({ nxtDateMax: { max: '2026-12-31', actual: '2027-01-02' } });
  });
});
