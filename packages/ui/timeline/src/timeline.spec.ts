import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NxtIcon } from '@nxt/ui/icon';
import { NxtTimeline, NxtTimelineItem } from './timeline';

@Component({
  imports: [NxtTimeline, NxtTimelineItem],
  template: `
    <nxt-timeline aria-label="Đường đi của đơn nghỉ phép">
      <nxt-timeline-item title="Lê Minh Anh gửi đơn" time="08:15 · 14/10/2026" icon="send" tone="brand" />
      <nxt-timeline-item title="Bước 1 · Trưởng phòng Kế toán" tone="success" />
      <nxt-timeline-item title="Bước 2 · Giám đốc khối" time="Chỉ áp dụng khi số ngày nghỉ > 3" tone="warning" [skipped]="skipped()">Đơn này: 2 ngày</nxt-timeline-item>
      <nxt-timeline-item title="Bước 3 · Phòng Nhân sự" icon="minus" skipped />
    </nxt-timeline>
  `,
})
class Host {
  readonly skipped = signal(true);
}

describe('NxtTimeline', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const items = [...el.querySelectorAll<HTMLElement>('nxt-timeline-item')];
    /** Name of the icon in the marker of item `i`, read from the NxtIcon instance. */
    const markerIcon = (i: number) =>
      fixture.debugElement
        .queryAll(By.directive(NxtIcon))
        .find((d) => items[i].contains(d.nativeElement))
        ?.componentInstance.name() as string | undefined;
    return { fixture, el, items, markerIcon };
  }

  it('is a list of list items with a decorative marker', () => {
    const { el, items } = setup();
    expect(el.querySelector('nxt-timeline')!.getAttribute('role')).toBe('list');
    expect(items).toHaveLength(4);
    for (const item of items) {
      expect(item.getAttribute('role')).toBe('listitem');
      expect(item.querySelector('.nxt-timeline__marker')!.getAttribute('aria-hidden')).toBe('true');
    }
    expect(items[0].dataset['tone']).toBe('brand');
    expect(items[0].hasAttribute('data-skipped')).toBe(false);
    expect(items[0].querySelector('.nxt-timeline__title')!.textContent!.trim()).toBe('Lê Minh Anh gửi đơn');
    // No time → no time line.
    expect(items[1].querySelector('.nxt-timeline__time')).toBeNull();
    // No icon → empty marker.
    expect(items[1].querySelector('.nxt-timeline__marker nxt-icon')).toBeNull();
  });

  it('a skipped step says so in text before its title (the marker is aria-hidden)', () => {
    const { items } = setup();
    const skipped = items[2];
    expect(skipped.hasAttribute('data-skipped')).toBe(true);
    const title = skipped.querySelector('.nxt-timeline__title')!;
    const hidden = title.querySelector('.nxt-timeline__skipped')!;
    expect(hidden.textContent).toBe('Bỏ qua: ');
    expect(title.textContent).toBe('Bỏ qua: Bước 2 · Giám đốc khối');
    expect(skipped.querySelector('.nxt-timeline__time')!.textContent).toBe('Chỉ áp dụng khi số ngày nghỉ > 3');
    // Steps that are not skipped carry no extra text.
    expect(items[1].querySelector('.nxt-timeline__title .nxt-timeline__skipped')).toBeNull();
  });

  it('a skipped step gets the skip icon unless one is given', () => {
    const { items, markerIcon } = setup();
    expect(markerIcon(0)).toBe('send');
    expect(markerIcon(2)).toBe('player-skip-forward');
    expect(markerIcon(3)).toBe('minus');
    expect(items[3].hasAttribute('data-skipped')).toBe(true);
  });

  it('turns skipped off again', async () => {
    const { fixture, items } = setup();
    fixture.componentInstance.skipped.set(false);
    await fixture.whenStable();
    expect(items[2].hasAttribute('data-skipped')).toBe(false);
    expect(items[2].dataset['tone']).toBe('warning');
    expect(items[2].querySelector('.nxt-timeline__title .nxt-timeline__skipped')).toBeNull();
    expect(items[2].querySelector('.nxt-timeline__marker nxt-icon')).toBeNull();
  });
});
