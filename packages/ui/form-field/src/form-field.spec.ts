import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NxtFormField, NxtInput } from './form-field';

@Component({
  imports: [NxtFormField, NxtInput],
  template: `
    <nxt-form-field label="Email công ty" hint="Dùng email @congty.vn." [error]="error()" required>
      <span nxtPrefix>@</span>
      <input nxtInput type="email" />
    </nxt-form-field>
    <nxt-form-field label="Phòng ban">
      <select nxtInput><option>Kế toán</option></select>
    </nxt-form-field>
    <nxt-form-field label="Tìm nhân viên" hideLabel>
      <input nxtInput type="search" />
    </nxt-form-field>
  `,
})
class Host {
  readonly error = signal<string | null>(null);
}

describe('NxtFormField + NxtInput', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const fields = [...el.querySelectorAll<HTMLElement>('nxt-form-field')];
    return { fixture, host: fixture.componentInstance, el, fields };
  }

  it('connects the visible label to the control without manual ids', () => {
    const { fields } = setup();
    const label = fields[0].querySelector('label')!;
    const input = fields[0].querySelector('input')!;
    expect(input.id).toBeTruthy();
    expect(label.htmlFor).toBe(input.id);
    expect(label.textContent).toContain('Email công ty');
    const ids = fields.map((f) => f.querySelector('.nxt-input')!.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('describes the control with the hint, and marks it required', () => {
    const { fields } = setup();
    const input = fields[0].querySelector('input')!;
    const hint = fields[0].querySelector('.nxt-form-field__hint')!;
    expect(input.getAttribute('aria-describedby')).toBe(hint.id);
    expect(input.getAttribute('aria-required')).toBe('true');
    expect(input.hasAttribute('aria-invalid')).toBe(false);
  });

  it('replaces the hint with the error, sets aria-invalid, and clears both when fixed', async () => {
    const { fixture, host, fields } = setup();
    const input = fields[0].querySelector('input')!;
    host.error.set('Email chưa đúng định dạng, ví dụ ten@congty.vn.');
    await fixture.whenStable();
    const error = fields[0].querySelector('.nxt-form-field__error')!;
    expect(error.textContent).toContain('Email chưa đúng định dạng');
    expect(fields[0].querySelector('.nxt-form-field__hint')).toBeNull();
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe(error.id);
    host.error.set(null);
    await fixture.whenStable();
    expect(input.hasAttribute('aria-invalid')).toBe(false);
    expect(input.getAttribute('aria-describedby')).toBe(fields[0].querySelector('.nxt-form-field__hint')!.id);
  });

  it('adds the chevron for selects and keeps a hidden label announced', () => {
    const { fields } = setup();
    expect(fields[1].querySelector('.nxt-form-field__chevron')).not.toBeNull();
    expect(fields[0].querySelector('.nxt-form-field__chevron')).toBeNull();
    const hidden = fields[2].querySelector('label')!;
    expect(hidden.classList).toContain('nxt-visually-hidden');
    expect(hidden.htmlFor).toBe(fields[2].querySelector('input')!.id);
  });
});
