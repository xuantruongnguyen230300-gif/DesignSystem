import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NxtButton, NxtButtonType, NxtButtonVariant } from './button';

@Component({
  imports: [NxtButton],
  template: `
    <form (submit)="onSubmit($event)">
      <button
        nxtButton
        [variant]="variant()"
        [disabled]="disabled()"
        [loading]="loading()"
        [type]="type()"
        (click)="clicks = clicks + 1"
      >
        Lưu hồ sơ
      </button>
    </form>
    <a nxtButton href="#ho-so" variant="ghost">Xem hồ sơ</a>
    <button nxtButton id="static-disabled" disabled>Phê duyệt</button>
  `,
})
class Host {
  readonly variant = signal<NxtButtonVariant>('secondary');
  readonly disabled = signal(false);
  readonly loading = signal(false);
  readonly type = signal<NxtButtonType>('button');
  clicks = 0;
  submits = 0;
  onSubmit(event: Event) {
    event.preventDefault();
    this.submits++;
  }
}

describe('NxtButton', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    const anchor: HTMLAnchorElement = fixture.nativeElement.querySelector('a');
    const update = (fn: (h: Host) => void) => {
      fn(fixture.componentInstance);
      fixture.detectChanges();
    };
    return { fixture, host: fixture.componentInstance, button, anchor, update };
  }

  it('renders the label and reflects variant/size as data attributes', () => {
    const { button, update } = setup();
    expect(button.textContent).toContain('Lưu hồ sơ');
    expect(button.classList).toContain('nxt-button');
    expect(button.dataset['variant']).toBe('secondary');
    expect(button.dataset['size']).toBe('md');
    update((h) => h.variant.set('danger'));
    expect(button.dataset['variant']).toBe('danger');
  });

  it('defaults to type="button" so it never submits a form by accident', () => {
    const { button, host, update } = setup();
    expect(button.getAttribute('type')).toBe('button');
    button.click();
    expect(host.submits).toBe(0);
    update((h) => h.type.set('submit'));
    button.click();
    expect(host.submits).toBe(1);
  });

  it('does not put a type attribute on anchors', () => {
    const { anchor } = setup();
    expect(anchor.hasAttribute('type')).toBe(false);
    expect(anchor.dataset['variant']).toBe('ghost');
  });

  it('activates on click when enabled', () => {
    const { button, host } = setup();
    button.click();
    expect(host.clicks).toBe(1);
  });

  describe('disabled (SPEC §6)', () => {
    it('uses aria-disabled and stays focusable so the reason can be explained', () => {
      const { button, update } = setup();
      update((h) => h.disabled.set(true));
      expect(button.getAttribute('aria-disabled')).toBe('true');
      expect(button.hasAttribute('disabled')).toBe(false);
      button.focus();
      expect(document.activeElement).toBe(button);
    });

    it('removes a static native disabled attribute so the button stays focusable', () => {
      const { fixture } = setup();
      const staticDisabled: HTMLButtonElement = fixture.nativeElement.querySelector('#static-disabled');
      expect(staticDisabled.hasAttribute('disabled')).toBe(false);
      expect(staticDisabled.getAttribute('aria-disabled')).toBe('true');
      staticDisabled.focus();
      expect(document.activeElement).toBe(staticDisabled);
    });

    it('blocks activation before consumer click listeners run', () => {
      const { button, host, update } = setup();
      update((h) => h.disabled.set(true));
      button.click();
      expect(host.clicks).toBe(0);
    });

    it('blocks form submission', () => {
      const { button, host, update } = setup();
      update((h) => {
        h.type.set('submit');
        h.disabled.set(true);
      });
      button.click();
      expect(host.submits).toBe(0);
    });
  });

  describe('loading (SPEC §5)', () => {
    it('shows a spinner, sets aria-busy and keeps the label in the accessibility tree', () => {
      const { button, update } = setup();
      update((h) => h.loading.set(true));
      expect(button.getAttribute('aria-busy')).toBe('true');
      expect(button.getAttribute('aria-disabled')).toBe('true');
      expect(button.querySelector('.nxt-button__spinner')?.getAttribute('aria-hidden')).toBe('true');
      expect(button.querySelector('.nxt-button__content')?.textContent).toContain('Lưu hồ sơ');
    });

    it('blocks activation and removes the spinner when done', () => {
      const { button, host, update } = setup();
      update((h) => h.loading.set(true));
      button.click();
      expect(host.clicks).toBe(0);
      update((h) => h.loading.set(false));
      expect(button.querySelector('.nxt-button__spinner')).toBeNull();
      expect(button.hasAttribute('aria-busy')).toBe(false);
      button.click();
      expect(host.clicks).toBe(1);
    });
  });
});
