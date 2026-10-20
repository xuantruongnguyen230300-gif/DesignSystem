import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { NxtFormField, NxtInput } from '@nxt/ui/form-field';
import { NXT_ICONS, NxtIcon, NxtIconName } from '@nxt/ui/icon';
import { NxtStack } from '@nxt/ui/layout';

const NAMES = Object.keys(NXT_ICONS) as NxtIconName[];
const vi = new Intl.NumberFormat('vi-VN');

/** Vietnamese search words (no diacritics) → fragments of the English icon names they should find. */
const KEYWORDS: Record<string, string[]> = {
  'nhan vien': ['user', 'id-badge'],
  'nguoi dung': ['user'],
  'phong ban': ['building', 'sitemap', 'hierarchy'],
  'to chuc': ['sitemap', 'hierarchy', 'building'],
  them: ['plus'],
  xoa: ['trash', 'x', 'minus'],
  sua: ['pencil', 'edit'],
  tim: ['search', 'zoom'],
  loc: ['filter'],
  'tai xuong': ['download', 'file-export'],
  'tai len': ['upload', 'file-import', 'cloud-upload'],
  lich: ['calendar'],
  'thoi gian': ['clock', 'alarm', 'hourglass', 'history'],
  'canh bao': ['alert'],
  'thong bao': ['bell', 'speakerphone'],
  luong: ['cash', 'coin', 'wallet', 'receipt', 'report-money'],
  tien: ['cash', 'coin', 'wallet', 'receipt', 'report-money'],
  'hop dong': ['file-certificate', 'signature', 'license'],
  'tai lieu': ['file', 'book', 'notes', 'paperclip'],
  duyet: ['check', 'clipboard-check', 'rubber-stamp', 'gavel'],
  'cai dat': ['settings', 'adjustments', 'tool'],
  khoa: ['lock', 'shield', 'key'],
  email: ['mail', 'send'],
  'bieu do': ['chart'],
  bang: ['table', 'columns', 'layout-rows'],
  'nghi phep': ['beach', 'calendar-off', 'plane'],
  'cong tac': ['plane', 'car', 'bus', 'briefcase', 'route'],
  'dao tao': ['school', 'certificate', 'book'],
  'khen thuong': ['award', 'medal', 'trophy', 'gift', 'star'],
  'mui ten': ['arrow', 'chevron'],
};

/** Lowercase, strip Vietnamese diacritics (đ → d) so "Nhân viên" matches "nhan vien". */
function fold(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd').toLowerCase().trim().replace(/\s+/g, ' ');
}

/** Toàn bộ icon: tìm kiếm và sao chép mã */
@Component({
  selector: 'example-icon-gallery',
  imports: [NxtFormField, NxtInput, NxtIcon, NxtStack],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-stack gap="md">
      <nxt-form-field label="Tìm icon" hint="Tên tiếng Anh (user, calendar) hoặc từ khoá tiếng Việt (nhân viên, lịch, hợp đồng)">
        <nxt-icon nxtPrefix name="search" />
        <input #q nxtInput type="search" autocomplete="off" (input)="query.set(q.value)" />
      </nxt-form-field>
      <p class="docs-demo-label nxt-tabular-nums" role="status">{{ summary() }}</p>

      @if (shown().length) {
        <ul class="gallery" role="list">
          @for (name of shown(); track name) {
            <li>
              <button type="button" class="tile" [attr.aria-label]="'Sao chép mã icon ' + name" (click)="copy(name)">
                <nxt-icon [name]="copied() === name ? 'check' : name" size="lg" />
                <span class="tile__name">{{ name }}</span>
              </button>
            </li>
          }
        </ul>
      } @else {
        <p class="docs-demo-label">Thử từ ngắn hơn, hoặc tên tiếng Anh như user, file, calendar.</p>
      }
      <p class="docs-demo-label" role="status">{{ message() }}</p>
    </nxt-stack>
  `,
  styles: `
    .gallery {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(calc(var(--nxt-size-64) * 2), 1fr));
      gap: var(--nxt-space-gap-sm);
      max-block-size: var(--nxt-size-480);
      margin: 0;
      padding: var(--nxt-space-0-5);
      overflow-y: auto;
      list-style: none;
    }
    .tile {
      display: grid;
      justify-items: center;
      align-content: center;
      gap: var(--nxt-space-gap-sm);
      inline-size: 100%;
      block-size: 100%;
      min-block-size: var(--nxt-size-72);
      padding: var(--nxt-space-inset-sm);
      border: var(--nxt-border-width-default) solid var(--nxt-color-border-subtle);
      border-radius: var(--nxt-radius-control);
      background: var(--nxt-color-bg-surface);
      color: var(--nxt-color-icon-default);
      cursor: pointer;
    }
    .tile:hover {
      background: var(--nxt-color-bg-surface-hover);
    }
    .tile:focus-visible {
      outline: var(--nxt-focus-ring-width) solid var(--nxt-focus-ring-color);
      outline-offset: calc(-1 * var(--nxt-focus-ring-width));
    }
    .tile__name {
      color: var(--nxt-color-text-subtle);
      font: var(--nxt-typography-caption);
      text-align: center;
      overflow-wrap: anywhere;
    }
  `,
})
export class IconGalleryExample {
  protected readonly query = signal('');
  protected readonly copied = signal<NxtIconName | null>(null);
  protected readonly message = signal('');
  private timer: ReturnType<typeof setTimeout> | undefined;

  protected readonly shown = computed(() => {
    const q = fold(this.query());
    if (!q) return NAMES;
    const fragments = Object.entries(KEYWORDS)
      .filter(([word]) => q.length >= 2 && word.includes(q))
      .flatMap(([, f]) => f);
    return NAMES.filter((name) => name.includes(q) || fragments.some((f) => name.includes(f)));
  });

  protected readonly summary = computed(() => {
    const total = vi.format(NAMES.length);
    if (!this.query().trim()) return `${total} icon`;
    const n = this.shown().length;
    return n ? `${vi.format(n)} / ${total} icon khớp với “${this.query().trim()}”` : `Không có icon nào khớp với “${this.query().trim()}”`;
  });

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
  }

  protected async copy(name: NxtIconName) {
    const code = `<nxt-icon name="${name}" />`;
    try {
      await navigator.clipboard.writeText(code);
      this.message.set(`Đã sao chép ${code}`);
      this.copied.set(name);
      clearTimeout(this.timer);
      this.timer = setTimeout(() => this.copied.set(null), 1500);
    } catch {
      this.message.set(`Trình duyệt không cho sao chép. Mã icon: ${code}`);
    }
  }
}
