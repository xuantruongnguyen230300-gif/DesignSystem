---
component: segmented
status: beta
owner: "NXT core"
updated: 2026-10-19
apg-pattern: radio-group
---

# Segmented control: Spec

## 1. Mục đích
- **Vấn đề người dùng giải quyết:** chuyển nhanh giữa 2–5 lựa chọn loại trừ nhau mà vẫn thấy hết các lựa chọn: kiểu hiển thị (bảng / thẻ), kỳ báo cáo (tháng / quý / năm), lọc nhanh theo trạng thái.
- **Khi nào dùng:** lựa chọn có hiệu lực ngay trên vùng hiện tại, số lựa chọn ít và nhãn ngắn.
- **Khi nào KHÔNG dùng:**
  - Chuyển giữa các panel nội dung khác nhau: dùng `nxt-tabs`.
  - Hơn 5 lựa chọn hoặc nhãn dài: dùng select (chưa có) hoặc radio dọc.
  - Chọn nhiều giá trị cùng lúc: dùng checkbox.
  - Giá trị nằm trong form cần validate và submit: chưa hỗ trợ Angular forms (xem §11), tạm dùng radio native.

## 2. Anatomy
| # | Phần tử | Bắt buộc | Ghi chú |
|---|---------|----------|---------|
| 1 | Host `nxt-segmented` | ✓ | `inline-flex` |
| 2 | `fieldset.nxt-segmented__group` (track) | ✓ | Nền `track-bg`, viền, bo `radius.control` |
| 3 | `legend` | ✓ | Nhãn nhóm, ẩn bằng `.nxt-visually-hidden` |
| 4 | Option `label.nxt-segmented__option` | ✓ | Bọc `input[type=radio]` trong suốt phủ kín option |
| 5 | Mặt option `.nxt-segmented__face` | ✓ | Icon (tuỳ chọn) + nhãn; option được chọn nổi lên nền `surface` |

## 3. API (Angular)
Selector: `nxt-segmented`. Generic `NxtSegmented<T extends string>`. Export type `NxtSegmentedOption<T>` = `{ value: T; label: string; icon?: NxtIconName }`.

| Loại | Tên | Kiểu | Mặc định | Mô tả |
|------|-----|------|----------|-------|
| input | `label` | `string` | (bắt buộc) | Tên nhóm, đọc qua `legend` |
| input | `options` | `NxtSegmentedOption<T>[]` | (bắt buộc) | 2–5 lựa chọn |
| model | `value` | `T \| undefined` | `undefined` | Giá trị đang chọn, two-way `[(value)]` |
| input | `size` | `'sm' \| 'md'` | `'md'` | Phản ánh ra `data-size` |
| input | `iconOnly` | `boolean` | `false` | Chỉ hiện icon; nhãn ẩn khỏi màn hình (vẫn đọc được) và hiện thành tooltip |

Output: `valueChange` (từ `model`). Không có content slot.

## 4. Variants & sizes
| Variant | Dùng khi | Không dùng khi |
|---------|----------|----------------|
| Có nhãn (mặc định) | Hầu hết trường hợp | |
| `iconOnly` | Toolbar chật, icon quen thuộc (bảng / thẻ, sáng / tối) | Icon không tự giải thích được |

`iconOnly` chỉ ẩn nhãn của option **có** `icon`; option không có icon vẫn hiện chữ.

| Size | comfortable | compact | spacious |
|------|-------------|---------|----------|
| `sm` | 28px | 24px | 32px |
| `md` | 32px | 28px | 40px |

## 5. States
| Rest | Hover | Focus-visible | Active/Pressed | Selected | Disabled | Loading | Error | Read-only | Empty |
|------|-------|---------------|----------------|----------|----------|---------|-------|-----------|-------|
| ✓ | ✓ chữ đậm màu hơn | ✓ ring token trên mặt option | — (native) | ✓ nền `surface` + `elevation.raised` | — (chưa có) | — | — | — | ✓ `value` rỗng: không option nào được chọn |

## 6. Keyboard & ARIA
APG pattern: https://www.w3.org/WAI/ARIA/apg/patterns/radio/

| Phím | Hành vi |
|------|---------|
| Tab / Shift+Tab | Vào nhóm tại option đang chọn (hoặc option đầu nếu chưa chọn); ra khỏi nhóm |
| ← / ↑ | Chọn option trước (native, vòng về cuối) |
| → / ↓ | Chọn option sau (native, vòng về đầu) |
| Space | Chọn option đang focus nếu chưa được chọn (native) |

- Cấu trúc native: `fieldset` + `legend` = radio group có tên; mỗi option là `input[type=radio]` dùng chung `name` duy nhất (`nxt-segmented-{n}`). Không gắn `role`.
- Tên option lấy từ nhãn trong `label`; ở `iconOnly` nhãn bị ẩn bằng `.nxt-visually-hidden` (không bị xoá) nên vẫn đọc được. Tooltip trùng tên nên không thêm `aria-describedby`.
- Icon trong option là trang trí.
- Forced colors: option được chọn có outline `Highlight`.
- Đã kiểm bằng Playwright e2e trong template phê duyệt (2026-10-19).

## 7. Tokens
`packages/tokens/src/component/segmented.tokens.json`:

| Token | Alias semantic |
|-------|----------------|
| `track-bg` | `color.bg.muted` |
| `track-border` | `color.border.default` |
| `item-text` | `color.text.subtle` |
| `item-text-hover` | `color.text.default` |
| `selected-bg` | `color.bg.surface` |
| `selected-text` | `color.text.strong` |
| `radius` | `radius.control` |
| `height`, `height-sm` | `size.control.md`, `size.control.sm` |

Dùng thẳng semantic: `size.icon.sm`, `space.gap.xs`, `space.inset.sm`, `border-width.default`, `elevation.raised`, `typography.label-sm`, `focus.ring.*`, `motion.duration.fast`, `motion.ease.standard`.

## 8. Density, responsive, i18n
- Chiều cao theo `size.control.*`, đổi theo density. Ở compact `sm` (24px) vùng chạm vẫn đạt 24×24 vì input phủ kín option.
- Nhãn không xuống dòng (`nowrap`). Nhóm không tự cuộn hay thu gọn khi hẹp: giữ số lựa chọn ít và nhãn ngắn.
- Tiếng Việt: `label-sm` (12 / 16px) đủ chỗ cho dấu chồng.

## 9. Content guidelines
- Nhãn 1–2 từ, cùng loại từ: "Tháng · Quý · Năm", "Bảng · Thẻ".
- `label` của nhóm nêu điều đang chọn: "Kỳ báo cáo", "Kiểu hiển thị".
- `iconOnly` vẫn bắt buộc `label` cho từng option; nhãn này thành tooltip và tên truy cập.

## 10. Acceptance (Definition of Done)
- [ ] Có nhãn, `iconOnly`, hai size, chưa chọn giá trị có trong docs example
- [x] Unit test: radio group có `legend`, phản ánh và cập nhật `value`, `iconOnly` giữ tên cho mọi option
- [x] Playwright e2e: segmented trong template phê duyệt (2026-10-19)
- [x] axe: 0 vi phạm ở sáng/tối/gọn (Playwright, `npm run test:a11y`; 2026-10-19, 341/341)
- [x] `npm run ds:check` sạch (tokens + hardcoded)
- [x] Docs page đủ mục (skill `nxt-docs-page`)

## 11. Việc còn mở
- Không có `disabled` (cả nhóm lẫn từng option) và không implement `ControlValueAccessor`, nên không dùng được với `formControl` / `ngModel` (component-conventions §2).
- `src/segmented.css:58`: option được chọn chỉ phân biệt bằng nền `bg.surface` trên track `bg.muted` + bóng + màu chữ; cặp này chưa nằm trong `contrastPairs`, chưa chắc đạt 3:1 cho chỉ báo trạng thái (WCAG 1.4.11).
- `src/segmented.css:14`, `:16`, `:40`, `:42`: khoảng đệm track dùng primitive `--nxt-space-0-5`, không theo density.
