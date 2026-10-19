import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NxtCard, NxtStat } from './card';

@Component({
  imports: [NxtCard],
  template: `
    <nxt-card #contracts title="Hợp đồng sắp hết hạn" subtitle="Trong 30 ngày tới · 4 hợp đồng" [headingLevel]="level()" padding="none">
      <div class="scroll" role="region" tabindex="0" [attr.aria-labelledby]="contracts.headingId">Bảng hợp đồng</div>
    </nxt-card>
    <nxt-card title="Đơn chờ duyệt" region>12 đơn</nxt-card>
    <nxt-card region>Không có tiêu đề</nxt-card>
    <nxt-card role="note" aria-labelledby="note-title"><p id="note-title">Ghi chú</p></nxt-card>
  `,
})
class Host {
  readonly level = signal(2);
}

describe('NxtCard', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const cards = [...el.querySelectorAll<HTMLElement>('nxt-card')];
    return { fixture, el, cards };
  }

  it('gives the title a stable id that content inside can point to', async () => {
    const { fixture, el, cards } = setup();
    const h2 = cards[0].querySelector('h2')!;
    expect(h2.id).toMatch(/^nxt-card-\d+-title$/);
    expect(el.querySelector('.scroll')!.getAttribute('aria-labelledby')).toBe(h2.id);
    // Same id at every heading level.
    fixture.componentInstance.level.set(3);
    await fixture.whenStable();
    expect(cards[0].querySelector('h3')!.id).toBe(h2.id);
    fixture.componentInstance.level.set(4);
    await fixture.whenStable();
    expect(cards[0].querySelector('h4')!.id).toBe(h2.id);
  });

  it('every card has its own heading id', () => {
    const { cards } = setup();
    expect(cards[0].querySelector('h2')!.id).not.toBe(cards[1].querySelector('h2')!.id);
  });

  it('has no role by default', () => {
    const { cards } = setup();
    expect(cards[0].hasAttribute('role')).toBe(false);
    expect(cards[0].hasAttribute('aria-labelledby')).toBe(false);
    expect(cards[0].hasAttribute('title')).toBe(false);
  });

  it('region: a landmark named by its title', () => {
    const { cards } = setup();
    expect(cards[1].getAttribute('role')).toBe('region');
    expect(cards[1].getAttribute('aria-labelledby')).toBe(cards[1].querySelector('h2')!.id);
  });

  it('region without a title is not a landmark (it would have no name)', () => {
    const { cards } = setup();
    expect(cards[2].hasAttribute('role')).toBe(false);
    expect(cards[2].hasAttribute('aria-labelledby')).toBe(false);
  });

  it('keeps a role and aria-labelledby written on the host', () => {
    const { cards } = setup();
    expect(cards[3].getAttribute('role')).toBe('note');
    expect(cards[3].getAttribute('aria-labelledby')).toBe('note-title');
  });
});

@Component({
  imports: [NxtStat],
  template: `<nxt-stat label="Tỷ lệ nghỉ việc" value="1,8" unit="%" delta="0,4 điểm" trend="down" deltaTone="positive" caption="so với tháng 9" />`,
})
class StatHost {}

describe('NxtStat', () => {
  it('says the trend in words, not only with colour and icon', () => {
    const fixture = TestBed.createComponent(StatHost);
    fixture.detectChanges();
    const delta = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('.nxt-stat__delta')!;
    expect(delta.dataset['tone']).toBe('positive');
    expect(delta.querySelector('.nxt-visually-hidden')!.textContent).toBe('Giảm');
    expect(delta.textContent).toContain('0,4 điểm');
  });
});
