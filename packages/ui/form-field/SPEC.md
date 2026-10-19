---
component: form-field
status: beta
owner: "NXT core"
updated: 2026-10-19
apg-pattern: "none (native form controls)"
---

# Form field & Input: Spec

Entry `@nxt/ui/form-field` gồm `nxt-form-field` (khung nhãn + control + hướng dẫn/lỗi) và directive `nxtInput` (style và nối ARIA cho `input` / `textarea` / `select` native).

## 1. Mục đích
- **Vấn đề người dùng giải quyết:** nhập dữ liệu với nhãn luôn nhìn thấy, biết trường nào bắt buộc, đọc hướng dẫn định dạng, và thấy lỗi ngay cạnh trường kèm cách sửa.
- **Khi nào dùng:** mọi trường nhập liệu một dòng, nhiều dòng hoặc chọn từ danh sách native trong form, bộ lọc, ô tìm kiếm.
- **Khi nào KHÔNG dùng:**
  - Checkbox / nhóm radio: dùng `nxt-checkbox` / `nxt-segmented` trong `fieldset` + `legend`; `nxt-form-field` chỉ bọc một control `nxtInput`.
  - Chọn ngày, combobox có tìm kiếm, upload file: chưa có component, không giả lập bằng `nxtInput`.
  - Hiển thị giá trị chỉ đọc trong trang chi tiết: dùng danh sách mô tả (`dl`), không dùng input `readonly`.

## 2. Anatomy
| # | Phần tử | Bắt buộc | Ghi chú |
|---|---------|----------|---------|
| 1 | Host `nxt-form-field` | ✓ | Cột dọc, `min-inline-size: 0` |
| 2 | `label` | ✓ | `for` = id của control; ẩn bằng `.nxt-visually-hidden` khi `hideLabel` |
| 3 | Dấu `*` bắt buộc | — | Khi `required`; `aria-hidden="true"` |
| 4 | Khung control `.nxt-form-field__control` | ✓ | Viền, nền, focus ring (`:focus-within`), viền đỏ khi có lỗi |
| 5 | Prefix `[nxtPrefix]` | — | Icon / chữ trước control |
| 6 | Control `[nxtInput]` | ✓ | `input`, `textarea` hoặc `select` native |
| 7 | Suffix `[nxtSuffix]` | — | Icon / nút sau control |
| 8 | Chevron | — | Tự thêm khi control là `select` |
| 9 | Hướng dẫn `.nxt-form-field__hint` | — | Khi có `hint` và không có lỗi |
| 10 | Lỗi `.nxt-form-field__error` | — | Icon `alert-circle` + nội dung `error`; **thay thế** hướng dẫn |

## 3. API (Angular)
Selector: `nxt-form-field`; `input[nxtInput]`, `textarea[nxtInput]`, `select[nxtInput]`.

| Loại | Tên | Kiểu | Mặc định | Mô tả |
|------|-----|------|----------|-------|
| `nxt-form-field` input | `label` | `string` | (bắt buộc) | Nhãn hiển thị và tên truy cập |
| `nxt-form-field` input | `hint` | `string` | `undefined` | Hướng dẫn dưới control |
| `nxt-form-field` input | `error` | `string \| null` | `undefined` | Chuỗi khác rỗng → trạng thái lỗi |
| `nxt-form-field` input | `required` | `boolean` | `false` | Hiện `*` và đặt `aria-required` lên control |
| `nxt-form-field` input | `hideLabel` | `boolean` | `false` | Ẩn nhãn khỏi màn hình (vẫn đọc được); chỉ cho ô tìm kiếm rõ mục đích |
| `nxt-form-field` input | `size` | `'sm' \| 'md'` | `'md'` | Phản ánh ra `data-size` |
| `nxt-form-field` content | `[nxtPrefix]`, (default), `[nxtSuffix]` | | | Prefix, control, suffix |
| `nxtInput` | `kind` (readonly) | `'input' \| 'textarea' \| 'select'` | theo tag | Dùng để thêm chevron, style textarea |

`nxt-form-field` không giữ giá trị và không validate: nơi dùng gắn `formControl` / `ngModel` / `required` lên control native và truyền thông báo vào `error`. Id được sinh tự động (`nxt-field-{n}`, `-hint`, `-error`).

## 4. Variants & sizes
| Loại control | Ghi chú |
|--------------|---------|
| `input` | Một dòng |
| `textarea` | Cao tối thiểu 2,5 × chiều cao control, kéo giãn theo chiều dọc |
| `select` | `appearance: none`, chevron do field thêm |

| Size | comfortable | compact | spacious |
|------|-------------|---------|----------|
| `sm` | 28px | 24px | 32px |
| `md` | 32px | 28px | 40px |

## 5. States
| Rest | Hover | Focus-visible | Active/Pressed | Selected | Disabled | Loading | Error | Read-only | Empty |
|------|-------|---------------|----------------|----------|----------|---------|-------|-----------|-------|
| ✓ | ✓ viền `input-hover` | ✓ ring token trên khung (`:focus-within`) | — | — | ✓ control `disabled` native: nền `bg.disabled`, chữ `text.disabled` | — (chưa có) | ✓ `error`: viền `border.danger`, icon + chữ lỗi, `aria-invalid` | — (chưa có style riêng) | ✓ placeholder màu `text.subtle` (không thay nhãn) |

## 6. Keyboard & ARIA
APG pattern: không áp dụng (control native).

| Phím | Hành vi |
|------|---------|
| Tab / Shift+Tab | Focus vào control (native); control `disabled` bị bỏ qua |
| Các phím khác | Hành vi native của `input` / `textarea` / `select` |

Bấm chuột vào nhãn cũng focus control (`label[for]`).

`nxtInput` đặt lên control:
- `id` = `controlId` (nối với `label[for]`).
- `aria-describedby` = id của lỗi khi có lỗi, nếu không thì id của hướng dẫn, nếu không có cả hai thì bỏ.
- `aria-invalid="true"` khi có `error`; `aria-required="true"` khi `required`.

Dấu `*` có `aria-hidden="true"` (trạng thái bắt buộc đi qua `aria-required`). Icon lỗi là trang trí.

Đã kiểm bằng Playwright e2e (2026-10-19): form trong drawer của template catalog (focus về trường lỗi đầu tiên khi validate) và template phê duyệt.

## 7. Tokens
`packages/tokens/src/component/form-field.tokens.json`:

| Token | Alias semantic |
|-------|----------------|
| `label-text` | `color.text.default` |
| `hint-text` | `color.text.subtle` |
| `error-text`, `required-text` | `color.text.danger` |
| `control-bg` / `control-bg-disabled` | `color.bg.surface` / `color.bg.disabled` |
| `control-text` | `color.text.strong` |
| `control-placeholder` | `color.text.subtle` |
| `control-border` / `-hover` / `-invalid` | `color.border.input` / `color.border.input-hover` / `color.border.danger` |
| `control-radius` | `radius.control` |
| `control-height`, `control-height-sm` | `size.control.md`, `size.control.sm` |
| `affix-color` | `color.icon.subtle` |

Dùng thẳng semantic: `space.gap.{xs,sm}`, `space.inset.{sm,md,lg}`, `size.icon.sm`, `border-width.default`, `typography.{label-md,body-md,caption}`, `focus.ring.*`, `motion.duration.fast`, `color.text.disabled`. Cặp `border.input` / `surface` (3:1) và `text.danger` / `surface` (4.5:1) có trong `contrastPairs`.

## 8. Density, responsive, i18n
- Chiều cao control theo density; khoảng cách nhãn – control – lỗi theo density.
- Field co giãn theo bề rộng cha; đặt trong `nxt-grid` để form 2 cột tự về 1 cột ở drawer hẹp.
- Nhãn `label-md` và control `body-md` (14 / 20px) đủ chỗ cho dấu chồng tiếng Việt.
- Hướng dẫn định dạng theo locale `vi`: "dd/MM/yyyy", "1.250.000 ₫".

## 9. Content guidelines
- Nhãn là danh từ ngắn, sentence case, không có dấu hai chấm: "Ngày bắt đầu", "Phòng ban".
- Placeholder chỉ là ví dụ ("VD: 0901 234 567"), không thay nhãn và không chứa thông tin bắt buộc.
- `hint` nói định dạng hoặc ràng buộc: "Theo định dạng dd/MM/yyyy".
- `error` nói chuyện gì sai và cách sửa: "Ngày kết thúc phải sau ngày bắt đầu. Hãy chọn lại ngày kết thúc." Không viết "Không hợp lệ".
- Form dài có tóm tắt lỗi ở đầu form và focus về trường lỗi đầu tiên.

## 10. Acceptance (Definition of Done)
- [ ] Mọi trạng thái ở §5, ba loại control, prefix/suffix, `hideLabel` có trong docs example
- [x] Unit test: nhãn nối với control không cần id thủ công, `hint` + `aria-required`, lỗi thay hướng dẫn + `aria-invalid` và gỡ khi sửa xong, chevron cho `select`, nhãn ẩn vẫn được đọc
- [x] Playwright e2e: focus trường lỗi trong drawer (template catalog), template phê duyệt (2026-10-19)
- [x] axe: 0 vi phạm ở sáng/tối/gọn (Playwright, `npm run test:a11y`; 2026-10-19, 341/341)
- [x] `npm run ds:check` sạch (tokens + hardcoded)
- [x] Docs page đủ mục (skill `nxt-docs-page`)

## 11. Việc còn mở
- `src/form-field.ts:75`: `aria-describedby` do field ghi đè hoàn toàn; id mô tả mà nơi dùng tự thêm (ví dụ bộ đếm ký tự) bị mất. Tương tự `[id]` ở `:74` ghi đè id của control.
- `src/form-field.ts:40`–`44`: khi có lỗi thì hướng dẫn bị gỡ khỏi DOM; người dùng mất hướng dẫn định dạng đúng lúc cần nó. Cân nhắc giữ cả hai trong `aria-describedby`.
- Lỗi xuất hiện không được thông báo (không có live region); người dùng screen reader chỉ nghe thấy khi quay lại trường. Hiện dựa vào tóm tắt lỗi / focus của pattern.
- Không có style `readonly` (control chỉ đọc trông như sửa được) và chưa có `loading`.
- `src/form-field.ts:87`: mỗi field chỉ nhận một `nxtInput`; control đăng ký sau ghi đè control trước, không cảnh báo.
- `src/form-field.css:21`, `:108`: margin / gap dùng primitive `--nxt-space-0-5`, `--nxt-space-1`; `:82` dùng thẳng `--nxt-color-text-disabled`.
