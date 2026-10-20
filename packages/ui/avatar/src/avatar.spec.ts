import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NxtAvatar, nxtAvatarTone, nxtInitials } from './avatar';

describe('nxtInitials', () => {
  it('uses family name + given name, as Vietnamese names are written', () => {
    expect(nxtInitials('Nguyễn Thị Ngọc Diệp')).toBe('ND');
    expect(nxtInitials('Đặng Anh')).toBe('ĐA');
    expect(nxtInitials('  lê   minh  anh ')).toBe('LA');
    expect(nxtInitials('Minh')).toBe('M');
    expect(nxtInitials('')).toBe('?');
  });
});

describe('nxtAvatarTone', () => {
  it('is stable for a name and always within 1–6', () => {
    expect(nxtAvatarTone('Phạm Thu Hà')).toBe(nxtAvatarTone('Phạm Thu Hà'));
    for (const name of ['A', 'Lê Minh Anh', 'Võ Thành Nam', 'Hoàng Văn Đức', 'Bùi Khánh Linh', 'Đỗ Minh Khoa']) {
      const tone = nxtAvatarTone(name);
      expect(tone).toBeGreaterThanOrEqual(1);
      expect(tone).toBeLessThanOrEqual(6);
    }
  });
});

@Component({
  imports: [NxtAvatar],
  template: `
    <nxt-avatar name="Nguyễn Thị Ngọc Diệp" />
    <nxt-avatar name="Võ Thành Nam" label="Võ Thành Nam, đang trực tuyến" size="lg" />
    <nxt-avatar name="Lê Minh Anh" [src]="src()" />
  `,
})
class Host {
  readonly src = signal('data:image/gif;base64,R0lGODlhAQABAAAAACw=');
}

describe('NxtAvatar', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const avatars = [...(fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('nxt-avatar')];
    return { fixture, avatars };
  }

  it('shows initials as decoration (the name is usually visible next to it)', () => {
    const { avatars } = setup();
    const initials = avatars[0].querySelector('.nxt-avatar__initials')!;
    expect(initials.textContent!.trim()).toBe('ND');
    expect(initials.getAttribute('aria-hidden')).toBe('true');
    expect(avatars[0].textContent!.trim()).toBe('ND');
    expect(avatars[0].dataset['tone']).toBe(String(nxtAvatarTone('Nguyễn Thị Ngọc Diệp')));
  });

  it('exposes a label when it stands alone', () => {
    const { avatars } = setup();
    expect(avatars[1].querySelector('.nxt-visually-hidden')!.textContent).toBe('Võ Thành Nam, đang trực tuyến');
    expect(avatars[1].dataset['size']).toBe('lg');
  });

  it('falls back to initials when the photo fails to load', async () => {
    const { fixture, avatars } = setup();
    const img = avatars[2].querySelector('img')!;
    expect(img.getAttribute('alt')).toBe('');
    img.dispatchEvent(new Event('error'));
    await fixture.whenStable();
    expect(avatars[2].querySelector('img')).toBeNull();
    expect(avatars[2].querySelector('.nxt-avatar__initials')!.textContent!.trim()).toBe('LA');
  });

  it('tries again when the photo URL changes after a failure', async () => {
    const { fixture, avatars } = setup();
    avatars[2].querySelector('img')!.dispatchEvent(new Event('error'));
    await fixture.whenStable();
    fixture.componentInstance.src.set('data:image/gif;base64,R0lGODlhAgACAAAAACw=');
    await fixture.whenStable();
    expect(avatars[2].querySelector('img')!.getAttribute('src')).toContain('AgACAAAA');
  });
});
