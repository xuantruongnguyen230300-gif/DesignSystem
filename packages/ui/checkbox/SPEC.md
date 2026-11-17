---
component: checkbox
status: beta
owner: "NXT core"
updated: 2026-11-16
apg-pattern: checkbox
---

# Checkbox: Spec

Entry `@nxt/ui/checkbox` gồm `nxt-checkbox` (một ô) và `nxt-checkbox-group` (nhóm có `fieldset` + `legend`, hướng dẫn và lỗi cấp nhóm).

## 1. Mục đích
- **Vấn đề người dùng giải quyết:** bật/tắt một lựa chọn độc lập hoặc chọn nhiều mục trong một danh sách, rồi xác nhận bằng một hành động khác (lưu form, thao tác hàng loạt). Biết được ô / nhóm nào bắt buộc, sai ở đâu, và ô nào trong form đang sửa là chỉ đọc.
- **Khi nào dùng:**
  - Lựa chọn có/không trong form: "Đóng bảo hiểm xã hội".
  - Chọn nhiều giá trị trong một nhóm ngắn: `nxt-checkbox-group`.
  - Xác nhận bắt buộc trước khi gửi: "Tôi xác nhận bảng công tháng 9 là chính xác" (`required` + `error`).
  - Chọn hàng trong bảng và "chọn tất cả" (trạng thái `indeterminate`), với `hideLabel`.
- **Khi nào KHÔNG dùng:**
  - Chọn đúng một trong vài giá trị: dùng `nxt-radio-group` (trong form) hoặc `nxt-segmented` (đổi chế độ xem).
  - Bật/tắt có hiệu lực ngay, không cần lưu: dùng `nxt-switch`.
  - Danh sách lựa chọn dài (> ~8) hoặc cần tìm: dùng combobox chọn nhiều.

Theo SAP Fiori (checkbox): thay đổi của checkbox chỉ có hiệu lực sau khi bấm hành động (Lưu); `indeterminate` chỉ là trạng thái hiển thị của nhóm con chọn một phần, người dùng không bấm ra được.

## 2. Anatomy
### `nxt-checkbox`
| # | Phần tử | Bắt buộc | Ghi chú |
|---|---------|----------|---------|
| 1 | Host `nxt-checkbox` | ✓ | `inline-flex` theo cột |
| 2 | `label.nxt-checkbox__label` | ✓ | Bọc input; vùng chạm tối thiểu 24×24 |
| 3 | `input[type=checkbox]` native | ✓ | Tự vẽ (`appearance: none`) 20px, bo mềm theo `radius.control` (tối đa 30% cạnh hộp, ≈ 6px); trạng thái là `:checked` / `:indeterminate` / `:disabled` native; viền lỗi bằng `outline` khi `invalid` |
| 4 | Nhãn `.nxt-checkbox__text` | ✓ | Ẩn bằng `.nxt-visually-hidden` khi `hideLabel`, vẫn được đọc |
| 5 | Dấu `*` | — | Khi `required`; `aria-hidden="true"` |
| 6 | Gợi ý `p.nxt-checkbox__hint` | — | Khi có `hint`; nằm **ngoài** `label`, thụt vào thẳng hàng chữ nhãn |
| 7 | Lỗi `p.nxt-checkbox__error` | — | Khi có `error`: icon `alert-circle` + chữ, thụt như gợi ý, đứng trên gợi ý |

### `nxt-checkbox-group`
| # | Phần tử | Bắt buộc | Ghi chú |
|---|---------|----------|---------|
| 1 | `fieldset.nxt-checkbox-group` | ✓ | Không viền, không padding |
| 2 | `legend.nxt-checkbox-group__label` | ✓ | Nhãn nhóm, kiểu chữ như nhãn `nxt-form-field`; `*` + chữ ẩn "(bắt buộc)" khi `required` |
| 3 | Gợi ý nhóm `.nxt-checkbox-group__hint` | — | Ngay dưới legend |
| 4 | Danh sách `.nxt-checkbox-group__options` | ✓ | Các `nxt-checkbox` (content); dọc mặc định |
| 5 | Lỗi nhóm `.nxt-checkbox-group__error` | — | **Dưới** nhóm: icon + chữ |

## 3. API (Angular)
### `nxt-checkbox`
Implement `ControlValueAccessor` (`formControl`, `ngModel`).

| Loại | Tên | Kiểu | Mặc định | Mô tả |
|------|-----|------|----------|-------|
| model | `checked` | `boolean` | `false` | Two-way `[(checked)]` |
| output | `toggled` | `{ checked: boolean; shiftKey: boolean }` | | Người dùng vừa bấm; `shiftKey` lấy từ sự kiện con trỏ/phím thật. Dùng cho chọn dải trong bảng (`NxtSelection`) |
| input | `indeterminate` | `boolean` | `false` | Trạng thái "một phần" (một số hàng được chọn) |
| input | `label` | `string` | (bắt buộc) | Tên truy cập và nhãn hiển thị |
| input | `hideLabel` | `boolean` | `false` | Ẩn nhãn khỏi màn hình (chọn hàng trong bảng), vẫn đọc được |
| input | `hint` | `string` | `undefined` | Chữ gợi ý dưới nhãn, nối bằng `aria-describedby` |
| input | `error` | `string \| null` | `undefined` | Lỗi của riêng ô này (ô xác nhận bắt buộc): hiện dưới ô, `aria-invalid`, nối `aria-describedby` |
| input | `invalid` | `boolean` | `false` | Đánh dấu lỗi mà không có thông điệp riêng (thông điệp nằm ở nhóm / nơi khác) |
| input | `required` | `boolean` | `false` | `*` sau nhãn + `aria-required="true"` (không dùng `required` native để tránh bong bóng lỗi của trình duyệt) |
| input | `readonly` | `boolean` | `false` | Chỉ đọc trong form đang sửa: focus được, không đổi được, `aria-readonly` |
| input | `disabled` | `boolean` | `false` | Gộp với trạng thái disabled của form control và của nhóm |

### `nxt-checkbox-group`
Không giữ giá trị (mỗi ô một `formControl` / `[(checked)]`); nhóm chỉ đặt tên, hướng dẫn, lỗi và trạng thái chung.

| Loại | Tên | Kiểu | Mặc định | Mô tả |
|------|-----|------|----------|-------|
| input | `label` | `string` | (bắt buộc) | Câu hỏi chung của nhóm (`legend`). Quy tắc chọn ghi trong ngoặc: "Kênh nhận thông báo (chọn ít nhất một)" |
| input | `hint` | `string` | `undefined` | Hướng dẫn dưới legend |
| input | `error` | `string \| null` | `undefined` | Lỗi cấp nhóm: hiện **dưới** nhóm; mọi ô trong nhóm `aria-invalid` + viền lỗi |
| input | `required` | `boolean` | `false` | `*` sau legend + chữ ẩn `requiredLabel` |
| input | `requiredLabel` | `string` | `'(bắt buộc)'` | Chữ ẩn đọc sau legend khi `required` (i18n) |
| input | `orientation` | `'vertical' \| 'horizontal'` | `'vertical'` | Dọc trong form; ngang chỉ cho 2–3 nhãn ngắn |
| input | `disabled` | `boolean` | `false` | Khoá cả nhóm (`fieldset disabled`) |
| input | `readonly` | `boolean` | `false` | Mọi ô trong nhóm chỉ đọc |
| content | (default) | | | Các `nxt-checkbox` |

## 4. Variants & sizes
Không có variant hay size. Ô check 20px (`size.icon.md`) cố định; vùng chạm của label ≥ 24×24 (`size.icon.lg`).

| Cách dùng | Cấu hình |
|-----------|----------|
| Trong form | `label` hiển thị |
| Nhóm nhiều lựa chọn | `nxt-checkbox-group label="…"` + các `nxt-checkbox` |
| Ô xác nhận bắt buộc | `required` + `error` khi chưa chọn lúc gửi |
| Chọn hàng trong bảng | `hideLabel`, `label="Chọn {tên hàng}"` |
| Chọn tất cả | `hideLabel`, `indeterminate` khi chọn một phần, `label="Chọn tất cả"` |
| Lựa chọn cần giải thích hệ quả | `label` + `hint` |

## 5. States
| Rest | Hover | Focus-visible | Active/Pressed | Selected | Disabled | Loading | Error | Read-only | Empty |
|------|-------|---------------|----------------|----------|----------|---------|-------|-----------|-------|
| ✓ | ✓ (native) | ✓ ring token | ✓ (native) | ✓ `checked`, ✓ `indeterminate` | ✓ native `disabled` (ô, form, hoặc nhóm), nhãn màu `text.disabled` | — (lựa chọn tại chỗ, không chờ máy chủ) | ✓ `error` / `invalid` / lỗi nhóm: `outline` `border.danger` quanh ô + `aria-invalid`, thông điệp icon + chữ | ✓ `readonly`: màu ô trung tính `icon.subtle`, con trỏ mặc định, focus được, `aria-readonly`; bấm / Space không đổi | — |

Thông điệp lỗi luôn có icon + chữ; viền đỏ chỉ là tín hiệu phụ (WCAG 1.4.1). Read-only khác disabled: vẫn trong thứ tự Tab, nhãn đủ tương phản.

## 6. Keyboard & ARIA
APG pattern: https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/

| Phím | Hành vi |
|------|---------|
| Tab / Shift+Tab | Focus vào hoặc ra từng ô; ô `disabled` bị bỏ qua (native); ô `readonly` vẫn nhận focus |
| Space | Đổi trạng thái (native); `indeterminate` chuyển thành checked/unchecked. Khi `readonly`: không đổi (`click` bị `preventDefault`) |

- Role: native `checkbox`, không gắn thêm `role`. Tên truy cập lấy từ `label` bọc input.
- Trạng thái "mixed" qua thuộc tính DOM `indeterminate` của input native.
- `aria-describedby` của ô = lỗi riêng (nếu có), rồi gợi ý (nếu có). `p` gợi ý / lỗi nằm ngoài `label`, nên không thành một phần của tên.
- `aria-invalid="true"` khi `error`, `invalid` hoặc nhóm có lỗi. `aria-required="true"` khi `required`. `aria-readonly="true"` khi `readonly` (ARIA 1.2 cho phép trên `checkbox`).
- Nhóm: `fieldset` (role `group`) có tên từ `legend`; `aria-describedby` của `fieldset` = gợi ý nhóm, rồi lỗi nhóm. Role `group` không nhận `aria-required`, nên bắt buộc của nhóm đọc qua chữ ẩn `requiredLabel` trong legend; `*` có `aria-hidden`.
- Focus ring: `:focus-visible` với `focus.ring.*` (đè lên viền lỗi khi focus).

## 7. Tokens
`packages/tokens/src/component/checkbox.tokens.json`:

| Token | Alias semantic |
|-------|----------------|
| `accent` | `color.bg.primary` (nền hộp đã chọn / lưng chừng) |
| `accent-readonly` | `color.icon.subtle` |
| `size` | `size.icon.md` |
| `touch-target` | `size.row.md` (tạm, xem §8 Density / touch) |
| `radius` | `radius.control` (CSS giới hạn ở 30% cạnh hộp) |
| `border` / `bg` | `color.border.input` (≥ 3:1) / `color.bg.surface` |
| `mark` | `color.text.on-primary` (dấu check, gạch ngang) |
| `bg-disabled` / `border-disabled` | `color.bg.disabled` / `color.icon.disabled` |
| `label-text` | `color.text.default` |
| `group-label-text` | `color.text.default` (như `form-field.label-text`) |
| `hint-text` | `color.text.subtle` (như `form-field.hint-text`) |
| `error-text`, `required-text` | `color.text.danger` |
| `border-invalid` | `color.border.danger` |

Dùng thẳng semantic: `space.gap.{xs,sm}`, `size.icon.lg` (vùng chạm), `typography.body-md`, `typography.label-md` (legend), `typography.caption` (gợi ý, lỗi), `border-width.{default,strong}`, `focus.ring.{width,color,offset}`, `color.text.disabled`. Cặp `icon.subtle` / `surface` (3:1), `border.danger` / `surface` (3:1), `text.danger` / `surface` (4.5:1) đã có trong `contrastPairs`.

## 8. Density, responsive, i18n
- Ô check và vùng chạm không đổi theo density (20px / 24px) với con trỏ chuột; khoảng cách tới nhãn theo density.
- **Density / touch (Apple HIG: vùng chạm ≥ 44×44pt).** Trên thiết bị có `@media (pointer: coarse)`, nhãn (là vùng bấm, bọc cả ô check) có `min-block-size` bằng `touch-target`, nên mỗi hàng checkbox cao tối thiểu bằng đó; ô check không có nhãn nhìn thấy được đặt giữa một ô vuông cùng cỡ (`min-inline-size`). Ô check vẫn 20px: chỉ vùng bấm và nhịp hàng đổi, và chỉ trên cảm ứng; không có rule nào cho `pointer: fine`. Token `touch-target` tạm alias `size.row.md` (44px ở comfortable, 56px ở spacious, 32px ở compact); cần token `semantic.size.touch-target` (44px, không đổi theo density), khi có chỉ việc đổi alias (xem Button §8).
- Nhãn dài tự xuống dòng, ô check căn giữa theo dòng.
- `hint` và lỗi thụt vào bằng bề rộng ô check + `space.gap.sm`, thẳng hàng với chữ nhãn; tự xuống dòng.
- Nhóm ngang tự xuống dòng khi hết chỗ (`flex-wrap`); chỉ dùng ngang cho 2–3 nhãn ngắn.
- Nhãn tiếng Việt dùng `body-md` (14 / 20px), không cắt dấu. Mọi chữ mặc định (`requiredLabel`) override được qua input.

## 9. Content guidelines
- Nhãn khẳng định, nói rõ điều sẽ xảy ra khi chọn: "Gửi email thông báo cho nhân viên". Không dùng câu phủ định ("Không gửi email").
- Nhãn ẩn trong bảng vẫn phải cụ thể: "Chọn Nguyễn Văn An", không chỉ "Chọn".
- Nhóm có `label` nêu câu hỏi: "Loại hợp đồng áp dụng". Quy tắc chọn ghi trong ngoặc ở nhãn nhóm: "(chọn ít nhất một)".
- Lỗi nói cách sửa: "Đánh dấu ô xác nhận để gửi bảng công.", "Chọn ít nhất một kênh nhận thông báo."

## 10. Acceptance (Definition of Done)
- [ ] Mọi trạng thái ở §5 (gồm `indeterminate`, `hideLabel` trong bảng, lỗi nhóm, chỉ đọc) có trong docs example (`checkbox-validation`, `checkbox-readonly`) — chưa chạy `docs:generate` / xem bản render
- [x] Unit test: native checkbox có tên, `[(checked)]` hai chiều, trạng thái mixed, dùng với Angular forms kể cả disabled, `toggled` báo đúng trạng thái và phím Shift, `hint` nối `aria-describedby` và nằm ngoài tên
- [x] Unit test (2026-11-06): `error` / `invalid` / `required` → `aria-*` và thứ tự `aria-describedby`; `readonly` chặn click/Space, vẫn focus được; nhóm: legend, `aria-describedby` của fieldset, lỗi nhóm lan xuống từng ô, `disabled` / `readonly` của nhóm
- [ ] axe: 0 vi phạm ở sáng/tối/gọn — lần chạy gần nhất 2026-10-19 (trước khi thêm lỗi / chỉ đọc / nhóm); cần chạy lại
- [x] `npm run ds:check` sạch (tokens + hardcoded)
- [x] Docs page đủ mục (skill `nxt-docs-page`)

## 11. Việc còn mở
- `src/checkbox.ts`: `indeterminate` chỉ là input một chiều. Khi người dùng bấm, input native tự bỏ mixed nhưng signal vẫn `true`; nơi dùng phải tự tính lại.
- Disabled dùng `disabled` native (không focus được), khác Button dùng `aria-disabled`; không gắn được tooltip giải thích lý do. Lý do ghi trong nhãn hoặc `hint`.
- `writeValue` gọi `checked.set`, làm phát `checkedChange` cả khi giá trị đến từ form.
- Read-only của ô **chưa chọn** trông gần như ô thường (ô native không đổi được màu viền); tín hiệu chính là con trỏ, `aria-readonly` và ngữ cảnh form hỗn hợp. Ô native không có `readonly`, nên chặn bằng `preventDefault` trên `click`.
- `src/checkbox.css`: màu nhãn disabled dùng thẳng `--nxt-color-text-disabled`, không qua component token.

### Bổ sung (2026-10-19)
- Input `hint`: chữ gợi ý dưới nhãn, nối vào input bằng `aria-describedby`. Phát hiện ở template Quy trình duyệt.
- Host đổi sang `inline-flex` theo cột (nhãn, rồi gợi ý); không có `hint` thì bố cục như cũ.

### Bổ sung (2026-11-06, theo SAP Fiori: checkbox, trạng thái component)
- Input `error`, `invalid`, `required`, `readonly` cho `nxt-checkbox` (tên chung theo component-conventions §2).
- Component mới `nxt-checkbox-group`: `fieldset` + `legend`, hướng dẫn nhóm, **lỗi cấp nhóm đặt dưới nhóm** (cả nhóm vào trạng thái lỗi), `required`, `disabled`, `readonly`, `orientation`.
- Token mới `checkbox.{accent-readonly,group-label-text,error-text,required-text,border-invalid}`.
- Sửa: ô native được đặt lại theo giá trị sau mỗi lần giá trị đổi (`afterRenderEffect`). Trước đây, nếu người dùng bấm rồi form đặt lại giá trị cũ trước lần render kế tiếp, binding `[checked]` không ghi lại và ô hiển thị sai giá trị.
