import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { NxtRadio, NxtRadioGroup } from './radio-group';

type Mode = 'office' | 'hybrid' | 'remote';

@Component({
  imports: [NxtRadio, NxtRadioGroup],
  template: `
    <nxt-radio-group label="Hình thức làm việc" hint="Áp dụng từ kỳ lương kế tiếp." [(value)]="mode" [readonly]="readonly()">
      <nxt-radio value="office" label="Tại văn phòng" />
      <nxt-radio value="hybrid" label="Kết hợp" hint="Tối đa 2 ngày làm từ xa mỗi tuần." />
      <nxt-radio value="remote" label="Từ xa" disabled hint="Cần quản lý trực tiếp đề xuất trước." />
    </nxt-radio-group>
    <nxt-radio-group label="Kỳ báo cáo" orientation="horizontal">
      <nxt-radio value="month" label="Tháng" />
      <nxt-radio value="quarter" label="Quý" />
    </nxt-radio-group>
  `,
})
class Host {
  readonly mode = signal<Mode | null>('office');
  readonly readonly = signal(false);
}

describe('NxtRadioGroup', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const groups = [...el.querySelectorAll<HTMLElement>('nxt-radio-group')];
    const radios = (g: number) => [...groups[g].querySelectorAll<HTMLInputElement>('input[type="radio"]')];
    return { fixture, host: fixture.componentInstance, groups, radios };
  }

  it('is a radiogroup named by its legend and described by its hint', () => {
    const { groups } = setup();
    const fieldset = groups[0].querySelector('fieldset')!;
    const legend = fieldset.querySelector('legend')!;
    expect(fieldset.getAttribute('role')).toBe('radiogroup');
    expect(fieldset.firstElementChild).toBe(legend);
    expect(fieldset.getAttribute('aria-labelledby')).toBe(legend.id);
    expect(legend.textContent!.trim()).toBe('Hình thức làm việc');
    expect(fieldset.getAttribute('aria-describedby')).toBe(groups[0].querySelector('.nxt-radio-group__hint')!.id);
  });

  it('gives the radios of one group one shared, unique name (one Tab stop, arrow keys native)', () => {
    const { radios } = setup();
    expect(new Set(radios(0).map((r) => r.name)).size).toBe(1);
    expect(radios(0)[0].name).not.toBe(radios(1)[0].name);
    expect(radios(0).every((r) => r.type === 'radio')).toBe(true);
  });

  it('names each radio by its label and describes it by its own hint', () => {
    const { groups, radios } = setup();
    const hybrid = radios(0)[1];
    expect(hybrid.closest('label')!.textContent!.trim()).toBe('Kết hợp');
    const hint = groups[0].querySelectorAll<HTMLElement>('.nxt-radio__hint')[0];
    expect(hint.textContent).toBe('Tối đa 2 ngày làm từ xa mỗi tuần.');
    expect(hint.closest('label')).toBeNull();
    expect(hybrid.getAttribute('aria-describedby')).toBe(hint.id);
    expect(radios(0)[0].hasAttribute('aria-describedby')).toBe(false);
  });

  it('reflects and updates the value two-way', async () => {
    const { fixture, host, radios } = setup();
    expect(radios(0).map((r) => r.checked)).toEqual([true, false, false]);
    radios(0)[1].click();
    await fixture.whenStable();
    expect(host.mode()).toBe('hybrid');
    host.mode.set('office');
    await fixture.whenStable();
    expect(radios(0).map((r) => r.checked)).toEqual([true, false, false]);
    host.mode.set(null);
    await fixture.whenStable();
    expect(radios(0).some((r) => r.checked)).toBe(false);
  });

  it('disables a single option without disabling the group', () => {
    const { groups, radios } = setup();
    expect(radios(0)[2].disabled).toBe(true);
    expect(radios(0)[0].disabled).toBe(false);
    expect(groups[0].querySelector('fieldset')!.disabled).toBe(false);
  });

  it('readonly: aria-readonly on the group; click and arrow keys change nothing; still focusable', async () => {
    const { fixture, host, groups, radios } = setup();
    host.readonly.set(true);
    await fixture.whenStable();
    const fieldset = groups[0].querySelector('fieldset')!;
    expect(fieldset.getAttribute('aria-readonly')).toBe('true');
    expect(groups[0].hasAttribute('data-readonly')).toBe(true);
    // A cancelled click is undone by the browser (the classic "return false" read-only radio).
    const click = new MouseEvent('click', { bubbles: true, cancelable: true });
    radios(0)[1].dispatchEvent(click);
    await fixture.whenStable();
    expect(click.defaultPrevented).toBe(true);
    expect(host.mode()).toBe('office');
    expect(radios(0)[1].checked).toBe(false);
    const arrow = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true });
    radios(0)[0].dispatchEvent(arrow);
    expect(arrow.defaultPrevented).toBe(true);
    radios(0)[0].focus();
    expect(document.activeElement).toBe(radios(0)[0]);
    host.readonly.set(false);
    await fixture.whenStable();
    const free = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true });
    radios(0)[0].dispatchEvent(free);
    expect(free.defaultPrevented).toBe(false);
  });

  it('reflects orientation for layout', () => {
    const { groups } = setup();
    expect(groups[0].getAttribute('data-orientation')).toBe('vertical');
    expect(groups[1].getAttribute('data-orientation')).toBe('horizontal');
  });
});

@Component({
  imports: [NxtRadio, NxtRadioGroup, ReactiveFormsModule],
  template: `
    <nxt-radio-group label="Giới tính" required [formControl]="gender" [error]="error()">
      <nxt-radio value="nam" label="Nam" />
      <nxt-radio value="nu" label="Nữ" />
      <nxt-radio value="khac" label="Khác" />
    </nxt-radio-group>
    <button type="button">Sau</button>
  `,
})
class Forms {
  readonly gender = new FormControl<string | null>(null, Validators.required);
  readonly error = signal<string | null>(null);
}

describe('NxtRadioGroup with Angular forms', () => {
  function setup() {
    const fixture = TestBed.createComponent(Forms);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const fieldset = el.querySelector('fieldset')!;
    const radios = [...el.querySelectorAll<HTMLInputElement>('input[type="radio"]')];
    return { fixture, host: fixture.componentInstance, el, fieldset, radios };
  }

  it('required: * hidden from screen readers, aria-required on the group; no option pre-selected', () => {
    const { fieldset, radios } = setup();
    expect(fieldset.getAttribute('aria-required')).toBe('true');
    expect(fieldset.querySelector('legend [aria-hidden="true"]')!.textContent).toBe('*');
    expect(radios.some((r) => r.checked)).toBe(false);
  });

  it('writes, reads, disables and marks touched through the form control', async () => {
    const { fixture, host, el, radios } = setup();
    host.gender.setValue('nu');
    await fixture.whenStable();
    expect(radios[1].checked).toBe(true);
    radios[2].click();
    expect(host.gender.value).toBe('khac');
    expect(host.gender.touched).toBe(false);
    radios[2].focus();
    radios[2].dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: el.querySelector('button') }));
    expect(host.gender.touched).toBe(true);
    host.gender.disable();
    await fixture.whenStable();
    expect(el.querySelector('fieldset')!.disabled).toBe(true);
    expect(radios.every((r) => r.matches(':disabled'))).toBe(true);
  });

  it('stays true to the value when a form reverts the user choice before the next render', async () => {
    const { fixture, host, radios } = setup();
    host.gender.setValue('nam');
    await fixture.whenStable();
    const sub = host.gender.valueChanges.subscribe((v) => v === 'khac' && host.gender.setValue('nam'));
    radios[2].click();
    await fixture.whenStable();
    sub.unsubscribe();
    expect(host.gender.value).toBe('nam');
    expect(radios.map((r) => r.checked)).toEqual([true, false, false]);
  });

  it('shows one error below the group: aria-invalid on the group, described by the error, ring on every radio', async () => {
    const { fixture, host, el, fieldset } = setup();
    host.error.set('Chọn giới tính.');
    await fixture.whenStable();
    const error = fieldset.querySelector('.nxt-radio-group__error')!;
    expect(fieldset.lastElementChild).toBe(error);
    expect(error.querySelector('nxt-icon')).not.toBeNull();
    expect(error.textContent).toContain('Chọn giới tính.');
    expect(fieldset.getAttribute('aria-invalid')).toBe('true');
    expect(fieldset.getAttribute('aria-describedby')).toBe(error.id);
    expect(el.querySelector('nxt-radio-group')!.hasAttribute('data-invalid')).toBe(true);
    host.error.set(null);
    await fixture.whenStable();
    expect(fieldset.hasAttribute('aria-invalid')).toBe(false);
    expect(fieldset.hasAttribute('aria-describedby')).toBe(false);
  });
});
