import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { NxtCard, NxtCardState, NxtStat } from './card';

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

// ---------- overview-page card: link, counter, states (2026-11-06) ----------

@Component({ template: '' })
class Blank {}

@Component({
  imports: [NxtCard, NxtStat],
  template: `
    <nxt-card
      id="list"
      title="Đơn chờ duyệt"
      subtitle="Sắp xếp theo hạn duyệt"
      link="/don-tu"
      [queryParams]="{ 'trang-thai': 'cho-duyet' }"
      [count]="count()"
      [total]="total()"
      [state]="state()"
      viewAllLabel="Xem tất cả 12 đơn"
      emptyText="Không có đơn chờ duyệt"
    >
      <ul>
        <li>Lê Minh Anh</li>
      </ul>
      <button nxtCardStateAction type="button">Thử lại</button>
    </nxt-card>
    <nxt-card id="kpi" title="Tổng nhân sự" subtitle="Tháng 10/2026 | người" link="/nhan-vien" clickable>
      <span nxtCardStatus>Ổn định</span>
      <nxt-stat nxtCardKpi value="1.284" delta="2,1%" trend="up" caption="so với tháng 9" />
    </nxt-card>
    <nxt-card id="plain" title="Thông tin hợp đồng">Nội dung</nxt-card>
  `,
})
class OverviewHost {
  readonly count = signal<number | undefined>(5);
  readonly total = signal<number | undefined>(12);
  readonly state = signal<NxtCardState>('ready');
}

describe('NxtCard (overview page)', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([{ path: '**', component: Blank }])] });
  });

  function setup() {
    const fixture = TestBed.createComponent(OverviewHost);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const card = (id: string) => el.querySelector<HTMLElement>(`#${id}`)!;
    return { fixture, el, card, host: fixture.componentInstance };
  }

  it('link: a "Xem tất cả" footer link to the pre-filtered list, named with the card title', () => {
    const { card } = setup();
    const link = card('list').querySelector<HTMLAnchorElement>('.nxt-card__footer a')!;
    expect(link.getAttribute('href')).toBe('/don-tu?trang-thai=cho-duyet');
    expect(link.textContent!.trim()).toBe('Xem tất cả 12 đơn');
    const [textId, headingId] = link.getAttribute('aria-labelledby')!.split(' ');
    expect(card('list').querySelector(`#${textId}`)!.textContent).toBe('Xem tất cả 12 đơn');
    expect(headingId).toBe(card('list').querySelector('h2')!.id);
    // Not clickable: the title stays a plain heading.
    expect(card('list').querySelector('h2 a')).toBeNull();
    expect(card('list').hasAttribute('data-clickable')).toBe(false);
  });

  it('no link: no footer link', () => {
    const { card } = setup();
    expect(card('plain').querySelector('.nxt-card__footer')).toBeNull();
    expect(card('plain').querySelector('a')).toBeNull();
  });

  it('clickable: one link inside the heading, described by subtitle, status and KPI; no footer link', () => {
    const { card } = setup();
    const kpi = card('kpi');
    expect(kpi.getAttribute('data-clickable')).toBe('true');
    const links = kpi.querySelectorAll('a');
    expect(links.length).toBe(1);
    const link = links[0];
    expect(link.parentElement!.tagName).toBe('H2');
    expect(link.textContent!.trim()).toBe('Tổng nhân sự');
    expect(link.getAttribute('href')).toBe('/nhan-vien');
    const described = link
      .getAttribute('aria-describedby')!
      .split(' ')
      .map((id) => kpi.querySelector(`#${id}`)!.textContent!.trim());
    expect(described[0]).toBe('Tháng 10/2026 | người');
    expect(described[1]).toBe('Ổn định');
    expect(described[2]).toContain('1.284');
    expect(kpi.querySelector('.nxt-card__footer')).toBeNull();
  });

  it('Enter on the focused title link activates it and the router navigates', async () => {
    const { card, fixture } = setup();
    const router = TestBed.inject(Router);
    const link = card('kpi').querySelector('a')!;
    link.focus();
    expect(document.activeElement).toBe(link);
    // The browser turns Enter on a focused link into a click; jsdom does not, so the click is dispatched here.
    link.click();
    await fixture.whenStable();
    expect(router.url).toBe('/nhan-vien');
  });

  it('counter: "5/12" with full hidden text, hidden when everything is shown', async () => {
    const { card, host, fixture } = setup();
    const count = () => card('list').querySelector<HTMLElement>('.nxt-card__count');
    expect(count()!.querySelector('[aria-hidden="true"]')!.textContent).toBe('5/12');
    expect(count()!.querySelector('.nxt-visually-hidden')!.textContent).toBe('Hiển thị 5 trên 12 mục');
    host.total.set(1240);
    await fixture.whenStable();
    expect(count()!.querySelector('[aria-hidden="true"]')!.textContent).toBe('5/1.240');
    host.count.set(1240);
    await fixture.whenStable();
    expect(count()).toBeNull();
    host.count.set(undefined);
    await fixture.whenStable();
    expect(count()).toBeNull();
  });

  it('loading: aria-busy, skeleton and hidden text; body, counter and state action hidden', async () => {
    const { card, host, fixture } = setup();
    host.state.set('loading');
    await fixture.whenStable();
    const list = card('list');
    expect(list.getAttribute('aria-busy')).toBe('true');
    expect(list.dataset['state']).toBe('loading');
    expect(list.querySelector<HTMLElement>('.nxt-card__body')!.hidden).toBe(true);
    expect(list.querySelector('.nxt-card__skeleton')!.getAttribute('aria-hidden')).toBe('true');
    expect(list.querySelector('.nxt-card__state .nxt-visually-hidden')!.textContent).toBe('Đang tải dữ liệu');
    expect(list.querySelector('.nxt-card__count')).toBeNull();
    expect(list.querySelector('.nxt-card__state [nxtCardStateAction]')).toBeNull();
    // The destination list can still be opened.
    expect(list.querySelector('.nxt-card__footer a')).not.toBeNull();
  });

  it('loading hides the KPI of a numeric header', async () => {
    @Component({
      imports: [NxtCard, NxtStat],
      template: `<nxt-card title="Tổng nhân sự" state="loading"><nxt-stat nxtCardKpi value="1.284" /></nxt-card>`,
    })
    class LoadingKpiHost {}
    const fixture = TestBed.createComponent(LoadingKpiHost);
    fixture.detectChanges();
    const kpi = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('.nxt-card__kpi')!;
    expect(kpi.hidden).toBe(true);
  });

  it('empty: message and state action; counter and footer link hidden', async () => {
    const { card, host, fixture } = setup();
    host.state.set('empty');
    await fixture.whenStable();
    const list = card('list');
    expect(list.hasAttribute('aria-busy')).toBe(false);
    expect(list.querySelector('.nxt-card__message')!.textContent!.trim()).toBe('Không có đơn chờ duyệt');
    expect(list.querySelector('.nxt-card__state-action [nxtCardStateAction]')).not.toBeNull();
    expect(list.querySelector('.nxt-card__count')).toBeNull();
    expect(list.querySelector('.nxt-card__footer')).toBeNull();
  });

  it('error: default message, state action, footer link kept; ready again shows the body', async () => {
    const { card, host, fixture } = setup();
    host.state.set('error');
    await fixture.whenStable();
    const list = card('list');
    expect(list.querySelector('.nxt-card__state')!.getAttribute('data-state')).toBe('error');
    expect(list.querySelector('.nxt-card__message')!.textContent!.trim()).toBe('Không tải được dữ liệu. Hãy thử lại sau.');
    expect(list.querySelector('.nxt-card__state [nxtCardStateAction]')!.textContent).toBe('Thử lại');
    expect(list.querySelector('.nxt-card__footer a')).not.toBeNull();
    host.state.set('ready');
    await fixture.whenStable();
    expect(list.querySelector<HTMLElement>('.nxt-card__body')!.hidden).toBe(false);
    expect(list.querySelector('.nxt-card__state')).toBeNull();
  });
});

@Component({
  imports: [NxtCard],
  template: `<nxt-card title="Đơn chờ duyệt" link="/don-tu" clickable><button type="button">Duyệt</button></nxt-card>`,
})
class NestedHost {}

@Component({ imports: [NxtCard], template: `<nxt-card title="Tổng nhân sự" clickable>1.284</nxt-card>` })
class NoLinkHost {}

describe('NxtCard clickable guard', () => {
  it('warns in dev mode when a clickable card contains another interactive element', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const fixture = TestBed.createComponent(NestedHost);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0][0])).toContain('clickable');
    warn.mockRestore();
  });

  it('clickable without link is not clickable (no link, no data-clickable)', () => {
    const fixture = TestBed.createComponent(NoLinkHost);
    fixture.detectChanges();
    const card = (fixture.nativeElement as HTMLElement).querySelector('nxt-card')!;
    expect(card.hasAttribute('data-clickable')).toBe(false);
    expect(card.querySelector('a')).toBeNull();
  });
});

@Component({
  imports: [NxtStat],
  template: `<nxt-stat value="96,4" unit="%" delta="0,8 điểm" trend="down" deltaTone="negative" />`,
})
class StatNoLabelHost {}

describe('NxtStat without label', () => {
  it('renders no label element (the card title names the metric)', () => {
    const fixture = TestBed.createComponent(StatNoLabelHost);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.nxt-stat__label')).toBeNull();
    expect(el.querySelector('.nxt-stat__value')!.textContent).toContain('96,4');
  });
});
