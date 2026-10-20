import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Nxt{{Name}} } from './{{name}}';

@Component({
  imports: [Nxt{{Name}}],
  template: `<{{tag}} [disabled]="disabled()">Label</{{tagClose}}>`,
})
class Host {
  readonly disabled = signal(false);
}

describe('Nxt{{Name}}', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement.querySelector('.nxt-{{name}}');
    return { fixture, el };
  }

  it('renders projected content', () => {
    const { el } = setup();
    expect(el.textContent).toContain('Label');
  });

  it('reflects disabled state to ARIA', () => {
    const { fixture, el } = setup();
    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();
    expect(el.getAttribute('aria-disabled')).toBe('true');
  });

  // Fill from SPEC.md → "Keyboard" and "States" before marking the component Beta.
  it.todo('implements every row of the SPEC.md keyboard map');
  it.todo('announces state changes to assistive tech where SPEC.md requires it');
});
