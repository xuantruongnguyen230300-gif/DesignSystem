import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NxtDescription, NxtDescriptions } from './descriptions';

@Component({
  imports: [NxtDescriptions, NxtDescription],
  template: `
    <dl nxtDescriptions [columns]="columns()">
      <div nxtDescription label="Mã">KT-TH</div>
      <div nxtDescription label="Tên">Kế toán tổng hợp</div>
      <div nxtDescription label="Mô tả" full>Lập báo cáo tài chính hằng tháng.</div>
    </dl>
  `,
})
class Host {
  readonly columns = signal<'auto' | 1 | 2 | 3>('auto');
}

describe('NxtDescriptions', () => {
  it('renders a valid description list: dl > div > dt + dd', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const dl = (fixture.nativeElement as HTMLElement).querySelector('dl')!;
    const items = [...dl.children];
    expect(items.map((i) => i.tagName)).toEqual(['DIV', 'DIV', 'DIV']);
    for (const item of items) expect([...item.children].map((c) => c.tagName)).toEqual(['DT', 'DD']);
    expect(items[0].querySelector('dt')!.textContent).toBe('Mã');
    expect(items[0].querySelector('dd')!.textContent).toContain('KT-TH');
  });

  it('spans a full row and switches column count', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const dl = (fixture.nativeElement as HTMLElement).querySelector('dl')!;
    expect(dl.children[2].hasAttribute('data-full')).toBe(true);
    expect(dl.children[0].hasAttribute('data-full')).toBe(false);
    expect(dl.dataset['columns']).toBe('auto');
    fixture.componentInstance.columns.set(2);
    await fixture.whenStable();
    expect(dl.dataset['columns']).toBe('2');
  });
});
