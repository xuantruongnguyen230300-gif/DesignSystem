import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NxtCheckbox, NxtCheckboxGroup } from './checkbox';

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

describe('NxtCheckbox kept in sync', () => {
  it('shows the value again when a form reverts the user tick before the next render', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    const box = (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLInputElement>('input[type="checkbox"]')[2];
    const sub = host.notify.valueChanges.subscribe((v) => !v && host.notify.setValue(true));
    box.click();
    await fixture.whenStable();
    sub.unsubscribe();
    expect(host.notify.value).toBe(true);
    expect(box.checked).toBe(true);
  });
});

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

@Component({
  imports: [NxtCheckbox, ReactiveFormsModule],
  template: `
    <nxt-checkbox
      label="Tôi xác nhận bảng công tháng 9 là chính xác"
      required
      hint="Bảng công sẽ được chuyển cho phòng Nhân sự."
      [error]="error()"
      [formControl]="confirmed"
    />
    <nxt-checkbox label="Chọn Nguyễn Văn An" hideLabel [invalid]="invalid()" />
    <nxt-checkbox label="Đóng bảo hiểm xã hội" [readonly]="readonly()" [(checked)]="insured" />
  `,
})
class States {
  readonly error = signal<string | null>(null);
  readonly invalid = signal(false);
  readonly readonly = signal(true);
  readonly insured = signal(true);
  readonly confirmed = new FormControl(false, { nonNullable: true });
}

describe('NxtCheckbox error, required, readonly', () => {
  function setup() {
    const fixture = TestBed.createComponent(States);
    fixture.detectChanges();
    const hosts = [...(fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('nxt-checkbox')];
    const input = (i: number) => hosts[i].querySelector('input')!;
    return { fixture, host: fixture.componentInstance, hosts, input };
  }

  it('required: a hidden * after the label and aria-required, not the native attribute', () => {
    const { hosts, input } = setup();
    const star = hosts[0].querySelector('.nxt-checkbox__required')!;
    expect(star.getAttribute('aria-hidden')).toBe('true');
    expect(input(0).getAttribute('aria-required')).toBe('true');
    expect(input(0).hasAttribute('required')).toBe(false);
    expect(input(1).hasAttribute('aria-required')).toBe(false);
  });

  it('error: message below the box (icon + text), aria-invalid, described before the hint; cleared when fixed', async () => {
    const { fixture, host, hosts, input } = setup();
    expect(input(0).hasAttribute('aria-invalid')).toBe(false);
    host.error.set('Đánh dấu ô xác nhận để gửi bảng công.');
    await fixture.whenStable();
    const error = hosts[0].querySelector<HTMLElement>('.nxt-checkbox__error')!;
    const hint = hosts[0].querySelector<HTMLElement>('.nxt-checkbox__hint')!;
    expect(error.textContent).toContain('Đánh dấu ô xác nhận');
    expect(error.querySelector('nxt-icon')).not.toBeNull();
    expect(error.closest('label')).toBeNull();
    expect(input(0).getAttribute('aria-invalid')).toBe('true');
    expect(input(0).getAttribute('aria-describedby')).toBe(`${error.id} ${hint.id}`);
    expect(hosts[0].hasAttribute('data-invalid')).toBe(true);
    host.error.set(null);
    await fixture.whenStable();
    expect(input(0).hasAttribute('aria-invalid')).toBe(false);
    expect(input(0).getAttribute('aria-describedby')).toBe(hint.id);
  });

  it('invalid: marks the box without a message of its own', async () => {
    const { fixture, host, hosts, input } = setup();
    host.invalid.set(true);
    await fixture.whenStable();
    expect(input(1).getAttribute('aria-invalid')).toBe('true');
    expect(hosts[1].hasAttribute('data-invalid')).toBe(true);
    expect(hosts[1].querySelector('.nxt-checkbox__error')).toBeNull();
  });

  it('readonly: focusable and aria-readonly; click and Space (a click) do not change it', async () => {
    const { fixture, host, hosts, input } = setup();
    const box = input(2);
    expect(box.getAttribute('aria-readonly')).toBe('true');
    expect(hosts[2].hasAttribute('data-readonly')).toBe(true);
    expect(box.disabled).toBe(false);
    box.focus();
    expect(document.activeElement).toBe(box);
    box.click();
    await fixture.whenStable();
    expect(box.checked).toBe(true);
    expect(host.insured()).toBe(true);
    host.readonly.set(false);
    await fixture.whenStable();
    expect(box.hasAttribute('aria-readonly')).toBe(false);
    box.click();
    await fixture.whenStable();
    expect(host.insured()).toBe(false);
  });
});

@Component({
  imports: [NxtCheckbox, NxtCheckboxGroup],
  template: `
    <nxt-checkbox-group
      label="Kênh nhận thông báo (chọn ít nhất một)"
      hint="Áp dụng cho đơn cần bạn duyệt."
      required
      [error]="error()"
      [disabled]="disabled()"
      [readonly]="readonly()"
    >
      <nxt-checkbox label="Email công ty" [(checked)]="email" />
      <nxt-checkbox label="Tin nhắn SMS" />
    </nxt-checkbox-group>
  `,
})
class Group {
  readonly error = signal<string | null>(null);
  readonly disabled = signal(false);
  readonly readonly = signal(false);
  readonly email = signal(false);
}

describe('NxtCheckboxGroup', () => {
  function setup() {
    const fixture = TestBed.createComponent(Group);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const fieldset = el.querySelector('fieldset')!;
    const inputs = [...el.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')];
    return { fixture, host: fixture.componentInstance, el, fieldset, inputs };
  }

  it('is a fieldset named by its legend, with the hint describing the group and a hidden required word', () => {
    const { fieldset } = setup();
    const legend = fieldset.querySelector('legend')!;
    expect(fieldset.firstElementChild).toBe(legend);
    expect(legend.textContent).toContain('Kênh nhận thông báo (chọn ít nhất một)');
    expect(legend.querySelector('[aria-hidden="true"]')!.textContent).toBe('*');
    expect(legend.querySelector('.nxt-visually-hidden')!.textContent!.trim()).toBe('(bắt buộc)');
    const hint = fieldset.querySelector('.nxt-checkbox-group__hint')!;
    expect(fieldset.getAttribute('aria-describedby')).toBe(hint.id);
  });

  it('shows one error below the group and marks every checkbox invalid', async () => {
    const { fixture, host, el, fieldset, inputs } = setup();
    host.error.set('Chọn ít nhất một kênh nhận thông báo.');
    await fixture.whenStable();
    const error = fieldset.querySelector('.nxt-checkbox-group__error')!;
    expect(fieldset.lastElementChild).toBe(error);
    expect(error.querySelector('nxt-icon')).not.toBeNull();
    const hint = fieldset.querySelector('.nxt-checkbox-group__hint')!;
    expect(fieldset.getAttribute('aria-describedby')).toBe(`${hint.id} ${error.id}`);
    expect(inputs.every((i) => i.getAttribute('aria-invalid') === 'true')).toBe(true);
    expect(el.querySelector('nxt-checkbox-group')!.hasAttribute('data-invalid')).toBe(true);
    host.email.set(true);
    host.error.set(null);
    await fixture.whenStable();
    expect(inputs.some((i) => i.hasAttribute('aria-invalid'))).toBe(false);
  });

  it('disables or locks every checkbox in the group', async () => {
    const { fixture, host, fieldset, inputs } = setup();
    host.disabled.set(true);
    await fixture.whenStable();
    expect(fieldset.disabled).toBe(true);
    expect(inputs.every((i) => i.disabled)).toBe(true);
    host.disabled.set(false);
    host.readonly.set(true);
    await fixture.whenStable();
    expect(inputs.every((i) => i.getAttribute('aria-readonly') === 'true' && !i.disabled)).toBe(true);
    inputs[0].click();
    await fixture.whenStable();
    expect(host.email()).toBe(false);
  });
});
