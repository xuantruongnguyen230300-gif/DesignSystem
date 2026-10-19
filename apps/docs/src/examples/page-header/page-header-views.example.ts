import { ChangeDetectionStrategy, Component, ElementRef, Injector, afterNextRender, inject, signal, viewChild } from '@angular/core';
import { NxtDescription, NxtDescriptions } from '@nxt/ui/descriptions';
import { NxtStack } from '@nxt/ui/layout';
import { NxtBreadcrumbItem, NxtPageHeader } from '@nxt/ui/page-header';
import { NxtTag } from '@nxt/ui/tag';

interface Position {
  code: string;
  name: string;
  dept: string;
  grade: string;
  headcount: number;
}

const POSITIONS: Position[] = [
  { code: 'KT-TR', name: 'Kế toán trưởng', dept: 'Phòng Kế toán', grade: 'Bậc 7', headcount: 1 },
  { code: 'KT-TH', name: 'Kế toán tổng hợp', dept: 'Phòng Kế toán', grade: 'Bậc 5', headcount: 3 },
  { code: 'NS-TD', name: 'Chuyên viên tuyển dụng', dept: 'Phòng Nhân sự', grade: 'Bậc 4', headcount: 4 },
];

/** Đổi màn hình không qua router: breadcrumb bấm được (navigable) và đưa focus lên tiêu đề mới (focusTitle) */
@Component({
  selector: 'example-page-header-views',
  imports: [NxtDescription, NxtDescriptions, NxtPageHeader, NxtStack, NxtTag],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- headingLevel="2" chỉ vì ví dụ nằm trong trang docs đã có h1. Trang thật để mặc định (h1). -->
    @if (open(); as p) {
      <nxt-stack gap="md">
        <nxt-page-header headingLevel="2" [title]="p.name" [breadcrumb]="detailCrumbs(p)" [description]="p.code + ' · ' + p.dept" (navigate)="back()">
          <nxt-tag nxtPageMeta tone="success" dot>Đang sử dụng</nxt-tag>
        </nxt-page-header>
        <dl nxtDescriptions>
          <div nxtDescription label="Mã">{{ p.code }}</div>
          <div nxtDescription label="Phòng ban">{{ p.dept }}</div>
          <div nxtDescription label="Ngạch lương">{{ p.grade }}</div>
          <div nxtDescription label="Định biên">{{ p.headcount }} người</div>
        </dl>
      </nxt-stack>
    } @else {
      <nxt-stack gap="md">
        <nxt-page-header headingLevel="2" title="Chức danh" description="3 chức danh đang sử dụng" [breadcrumb]="listCrumbs" />
        <ul class="list">
          @for (p of positions; track p.code) {
            <li class="row">
              <button type="button" class="open" [attr.data-code]="p.code" (click)="show(p)">{{ p.name }}</button>
              <span class="docs-demo-label">{{ p.code }} · {{ p.dept }}</span>
            </li>
          }
        </ul>
      </nxt-stack>
    }
  `,
  styles: `
    .list {
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .row {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: var(--nxt-space-gap-sm);
      padding-block: var(--nxt-space-inset-sm);
    }
    .row + .row {
      border-block-start: var(--nxt-border-width-default) solid var(--nxt-color-border-subtle);
    }
    .open {
      padding: 0;
      border: 0;
      background: none;
      color: var(--nxt-color-text-link);
      font: var(--nxt-typography-label-md);
      text-align: start;
      cursor: pointer;
    }
    .open:hover {
      color: var(--nxt-color-text-link-hover);
      text-decoration: underline;
    }
  `,
})
export class PageHeaderViewsExample {
  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  private readonly injector = inject(Injector);
  /** Whichever header is on screen: the list's or the detail's. */
  private readonly header = viewChild(NxtPageHeader);

  protected readonly positions = POSITIONS;
  protected readonly open = signal<Position | null>(null);
  protected readonly listCrumbs: NxtBreadcrumbItem[] = [{ label: 'Thiết lập' }, { label: 'Chức danh' }];

  /** "Chức danh" swaps back to the list in this same component: no route, so `navigable` instead of `link`. */
  protected detailCrumbs(p: Position): NxtBreadcrumbItem[] {
    return [{ label: 'Thiết lập' }, { label: 'Chức danh', navigable: true }, { label: p.name }];
  }

  /** New view: start at its title, so screen readers announce where the user is and Tab goes on from there. */
  protected show(p: Position) {
    this.open.set(p);
    afterNextRender(() => this.header()?.focusTitle(), { injector: this.injector });
  }

  /** Back to the list: focus the item that was opened, not the list title. */
  protected back() {
    const code = this.open()?.code;
    this.open.set(null);
    afterNextRender(() => this.host.querySelector<HTMLElement>(`[data-code="${code}"]`)?.focus(), { injector: this.injector });
  }
}
