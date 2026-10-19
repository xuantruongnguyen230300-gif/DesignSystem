import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input, linkedSignal } from '@angular/core';

/**
 * Initials following Vietnamese naming: family name + given name.
 * "Nguyễn Thị Ngọc Diệp" → "ND", "Đặng Anh" → "ĐA", "Minh" → "M".
 */
export function nxtInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return '?';
  const first = words[0].charAt(0);
  const last = words.length > 1 ? words[words.length - 1].charAt(0) : '';
  return `${first}${last}`.toLocaleUpperCase('vi');
}

/** Stable tone 1–6 from the name, so the same person keeps the same color everywhere. */
export function nxtAvatarTone(name: string): number {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.codePointAt(0)!) >>> 0;
  return (h % 6) + 1;
}

/**
 * Person avatar: photo, or initials on a tone derived from the name.
 * Decorative by default (the name is usually shown next to it); pass `label` when it stands alone.
 */
@Component({
  selector: 'nxt-avatar',
  template: `
    @if (src() && !failed()) {
      <img [src]="src()" [alt]="label() ?? ''" (error)="failed.set(true)" />
    } @else {
      <span class="nxt-avatar__initials" aria-hidden="true">{{ initials() }}</span>
      @if (label()) {
        <span class="nxt-visually-hidden">{{ label() }}</span>
      }
    }
  `,
  styleUrl: './avatar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'nxt-avatar',
    '[attr.data-size]': 'size()',
    '[attr.data-tone]': 'tone()',
  },
})
export class NxtAvatar {
  /** Full name (drives initials and tone). */
  readonly name = input.required<string>();
  /** Photo URL; falls back to initials if it fails to load. */
  readonly src = input<string>();
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  /** Accessible name when the avatar is not accompanied by visible text. */
  readonly label = input<string>();
  /** Resets whenever `src` changes, so a later valid photo is shown after an earlier one failed. */
  protected readonly failed = linkedSignal({ source: this.src, computation: () => false });
  protected readonly initials = computed(() => nxtInitials(this.name()));
  protected readonly tone = computed(() => nxtAvatarTone(this.name()));
}
