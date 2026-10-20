---
component: button
status: beta
owner: "NXT core"
updated: 2026-10-16
apg-pattern: button
---

# Button: Spec

## 1. Mục đích
- **Vấn đề người dùng giải quyết:** kích hoạt một hành động ngay trên trang hiện tại, ví dụ lưu, gửi duyệt, xoá hay mở dialog.
- **Khi nào dùng:** hành động thay đổi dữ liệu hoặc trạng thái giao diện.
- **Khi nào KHÔNG dùng:**
  - Điều hướng sang trang khác: dùng link (`a`). Nếu link cần trông như nút thì dùng `a[nxtButton]`, vẫn giữ ngữ nghĩa link.
  - Chọn giữa các giá trị: dùng segmented / radio.
  - Bật/tắt có hiệu lực ngay: dùng switch.
  - Hành động chỉ có icon: dùng `nxtIconButton` (đợt A, chưa phát hành).

## 2. Anatomy
| # | Phần tử | Bắt buộc | Ghi chú |
|---|---------|----------|---------|
| 1 | Container (`button` / `a` native) | ✓ | Mang role và trạng thái |
| 2 | Icon đầu | — | `svg` được chiếu vào, `aria-hidden="true"` |
| 3 | Nhãn | ✓ | Động từ + đối tượng: "Lưu hồ sơ" |
| 4 | Icon cuối | — | Ví dụ mũi tên mở menu |
| 5 | Spinner | — | Chỉ hiện khi `loading`; giữ nguyên kích thước nút |

## 3. API (Angular)
Selector: `button[nxtButton]`, `a[nxtButton]`.

| Loại | Tên | Kiểu | Mặc định | Mô tả |
|------|-----|------|----------|-------|
| input | `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'danger'` | `'secondary'` | Mức nhấn mạnh |
| input | `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Chiều cao lấy từ density hiện hành |
| input | `disabled` | `boolean` | `false` | Dùng `aria-disabled`: nút vẫn focus được để tooltip giải thích lý do |
| input | `loading` | `boolean` | `false` | Hiện spinner, `aria-busy="true"`, chặn kích hoạt |
| input | `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | Chỉ áp dụng cho `<button>`. Mặc định `button` để tránh submit form ngoài ý muốn |
| content | (default) | text, `svg` | | Nhãn và icon |

Không có output riêng: dùng `(click)` native. Khi `disabled` hoặc `loading`, click bị chặn trước mọi listener của người dùng.

## 4. Variants & sizes
| Variant | Dùng khi | Không dùng khi |
|---------|----------|----------------|
| `primary` | Hành động chính của vùng: "Lưu", "Gửi duyệt". **Tối đa 1 nút primary mỗi vùng** | Có nhiều hành động ngang hàng |
| `secondary` | Hành động phụ: "Huỷ", "Xuất file" | Đây là hành động chính |
| `ghost` | Hành động ít quan trọng, trong toolbar hoặc trong hàng bảng | Đứng một mình, dễ bị nhầm là text |
| `danger` | Hành động phá huỷ: "Xoá 3 nhân viên" | Cảnh báo không phá huỷ (dùng secondary + dialog) |

| Size | comfortable | compact | spacious |
|------|-------------|---------|----------|
| `sm` | 28px | 24px | 32px |
| `md` | 32px | 28px | 40px |
| `lg` | 40px | 32px | 48px |

## 5. States
| Rest | Hover | Focus-visible | Active/Pressed | Selected | Disabled | Loading | Error | Read-only | Empty |
|------|-------|---------------|----------------|----------|----------|---------|-------|-----------|-------|
| ✓ | ✓ (chỉ trên thiết bị có hover) | ✓ ring token | ✓ | — (dùng toggle button) | ✓ `aria-disabled` | ✓ | — (lỗi hiển thị ở form/alert) | — | — (luôn có nhãn) |

## 6. Keyboard & ARIA
APG pattern: https://www.w3.org/WAI/ARIA/apg/patterns/button/

| Phím | Hành vi |
|------|---------|
| Tab / Shift+Tab | Focus vào hoặc ra khỏi nút, kể cả khi `disabled` (để đọc được lý do) |
| Enter | Kích hoạt (native); bị chặn khi `disabled` / `loading` |
| Space | Kích hoạt (native `<button>`); bị chặn khi `disabled` / `loading` |

- Role: native `button` hoặc `link`, không gắn thêm `role`.
- `aria-disabled="true"` khi disabled. `aria-busy="true"` khi loading. Nhãn vẫn nằm trong accessibility tree khi loading (chỉ ẩn bằng opacity).
- Icon trong nút phải có `aria-hidden="true"`. Nút chỉ có icon thì dùng `nxtIconButton` kèm `aria-label`.

## 7. Tokens
`packages/tokens/src/component/button.tokens.json`:

| Token | Alias semantic |
|-------|----------------|
| `height-{sm,md,lg}` | `size.control.{sm,md,lg}` |
| `padding-inline-{sm,md,lg}` | `space.inset.{sm,md,lg}` |
| `gap` | `space.gap.sm` |
| `radius` | `radius.control` |
| `font`, `font-sm` | `typography.label-md`, `typography.label-sm` |
| `icon-size` | `size.icon.sm` |
| `{variant}-bg / -bg-hover / -bg-pressed / -text / -border` | `color.bg.*`, `color.text.*`, `color.border.*` |
| `disabled-bg / -text / -border` | `color.bg.disabled`, `color.text.disabled`, `color.border.transparent` |

## 8. Density, responsive, i18n
- Chiều cao theo `size.control.*`, nên đổi theo density. Vùng chạm nhỏ nhất là 24×24 (compact `sm`), đạt WCAG 2.5.8.
- Nhãn không xuống dòng (`white-space: nowrap`). Nhãn quá dài là lỗi nội dung, không phải lỗi layout: rút gọn nhãn.
- Tiếng Việt: line-height của label-md (20px / 14px) đủ chỗ cho dấu chồng.

## 9. Content guidelines
- Động từ + đối tượng, sentence case: "Thêm nhân viên", "Gửi duyệt". Không dùng "OK" hay "Xác nhận" chung chung.
- Nút danger ghi rõ phạm vi: "Xoá 3 nhân viên", không chỉ "Xoá".
- Tối đa khoảng 3 từ cho nút trong toolbar và hàng bảng.

## 10. Acceptance (Definition of Done)
- [x] Mọi trạng thái ở §5 có trong docs example
- [x] Unit test phủ keyboard map §6 và chặn kích hoạt khi disabled/loading
- [x] axe: 0 vi phạm ở sáng/tối/gọn (Playwright, `npm run test:a11y`; 2026-10-16)
- [x] `npm run ds:check` sạch (tokens + hardcoded)
- [x] Docs page đủ mục (skill `nxt-docs-page`)
