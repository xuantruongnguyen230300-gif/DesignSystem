import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NxtMenu, NxtMenuGroup, NxtMenuItemRadio, NxtMenuLabel } from './menu';

@Component({
  imports: [NxtMenu, NxtMenuGroup, NxtMenuItemRadio, NxtMenuLabel],
  template: `
    <div nxtMenu>
      <div nxtMenuLabel>Mật độ</div>
      <div nxtMenuGroup label="Mật độ">
        @for (d of densities; track d) {
          <button nxtMenuItemRadio [checked]="density() === d" (triggered)="density.set(d)">{{ d }}</button>
        }
      </div>
      <div nxtMenuLabel>Sắp xếp</div>
      <div nxtMenuGroup label="Sắp xếp">
        @for (s of sorts; track s) {
          <button nxtMenuItemRadio [checked]="sort() === s" (triggered)="sort.set(s)">{{ s }}</button>
        }
      </div>
    </div>
  `,
})
class Host {
  readonly densities = ['Gọn', 'Vừa', 'Rộng'];
  readonly sorts = ['Tên', 'Ngày vào làm'];
  readonly density = signal('Vừa');
  readonly sort = signal('Tên');
}

describe('NxtMenu radio groups', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const item = (name: string) => [...el.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]')].find((b) => b.textContent!.trim() === name)!;
    return { fixture, host: fixture.componentInstance, el, item };
  }

  it('exposes named groups of menuitemradio', () => {
    const { el, item } = setup();
    const groups = [...el.querySelectorAll('[role="group"]')];
    expect(groups.map((g) => g.getAttribute('aria-label'))).toEqual(['Mật độ', 'Sắp xếp']);
    expect(item('Vừa').getAttribute('aria-checked')).toBe('true');
    expect(item('Tên').getAttribute('aria-checked')).toBe('true');
  });

  it('choosing in one group does not uncheck the other group', async () => {
    const { fixture, host, item } = setup();
    item('Gọn').click();
    await fixture.whenStable();
    expect(host.density()).toBe('Gọn');
    expect(item('Gọn').getAttribute('aria-checked')).toBe('true');
    expect(item('Vừa').getAttribute('aria-checked')).toBe('false');
    expect(item('Tên').getAttribute('aria-checked')).toBe('true');
  });
});
