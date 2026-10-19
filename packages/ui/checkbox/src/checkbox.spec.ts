import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NxtCheckbox } from './checkbox';

@Component({
  imports: [NxtCheckbox, ReactiveFormsModule],
  template: `
    <nxt-checkbox label="Đang sử dụng" [(checked)]="active" />
    <nxt-checkbox label="Chọn tất cả nhân viên" hideLabel [indeterminate]="some()" />
    <nxt-checkbox label="Nhận thông báo qua email" [formControl]="notify" />
  `,
})
class Host {
  readonly active = signal(false);
  readonly some = signal(true);
  readonly notify = new FormControl(true, { nonNullable: true });
}

describe('NxtCheckbox', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const inputs = [...(fixture.nativeElement as HTMLElement).querySelectorAll<HTMLInputElement>('input[type="checkbox"]')];
    return { fixture, host: fixture.componentInstance, inputs };
  }

  it('is a native checkbox named by its label', () => {
    const { inputs } = setup();
    expect(inputs[0].closest('label')!.textContent).toContain('Đang sử dụng');
    const hidden = inputs[1].closest('label')!.querySelector('.nxt-checkbox__text')!;
    expect(hidden.classList).toContain('nxt-visually-hidden');
    expect(hidden.textContent).toContain('Chọn tất cả nhân viên');
  });

  it('supports two-way [(checked)]', async () => {
    const { fixture, host, inputs } = setup();
    inputs[0].click();
    await fixture.whenStable();
    expect(host.active()).toBe(true);
    host.active.set(false);
    await fixture.whenStable();
    expect(inputs[0].checked).toBe(false);
  });

  it('reflects the mixed state', async () => {
    const { fixture, host, inputs } = setup();
    expect(inputs[1].indeterminate).toBe(true);
    host.some.set(false);
    await fixture.whenStable();
    expect(inputs[1].indeterminate).toBe(false);
  });

  it('works as a form control, including disabled state', async () => {
    const { fixture, host, inputs } = setup();
    expect(inputs[2].checked).toBe(true);
    inputs[2].click();
    expect(host.notify.value).toBe(false);
    host.notify.disable();
    await fixture.whenStable();
    expect(inputs[2].disabled).toBe(true);
  });
});
