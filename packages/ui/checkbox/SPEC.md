---
component: checkbox
status: beta
owner: "NXT core"
updated: 2026-10-19
apg-pattern: checkbox
---

# Checkbox: Spec

## 1. Mục đích
- **Vấn đề người dùng giải quyết:** bật/tắt một lựa chọn độc lập hoặc chọn nhiều mục trong một danh sách, rồi xác nhận bằng một hành động khác (lưu form, thao tác hàng loạt).
- **Khi nào dùng:**
  - Lựa chọn có/không trong form: "Đóng bảo hiểm xã hội".
  - Chọn nhiều giá trị trong một nhóm ngắn (bọc `fieldset` + `legend`).
  - Chọn hàng trong bảng và "chọn tất cả" (trạng thái `indeterminate`), với `hideLabel`.
- **Khi nào KHÔNG dùng:**
  - Chọn đúng một trong vài giá trị: dùng radio hoặc `nxt-segmented`.
  - Bật/tắt có hiệu lực ngay, không cần lưu: dùng switch (chưa có).
  - Danh sách lựa chọn dài: dùng select / combobox (chưa có).

## 2. Anatomy
| # | Phần tử | Bắt buộc | Ghi chú |
|---|---------|----------|---------|
| 1 | Host `nxt-checkbox` | ✓ | `inline-flex` |
| 2 | `label.nxt-checkbox__label` | ✓ | Bọc input; vùng chạm tối thiểu 24×24 |
| 3 | `input[type=checkbox]` native | ✓ | 16px, màu `accent-color` |
| 4 | Nhãn `.nxt-checkbox__text` | ✓ | Ẩn bằng `.nxt-visually-hidden` khi `hideLabel`, vẫn được đọc |
| 5 | Gợi ý `p.nxt-checkbox__hint` | — | Khi có `hint`; nằm **ngoài** `label`, dưới nhãn, thụt vào thẳng hàng chữ nhãn; `id` riêng, input trỏ tới qua `aria-describedby` |

## 3. API (Angular)
Selector: `nxt-checkbox`. Implement `ControlValueAccessor` (`formControl`, `ngModel`).

| Loại | Tên | Kiểu | Mặc định | Mô tả |
|------|-----|------|----------|-------|
| model | `checked` | `boolean` | `false` | Two-way `[(checked)]` |
| output | `toggled` | `{ checked: boolean; shiftKey: boolean }` | | Người dùng vừa bấm; `shiftKey` lấy từ sự kiện con trỏ/phím thật (`change` không mang phím bổ trợ). Dùng cho chọn dải trong bảng (`NxtSelection`) |
| input | `indeterminate` | `boolean` | `false` | Trạng thái "một phần" (một số hàng được chọn) |
| input | `label` | `string` | (bắt buộc) | Tên truy cập và nhãn hiển thị |
| input | `hideLabel` | `boolean` | `false` | Ẩn nhãn khỏi màn hình (chọn hàng trong bảng), vẫn đọc được |
| input | `hint` | `string` | `undefined` | Chữ gợi ý dưới nhãn (hệ quả của lựa chọn, điều kiện). Nối vào input bằng `aria-describedby`; kiểu chữ như hint của `nxt-form-field` |
| input | `disabled` | `boolean` | `false` | Gộp với trạng thái disabled của form control |

Output: `checkedChange` (từ `model`). Không có content slot.

## 4. Variants & sizes
Không có variant hay size. Ô check 16px (`size.icon.sm`) cố định; vùng chạm của label ≥ 24×24 (`size.icon.lg`).

| Cách dùng | Cấu hình |
|-----------|----------|
| Trong form | `label` hiển thị |
| Chọn hàng trong bảng | `hideLabel`, `label="Chọn {tên hàng}"` |
| Chọn tất cả | `hideLabel`, `indeterminate` khi chọn một phần, `label="Chọn tất cả"` |
| Lựa chọn cần giải thích hệ quả | `label` + `hint` ("Người được uỷ quyền phải cùng phòng hoặc là cấp trên.") |

## 5. States
| Rest | Hover | Focus-visible | Active/Pressed | Selected | Disabled | Loading | Error | Read-only | Empty |
|------|-------|---------------|----------------|----------|----------|---------|-------|-----------|-------|
| ✓ | ✓ (native) | ✓ ring token | ✓ (native) | ✓ `checked`, ✓ `indeterminate` | ✓ native `disabled`, nhãn màu `text.disabled` | — | — (chưa có `invalid`) | — (chưa có) | — |

## 6. Keyboard & ARIA
APG pattern: https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/

| Phím | Hành vi |
|------|---------|
| Tab / Shift+Tab | Focus vào hoặc ra; checkbox `disabled` bị bỏ qua (native) |
| Space | Đổi trạng thái (native); `indeterminate` chuyển thành checked/unchecked |

- Role: native `checkbox`, không gắn thêm `role`. Tên truy cập lấy từ `label` bọc input.
- Trạng thái "mixed" qua thuộc tính DOM `indeterminate` của input native (trình duyệt tự báo `aria-checked="mixed"`).
- `hint`: `p` có `id` (`nxt-checkbox-{n}-hint`) nằm ngoài `label`, nên không thành một phần của tên; input có `aria-describedby` trỏ tới, screen reader đọc tên, trạng thái rồi gợi ý. Không có `hint` thì không có `aria-describedby`.
- Focus ring: `:focus-visible` với `focus.ring.*`.

## 7. Tokens
`packages/tokens/src/component/checkbox.tokens.json`:

| Token | Alias semantic |
|-------|----------------|
| `accent` | `color.bg.primary` |
| `size` | `size.icon.sm` |
| `label-text` | `color.text.default` |
| `hint-text` | `color.text.subtle` (như `form-field.hint-text`) |

Dùng thẳng semantic: `space.gap.sm`, `size.icon.lg` (vùng chạm), `typography.body-md`, `typography.caption` (hint), `focus.ring.{width,color,offset}`, `color.text.disabled`.

## 8. Density, responsive, i18n
- Ô check và vùng chạm không đổi theo density (16px / 24px); khoảng cách tới nhãn theo density.
- Nhãn dài tự xuống dòng, ô check căn giữa theo dòng.
- `hint` thụt vào bằng bề rộng ô check + `space.gap.sm`, nên thẳng hàng với chữ nhãn; tự xuống dòng.
- Nhãn tiếng Việt dùng `body-md` (14 / 20px), không cắt dấu.

## 9. Content guidelines
- Nhãn khẳng định, nói rõ điều sẽ xảy ra khi chọn: "Gửi email thông báo cho nhân viên". Không dùng câu phủ định ("Không gửi email").
- Nhãn ẩn trong bảng vẫn phải cụ thể: "Chọn Nguyễn Văn An", không chỉ "Chọn".
- Nhóm checkbox có `legend` nêu câu hỏi: "Loại hợp đồng áp dụng".

## 10. Acceptance (Definition of Done)
- [ ] Mọi trạng thái ở §5 (gồm `indeterminate`, `hideLabel` trong bảng) có trong docs example
- [x] Unit test: native checkbox có tên, `[(checked)]` hai chiều, trạng thái mixed, dùng với Angular forms kể cả disabled, `toggled` báo đúng trạng thái và phím Shift, `hint` nối `aria-describedby` và nằm ngoài tên
- [x] axe: 0 vi phạm ở sáng/tối/gọn (Playwright, `npm run test:a11y`; 2026-10-19, 341/341)
- [x] `npm run ds:check` sạch (tokens + hardcoded)
- [x] Docs page đủ mục (skill `nxt-docs-page`)

## 11. Việc còn mở
- Thiếu input `invalid`, `readonly`, `required` theo quy ước tên chung (component-conventions §2); checkbox bắt buộc trong form chưa báo lỗi được và chưa nối `aria-describedby` tới lỗi (hướng dẫn đã nối được qua `hint`).
- `src/checkbox.ts:42`: `indeterminate` chỉ là input một chiều. Khi người dùng bấm, input native tự bỏ mixed nhưng signal vẫn `true`; không có output báo ngược, nơi dùng phải tự tính lại để khỏi lệch.
- Disabled dùng `disabled` native (không focus được), khác Button dùng `aria-disabled`; không gắn được tooltip giải thích lý do.
- `src/checkbox.ts:58`: `writeValue` gọi `checked.set`, làm phát `checkedChange` cả khi giá trị đến từ form.
- `src/checkbox.css:33`: màu nhãn disabled dùng thẳng `--nxt-color-text-disabled`, không qua component token.

### Bổ sung (2026-10-19)
- Input `hint`: chữ gợi ý dưới nhãn, nối vào input bằng `aria-describedby`, kiểu chữ và màu như hint của `nxt-form-field` (`typography.caption`, token mới `checkbox.hint-text` = `color.text.subtle`). Phát hiện ở template Quy trình duyệt (quyền của người duyệt): các lựa chọn như "Được uỷ quyền cho người khác duyệt thay" cần giải thích hệ quả mà không nhồi vào nhãn.
- Host đổi sang `inline-flex` theo cột (nhãn, rồi gợi ý); không có `hint` thì bố cục như cũ.
