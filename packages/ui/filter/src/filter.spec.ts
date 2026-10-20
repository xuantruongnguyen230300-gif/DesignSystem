import { Component, computed } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NxtFilter, NxtFilterChip, NxtFilterChips, NxtFilterState } from './filter';

describe('NxtFilterState', () => {
  it('edits a draft and only applies it on apply()', () => {
    const f = new NxtFilterState({ status: 'all', groups: [] as string[] });
    expect(f.activeCount()).toBe(0);
    f.edit();
    f.set('status', 'inactive');
    f.toggle('groups', 'Quản lý', true);
    f.toggle('groups', 'Hỗ trợ', true);
    f.toggle('groups', 'Quản lý', false);
    expect(f.applied().status).toBe('all');
    f.apply();
    expect(f.applied()).toEqual({ status: 'inactive', groups: ['Hỗ trợ'] });
    expect(f.activeCount()).toBe(2);
    expect(f.isActive('groups')).toBe(true);
  });

  it('reset only touches the draft; clear and clearAll touch what is applied', () => {
    const f = new NxtFilterState({ status: 'all', groups: [] as string[] });
    f.set('status', 'active');
    f.set('groups', ['Chuyên môn']);
    f.apply();
    f.resetDraft();
    expect(f.draft()).toEqual(f.defaults);
    expect(f.activeCount()).toBe(2);
    f.clear('status');
    expect(f.activeCount()).toBe(1);
    f.clearAll();
    expect(f.activeCount()).toBe(0);
  });
});

@Component({
  imports: [NxtFilter, NxtFilterChips],
  template: `
    <nxt-filter #filter title="Lọc chức danh" [activeCount]="state.activeCount()" (opened)="state.edit()" (applied)="state.apply()" (reset)="state.resetDraft()">
      <label><input type="checkbox" class="inactive" [checked]="state.draft().status === 'inactive'" (change)="state.set('status', $any($event.target).checked ? 'inactive' : 'all')" /> Ngừng sử dụng</label>
    </nxt-filter>
    <!-- As pages use it: the chips are removed together with the last criterion. -->
    @if (chips().length) {
      <nxt-filter-chips [chips]="chips()" [returnFocusTo]="filter" (remove)="state.clear($any($event))" (clearAll)="state.clearAll()" />
    }
  `,
})
class Host {
  readonly state = new NxtFilterState({ status: 'all', groups: [] as string[] });
  readonly chips = computed<NxtFilterChip[]>(() => [
    ...(this.state.isActive('status') ? [{ key: 'status', label: 'Trạng thái: Ngừng sử dụng' }] : []),
    ...(this.state.isActive('groups') ? [{ key: 'groups', label: `Nhóm: ${this.state.applied().groups.join(', ')}` }] : []),
  ]);
}

describe('NxtFilter + NxtFilterChips', () => {
  afterEach(() => document.querySelectorAll('.cdk-overlay-container').forEach((c) => (c.innerHTML = '')));

  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const trigger = el.querySelector<HTMLButtonElement>('.nxt-filter__trigger')!;
    const panel = () => document.querySelector<HTMLElement>('.nxt-filter__panel');
    const button = (name: string) => [...panel()!.querySelectorAll('button')].find((b) => b.textContent!.trim() === name)!;
    const stable = async () => {
      await fixture.whenStable();
      await new Promise((r) => setTimeout(r));
    };
    return { fixture, host: fixture.componentInstance, el, trigger, panel, button, stable };
  }

  it('the button opens a named dialog panel with the projected fields', async () => {
    const { trigger, panel, stable } = setup();
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    trigger.click();
    await stable();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    const dialog = panel()!.closest('[role="dialog"]')!;
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(document.getElementById(dialog.getAttribute('aria-labelledby')!)!.textContent).toBe('Lọc chức danh');
    expect(panel()!.querySelector('input.inactive')).not.toBeNull();
  });

  it('applies on "Áp dụng": count on the button and a chip appear', async () => {
    const { host, el, trigger, panel, button, stable } = setup();
    trigger.click();
    await stable();
    panel()!.querySelector<HTMLInputElement>('input.inactive')!.click();
    expect(host.state.activeCount()).toBe(0);
    button('Áp dụng').click();
    await stable();
    expect(panel()).toBeNull();
    expect(host.state.activeCount()).toBe(1);
    expect(trigger.hasAttribute('data-active')).toBe(true);
    expect(trigger.textContent).toContain('đang áp dụng 1');
    const chip = el.querySelector<HTMLButtonElement>('.nxt-filter-chip')!;
    expect(chip.getAttribute('aria-label')).toBe('Bỏ lọc Trạng thái: Ngừng sử dụng');
    expect(el.querySelector('[role="group"]')!.getAttribute('aria-label')).toBe('Bộ lọc đang áp dụng');
  });

  it('"Huỷ" closes without applying, and the draft restarts from what is applied next time', async () => {
    const { host, trigger, panel, button, stable } = setup();
    trigger.click();
    await stable();
    panel()!.querySelector<HTMLInputElement>('input.inactive')!.click();
    button('Huỷ').click();
    await stable();
    expect(panel()).toBeNull();
    expect(host.state.activeCount()).toBe(0);
    trigger.click();
    await stable();
    expect(panel()!.querySelector<HTMLInputElement>('input.inactive')!.checked).toBe(false);
  });

  it('Enter in the panel applies (it is a form)', async () => {
    const { host, trigger, panel, stable } = setup();
    trigger.click();
    await stable();
    panel()!.querySelector<HTMLInputElement>('input.inactive')!.click();
    panel()!.dispatchEvent(new Event('submit', { cancelable: true }));
    await stable();
    expect(host.state.activeCount()).toBe(1);
  });

  it('removing the last chip returns focus to the filter button', async () => {
    const { fixture, host, el, trigger, stable } = setup();
    host.state.set('status', 'inactive');
    host.state.apply();
    await stable();
    el.querySelector<HTMLButtonElement>('.nxt-filter-chip')!.click();
    await stable();
    fixture.detectChanges();
    await stable();
    expect(host.state.activeCount()).toBe(0);
    expect(el.querySelector('.nxt-filter-chip')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });
});

describe('NxtFilterChips clear all', () => {
  it('"Xoá bộ lọc" clears everything and returns focus to the filter button', async () => {
    const fixture = TestBed.createComponent(Host);
    const host = fixture.componentInstance;
    host.state.set('status', 'inactive');
    host.state.set('groups', ['Quản lý']);
    host.state.apply();
    fixture.detectChanges();
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelectorAll('.nxt-filter-chip').length).toBe(2);
    el.querySelector<HTMLButtonElement>('.nxt-filter-chips__clear')!.click();
    await fixture.whenStable();
    expect(host.state.activeCount()).toBe(0);
    expect(el.querySelector('nxt-filter-chips')).toBeNull();
    expect(document.activeElement).toBe(el.querySelector('.nxt-filter__trigger'));
  });
});
