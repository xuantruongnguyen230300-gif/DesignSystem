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

@Component({
  imports: [NxtCheckbox],
  template: `<nxt-checkbox label="Chọn Kế toán tổng hợp" hideLabel (toggled)="events.push($event)" />`,
})
class Toggled {
  readonly events: { checked: boolean; shiftKey: boolean }[] = [];
}

describe('NxtCheckbox toggled', () => {
  it('reports the new state and whether Shift was held (for range selection)', async () => {
    const fixture = TestBed.createComponent(Toggled);
    fixture.detectChanges();
    const label = (fixture.nativeElement as HTMLElement).querySelector('label')!;
    const input = label.querySelector('input')!;
    label.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, shiftKey: true }));
    input.click();
    label.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    input.click();
    expect(fixture.componentInstance.events).toEqual([
      { checked: true, shiftKey: true },
      { checked: false, shiftKey: false },
    ]);
  });
});

@Component({
  imports: [NxtCheckbox],
  template: `
    <nxt-checkbox label="Được uỷ quyền cho người khác duyệt thay" hint="Người được uỷ quyền phải cùng phòng hoặc là cấp trên." />
    <nxt-checkbox label="Được từ chối" />
  `,
})
class Hinted {}

describe('NxtCheckbox hint', () => {
  it('describes the box with helper text that is not part of its name', () => {
    const fixture = TestBed.createComponent(Hinted);
    fixture.detectChanges();
    const [withHint, without] = [...(fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('nxt-checkbox')];
    const input = withHint.querySelector('input')!;
    const hint = withHint.querySelector<HTMLElement>('.nxt-checkbox__hint')!;
    expect(hint.textContent).toBe('Người được uỷ quyền phải cùng phòng hoặc là cấp trên.');
    expect(hint.id).toMatch(/^nxt-checkbox-\d+-hint$/);
    expect(input.getAttribute('aria-describedby')).toBe(hint.id);
    // Outside the <label>: the name stays the label text only.
    expect(hint.closest('label')).toBeNull();
    expect(input.closest('label')!.textContent!.trim()).toBe('Được uỷ quyền cho người khác duyệt thay');
    // No hint → no description and no empty element.
    expect(without.querySelector('.nxt-checkbox__hint')).toBeNull();
    expect(without.querySelector('input')!.hasAttribute('aria-describedby')).toBe(false);
  });

  it('gives every checkbox its own hint id', () => {
    const fixture = TestBed.createComponent(Hinted);
    fixture.detectChanges();
    const again = TestBed.createComponent(Hinted);
    again.detectChanges();
    const a = (fixture.nativeElement as HTMLElement).querySelector('.nxt-checkbox__hint')!.id;
    const b = (again.nativeElement as HTMLElement).querySelector('.nxt-checkbox__hint')!.id;
    expect(a).not.toBe(b);
  });
});
