import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NxtFormField } from '@nxt/ui/form-field';
import { NxtCombobox, NxtComboboxOption, nxtHighlight } from './combobox';

const DEPTS: NxtComboboxOption[] = [
  { key: 'KT', label: 'Phòng Kế toán', description: 'KT01', group: 'Khối Văn phòng' },
  { key: 'NS', label: 'Phòng Nhân sự', description: 'NS01', group: 'Khối Văn phòng' },
  { key: 'PC', label: 'Phòng Pháp chế', description: 'PC01', group: 'Khối Văn phòng' },
  { key: 'KD', label: 'Phòng Kinh doanh', description: 'KD01', group: 'Khối Kinh doanh' },
  { key: 'MK', label: 'Phòng Marketing', description: 'MK01', group: 'Khối Kinh doanh' },
  { key: 'CN', label: 'Phòng Công nghệ thông tin', description: 'IT01', group: 'Khối Kỹ thuật' },
];

const SKILLS: NxtComboboxOption[] = ['Angular', 'C#', 'Docker', 'Java', 'Kế toán thuế', 'Kotlin', 'Python', 'SQL Server', 'Tiếng Anh', 'Tiếng Nhật', 'TypeScript', 'Vue'].map(
  (label) => ({ key: label.toLowerCase(), label }),
);

const KEY_CODES: Record<string, number> = {
  ArrowDown: 40,
  ArrowUp: 38,
  ArrowLeft: 37,
  ArrowRight: 39,
  PageDown: 34,
  PageUp: 33,
  Enter: 13,
  Escape: 27,
  Tab: 9,
  Backspace: 8,
  Delete: 46,
};

function key(el: Element, k: string, init: KeyboardEventInit = {}): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key: k, keyCode: KEY_CODES[k], bubbles: true, cancelable: true, ...init });
  el.dispatchEvent(event);
  return event;
}

@Component({
  imports: [NxtCombobox, NxtFormField, ReactiveFormsModule],
  template: `
    <div (keydown)="outer.push($event.key)">
      <nxt-form-field label="Phòng ban" hint="Gõ tên hoặc mã phòng ban">
        <nxt-combobox
          [options]="options()"
          [formControl]="dept"
          [searchMode]="mode()"
          [loading]="loading()"
          [readonly]="readonly()"
          [debounce]="debounce()"
          clearable
          valueHelp
          placeholder="Chọn phòng ban"
          (query)="queries.push($event)"
          (valueHelpRequested)="helps.push($event)"
        />
      </nxt-form-field>
    </div>
  `,
})
class SingleHost {
  readonly options = signal<NxtComboboxOption[]>(DEPTS);
  readonly mode = signal<'local' | 'server'>('local');
  readonly loading = signal(false);
  readonly readonly = signal(false);
  readonly debounce = signal(0);
  readonly dept = new FormControl<string | null>(null);
  readonly queries: string[] = [];
  readonly helps: string[] = [];
  readonly outer: string[] = [];
}

@Component({
  imports: [NxtCombobox, NxtFormField, ReactiveFormsModule],
  template: `
    <nxt-form-field label="Kỹ năng">
      <nxt-combobox multiple [options]="options" [formControl]="skills" />
    </nxt-form-field>
  `,
})
class MultiHost {
  readonly options = SKILLS;
  readonly skills = new FormControl<string[]>(['angular', 'docker']);
}

@Component({
  imports: [NxtCombobox],
  template: `
    <div role="dialog" aria-modal="true"><nxt-combobox label="Chi nhánh" [options]="options" [(value)]="branch" /></div>
  `,
})
class StandaloneHost {
  readonly options: NxtComboboxOption[] = [
    { key: 'HN', label: 'Hà Nội' },
    { key: 'HCM', label: 'TP. Hồ Chí Minh' },
  ];
  readonly branch = signal<string | null>('HN');
}

async function settle(fixture: ComponentFixture<unknown>) {
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
}

const listbox = () => document.querySelector<HTMLElement>('[role="listbox"]');
const options = () => [...document.querySelectorAll<HTMLElement>('[role="option"]')];
const optionText = (o: HTMLElement) => o.querySelector('.nxt-combobox__option-label')!.textContent!.trim();
const activeOption = (input: HTMLInputElement) => {
  const id = input.getAttribute('aria-activedescendant');
  return id ? document.getElementById(id) : null;
};

afterEach(() => document.querySelectorAll('.cdk-overlay-container').forEach((c) => (c.innerHTML = '')));

describe('nxtHighlight', () => {
  it('marks every word of the query, ignoring case and diacritics', () => {
    // Words match anywhere, like nxtMatches: "an" also marks the end of "Văn".
    expect(nxtHighlight('Nguyễn Văn An', 'nguyen an')).toEqual([
      { text: 'Nguyễn', match: true },
      { text: ' V', match: false },
      { text: 'ăn', match: true },
      { text: ' ', match: false },
      { text: 'An', match: true },
    ]);
    expect(nxtHighlight('Phòng Kế toán', 'ke to')).toEqual([
      { text: 'Phòng ', match: false },
      { text: 'Kế', match: true },
      { text: ' ', match: false },
      { text: 'to', match: true },
      { text: 'án', match: false },
    ]);
  });

  it('returns the whole text unmarked for an empty query', () => {
    expect(nxtHighlight('Đặng Minh Khoa', '  ')).toEqual([{ text: 'Đặng Minh Khoa', match: false }]);
  });
});

describe('NxtCombobox (single)', () => {
  function setup() {
    const fixture = TestBed.createComponent(SingleHost);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const input = el.querySelector<HTMLInputElement>('input[role="combobox"]')!;
    const type = async (text: string) => {
      input.focus();
      input.value = text;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await settle(fixture);
    };
    return { fixture, host: fixture.componentInstance, el, input, type, settle: () => settle(fixture) };
  }

  it('is a named combobox wired to the form field, closed at rest', () => {
    const { el, input } = setup();
    const label = el.querySelector('label')!;
    expect(label.getAttribute('for')).toBe(input.id);
    expect(input.getAttribute('aria-describedby')).toContain('-hint');
    expect(input.getAttribute('aria-autocomplete')).toBe('list');
    expect(input.getAttribute('aria-haspopup')).toBe('listbox');
    expect(input.getAttribute('aria-expanded')).toBe('false');
    expect(input.hasAttribute('aria-controls')).toBe(false);
    expect(input.hasAttribute('aria-activedescendant')).toBe(false);
    expect(listbox()).toBeNull();
    // Buttons: open list and clear stay out of the Tab order; value help is a Tab stop with a name.
    expect(el.querySelector('.nxt-combobox__toggle')!.getAttribute('tabindex')).toBe('-1');
    const help = el.querySelector<HTMLButtonElement>('.nxt-combobox__help')!;
    expect(help.getAttribute('aria-label')).toBe('Mở danh sách đầy đủ');
    expect(help.hasAttribute('tabindex')).toBe(false);
  });

  it('typing opens the list, filters without diacritics and highlights the first match', async () => {
    const { input, type } = setup();
    await type('phong doanh');
    expect(options().map(optionText)).toEqual(['Phòng Kinh doanh']);
    await type('phong t');
    expect(input.getAttribute('aria-expanded')).toBe('true');
    expect(input.getAttribute('aria-controls')).toBe(listbox()!.id);
    expect(options().map(optionText)).toEqual(['Phòng Kế toán', 'Phòng Marketing', 'Phòng Công nghệ thông tin']);
    expect(activeOption(input)).toBe(options()[0]);
    expect(options()[0].getAttribute('aria-selected')).toBe('true');
    expect(options()[1].getAttribute('aria-selected')).toBe('false');
    // The matching part is marked (bolder), also in the code.
    expect(options()[0].querySelector('.nxt-combobox__match')!.textContent).toBe('Phòng');
    await type('it01');
    expect(options().map(optionText)).toEqual(['Phòng Công nghệ thông tin']);
  });

  it('groups choices with a labelled role="group"', async () => {
    const { input, settle } = setup();
    key(input, 'ArrowDown');
    await settle();
    const groups = [...listbox()!.querySelectorAll('[role="group"]')];
    expect(groups.length).toBe(3);
    const heading = document.getElementById(groups[0].getAttribute('aria-labelledby')!)!;
    expect(heading.textContent!.trim()).toBe('Khối Văn phòng');
    expect(heading.getAttribute('role')).toBe('presentation');
    expect(listbox()!.getAttribute('aria-label')).toBe('Phòng ban');
  });

  it('ArrowDown opens on the chosen (or first) choice, then moves down and wraps', async () => {
    const { host, input, settle } = setup();
    host.dept.setValue('MK');
    await settle();
    key(input, 'ArrowDown');
    await settle();
    expect(optionText(activeOption(input)!)).toBe('Phòng Marketing');
    key(input, 'ArrowDown');
    await settle();
    expect(optionText(activeOption(input)!)).toBe('Phòng Công nghệ thông tin');
    key(input, 'ArrowDown');
    await settle();
    expect(optionText(activeOption(input)!)).toBe('Phòng Kế toán');
  });

  it('ArrowUp opens on the last choice, then moves up', async () => {
    const { input, settle } = setup();
    key(input, 'ArrowUp');
    await settle();
    expect(optionText(activeOption(input)!)).toBe('Phòng Công nghệ thông tin');
    key(input, 'ArrowUp');
    await settle();
    expect(optionText(activeOption(input)!)).toBe('Phòng Marketing');
  });

  it('Alt+ArrowDown opens without moving the highlight; Alt+ArrowUp closes without choosing', async () => {
    const { host, input, settle } = setup();
    key(input, 'ArrowDown', { altKey: true });
    await settle();
    expect(input.getAttribute('aria-expanded')).toBe('true');
    expect(input.hasAttribute('aria-activedescendant')).toBe(false);
    key(input, 'ArrowDown');
    await settle();
    key(input, 'ArrowUp', { altKey: true });
    await settle();
    expect(input.getAttribute('aria-expanded')).toBe('false');
    expect(host.dept.value).toBeNull();
  });

  it('PageDown / PageUp move the highlight by ten', async () => {
    const { host, input, settle } = setup();
    host.options.set(SKILLS);
    await settle();
    key(input, 'ArrowDown');
    await settle();
    key(input, 'PageDown');
    await settle();
    expect(optionText(activeOption(input)!)).toBe('TypeScript');
    key(input, 'PageUp');
    await settle();
    expect(optionText(activeOption(input)!)).toBe('Angular');
  });

  it('Enter chooses the highlighted choice, shows its label and closes', async () => {
    const { host, input, type, settle } = setup();
    await type('nhan su');
    key(input, 'Enter');
    await settle();
    expect(host.dept.value).toBe('NS');
    expect(input.value).toBe('Phòng Nhân sự');
    expect(input.getAttribute('aria-expanded')).toBe('false');
  });

  it('Escape closes the list first and is not passed on; a second Escape clears the text and the value', async () => {
    const { host, input, settle } = setup();
    host.dept.setValue('KT');
    await settle();
    key(input, 'ArrowDown');
    await settle();
    const first = key(input, 'Escape');
    await settle();
    expect(input.getAttribute('aria-expanded')).toBe('false');
    expect(first.defaultPrevented).toBe(true);
    expect(host.outer).not.toContain('Escape');
    key(input, 'Escape');
    await settle();
    expect(input.value).toBe('');
    expect(host.dept.value).toBeNull();
    expect(host.outer).not.toContain('Escape');
    // Empty and closed: Escape is left for the drawer / dialog around.
    const third = key(input, 'Escape');
    expect(third.defaultPrevented).toBe(false);
    expect(host.outer).toContain('Escape');
  });

  it('Enter on a closed list commits the typed text like leaving the box, and does not block form submit', async () => {
    const { host, input, type, settle } = setup();
    await type('kt01');
    key(input, 'Escape');
    await settle();
    expect(input.getAttribute('aria-expanded')).toBe('false');
    const enter = key(input, 'Enter');
    await settle();
    expect(host.dept.value).toBe('KT');
    expect(input.value).toBe('Phòng Kế toán');
    expect(enter.defaultPrevented).toBe(false);
  });

  it('Tab chooses the highlighted choice (APG)', async () => {
    const { host, input, type } = setup();
    await type('marke');
    key(input, 'Tab');
    expect(host.dept.value).toBe('MK');
  });

  it('blocks typed values: unmatched text goes back to the label, an exact label or code is picked, empty clears', async () => {
    const { host, input, type, settle } = setup();
    host.dept.setValue('KT');
    await settle();
    expect(input.value).toBe('Phòng Kế toán');
    await type('Phòng Tài vụ');
    input.dispatchEvent(new Event('blur'));
    await settle();
    expect(input.value).toBe('Phòng Kế toán');
    expect(host.dept.value).toBe('KT');
    await type('pc01');
    input.dispatchEvent(new Event('blur'));
    await settle();
    expect(host.dept.value).toBe('PC');
    expect(input.value).toBe('Phòng Pháp chế');
    await type('');
    input.dispatchEvent(new Event('blur'));
    await settle();
    expect(host.dept.value).toBeNull();
    expect(host.dept.touched).toBe(true);
  });

  it('clicking a choice chooses it; the clear button empties the value', async () => {
    const { host, el, input, settle } = setup();
    input.click();
    await settle();
    options()[3].click();
    await settle();
    expect(host.dept.value).toBe('KD');
    el.querySelector<HTMLButtonElement>('.nxt-combobox__clear')!.click();
    await settle();
    expect(host.dept.value).toBeNull();
    expect(input.value).toBe('');
  });

  it('shows "Không có kết quả phù hợp" and announces it', async () => {
    const { input, type } = setup();
    const announce = vi.spyOn(TestBed.inject(LiveAnnouncer), 'announce').mockResolvedValue();
    await type('phong xyz');
    expect(options().length).toBe(0);
    expect(document.querySelector('.nxt-combobox__message')!.textContent).toContain('Không có kết quả phù hợp');
    expect(announce).toHaveBeenCalledWith('Không có kết quả phù hợp', 'polite');
    expect(input.hasAttribute('aria-activedescendant')).toBe(false);
  });

  it('loading: message and aria-busy on the list', async () => {
    const { host, input, settle } = setup();
    host.loading.set(true);
    await settle();
    key(input, 'ArrowDown', { altKey: true });
    await settle();
    expect(listbox()!.getAttribute('aria-busy')).toBe('true');
    expect(document.querySelector('.nxt-combobox__message')!.textContent).toContain('Đang tải…');
  });

  it('server mode: no local filtering; query is emitted on open and while typing', async () => {
    const { host, input, type, settle } = setup();
    host.mode.set('server');
    await settle();
    input.click();
    await settle();
    expect(host.queries).toEqual(['']);
    await type('zzz');
    expect(host.queries).toEqual(['', 'zzz']);
    expect(options().length).toBe(DEPTS.length);
  });

  it('debounces query while typing', async () => {
    const { host, type, settle } = setup();
    host.debounce.set(300);
    await settle();
    await type('ke');
    await type('ke t');
    const typed = host.queries.filter((q) => q);
    expect(typed).toEqual([]);
    await new Promise((r) => setTimeout(r, 400));
    expect(host.queries.filter((q) => q)).toEqual(['ke t']);
  });

  it('value help button carries the text the user typed', async () => {
    const { host, el, input, type, settle } = setup();
    await type('cong nghe');
    input.dispatchEvent(new Event('blur'));
    await settle();
    el.querySelector<HTMLButtonElement>('.nxt-combobox__help')!.click();
    expect(host.helps).toEqual(['cong nghe']);
  });

  it('works with FormControl: value shows its label, disabled, touched', async () => {
    const { host, el, input, settle } = setup();
    host.dept.setValue('CN');
    await settle();
    expect(input.value).toBe('Phòng Công nghệ thông tin');
    host.dept.disable();
    await settle();
    expect(input.disabled).toBe(true);
    expect(el.querySelector('.nxt-combobox__toggle')).toBeNull();
    input.click();
    await settle();
    expect(listbox()).toBeNull();
  });

  it('read-only: focusable, does not open, no buttons', async () => {
    const { host, el, input, settle } = setup();
    host.readonly.set(true);
    await settle();
    expect(input.readOnly).toBe(true);
    expect(el.querySelector('.nxt-combobox__toggle')).toBeNull();
    input.click();
    key(input, 'ArrowDown');
    await settle();
    expect(listbox()).toBeNull();
  });
});

describe('NxtCombobox (multiple)', () => {
  function setup() {
    const fixture = TestBed.createComponent(MultiHost);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const input = el.querySelector<HTMLInputElement>('input[role="combobox"]')!;
    const tokens = () => [...el.querySelectorAll<HTMLElement>('.nxt-combobox__token')].map((t) => t.textContent!.trim());
    const removeButtons = () => [...el.querySelectorAll<HTMLButtonElement>('.nxt-combobox__token-remove')];
    const announce = vi.spyOn(TestBed.inject(LiveAnnouncer), 'announce').mockResolvedValue();
    const type = async (text: string) => {
      input.focus();
      input.value = text;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await settle(fixture);
    };
    return { fixture, host: fixture.componentInstance, el, input, tokens, removeButtons, announce, type, settle: () => settle(fixture) };
  }

  it('shows the values as a named list of tokens with named remove buttons', () => {
    const { el, tokens, removeButtons } = setup();
    expect(tokens()).toEqual(['Angular', 'Docker']);
    expect(el.querySelector('.nxt-combobox__tokens')!.getAttribute('aria-label')).toBe('Đã chọn');
    expect(removeButtons().map((b) => b.getAttribute('aria-label'))).toEqual(['Bỏ Angular', 'Bỏ Docker']);
    expect(removeButtons().every((b) => b.getAttribute('tabindex') === '-1')).toBe(true);
  });

  it('multi-selectable listbox: chosen choices have aria-selected="true"', async () => {
    const { input, settle } = setup();
    key(input, 'ArrowDown');
    await settle();
    expect(listbox()!.getAttribute('aria-multiselectable')).toBe('true');
    const selected = options().filter((o) => o.getAttribute('aria-selected') === 'true').map(optionText);
    expect(selected).toEqual(['Angular', 'Docker']);
  });

  it('Enter toggles the highlighted choice, clears the typed text and keeps the list open', async () => {
    const { host, input, tokens, announce, type, settle } = setup();
    await type('tieng nhat');
    key(input, 'Enter');
    await settle();
    expect(host.skills.value).toEqual(['angular', 'docker', 'tiếng nhật']);
    expect(tokens()).toEqual(['Angular', 'Docker', 'Tiếng Nhật']);
    expect(input.value).toBe('');
    expect(input.getAttribute('aria-expanded')).toBe('true');
    expect(optionText(activeOption(input)!)).toBe('Tiếng Nhật');
    expect(announce).toHaveBeenCalledWith('Đã thêm Tiếng Nhật', 'polite');
    key(input, 'Enter');
    await settle();
    expect(host.skills.value).toEqual(['angular', 'docker']);
    expect(announce).toHaveBeenCalledWith('Đã bỏ Tiếng Nhật', 'polite');
  });

  it('Tab leaves without choosing', async () => {
    const { host, input, type } = setup();
    await type('java');
    key(input, 'Tab');
    expect(host.skills.value).toEqual(['angular', 'docker']);
  });

  it('Backspace in the empty box removes the last token', async () => {
    const { host, input, tokens, settle } = setup();
    input.focus();
    key(input, 'Backspace');
    await settle();
    expect(host.skills.value).toEqual(['angular']);
    expect(tokens()).toEqual(['Angular']);
    expect(document.activeElement).toBe(input);
  });

  it('ArrowLeft from the empty box reaches the tokens; Left/Right move between them; Right on the last returns to the box', async () => {
    const { input, removeButtons, settle } = setup();
    input.focus();
    key(input, 'ArrowLeft');
    expect(document.activeElement).toBe(removeButtons()[1]);
    key(removeButtons()[1], 'ArrowLeft');
    expect(document.activeElement).toBe(removeButtons()[0]);
    key(removeButtons()[0], 'ArrowLeft');
    expect(document.activeElement).toBe(removeButtons()[0]);
    key(removeButtons()[0], 'ArrowRight');
    expect(document.activeElement).toBe(removeButtons()[1]);
    key(removeButtons()[1], 'ArrowRight');
    await settle();
    expect(document.activeElement).toBe(input);
  });

  it('Delete on a token removes it and focuses the next token (or the box)', async () => {
    const { host, removeButtons, settle } = setup();
    removeButtons()[0].focus();
    key(removeButtons()[0], 'Delete');
    await settle();
    expect(host.skills.value).toEqual(['docker']);
    expect(document.activeElement).toBe(removeButtons()[0]);
    key(removeButtons()[0], 'Delete');
    await settle();
    expect(host.skills.value).toEqual([]);
    expect(document.activeElement!.getAttribute('role')).toBe('combobox');
  });

  it('Backspace on a token removes it and focuses the previous token', async () => {
    const { host, removeButtons, announce, settle } = setup();
    removeButtons()[1].focus();
    key(removeButtons()[1], 'Backspace');
    await settle();
    expect(host.skills.value).toEqual(['angular']);
    expect(document.activeElement).toBe(removeButtons()[0]);
    expect(announce).toHaveBeenCalledWith('Đã bỏ Docker', 'polite');
  });

  it('Enter / Space on a token (native button) removes it', async () => {
    const { host, removeButtons, settle } = setup();
    removeButtons()[0].focus();
    removeButtons()[0].dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 0 }));
    await settle();
    expect(host.skills.value).toEqual(['docker']);
    expect(document.activeElement).toBe(removeButtons()[0]);
  });

  it('leaving the box drops unfinished text; tokens are what is kept', async () => {
    const { host, input, type, settle } = setup();
    await type('pyth');
    input.dispatchEvent(new Event('blur'));
    await settle();
    expect(input.value).toBe('');
    expect(host.skills.value).toEqual(['angular', 'docker']);
    expect(host.skills.touched).toBe(true);
  });

  it('disabled from the form: no remove buttons', async () => {
    const { host, removeButtons, input, settle } = setup();
    host.skills.disable();
    await settle();
    expect(removeButtons().length).toBe(0);
    expect(input.disabled).toBe(true);
  });
});

describe('NxtCombobox (standalone)', () => {
  it('draws its own frame, is named by `label`, two-way binds `value`, and is owned by a modal while open', async () => {
    const fixture = TestBed.createComponent(StandaloneHost);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const host = el.querySelector('nxt-combobox')!;
    const input = el.querySelector<HTMLInputElement>('input')!;
    expect(host.hasAttribute('data-framed')).toBe(true);
    expect(input.getAttribute('aria-label')).toBe('Chi nhánh');
    expect(input.value).toBe('Hà Nội');
    key(input, 'ArrowDown');
    await settle(fixture);
    const modal = el.querySelector('[aria-modal="true"]')!;
    const popup = document.querySelector('.nxt-combobox__popup')!;
    expect(modal.getAttribute('aria-owns')).toBe(popup.id);
    key(input, 'ArrowDown');
    key(input, 'Enter');
    await settle(fixture);
    expect(fixture.componentInstance.branch()).toBe('HCM');
    expect(modal.hasAttribute('aria-owns')).toBe(false);
  });
});
