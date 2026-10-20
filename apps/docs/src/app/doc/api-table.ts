import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { API } from '../../generated/api';
import { CopyButton } from '../shell/copy-button';

const KIND_LABEL = { input: 'input', model: 'model (two-way)', output: 'output' } as const;

/** API table extracted from packages/ui/<entry>/src by tools/docs/generate.mjs — never hand-written. */
@Component({
  selector: 'docs-api-table',
  imports: [CopyButton],
  template: `
    @if (api(); as a) {
      <div class="docs-import">
        <code>{{ importLine() }}</code>
        <docs-copy [text]="importLine()" label="Sao chép import" />
      </div>
      @for (cls of a.classes; track cls.name) {
        <section class="docs-api" [attr.aria-label]="'API ' + cls.name">
          <p class="docs-api__head">
            <code class="docs-api__name">{{ cls.name }}</code>
            <span class="docs-api__kind">{{ cls.kind }}</span>
            <code class="docs-api__selector">{{ cls.selector }}</code>
          </p>
          @if (cls.description) {
            <p class="docs-api__desc">{{ cls.description }}</p>
          }
          @if (cls.members.length) {
            <div class="docs-table" role="region" [attr.aria-label]="'Thuộc tính của ' + cls.name" tabindex="0">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Tên</th>
                    <th scope="col">Kiểu</th>
                    <th scope="col">Mặc định</th>
                    <th scope="col">Mô tả</th>
                  </tr>
                </thead>
                <tbody>
                  @for (m of cls.members; track m.name) {
                    <tr>
                      <th scope="row"><code>{{ m.name }}</code> <span class="docs-api__kind">{{ kind[m.kind] }}</span></th>
                      <td><code>{{ m.type }}</code></td>
                      <td><code>{{ m.default }}</code></td>
                      <td>{{ m.description }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </section>
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApiTable {
  readonly entry = input.required<string>();
  protected readonly kind = KIND_LABEL;
  protected readonly api = computed(() => API[this.entry()]);
  protected readonly importLine = computed(() => {
    const a = this.api();
    return a ? `import { ${a.classes.map((c) => c.name).join(', ')} } from '${a.importPath}';` : '';
  });
}
