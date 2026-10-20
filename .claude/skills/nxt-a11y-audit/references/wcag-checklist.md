# WCAG 2.2 AA: các tiêu chí áp dụng cho component và pattern NXT

| SC | Tên | Kiểm gì ở NXT | Cách kiểm |
|----|-----|---------------|-----------|
| 1.1.1 | Non-text Content | Icon-only button có tên; ảnh có `alt`; icon trang trí có `aria-hidden="true"` | Đọc template |
| 1.3.1 | Info and Relationships | Label gắn với input; header bảng là `th` có `scope`; nhóm radio/checkbox có `fieldset` + `legend` | Đọc template, axe |
| 1.3.5 | Identify Input Purpose | `autocomplete` cho field cá nhân (name, email, tel) | Đọc template |
| 1.4.1 | Use of Color | Trạng thái và lỗi không chỉ thể hiện bằng màu | Đọc CSS và template |
| 1.4.3 | Contrast (Minimum) | Chữ ≥ 4.5:1, chữ lớn ≥ 3:1 | `npm run ds:tokens` (contrastPairs) |
| 1.4.4 | Resize Text | Zoom 200% không mất nội dung | Thủ công / Playwright |
| 1.4.10 | Reflow | 320 CSS px không cuộn ngang (trừ bảng dữ liệu) | Playwright viewport 320 |
| 1.4.11 | Non-text Contrast | Viền input, focus ring, icon trạng thái ≥ 3:1 | contrastPairs |
| 1.4.12 | Text Spacing | Không vỡ khi tăng line-height 1.5 / letter-spacing 0.12em | Playwright inject CSS |
| 1.4.13 | Content on Hover or Focus | Tooltip/popover tắt được bằng `Esc`, hover được lên nội dung, không tự biến mất | Test |
| 2.1.1 | Keyboard | Mọi chức năng dùng được bằng bàn phím | Test keyboard map |
| 2.1.2 | No Keyboard Trap | Ra khỏi được mọi widget (trừ modal có `Esc`) | Test |
| 2.4.3 | Focus Order | Thứ tự focus theo thứ tự đọc; mở overlay thì focus vào overlay, đóng thì trả về trigger | Test |
| 2.4.7 | Focus Visible | `:focus-visible` có ring token | Đọc CSS |
| 2.4.11 | Focus Not Obscured (Minimum) | Sticky header/footer không che phần tử đang focus (`scroll-padding`) | Playwright |
| 2.5.3 | Label in Name | Accessible name chứa text hiển thị | Đọc template |
| 2.5.7 | Dragging Movements | Kéo thả (sắp xếp cột, kanban) có cách làm thay thế không cần kéo | Đọc SPEC |
| 2.5.8 | Target Size (Minimum) | Vùng chạm ≥ 24×24 CSS px, kể cả ở density compact | Đo trên render |
| 3.2.1 / 3.2.2 | On Focus / On Input | Focus hoặc chọn không tự submit hay chuyển trang | Test |
| 3.3.1 | Error Identification | Lỗi mô tả bằng text, gắn với field | Test + template |
| 3.3.2 | Labels or Instructions | Label luôn hiển thị (không dùng placeholder thay label) | Đọc template |
| 3.3.7 | Redundant Entry | Không bắt nhập lại thông tin đã có trong cùng quy trình | Review pattern |
| 3.3.8 | Accessible Authentication (Minimum) | Login cho dán mật khẩu, hỗ trợ password manager | Review template login |
| 4.1.2 | Name, Role, Value | Role/state đúng APG; cập nhật `aria-expanded`, `aria-selected`, `aria-checked` | Test + axe |
| 4.1.3 | Status Messages | Kết quả lọc, lưu thành công được announce không cần chuyển focus | Test `LiveAnnouncer` |

Chuẩn bổ sung của NXT (không thuộc WCAG nhưng bắt buộc):
- Hỗ trợ `prefers-reduced-motion` thông qua motion mode `reduced`.
- Ở `forced-colors: active`, viền và focus phải dùng system color (`CanvasText`, `Highlight`).

## Mẫu test
`apps/docs/e2e/a11y/<name>.a11y.spec.ts`:
```ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const modes = [
  { color: 'light', density: 'comfortable' },
  { color: 'dark', density: 'comfortable' },
  { color: 'light', density: 'compact' },
];

for (const m of modes) {
  test(`@a11y <name> ${m.color}/${m.density}`, async ({ page }) => {
    await page.goto(`/examples/<name>?color=${m.color}&density=${m.density}`);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .include('[data-example-root]')
      .analyze();
    expect(results.violations).toEqual([]);
  });
}
```
