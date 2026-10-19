---
component: menu
status: beta
owner: "NXT core"
updated: 2026-10-19
apg-pattern: menu-button
---

# Menu: Spec

Entry `@nxt/ui/menu` bọc Angular CDK Menu: `[nxtMenuTriggerFor]` (nút mở menu), `[nxtMenu]` (panel), `[nxtMenuItem]`, `[nxtMenuItemRadio]`, `[nxtMenuGroup]`, `[nxtMenuLabel]`, `[nxtMenuSeparator]`.

## 1. Mục đích
- **Vấn đề người dùng giải quyết:** truy cập các hành động phụ của một đối tượng mà không làm chật toolbar hay hàng bảng ("Thao tác": Sửa, Nhân bản, Xoá), hoặc chọn nhanh một tuỳ chọn hiển thị (mật độ, thứ tự sắp xếp).
- **Khi nào dùng:** 3 hành động trở lên cùng phạm vi, hoặc hành động ít dùng; menu tài khoản trên topbar.
- **Khi nào KHÔNG dùng:**
  - Hành động chính của vùng: đặt nút hiển thị trực tiếp (`nxtButton variant="primary"`).
  - Chọn giá trị cho một trường trong form: dùng `select[nxtInput]` trong `nxt-form-field`.
  - Điều hướng chính của ứng dụng: dùng `nxt-sidenav`.
  - Chỉ có 1–2 hành động: đặt nút trực tiếp.
  - Nội dung có field, mô tả dài: dùng popover / drawer.

## 2. Anatomy
| # | Phần tử | Bắt buộc | Ghi chú |
|---|---------|----------|---------|
| 1 | Trigger `[nxtMenuTriggerFor]` | ✓ | Thường là `button[nxtButton]` / `button[nxtIconButton]`; CDK gắn `aria-haspopup`, `aria-expanded`, `aria-controls` |
| 2 | Panel `[nxtMenu]` | ✓ | Trong `ng-template`; `role="menu"`, overlay CDK, nền `surface-raised`, `elevation.overlay`; cao tối đa `min(70vh, 14 item)` rồi cuộn |
| 3 | Item `[nxtMenuItem]` | ✓ | `role="menuitem"`; icon (tuỳ chọn) + nhãn |
| 4 | Item radio `[nxtMenuItemRadio]` | — | `role="menuitemradio"`, dấu check trước item đang chọn |
| 5 | Nhãn nhóm `[nxtMenuLabel]` | — | Chữ nhỏ, không tương tác |
| 6 | Đường phân cách `[nxtMenuSeparator]` | — | `role="separator"` |

## 3. API (Angular)
Selector: `[nxtMenuTriggerFor]`, `[nxtMenu]`, `[nxtMenuItem]`, `[nxtMenuItemRadio]`, `[nxtMenuGroup]`, `[nxtMenuLabel]`, `[nxtMenuSeparator]`.

| Loại | Tên | Kiểu | Mặc định | Mô tả |
|------|-----|------|----------|-------|
| `nxtMenuTriggerFor` input | `nxtMenuTriggerFor` | `TemplateRef` | (bắt buộc) | Template chứa `[nxtMenu]` (map vào `cdkMenuTriggerFor`) |
| `nxtMenuTriggerFor` input | `nxtMenuPosition` | `ConnectedPosition[]` | vị trí mặc định của CDK | Vị trí ưu tiên của panel (map vào `cdkMenuPosition`) |
| `nxtMenuItem` input | `tone` | `'default' \| 'danger'` | `'default'` | `danger` cho hành động phá huỷ; phản ánh ra `data-tone` |
| `nxtMenuItem` input | `disabled` | `boolean` | `false` | `aria-disabled`, vẫn focus được, không kích hoạt |
| `nxtMenuItem` output | `triggered` | `void` | | Khi item được kích hoạt (click, Enter, Space) |
| `nxtMenuItemRadio` input | `checked` | `boolean` | `false` | `aria-checked` |
| `nxtMenuItemRadio` input | `disabled` | `boolean` | `false` | |
| `nxtMenuItemRadio` output | `triggered` | `void` | | Nơi dùng cập nhật giá trị đang chọn |
| `nxtMenuGroup` input | `label` | `string` | | Tên nhóm (`role="group"`); mỗi nhóm radio là một lựa chọn riêng |
| content | (default) | text, `nxt-icon` | | Nhãn và icon của item |

Mọi hành vi (overlay, focus, phím) đến từ `@angular/cdk/menu` qua `hostDirectives`.

## 4. Variants & sizes
| Loại item | Dùng khi | Không dùng khi |
|-----------|----------|----------------|
| `nxtMenuItem` | Hành động: "Sửa hồ sơ", "Xuất file" | |
| `nxtMenuItem tone="danger"` | Hành động phá huỷ, đặt cuối menu sau separator: "Xoá nhân viên" | Cảnh báo không phá huỷ |
| `nxtMenuItemRadio` | Chọn đúng một tuỳ chọn có hiệu lực ngay: mật độ, thứ tự | Lựa chọn cần lưu bằng form |

Item cao `size.control.md` (32 / 28 / 40px); menu rộng tối thiểu 160px (`layout.item-min-sm`).

## 5. States
| Rest | Hover | Focus-visible | Active/Pressed | Selected | Disabled | Loading | Error | Read-only | Empty |
|------|-------|---------------|----------------|----------|----------|---------|-------|-----------|-------|
| ✓ | ✓ nền `surface-hover` | ✓ nền `surface-hover` + ring token | — | ✓ radio `aria-checked="true"`: dấu check | ✓ `aria-disabled`, mờ 50%, vẫn focus được | — | — | — | — (không mở menu rỗng) |

Panel xuất hiện bằng fade + trượt nhẹ (`motion.duration.fast`); motion `reduced` đưa về 0.

## 6. Keyboard & ARIA
APG pattern: https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/ (menu: https://www.w3.org/WAI/ARIA/apg/patterns/menubar/)

| Phím | Hành vi |
|------|---------|
| Enter / Space (trên trigger) | Mở / đóng menu, focus item đầu |
| ↓ / ↑ (trên trigger) | Mở menu, focus item đầu / cuối |
| ↓ / ↑ (trong menu) | Item kế / trước, vòng đầu – cuối; item disabled vẫn nhận focus |
| Home / End | Item đầu / cuối |
| Gõ ký tự | Nhảy tới item bắt đầu bằng ký tự đó (type-ahead) |
| Enter / Space (trên item) | Kích hoạt item và đóng menu; item disabled không kích hoạt |
| Space (trên item radio) | Chọn item, menu **giữ mở** (CDK); Enter chọn và đóng |
| Escape | Đóng menu, focus về trigger |
| Tab / Shift+Tab | Đóng menu, focus về trigger rồi đi tiếp theo thứ tự Tab |
| → / ← | Mở / đóng submenu khi item là trigger của menu con (CDK) |

- Trigger: `aria-haspopup="menu"`, `aria-expanded`, `aria-controls` (CDK).
- Panel: `role="menu"`; item: `role="menuitem"`; item radio: `role="menuitemradio"` + `aria-checked`; separator: `role="separator"`; nhãn nhóm: `role="presentation"`.
- Item disabled: `aria-disabled="true"`.
- Icon trong item là trang trí. Trigger chỉ có icon dùng `nxtIconButton` kèm `aria-label` ("Thao tác khác").
- Forced colors: panel viền `CanvasText`, item focus có outline `Highlight`.

## 7. Tokens
`packages/tokens/src/component/menu.tokens.json`:

| Token | Alias semantic |
|-------|----------------|
| `bg` | `color.bg.surface-raised` |
| `border` | `color.border.default` |
| `radius` | `radius.overlay` |
| `item-text` | `color.text.default` |
| `item-bg-hover` | `color.bg.surface-hover` |
| `item-danger-text` | `color.text.danger` |
| `item-height` | `size.control.md` |
| `label-text` | `color.text.subtle` |
| `min-width` | `layout.item-min-sm` |

Dùng thẳng semantic: `size.icon.sm`, `space.inset.{xs,sm}`, `space.gap.{xs,sm}`, `border-width.default`, `elevation.overlay`, `typography.{body-md,label-sm}`, `focus.ring.*`, `motion.duration.fast`, `motion.ease.enter`.

## 8. Density, responsive, i18n
- Chiều cao item theo density; vùng chạm tối thiểu 28px ở compact.
- Nhãn item không xuống dòng; menu rộng theo nhãn dài nhất (tối thiểu 160px).
- Vị trí overlay do CDK tính, tự lật khi thiếu chỗ và theo `dir` của trang.
- Tiếng Việt: `body-md` (14 / 20px), type-ahead so khớp theo ký tự đầu của nhãn.

## 9. Content guidelines
- Nhãn item là động từ + đối tượng, sentence case: "Sửa hồ sơ", "Nhân bản hợp đồng", "Xoá nhân viên".
- Nhãn trigger nêu phạm vi: "Thao tác", "Xuất file"; trigger icon dùng `aria-label="Thao tác khác"`.
- Hành động phá huỷ đặt cuối, tách bằng separator, ghi rõ đối tượng.
- Nhãn nhóm (`nxtMenuLabel`) là danh từ: "Mật độ hiển thị".

## 10. Acceptance (Definition of Done)
- [ ] Menu thao tác, item danger, item disabled, nhóm radio có nhãn có trong docs example
- [x] Unit test: nhóm radio độc lập (`src/menu.spec.ts`)
- [x] axe: 0 vi phạm ở sáng/tối/gọn (Playwright, `npm run test:a11y`; 2026-10-19, 341/341)
- [x] `npm run ds:check` sạch (tokens + hardcoded)
- [x] Docs page đủ mục (skill `nxt-docs-page`)

## 11. Việc còn mở
- `src/menu.css:70`–`73`: dấu check của radio vẽ bằng `background: currentColor` + `mask`; ở `forced-colors` nền bị trình duyệt ép màu nên dấu check có thể biến mất, không có rule thay thế.
- Chưa có `nxtMenuItemCheckbox` (CDK có `CdkMenuItemCheckbox`).
- `src/menu.css:72`: icon check là SVG nhúng (data URI), không lấy từ bộ `nxt-icon`.
- `src/menu.css:20`, `:31`: dùng primitive `--nxt-space-1`; `:58` opacity 0.5 viết cứng.

### Đã xử lý (2026-10-19)
- Thêm `NxtMenuGroup` (`[nxtMenuGroup]`, `role="group"`, input `label`) để tách các nhóm radio; mỗi `nxtMenu` có `UniqueSelectionDispatcher` riêng nên radio ở menu khác không bị bỏ chọn. Có unit test. Còn lại: `nxtMenuLabel` vẫn là chú thích trực quan, tên nhóm đặt qua `label` của group.
