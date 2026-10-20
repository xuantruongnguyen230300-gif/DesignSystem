import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NxtTooltip } from './tooltip';

@Component({
  imports: [NxtTooltip],
  template: `
    <div (keydown)="containerKeys = containerKeys + 1">
      <button type="button" aria-label="Xuất Excel" nxtTooltip="Xuất Excel">X</button>
      <button type="button" nxtTooltip="Xuất 1.284 nhân viên ra file .xlsx">Xuất</button>
    </div>
  `,
})
class Host {
  containerKeys = 0;
}

describe('NxtTooltip', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const [same, extra] = [...(fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('button')];
    return { fixture, same, extra };
  }

  afterEach(() => document.querySelectorAll('.cdk-overlay-container').forEach((c) => (c.innerHTML = '')));

  it('shows on focus immediately, and the description it points to already has its text', () => {
    const { extra } = setup();
    extra.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    const id = extra.getAttribute('aria-describedby')!;
    expect(id).toBeTruthy();
    const panel = document.getElementById(id)!;
    expect(panel.getAttribute('role')).toBe('tooltip');
    expect(panel.textContent).toContain('Xuất 1.284 nhân viên');
  });

  it('does not repeat the accessible name as a description', () => {
    const { same } = setup();
    same.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    expect(same.hasAttribute('aria-describedby')).toBe(false);
    expect(document.querySelector('[role="tooltip"]')!.textContent).toContain('Xuất Excel');
  });

  it('Escape closes only the tooltip: the event does not reach the surrounding drawer/menu', () => {
    const { fixture, extra } = setup();
    extra.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    extra.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(document.querySelector('[role="tooltip"]')).toBeNull();
    expect(extra.hasAttribute('aria-describedby')).toBe(false);
    expect(fixture.componentInstance.containerKeys).toBe(0);
    // With no tooltip open, Escape goes through as usual.
    extra.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(fixture.componentInstance.containerKeys).toBe(1);
  });
});
