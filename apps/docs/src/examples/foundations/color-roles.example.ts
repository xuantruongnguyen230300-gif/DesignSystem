import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { NxtGrid, NxtSpan } from '@nxt/ui/layout';
import { TokensData } from '../../app/core/tokens-data';

interface Role {
  label: string;
  fg: string;
  bg: string;
}

/** Cặp màu theo vai trò — đổi theo chế độ sáng/tối và brand, tương phản được kiểm tự động */
@Component({
  selector: 'example-color-roles',
  imports: [NxtGrid, NxtSpan],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-grid gap="sm">
      @for (r of roles; track r.label) {
        <div class="docs-role" [nxtSpan]="{ base: 12, md: 6, lg: 4 }" [style.background-color]="cssVar(r.bg)" [style.color]="cssVar(r.fg)">
          <span class="nxt-text-label-md">{{ r.label }}</span>
          <span class="docs-role__meta">{{ ratio(r) }}</span>
        </div>
      }
    </nxt-grid>
  `,
})
export class ColorRolesExample {
  private readonly tokens = inject(TokensData);
  protected readonly roles: Role[] = [
    { label: 'Chữ chính trên surface', fg: 'text.default', bg: 'bg.surface' },
    { label: 'Chữ phụ trên surface', fg: 'text.subtle', bg: 'bg.surface' },
    { label: 'Liên kết', fg: 'text.link', bg: 'bg.surface' },
    { label: 'Hành động chính', fg: 'text.on-primary', bg: 'bg.primary' },
    { label: 'Hành động phá huỷ', fg: 'text.on-danger', bg: 'bg.danger' },
    { label: 'Mục đang chọn', fg: 'text.default', bg: 'bg.selected' },
    { label: 'Lỗi', fg: 'text.danger', bg: 'bg.danger-subtle' },
    { label: 'Thành công', fg: 'text.success', bg: 'bg.success-subtle' },
    { label: 'Cảnh báo', fg: 'text.warning', bg: 'bg.warning-subtle' },
    { label: 'Thông tin', fg: 'text.info', bg: 'bg.info-subtle' },
    { label: 'Tooltip / toast', fg: 'text.inverse', bg: 'bg.inverse' },
    { label: 'Nền phụ', fg: 'text.subtle', bg: 'bg.muted' },
  ];

  private readonly contrast = computed(() => this.tokens.data()?.contrast ?? []);

  constructor() {
    void this.tokens.load();
  }

  protected cssVar(role: string): string {
    return `var(--nxt-color-${role.replace('.', '-')})`;
  }

  protected ratio(r: Role): string {
    const find = (mode: string) =>
      this.contrast().find((c) => c.fg === `semantic.color.${r.fg}` && c.bg === `semantic.color.${r.bg}` && c.context.startsWith(`core, color=${mode},`) && c.context.includes('density=comfortable'));
    const light = find('light');
    const dark = find('dark');
    if (!light || !dark) return '';
    return `Sáng ${light.ratio}:1 · Tối ${dark.ratio}:1`;
  }
}
