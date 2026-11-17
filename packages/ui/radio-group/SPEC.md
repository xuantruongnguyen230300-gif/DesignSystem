---
component: radio-group
status: beta
owner: "NXT core"
updated: 2026-11-16
apg-pattern: radio-group
---

# Radio group: Spec

Entry `@nxt/ui/radio-group` gồm `nxt-radio-group` (nhóm, giữ giá trị, `ControlValueAccessor`) và `nxt-radio` (một phương án).

## 1. Mục đích
- **Vấn đề người dùng giải quyết:** chọn **đúng một** trong vài phương án loại trừ nhau, thấy hết các phương án cùng lúc để so sánh trước khi chọn, trong một form sẽ được lưu: hình thức làm việc, loại hợp đồng, cách tính phép.
- **Khi nào dùng:**
  - 3–8 phương án, cần thấy hết cùng lúc, nhãn có thể dài hoặc cần gợi ý riêng từng phương án.
  - Trường trong form cần báo lỗi (bắt buộc chọn), khoá (`disabled` / `readonly`) và chạy với Angular forms.
- **Khi nào KHÔNG dùng:**
  - Chỉ hai phương án có/không: dùng `nxt-checkbox` (chờ Lưu) hoặc `nxt-switch` (có hiệu lực ngay).
  - Hơn 8 phương án, hoặc người dùng thường chọn phương án phổ biến: dùng `select[nxtInput]` có giá trị mặc định; danh sách dài cần tìm: combobox.
  - Đổi chế độ xem / bộ lọc nhanh có hiệu lực ngay, nhãn 1–2 từ: dùng `nxt-segmented`.
  - Chọn nhiều: dùng `nxt-checkbox-group`.

Theo SAP Fiori (radio button): nhóm radio hoạt động như **một control** (Tab vào thẳng phương án đang chọn, mũi tên đi trong nhóm); trong form luôn xếp **dọc**; tối đa 8 phương án; chọn sẵn phương án ít rủi ro nhất, trừ khi chọn sẵn gây giả định sai (khi đó để trống và báo lỗi nếu bắt buộc); cho phép "không chọn" bằng phương án "Không áp dụng".

## 2. Anatomy
| # | Phần tử | Bắt buộc | Ghi chú |
|---|---------|----------|---------|
| 1 | Host `nxt-radio-group` | ✓ | `block` |
| 2 | `fieldset.nxt-radio-group__fieldset` | ✓ | `role="radiogroup"`, không viền, không padding |
| 3 | `legend.nxt-radio-group__label` | ✓ | Tên nhóm, kiểu chữ như nhãn `nxt-form-field`; `*` (`aria-hidden`) khi `required`; ẩn bằng `.nxt-visually-hidden` khi `hideLabel` |
| 4 | Gợi ý nhóm `.nxt-radio-group__hint` | — | Ngay dưới legend |
| 5 | Danh sách `.nxt-radio-group__options` | ✓ | Các `nxt-radio` (content); dọc mặc định |
| 6 | `nxt-radio` → `label.nxt-radio__label` | ✓ | Bọc `input[type=radio]` native (tự vẽ `appearance: none`, 20px: vòng viền + chấm accent) + nhãn; vùng chạm ≥ 24×24 |
| 7 | Gợi ý phương án `.nxt-radio__hint` | — | Ngoài `label`, thụt thẳng hàng chữ nhãn |
| 8 | Lỗi nhóm `.nxt-radio-group__error` | — | **Dưới** nhóm: icon `alert-circle` + chữ |

## 3. API (Angular)
### `nxt-radio-group`
Selector `nxt-radio-group`. Generic `NxtRadioGroup<T = unknown>`. Implement `ControlValueAccessor` (`formControl`, `formControlName`, `ngModel`).

| Loại | Tên | Kiểu | Mặc định | Mô tả |
|------|-----|------|----------|-------|
| model | `value` | `T \| null` | `null` | Phương án đang chọn, two-way `[(value)]`; so sánh bằng `===` |
| input | `label` | `string` | (bắt buộc) | Tên nhóm (`legend`), câu hỏi ngắn: "Hình thức làm việc" |
| input | `hint` | `string` | `undefined` | Hướng dẫn dưới legend |
| input | `error` | `string \| null` | `undefined` | Lỗi cấp nhóm: hiện **dưới** nhóm, `aria-invalid` trên nhóm, viền lỗi quanh từng nút |
| input | `required` | `boolean` | `false` | `*` sau legend + `aria-required` trên nhóm |
| input | `orientation` | `'vertical' \| 'horizontal'` | `'vertical'` | Dọc trong form; ngang chỉ cho 2–3 nhãn một từ |
| input | `disabled` | `boolean` | `false` | Khoá cả nhóm (`fieldset disabled`); gộp với disabled của form control |
| input | `readonly` | `boolean` | `false` | Chỉ đọc trong form đang sửa: focus được phương án đang chọn, không đổi được, `aria-readonly` |
| input | `hideLabel` | `boolean` | `false` | Ẩn legend khỏi màn hình (vẫn đọc được) khi ngữ cảnh đã có tiêu đề nói rõ |
| content | (default) | | | Các `nxt-radio` |

### `nxt-radio`
Phải nằm trong một `nxt-radio-group`.

| Loại | Tên | Kiểu | Mặc định | Mô tả |
|------|-----|------|----------|-------|
| input | `value` | `unknown` | (bắt buộc) | Giá trị gán vào `value` của nhóm khi chọn |
| input | `label` | `string` | (bắt buộc) | Nhãn hiển thị và tên truy cập; **một dòng** |
| input | `hint` | `string` | `undefined` | Gợi ý dưới nhãn (hệ quả của phương án), nối bằng `aria-describedby` |
| input | `disabled` | `boolean` | `false` | Khoá riêng phương án này (ghi lý do trong `hint`) |

## 4. Variants & sizes
| Variant | Dùng khi | Không dùng khi |
|---------|----------|----------------|
| Dọc (mặc định) | Mọi nhóm trong form; nhãn dài ngắn khác nhau | — |
| `orientation="horizontal"` | 2–3 phương án nhãn một từ ("Nam · Nữ · Khác") ở vùng rộng | Nhãn dài; trong cột form hẹp. Khi hết chỗ nhóm tự xuống dòng (`flex-wrap`), đó là dấu hiệu nên dùng dọc |

Không có size. Nút radio 20px (`size.icon.md`) cố định; vùng chạm của label ≥ 24×24 (`size.icon.lg`).

## 5. States
| Rest | Hover | Focus-visible | Active/Pressed | Selected | Disabled | Loading | Error | Read-only | Empty |
|------|-------|---------------|----------------|----------|----------|---------|-------|-----------|-------|
| ✓ | ✓ (native) | ✓ ring token trên nút | ✓ (native) | ✓ `checked` (native `:checked`; vòng + chấm màu `accent`) | ✓ nhóm (`fieldset disabled`) hoặc từng phương án, nhãn `text.disabled` | — (lựa chọn tại chỗ) | ✓ `error`: lỗi dưới nhóm (icon + chữ), `aria-invalid` trên nhóm, `outline` `border.danger` quanh từng nút | ✓ `readonly`: nút đã chọn màu trung tính `icon.subtle`, con trỏ mặc định, `aria-readonly` trên nhóm; click / mũi tên / Space không đổi | ✓ `value` `null`: không phương án nào được chọn (Tab vào phương án đầu) |

## 6. Keyboard & ARIA
APG pattern: https://www.w3.org/WAI/ARIA/apg/patterns/radio/

| Phím | Hành vi |
|------|---------|
| Tab / Shift+Tab | Vào nhóm tại phương án đang chọn (chưa chọn: phương án đầu khi Tab, cuối khi Shift+Tab); ra khỏi nhóm. Cả nhóm là **một** điểm dừng Tab (native) |
| ↓ / → | Chuyển tới và **chọn** phương án kế tiếp, vòng về đầu; bỏ qua phương án `disabled` (native) |
| ↑ / ← | Chuyển tới và chọn phương án trước, vòng về cuối (native) |
| Space | Chọn phương án đang focus nếu chưa chọn (native) |
| ↑ ↓ ← → / Space khi `readonly` | Không đổi gì (`preventDefault`): focus đứng yên ở phương án đang chọn |

- Mỗi `nxt-radio` đặt lại `checked` của radio native theo `value` của nhóm sau mỗi lần giá trị đổi (`afterRenderEffect`), để radio không lệch khi form đặt lại giá trị trước lần render kế tiếp (binding `[checked]` một mình không ghi lại).
- Cấu trúc native: `input[type=radio]` dùng chung `name` duy nhất (`nxt-radio-group-{n}`), nên Tab / mũi tên / chọn do trình duyệt lo (cùng cách với `nxt-segmented`). Không tự viết roving tabindex.
- `fieldset` mang `role="radiogroup"` (ARIA in HTML cho phép) để nhận `aria-required`, `aria-invalid`, `aria-readonly` — role `group` mặc định không nhận các thuộc tính này. Tên nhóm qua `aria-labelledby` = id của `legend` (chắc chắn có tên dù role bị đổi).
- `aria-describedby` của nhóm = gợi ý nhóm, rồi lỗi nhóm. `aria-describedby` của từng nút = gợi ý của phương án đó.
- Mũi tên trên radio native **chọn ngay** (không cần Space): cố ý giữ hành vi native/APG, khác SAP Fiori (mũi tên chỉ chuyển focus). Lựa chọn trong form chỉ có hiệu lực khi lưu, nên chọn ngay không gây hệ quả.
- `readonly`: radio native không có `readonly`, nên chặn bằng `preventDefault` trên `click` (trả lại trạng thái cũ) và trên phím mũi tên.
- Focus ring: `:focus-visible` với `focus.ring.*` (đè lên viền lỗi khi focus). Forced colors: viền lỗi dùng màu hệ thống.

## 7. Tokens
`packages/tokens/src/component/radio-group.tokens.json`:

| Token | Alias semantic |
|-------|----------------|
| `accent` | `color.bg.primary` (viền + chấm khi chọn) |
| `accent-readonly` | `color.icon.subtle` |
| `size` | `size.icon.md` |
| `touch-target` | `size.row.md` (tạm, xem §8 Density / touch) |
| `border` / `bg` | `color.border.input` (≥ 3:1) / `color.bg.surface` |
| `bg-disabled` / `border-disabled` | `color.bg.disabled` / `color.icon.disabled` |
| `label-text` | `color.text.default` (legend, như `form-field.label-text`) |
| `option-text` | `color.text.default` |
| `hint-text` | `color.text.subtle` |
| `error-text`, `required-text` | `color.text.danger` |
| `border-invalid` | `color.border.danger` |

Dùng thẳng semantic: `space.gap.{xs,sm,lg}`, `size.icon.lg` (vùng chạm), `typography.{label-md,body-md,caption}`, `border-width.{default,strong}`, `focus.ring.*`, `color.text.disabled`. Các cặp tương phản cần (`bg.primary`, `icon.subtle`, `border.danger` / `surface` ≥ 3:1; `text.danger`, `text.subtle` / `surface` ≥ 4.5:1) đã có trong `contrastPairs` (`bg.primary` qua cặp `text.on-primary`/`bg.primary` và đo tay 5,14 / 3,49 ở sáng / tối).

## 8. Density, responsive, i18n
- Nút và vùng chạm không đổi theo density (20px / 24px) với con trỏ chuột; khoảng cách giữa các phương án theo density.
- **Density / touch (Apple HIG: vùng chạm ≥ 44×44pt).** Trên thiết bị có `@media (pointer: coarse)`, nhãn phương án (là vùng bấm, bọc cả nút radio) có `min-block-size` bằng `touch-target`, nên mỗi hàng cao tối thiểu bằng đó. Nút radio vẫn 20px: chỉ vùng bấm và nhịp hàng đổi, và chỉ trên cảm ứng; không có rule nào cho `pointer: fine`. Token `touch-target` tạm alias `size.row.md` (44px ở comfortable, 56px ở spacious, 32px ở compact); cần token `semantic.size.touch-target` (44px, không đổi theo density), khi có chỉ việc đổi alias (xem Button §8).
- Nhãn phương án giới hạn **một dòng** về nội dung (viết ngắn); nếu vẫn dài thì tự xuống dòng, không cắt. Gợi ý thụt vào thẳng hàng chữ nhãn, tự xuống dòng.
- Ngang tự xuống dòng khi hết chỗ; trong form hẹp dùng dọc.
- Tiếng Việt `body-md` (14 / 20px), không cắt dấu. Không có chữ mặc định nào trong component (mọi chữ do nơi dùng truyền vào).

## 9. Content guidelines
- `label` của nhóm là câu hỏi ngắn hoặc danh từ: "Hình thức làm việc", "Cách tính ngày phép".
- Nhãn phương án ngắn, cùng loại từ, không lặp phần chung của nhóm: "Tại văn phòng · Kết hợp · Từ xa".
- Thứ tự theo logic (rủi ro thấp → cao, hay dùng → ít dùng), không theo bảng chữ cái.
- Chọn sẵn phương án an toàn nhất. Không chọn sẵn khi việc đó gây giả định sai (giới tính, tình trạng hôn nhân); khi đó `required` + lỗi "Chọn giới tính." lúc gửi.
- Được phép bỏ trống thì thêm phương án "Không áp dụng" thay vì để người dùng không chọn được lại.
- Lỗi nói cách sửa: "Chọn hình thức làm việc."

## 10. Acceptance (Definition of Done)
- [ ] Mọi trạng thái ở §5 có trong docs example (`radio-group-basic`, `radio-group-validation`, `radio-group-states`) — chưa chạy `docs:generate` / xem bản render
- [x] Unit test: radiogroup có tên từ legend, `name` chung duy nhất, `[(value)]` hai chiều, Angular forms (giá trị, disabled, touched), lỗi nhóm → `aria-invalid` + `aria-describedby`, `required`, phương án `disabled`, `readonly` chặn click và mũi tên, gợi ý phương án
- [ ] Unit test phím mũi tên / Tab: hành vi native của trình duyệt, jsdom không mô phỏng → kiểm ở Playwright (chưa có test e2e riêng)
- [ ] axe: 0 vi phạm ở sáng/tối/gọn — chưa chạy
- [x] `npm run ds:check` sạch (tokens + hardcoded)
- [x] Docs page đủ mục (skill `nxt-docs-page`)

## 11. Việc còn mở
- Chưa có `compareWith` cho giá trị là object (so sánh bằng `===`).
- Read-only của nút **chưa chọn** trông như nút thường (nút native không đổi được màu viền); tín hiệu chính là nút đã chọn màu trung tính, con trỏ và `aria-readonly`.
- Phương án `disabled` dùng `disabled` native (không focus được), như checkbox; lý do ghi trong `hint` của phương án.
- Thuộc tính "số cột" (sắp nhóm thành n cột) của Fiori chưa làm; nhóm > 8 phương án nên đổi sang select / combobox thay vì chia cột.
