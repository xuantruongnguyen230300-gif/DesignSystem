import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { TokensData } from '../core/tokens-data';
import type { TokenRecord } from '../core/types';
import { CopyButton } from '../shell/copy-button';

interface Column {
  label: string;
  axis: string | null;
  mode: string | null;
}

const MODE_LABEL: Record<string, string> = {
  light: 'Sáng',
  dark: 'Tối',
  comfortable: 'Vừa',
  compact: 'Gọn',
  spacious: 'Rộng',
  full: 'Đầy đủ',
  reduced: 'Giảm chuyển động',
};

/** Token table generated from @nxt/tokens JSON — values per mode, alias chain, description. */
@Component({
  selector: 'docs-token-table',
  imports: [CopyButton],
  template: `
    @if (rows().length) {
      <div class="docs-table" role="region" [attr.aria-label]="'Bảng token ' + prefix()" tabindex="0">
        <table class="docs-token-table">
          <thead>
            <tr>
              <th scope="col">Token</th>
              @for (c of columns(); track c.label) {
                <th scope="col">{{ c.label }}</th>
              }
              <th scope="col">Dùng khi</th>
            </tr>
          </thead>
          <tbody>
            @for (t of rows(); track t.path) {
              <tr>
                <th scope="row">
                  <code class="docs-token__name">{{ t.cssVar }}</code>
                  @if (t.alias) {
                    <span class="docs-token__alias">→ {{ t.alias }}</span>
                  }
                </th>
                @for (c of columns(); track c.label) {
                  <td>
                    <span class="docs-token__value">
                      @if (t.type === 'color') {
                        <span class="docs-swatch" [style.background-color]="value(t, c)" aria-hidden="true"></span>
                      }
                      <code>{{ value(t, c) }}</code>
                    </span>
                  </td>
                }
                <td>{{ t.description }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
      <p class="docs-token__foot">
        {{ rows().length }} token · nguồn <code>packages/tokens/src</code>
        <docs-copy [text]="cssList()" label="Sao chép danh sách biến" />
      </p>
    } @else if (tokens.error(); as err) {
      <p class="docs-callout" data-tone="danger" role="alert">{{ err }}</p>
    } @else if (tokens.data()) {
      <p class="docs-callout">Không có token nào bắt đầu bằng <code>{{ prefix() }}</code>.</p>
    } @else {
      <p class="docs-example__state">Đang tải token…</p>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TokenTable {
  readonly prefix = input.required<string>();
  protected readonly tokens = inject(TokensData);

  protected readonly rows = computed(() => (this.tokens.data() ? this.tokens.byPrefix(this.prefix()) : []));
  protected readonly cssList = computed(() => this.rows().map((r) => r.cssVar).join('\n'));

  protected readonly columns = computed<Column[]>(() => {
    const data = this.tokens.data();
    const axis = this.rows().find((r) => r.axis)?.axis ?? null;
    if (!data || !axis) return [{ label: 'Giá trị', axis: null, mode: null }];
    const def = data.defaultSelection[axis];
    return (data.modes[axis] ?? []).map((m) => ({ label: MODE_LABEL[m] ?? m, axis: m === def ? null : axis, mode: m === def ? null : m }));
  });

  constructor() {
    void this.tokens.load();
  }

  protected value(t: TokenRecord, c: Column): string {
    return this.tokens.value(t, c.axis, c.mode);
  }
}
