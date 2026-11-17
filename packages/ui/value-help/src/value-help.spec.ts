import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NxtValueHelp, NxtValueHelpColumn } from './value-help';

interface Employee {
  code: string;
  name: string;
  dept: string;
  title: string;
}

const EMPLOYEES: Employee[] = [
  { code: 'NV-0012', name: 'Nguyễn Văn An', dept: 'Phòng Kế toán', title: 'Kế toán tổng hợp' },
  { code: 'NV-0045', name: 'Nguyễn Văn An', dept: 'Kho hàng', title: 'Thủ kho' },
  { code: 'NV-0027', name: 'Trần Thị Bích Ngọc', dept: 'Phòng Nhân sự', title: 'Chuyên viên tuyển dụng' },
  { code: 'NV-0031', name: 'Lê Hoàng Phúc', dept: 'Phòng Công nghệ', title: 'Lập trình viên' },
  { code: 'NV-0068', name: 'Đặng Minh Khoa', dept: 'Phòng Pháp chế', title: 'Chuyên viên pháp chế' },
];

const COLUMNS: NxtValueHelpColumn<Employee>[] = [
  { id: 'code', header: 'Mã NV', value: (e) => e.code },
  { id: 'name', header: 'Họ và tên', value: (e) => e.name, rowHeader: true },
  { id: 'dept', header: 'Phòng ban', value: (e) => e.dept },
  { id: 'title', header: 'Chức danh', value: (e) => e.title },
];

@Component({
  imports: [NxtValueHelp],
  template: `
    <div (keydown)="outer.push($event.key)">
      <nxt-value-help
        caption="Nhân viên"
        [items]="items()"
        [columns]="columns"
        [itemKey]="key"
        [itemLabel]="label"
        [multiple]="multiple()"
        [step]="step()"
        [loading]="loading()"
        [limit]="limit()"
        [(value)]="value"
        [(values)]="values"
        [(query)]="query"
        hint="Chỉ hiện nhân viên đang làm việc"
        (picked)="picked.push($event.code)"
        (cancelled)="cancelled = cancelled + 1"
      />
    </div>
  `,
})
class Host {
  readonly items = signal<Employee[]>(EMPLOYEES);
  readonly columns = COLUMNS;
  readonly key = (e: Employee) => e.code;
  readonly label = (e: Employee) => `${e.name} (${e.code})`;
  readonly multiple = signal(false);
  readonly step = signal(false);
  readonly loading = signal(false);
  readonly limit = signal(200);
  readonly value = signal<string | null>('NV-0027');
  readonly values = signal<string[]>([]);
  readonly query = signal('');
  readonly picked: string[] = [];
  readonly outer: string[] = [];
  cancelled = 0;
}

function key(el: Element, k: string, init: KeyboardEventInit = {}): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...init });
  el.dispatchEvent(event);
  return event;
}

describe('NxtValueHelp', () => {
  async function setup(configure: (h: Host) => void = () => {}) {
    const fixture: ComponentFixture<Host> = TestBed.createComponent(Host);
    configure(fixture.componentInstance);
    fixture.detectChanges();
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    const settle = async () => {
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
    };
    const search = el.querySelector<HTMLInputElement>('input[type="search"]')!;
    const rows = () => [...el.querySelectorAll<HTMLTableRowElement>('tbody tr[data-row]')];
    const names = () => rows().map((r) => r.querySelector('th')!.textContent!.trim());
    const type = async (text: string) => {
      search.value = text;
      search.dispatchEvent(new Event('input', { bubbles: true }));
      await settle();
    };
    const summary = () => el.querySelector('.nxt-value-help__summary')!.textContent!.trim();
    return { fixture, host: fixture.componentInstance, el, search, rows, names, type, summary, settle };
  }

  it('has a named search box, a status line and a named native table with row headers', async () => {
    const { el, summary, rows } = await setup();
    expect(el.querySelector('label')!.textContent).toContain('Tìm kiếm');
    expect(el.querySelector('.nxt-value-help__summary')!.getAttribute('role')).toBe('status');
    expect(summary()).toBe('5 kết quả');
    expect(el.querySelector('table')!.getAttribute('aria-label')).toBe('Nhân viên');
    expect(el.querySelector('nxt-table-scroll')!.getAttribute('aria-label')).toBe('Nhân viên');
    expect([...el.querySelectorAll('thead th')].map((th) => th.textContent!.trim())).toEqual(['Mã NV', 'Họ và tên', 'Phòng ban', 'Chức danh']);
    expect(rows()[0].querySelector('th')!.getAttribute('scope')).toBe('row');
    expect(el.querySelector('.nxt-value-help__hint')!.textContent).toContain('Chỉ hiện nhân viên đang làm việc');
  });

  it('searches every column without diacritics and marks the match', async () => {
    const { names, type, summary, rows } = await setup();
    await type('kho');
    expect(names()).toEqual(['Nguyễn Văn An', 'Đặng Minh Khoa']);
    expect(summary()).toBe('2 kết quả');
    await type('an ke toan');
    expect(names()).toEqual(['Nguyễn Văn An']);
    expect(rows()[0].querySelector('.nxt-value-help__match')).not.toBeNull();
  });

  it('single: the name is a "Chọn …" button; picking sets value and emits picked; the current value is aria-current', async () => {
    const { host, rows, settle } = await setup();
    const current = rows()[2];
    expect(current.getAttribute('aria-current')).toBe('true');
    expect(rows()[0].hasAttribute('aria-current')).toBe(false);
    const button = rows()[1].querySelector<HTMLButtonElement>('.nxt-value-help__pick')!;
    expect(button.getAttribute('aria-label')).toBe('Chọn Nguyễn Văn An (NV-0045)');
    button.click();
    await settle();
    expect(host.value()).toBe('NV-0045');
    expect(host.picked).toEqual(['NV-0045']);
    // A click elsewhere on the row picks it too.
    rows()[3].querySelector('td')!.click();
    expect(host.picked).toEqual(['NV-0045', 'NV-0031']);
  });

  it('Enter in the search box picks the only result', async () => {
    const { host, search, type } = await setup();
    await type('khoa');
    key(search, 'Enter');
    expect(host.picked).toEqual(['NV-0068']);
  });

  it('ArrowDown from the search reaches the first row; Down / Up / Home / End move between rows; Up on the first row returns to the search', async () => {
    const { rows, search } = await setup();
    const control = (i: number) => rows()[i].querySelector<HTMLElement>('.nxt-value-help__pick')!;
    search.focus();
    key(search, 'ArrowDown');
    expect(document.activeElement).toBe(control(0));
    key(control(0), 'ArrowDown');
    expect(document.activeElement).toBe(control(1));
    key(control(1), 'End');
    expect(document.activeElement).toBe(control(4));
    key(control(4), 'Home');
    expect(document.activeElement).toBe(control(0));
    key(control(0), 'ArrowUp');
    expect(document.activeElement).toBe(search);
  });

  it('multiple: checkboxes, "Đã chọn: N", Shift range, select all shown, clear', async () => {
    const { host, el, rows, settle } = await setup((h) => h.multiple.set(true));
    const box = (i: number) => rows()[i].querySelector<HTMLInputElement>('input[type="checkbox"]')!;
    expect(rows()[0].querySelector('td label')!.textContent).toContain('Chọn Nguyễn Văn An (NV-0012)');
    expect(rows()[0].querySelector('.nxt-value-help__pick')).toBeNull();
    box(0).click();
    await settle();
    expect(host.values()).toEqual(['NV-0012']);
    expect(rows()[0].getAttribute('aria-selected')).toBe('true');
    expect(el.querySelector('.nxt-value-help__selection [role="status"]')!.textContent).toBe('Đã chọn: 1');
    // Shift + click on the 4th row selects rows 1–4.
    box(3).dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, shiftKey: true }));
    box(3).click();
    await settle();
    expect(host.values()).toEqual(['NV-0012', 'NV-0045', 'NV-0027', 'NV-0031']);
    // A click on the row (not the box) toggles it.
    rows()[4].querySelector('td:last-child')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await settle();
    expect(host.values()).toContain('NV-0068');
    const all = el.querySelector<HTMLInputElement>('thead input[type="checkbox"]')!;
    expect(all.checked).toBe(true);
    all.click();
    await settle();
    expect(host.values()).toEqual([]);
    box(2).click();
    await settle();
    expect(all.indeterminate).toBe(true);
    const clear = [...el.querySelectorAll('button')].find((b) => b.textContent!.trim() === 'Bỏ chọn tất cả')!;
    clear.click();
    await settle();
    expect(host.values()).toEqual([]);
    expect(document.activeElement).toBe(el.querySelector('input[type="search"]'));
  });

  it('limit: shows the first rows and asks to type more', async () => {
    const { names, summary } = await setup((h) => h.limit.set(2));
    expect(names().length).toBe(2);
    expect(summary()).toBe('Hiện 2 / 5 kết quả. Gõ thêm để thu hẹp.');
  });

  it('no result: empty state with "Xoá tìm kiếm" that clears the search and refocuses it', async () => {
    const { host, el, type, summary, settle, rows } = await setup();
    await type('zzz');
    expect(rows().length).toBe(0);
    expect(summary()).toBe('Không có kết quả');
    expect(el.querySelector('.nxt-empty-state__title')!.textContent).toContain('Không có kết quả khớp “zzz”');
    const clear = [...el.querySelectorAll('button')].find((b) => b.textContent!.trim() === 'Xoá tìm kiếm')!;
    clear.click();
    await settle();
    expect(host.query()).toBe('');
    expect(rows().length).toBe(5);
    expect(document.activeElement).toBe(el.querySelector('input[type="search"]'));
  });

  it('loading: aria-busy table, placeholder rows before the first results, "Đang tải…"', async () => {
    const { el, summary } = await setup((h) => {
      h.loading.set(true);
      h.items.set([]);
    });
    expect(el.querySelector('table')!.getAttribute('aria-busy')).toBe('true');
    expect(el.querySelector('tbody[nxtTablePlaceholder]')).not.toBeNull();
    expect(el.querySelector('.nxt-empty-state')).toBeNull();
    expect(summary()).toBe('Đang tải…');
  });

  it('step: focuses the search; Escape with an empty search emits cancelled and does not reach the drawer', async () => {
    const { host, search, type } = await setup((h) => h.step.set(true));
    expect(document.activeElement).toBe(search);
    await type('an');
    key(search, 'Escape');
    expect(host.cancelled).toBe(0);
    expect(host.query()).toBe('');
    key(search, 'Escape');
    expect(host.cancelled).toBe(1);
    expect(host.outer).not.toContain('Escape');
  });

  it('without step, Escape is left for the dialog around', async () => {
    const { host, search } = await setup();
    key(search, 'Escape');
    expect(host.cancelled).toBe(0);
    expect(host.outer).toContain('Escape');
  });
});
