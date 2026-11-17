import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
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

  it('shows the error above the hint (both describe the control), sets aria-invalid, and clears it when fixed', async () => {
    const { fixture, host, fields } = setup();
    const input = fields[0].querySelector('input')!;
    host.error.set('Email chưa đúng định dạng, ví dụ ten@congty.vn.');
    await fixture.whenStable();
    const error = fields[0].querySelector('.nxt-form-field__error')!;
    const hint = fields[0].querySelector('.nxt-form-field__hint')!;
    expect(error.textContent).toContain('Email chưa đúng định dạng');
    // The hint stays: the user keeps the format guidance right when it is needed.
    expect(hint).not.toBeNull();
    expect(error.compareDocumentPosition(hint) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe(`${error.id} ${hint.id}`);
    expect(fields[0].querySelector('.nxt-form-field__control')!.getAttribute('data-status')).toBe('error');
    host.error.set(null);
    await fixture.whenStable();
    expect(input.hasAttribute('aria-invalid')).toBe(false);
    expect(fields[0].querySelector('.nxt-form-field__message')).toBeNull();
    expect(input.getAttribute('aria-describedby')).toBe(hint.id);
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

@Component({
  imports: [NxtFormField, NxtInput],
  template: `
    <nxt-form-field
      label="Lương cơ bản"
      [error]="error()"
      [warning]="warning()"
      [info]="info()"
      [success]="success()"
      [statusLabels]="labels()"
    >
      <input nxtInput numeric inputmode="numeric" />
    </nxt-form-field>
  `,
})
class States {
  readonly error = signal<string | null>(null);
  readonly warning = signal<string | null>(null);
  readonly info = signal<string | null>(null);
  readonly success = signal<string | null>(null);
  readonly labels = signal({});
}

describe('NxtFormField value states', () => {
  function setup() {
    const fixture = TestBed.createComponent(States);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const control = () => el.querySelector<HTMLElement>('.nxt-form-field__control')!;
    const message = () => el.querySelector<HTMLElement>('.nxt-form-field__message');
    const input = el.querySelector('input')!;
    return { fixture, host: fixture.componentInstance, control, message, input };
  }

  it('shows one state at a time: error > warning > info > success', async () => {
    const { fixture, host, control, message, input } = setup();
    expect(control().hasAttribute('data-status')).toBe(false);
    host.success.set('Đã đối chiếu với bảng lương tháng 10.');
    await fixture.whenStable();
    expect(control().getAttribute('data-status')).toBe('success');
    host.info.set('Lấy theo hợp đồng HĐ-2026-0142.');
    await fixture.whenStable();
    expect(control().getAttribute('data-status')).toBe('info');
    expect(message()!.textContent).toContain('HĐ-2026-0142');
    host.warning.set('Thấp hơn mức lương tối thiểu vùng I.');
    await fixture.whenStable();
    expect(control().getAttribute('data-status')).toBe('warning');
    expect(input.hasAttribute('aria-invalid')).toBe(false);
    host.error.set('Nhập lương cơ bản.');
    await fixture.whenStable();
    expect(control().getAttribute('data-status')).toBe('error');
    expect(control().hasAttribute('data-invalid')).toBe(true);
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(message()!.textContent).toContain('Nhập lương cơ bản.');
    expect(fixture.nativeElement.querySelectorAll('.nxt-form-field__message')).toHaveLength(1);
    expect(input.getAttribute('aria-describedby')).toBe(message()!.id);
  });

  it('every message has an icon; non-error ones start with a hidden status word that can be translated', async () => {
    const { fixture, host, message } = setup();
    host.warning.set('Ngày 02/09/2026 là ngày lễ.');
    await fixture.whenStable();
    expect(message()!.querySelector('nxt-icon')).not.toBeNull();
    expect(message()!.querySelector('.nxt-visually-hidden')!.textContent).toBe('Cảnh báo: ');
    host.labels.set({ warning: 'Warning' });
    await fixture.whenStable();
    expect(message()!.querySelector('.nxt-visually-hidden')!.textContent).toBe('Warning: ');
    host.warning.set(null);
    host.error.set('Nhập ngày nghỉ.');
    await fixture.whenStable();
    expect(message()!.querySelector('.nxt-visually-hidden')).toBeNull();
    expect(message()!.querySelector('nxt-icon')).not.toBeNull();
  });

  it('numeric controls are flagged for end alignment with tabular figures', () => {
    const { input } = setup();
    expect(input.hasAttribute('data-numeric')).toBe(true);
  });
});

@Component({
  imports: [NxtFormField, NxtInput],
  template: `
    <nxt-form-field label="Mã nhân viên" hint="Do hệ thống cấp.">
      <input nxtInput id="ma-nv" aria-describedby="ma-nv-note" />
    </nxt-form-field>
    <p id="ma-nv-note">Không đổi được sau khi tạo hồ sơ.</p>
    <input nxtInput class="lone" />
  `,
})
class OwnIds {}

describe('NxtInput keeps the ids written by the app', () => {
  it('uses a static id for the label and appends static aria-describedby ids after the field ones', () => {
    const fixture = TestBed.createComponent(OwnIds);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const input = el.querySelector<HTMLInputElement>('#ma-nv')!;
    expect(input).not.toBeNull();
    expect(el.querySelector('label')!.htmlFor).toBe('ma-nv');
    const hint = el.querySelector('.nxt-form-field__hint')!;
    expect(input.getAttribute('aria-describedby')).toBe(`${hint.id} ma-nv-note`);
  });

  it('gives no id at all to an nxtInput outside a field', () => {
    const fixture = TestBed.createComponent(OwnIds);
    fixture.detectChanges();
    const lone = (fixture.nativeElement as HTMLElement).querySelector('.lone')!;
    expect(lone.hasAttribute('id')).toBe(false);
  });
});

@Component({
  imports: [NxtFormField, NxtInput, ReactiveFormsModule],
  template: `
    <nxt-form-field label="Mã chức danh" required [readonly]="readonly()">
      <input nxtInput [formControl]="code" />
    </nxt-form-field>
    <nxt-form-field label="Phòng ban" [readonly]="readonly()">
      <select nxtInput [formControl]="dept">
        <option value="kt">Kế toán</option>
        <option value="ns">Nhân sự</option>
      </select>
    </nxt-form-field>
    <nxt-form-field label="Số hợp đồng">
      <input nxtInput [readOnly]="true" />
    </nxt-form-field>
  `,
})
class ReadOnly {
  readonly readonly = signal(true);
  readonly code = new FormControl('KT-TH', { nonNullable: true });
  readonly dept = new FormControl('kt', { nonNullable: true });
}

describe('NxtFormField readonly', () => {
  function setup() {
    const fixture = TestBed.createComponent(ReadOnly);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const fields = [...el.querySelectorAll<HTMLElement>('nxt-form-field')];
    return { fixture, host: fixture.componentInstance, fields };
  }

  it('makes an input natively read-only (focusable, not editable) and drops the required mark', async () => {
    const { fixture, host, fields } = setup();
    const input = fields[0].querySelector('input')!;
    expect(input.readOnly).toBe(true);
    expect(fields[0].hasAttribute('data-readonly')).toBe(true);
    expect(fields[0].querySelector('.nxt-form-field__control')!.hasAttribute('data-readonly')).toBe(true);
    expect(fields[0].querySelector('.nxt-form-field__required')).toBeNull();
    expect(input.hasAttribute('aria-required')).toBe(false);
    expect(input.disabled).toBe(false);
    input.focus();
    expect(document.activeElement).toBe(input);
    host.readonly.set(false);
    await fixture.whenStable();
    expect(input.readOnly).toBe(false);
    expect(fields[0].querySelector('.nxt-form-field__required')).not.toBeNull();
    expect(input.getAttribute('aria-required')).toBe('true');
  });

  it('keeps a select focusable, marks it aria-readonly, hides the chevron and blocks keys/clicks that change it', async () => {
    const { fixture, host, fields } = setup();
    const select = fields[1].querySelector('select')!;
    expect(select.getAttribute('aria-readonly')).toBe('true');
    expect(select.disabled).toBe(false);
    expect(fields[1].querySelector('.nxt-form-field__chevron')).toBeNull();
    const key = (k: string, init: KeyboardEventInit = {}) => {
      const e = new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...init });
      select.dispatchEvent(e);
      return e.defaultPrevented;
    };
    expect(key('ArrowDown')).toBe(true);
    expect(key('ArrowDown', { altKey: true })).toBe(true);
    expect(key(' ')).toBe(true);
    expect(key('n')).toBe(true);
    expect(key('Tab')).toBe(false);
    expect(key('r', { ctrlKey: true })).toBe(false);
    const down = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
    select.dispatchEvent(down);
    expect(down.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(select);
    host.readonly.set(false);
    await fixture.whenStable();
    expect(select.hasAttribute('aria-readonly')).toBe(false);
    expect(key('ArrowDown')).toBe(false);
    expect(fields[1].querySelector('.nxt-form-field__chevron')).not.toBeNull();
  });

  it('never removes a readonly the app bound on the control itself', async () => {
    const { fixture, host, fields } = setup();
    const own = fields[2].querySelector('input')!;
    expect(own.readOnly).toBe(true);
    host.readonly.set(false);
    await fixture.whenStable();
    expect(own.readOnly).toBe(true);
  });
});

@Component({
  imports: [NxtFormField, NxtInput, ReactiveFormsModule],
  template: `
    <nxt-form-field label="Lý do" hint="Người duyệt sẽ đọc lý do này." counter [counterText]="text">
      <textarea nxtInput maxlength="500" [formControl]="reason"></textarea>
    </nxt-form-field>
    <nxt-form-field label="Ghi chú" counter>
      <textarea nxtInput></textarea>
    </nxt-form-field>
  `,
})
class Counter {
  readonly reason = new FormControl('Nghỉ phép năm', { nonNullable: true });
  readonly text = (count: number, max: number) => `${count} of ${max} characters`;
}

describe('NxtFormField counter', () => {
  it('counts characters against maxlength, follows the value and describes the control', async () => {
    const fixture = TestBed.createComponent(Counter);
    fixture.detectChanges();
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    const [withMax, withoutMax] = [...el.querySelectorAll<HTMLElement>('nxt-form-field')];
    const counter = () => withMax.querySelector<HTMLElement>('.nxt-form-field__counter')!;
    expect(counter().querySelector('[aria-hidden="true"]')!.textContent).toBe('13/500');
    expect(counter().querySelector('.nxt-visually-hidden')!.textContent).toBe('13 of 500 characters');
    const textarea = withMax.querySelector('textarea')!;
    const hint = withMax.querySelector('.nxt-form-field__hint')!;
    expect(textarea.getAttribute('aria-describedby')).toBe(`${hint.id} ${counter().id}`);
    textarea.value = 'Nghỉ phép năm 2026';
    textarea.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(counter().querySelector('[aria-hidden="true"]')!.textContent).toBe('18/500');
    fixture.componentInstance.reason.setValue('');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(counter().querySelector('[aria-hidden="true"]')!.textContent).toBe('0/500');
    // No maxlength → nothing to count against.
    expect(withoutMax.querySelector('.nxt-form-field__counter')).toBeNull();
  });
});
