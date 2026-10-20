import { ChangeDetectionStrategy, Component } from '@angular/core';

interface Specimen {
  role: string;
  use: string;
  text: string;
}

/** Thang chữ theo vai trò, với văn bản tiếng Việt có dấu chồng */
@Component({
  selector: 'example-type-scale',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <dl class="docs-type">
      @for (s of specimens; track s.role) {
        <div class="docs-type__row">
          <dt class="docs-type__meta">
            <code>{{ s.role }}</code>
            <span class="docs-demo-label">{{ s.use }}</span>
          </dt>
          <dd [class]="'nxt-text-' + s.role">{{ s.text }}</dd>
        </div>
      }
    </dl>
  `,
})
export class TypeScaleExample {
  protected readonly specimens: Specimen[] = [
    { role: 'display', use: 'Trang chào, onboarding', text: 'Chào mừng trở lại' },
    { role: 'heading-lg', use: 'Tiêu đề trang', text: 'Hồ sơ nhân viên' },
    { role: 'heading-md', use: 'Section, dialog', text: 'Quá trình công tác' },
    { role: 'heading-sm', use: 'Card, nhóm field', text: 'Thông tin liên hệ' },
    { role: 'body-lg', use: 'Văn bản đọc dài', text: 'Hợp đồng lao động được ký kết theo Bộ luật Lao động năm 2019.' },
    { role: 'body-md', use: 'Mặc định của giao diện', text: 'Nguyễn Thị Ngọc Diệp — Phòng Quản trị Nguồn nhân lực' },
    { role: 'body-sm', use: 'Ô bảng dày, mô tả phụ', text: 'Cập nhật bởi Trần Quốc Việt lúc 14:32, 15/10/2026' },
    { role: 'label-md', use: 'Nhãn control, tab', text: 'Lưu hồ sơ' },
    { role: 'label-sm', use: 'Header cột, nhãn nhỏ', text: 'NGÀY HIỆU LỰC · Mức lương' },
    { role: 'caption', use: 'Helper text, timestamp', text: 'Tối đa 255 ký tự. Ặ ặ Ỗ ỗ Ữ ữ Ỷ ỷ' },
    { role: 'code', use: 'Mã, token', text: '--nxt-color-text-default' },
  ];
}
