import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NxtSegmented, NxtSegmentedOption } from './segmented';

type Theme = 'light' | 'dark' | 'auto';

@Component({
  imports: [NxtSegmented],
  template: `
    <nxt-segmented label="Chế độ màu" iconOnly [options]="options" [(value)]="theme" />
    <nxt-segmented label="Kỳ báo cáo" [options]="periods" value="month" />
  `,
})
class Host {
  readonly theme = signal<Theme>('light');
  readonly options: NxtSegmentedOption<Theme>[] = [
    { value: 'light', label: 'Giao diện sáng', icon: 'sun' },
    { value: 'dark', label: 'Giao diện tối', icon: 'moon' },
    { value: 'auto', label: 'Theo hệ thống', icon: 'device-desktop' },
  ];
  readonly periods: NxtSegmentedOption[] = [
    { value: 'month', label: 'Tháng' },
    { value: 'quarter', label: 'Quý' },
  ];
}

describe('NxtSegmented', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const groups = [...el.querySelectorAll<HTMLElement>('nxt-segmented')];
    const radios = (g: number) => [...groups[g].querySelectorAll<HTMLInputElement>('input[type="radio"]')];
    return { fixture, host: fixture.componentInstance, groups, radios };
  }

  it('is a radio group named by a legend', () => {
    const { groups, radios } = setup();
    expect(groups[0].querySelector('fieldset > legend')!.textContent).toContain('Chế độ màu');
    expect(radios(0)).toHaveLength(3);
    const names = new Set(radios(0).map((r) => r.name));
    expect(names.size).toBe(1);
    expect(radios(1)[0].name).not.toBe(radios(0)[0].name);
  });

  it('reflects and updates the value', async () => {
    const { fixture, host, radios } = setup();
    expect(radios(0).map((r) => r.checked)).toEqual([true, false, false]);
    radios(0)[1].click();
    await fixture.whenStable();
    expect(host.theme()).toBe('dark');
    host.theme.set('auto');
    await fixture.whenStable();
    expect(radios(0)[2].checked).toBe(true);
  });

  it('hides the legend visually by default', () => {
    const { groups } = setup();
    for (const g of groups) {
      expect(g.querySelector('legend')!.classList).toContain('nxt-visually-hidden');
      expect(g.hasAttribute('data-show-label')).toBe(false);
    }
  });

  it('icon-only keeps every option named (labels visually hidden, not removed)', () => {
    const { groups, radios } = setup();
    expect(groups[0].hasAttribute('data-icon-only')).toBe(true);
    const label = radios(0)[0].closest('label')!;
    const text = label.querySelector('.nxt-visually-hidden')!;
    expect(text.textContent).toBe('Giao diện sáng');
    expect(label.querySelector('nxt-icon')).not.toBeNull();
    expect(groups[1].querySelector('.nxt-visually-hidden:not(legend)')).toBeNull();
  });
});

@Component({
  imports: [NxtSegmented],
  template: `<nxt-segmented label="Cách duyệt" showLabel [options]="modes" [(value)]="mode" />`,
})
class Labelled {
  readonly mode = signal<'any' | 'all'>('any');
  readonly modes: NxtSegmentedOption<'any' | 'all'>[] = [
    { value: 'any', label: 'Một người duyệt là đủ' },
    { value: 'all', label: 'Tất cả cùng duyệt' },
  ];
}

describe('NxtSegmented showLabel', () => {
  it('shows the legend itself as the visible label: one name, no second label element', () => {
    const fixture = TestBed.createComponent(Labelled);
    fixture.detectChanges();
    const host = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('nxt-segmented')!;
    expect(host.hasAttribute('data-show-label')).toBe(true);
    const legends = host.querySelectorAll('legend');
    expect(legends).toHaveLength(1);
    // It stays the fieldset's first child, so it keeps naming the radio group.
    expect(host.querySelector('fieldset')!.firstElementChild).toBe(legends[0]);
    expect(legends[0].classList).not.toContain('nxt-visually-hidden');
    expect(legends[0].textContent).toBe('Cách duyệt');
    // The only other text is the option labels: the group name is not repeated anywhere.
    expect(host.textContent!.match(/Cách duyệt/g)).toHaveLength(1);
    expect(host.querySelectorAll('[aria-hidden="true"]:not(svg)')).toHaveLength(0);
    expect(host.querySelectorAll('.nxt-segmented__track input[type="radio"]')).toHaveLength(2);
  });
});
