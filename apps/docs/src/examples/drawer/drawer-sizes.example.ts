import { DIALOG_DATA } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NxtButton } from '@nxt/ui/button';
import { NxtDrawer, NxtDrawerConfig, NxtDrawerLayout } from '@nxt/ui/drawer';
import { NxtInline } from '@nxt/ui/layout';

type DrawerSize = NonNullable<NxtDrawerConfig['size']>;

interface SizeInfo {
  size: DrawerSize;
  label: string;
  usage: string;
  samples: string[];
}

const SIZES: SizeInfo[] = [
  {
    size: 'sm',
    label: 'Hẹp (sm)',
    usage: 'Xem nhanh một bản ghi, bộ lọc nâng cao, danh sách ngắn.',
    samples: ['Xem nhanh hồ sơ nhân viên', 'Chi tiết một lần chấm công', 'Bộ lọc danh sách đơn'],
  },
  {
    size: 'md',
    label: 'Vừa (md, mặc định)',
    usage: 'Form tạo và sửa thông thường: khoảng 4 đến 10 trường, tối đa 2 cột hẹp.',
    samples: ['Thêm chức danh', 'Sửa thông tin liên hệ', 'Thêm người phụ thuộc'],
  },
  {
    size: 'lg',
    label: 'Rộng (lg)',
    usage: 'Nội dung rộng: form 2 cột đầy đủ, bảng con, so sánh trước và sau khi sửa.',
    samples: ['Điều chỉnh hợp đồng kèm phụ lục', 'Lịch sử thay đổi lương', 'Phân ca cho cả nhóm'],
  },
];

/** Ba bề rộng: sm xem nhanh, md form (mặc định), lg nội dung rộng */
@Component({
  selector: 'example-drawer-sizes',
  imports: [NxtButton, NxtInline],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-inline>
      @for (s of sizes; track s.size) {
        <button nxtButton (click)="open(s)">Mở drawer {{ s.label }}</button>
      }
    </nxt-inline>
  `,
})
export class DrawerSizesExample {
  private readonly drawer = inject(NxtDrawer);
  protected readonly sizes = SIZES;

  protected open(info: SizeInfo) {
    this.drawer.open<void, SizeInfo>(SizeDemo, { title: `Drawer ${info.label}`, size: info.size, data: info });
  }
}

/** Nội dung minh hoạ: dùng cho trường hợp nào. */
@Component({
  selector: 'example-drawer-sizes-content',
  imports: [NxtDrawerLayout],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-drawer-layout [title]="'Drawer ' + info.label" [description]="info.usage">
      <p class="lead">Ví dụ dùng trong HRM:</p>
      <ul class="samples">
        @for (s of info.samples; track s) {
          <li>{{ s }}</li>
        }
      </ul>
    </nxt-drawer-layout>
  `,
  styles: `
    .lead {
      margin-block-end: var(--nxt-space-gap-xs);
      color: var(--nxt-color-text-strong);
      font: var(--nxt-typography-label-md);
    }
    .samples {
      display: grid;
      gap: var(--nxt-space-gap-xs);
      padding-inline-start: var(--nxt-space-inset-lg);
      font: var(--nxt-typography-body-md);
    }
  `,
})
class SizeDemo {
  protected readonly info = inject<SizeInfo>(DIALOG_DATA);
}
