import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NxtAvatar } from '@nxt/ui/avatar';
import { NxtDescription, NxtDescriptions } from '@nxt/ui/descriptions';
import { NxtPopover, NxtPopoverTrigger } from '@nxt/ui/popover';

interface Person {
  code: string;
  name: string;
  title: string;
  department: string;
  email: string;
  phone: string;
  manager: string;
}

const PEOPLE: Person[] = [
  {
    code: 'NV-00218',
    name: 'Nguyễn Thị Ngọc Diệp',
    title: 'Chuyên viên tuyển dụng',
    department: 'Phòng Quản trị Nguồn nhân lực & Phát triển Tổ chức',
    email: 'diep.ntn@congty.vn',
    phone: '0903 218 446',
    manager: 'Đặng Anh',
  },
  { code: 'NV-00241', name: 'Lê Minh Anh', title: 'Kế toán tổng hợp', department: 'Phòng Tài chính – Kế toán', email: 'anh.lm@congty.vn', phone: '', manager: 'Trần Thu Hà' },
  { code: 'NV-00305', name: 'Phạm Quốc Bảo', title: 'Trưởng nhóm kinh doanh', department: 'Kinh doanh miền Nam', email: 'bao.pq@congty.vn', phone: '0918 305 112', manager: 'Võ Thành Nam' },
];

/** Thẻ nhanh nhân viên: bấm tên mở popover cạnh tên, Esc hoặc bấm ra ngoài để đóng */
@Component({
  selector: 'example-popover-quick-view',
  imports: [NxtAvatar, NxtDescription, NxtDescriptions, NxtPopover, NxtPopoverTrigger],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p class="docs-demo-label">Người duyệt đơn nghỉ phép tuần 45/2026</p>
    <ul class="people" role="list">
      @for (p of people; track p.code) {
        <li class="person">
          <nxt-avatar [name]="p.name" size="sm" />
          <button type="button" class="person__name" [nxtPopoverTriggerFor]="card">{{ p.name }}</button>
          <span class="person__title">{{ p.title }}</span>
          <nxt-popover #card [title]="p.name">
            <div class="card">
              <div class="card__head">
                <nxt-avatar [name]="p.name" size="lg" />
                <div>
                  <p class="card__title">{{ p.title }}</p>
                  <p class="card__meta">{{ p.department }}</p>
                </div>
              </div>
              <dl nxtDescriptions [columns]="1">
                <div nxtDescription label="Mã nhân viên"><span class="nxt-tabular-nums">{{ p.code }}</span></div>
                <div nxtDescription label="Email">{{ p.email }}</div>
                <!-- Empty field: an em dash, never a blank. -->
                <div nxtDescription label="Điện thoại"><span class="nxt-tabular-nums">{{ p.phone || '—' }}</span></div>
                <div nxtDescription label="Quản lý trực tiếp">{{ p.manager }}</div>
              </dl>
              <a class="card__link" [href]="'#ho-so-' + p.code">Xem hồ sơ {{ p.name }}</a>
            </div>
          </nxt-popover>
        </li>
      }
    </ul>
  `,
  styles: `
    .people {
      display: grid;
      gap: var(--nxt-space-gap-sm);
      margin: 0;
      margin-block-start: var(--nxt-space-gap-sm);
      padding: 0;
      list-style: none;
    }
    .person {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--nxt-space-gap-sm);
    }
    .person__name {
      padding: 0;
      border: 0;
      background: none;
      color: var(--nxt-color-text-link);
      font: var(--nxt-typography-label-md);
      text-decoration: underline;
      text-underline-offset: 0.2em;
      cursor: pointer;
    }
    .person__name:hover {
      color: var(--nxt-color-text-link-hover);
    }
    .person__name:focus-visible {
      outline: var(--nxt-focus-ring-width) solid var(--nxt-focus-ring-color);
      outline-offset: var(--nxt-focus-ring-offset);
      border-radius: var(--nxt-radius-control);
    }
    .person__title {
      color: var(--nxt-color-text-subtle);
      font: var(--nxt-typography-body-sm);
    }
    .card {
      display: grid;
      gap: var(--nxt-space-gap-md);
    }
    .card__head {
      display: flex;
      align-items: center;
      gap: var(--nxt-space-gap-sm);
    }
    .card__title {
      color: var(--nxt-color-text-strong);
      font: var(--nxt-typography-label-md);
    }
    .card__meta {
      color: var(--nxt-color-text-subtle);
      font: var(--nxt-typography-body-sm);
    }
    .card__link {
      color: var(--nxt-color-text-link);
      font: var(--nxt-typography-body-md);
    }
  `,
})
export class PopoverQuickViewExample {
  protected readonly people = PEOPLE;
}
