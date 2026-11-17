---
component: form-field
status: beta
owner: "NXT core"
updated: 2026-11-06
apg-pattern: "none (native form controls)"
---

# Form field & Input: Spec

Entry `@nxt/ui/form-field` gồm `nxt-form-field` (khung nhãn + control + thông điệp trạng thái / hướng dẫn / bộ đếm) và directive `nxtInput` (style và nối ARIA cho `input` / `textarea` / `select` native).

## 1. Mục đích
- **Vấn đề người dùng giải quyết:** nhập dữ liệu với nhãn luôn nhìn thấy, biết trường nào bắt buộc, đọc hướng dẫn định dạng, thấy ngay cạnh trường giá trị đang **sai** (phải sửa), **cần xem lại** (vẫn lưu được), **do hệ thống đề xuất** hay **vừa được hệ thống xác nhận**, và nhận ra trường nào trong form đang sửa là **chỉ đọc**.
- **Khi nào dùng:** mọi trường nhập liệu một dòng, nhiều dòng hoặc chọn từ danh sách native trong form, bộ lọc, ô tìm kiếm. Field cũng là khung cho các control ghép có ô nhập bên trong: `nxt-date-picker` / `nxt-date-range-picker` (`@nxt/ui/date-picker`), `nxt-combobox` (`@nxt/ui/combobox`), ô có value help (`@nxt/ui/value-help`) — đặt chúng **trong** `nxt-form-field` để có nhãn, `*`, trạng thái giá trị và chỉ đọc giống mọi trường khác.
- **Khi nào KHÔNG dùng:**
  - Checkbox / nhóm checkbox: dùng `nxt-checkbox` / `nxt-checkbox-group`. Nhóm radio: `nxt-radio-group`. Bật/tắt có hiệu lực ngay: `nxt-switch`. `nxt-form-field` chỉ bọc **một** control `nxtInput`.
  - Chọn ngày, chọn từ danh sách dài có tìm kiếm, tìm đối tượng theo nhiều thuộc tính: không giả lập bằng `input[nxtInput]` (`type="date"`, `datalist`); dùng date picker / combobox / value help ở trên, vẫn đặt trong `nxt-form-field`. Upload file: chưa có component.
  - Hiển thị giá trị trong trang chi tiết / chế độ xem: dùng `nxt-descriptions` (không `*`, trống "—"). `readonly` chỉ dành cho trường **không sửa được trong một form đang sửa** (form hỗn hợp, ví dụ "Mã" khi sửa danh mục). Trường không bao giờ sửa được thì hiển thị dạng chữ.

## 2. Anatomy
| # | Phần tử | Bắt buộc | Ghi chú |
|---|---------|----------|---------|
| 1 | Host `nxt-form-field` | ✓ | Cột dọc, `min-inline-size: 0` |
| 2 | `label` | ✓ | `for` = id của control; ẩn bằng `.nxt-visually-hidden` khi `hideLabel` |
| 3 | Dấu `*` bắt buộc | — | Khi `required` và không `readonly`; `aria-hidden="true"` |
| 4 | Khung control `.nxt-form-field__control` | ✓ | Viền, nền, focus ring (`:focus-within`); viền theo trạng thái giá trị; style riêng khi chỉ đọc |
| 5 | Prefix `[nxtPrefix]` | — | Icon / chữ trước control |
| 6 | Control `[nxtInput]` | ✓ | `input`, `textarea` hoặc `select` native, trực tiếp hoặc nằm trong một control ghép (date picker, combobox) |
| 7 | Suffix `[nxtSuffix]` | — | Icon / nút / đơn vị sau control |
| 8 | Chevron | — | Tự thêm khi control là `select` (ẩn khi `readonly`) |
| 9 | Chân field `.nxt-form-field__footer` | — | Chỉ có khi có thông điệp, hướng dẫn hoặc bộ đếm |
| 10 | Thông điệp trạng thái `.nxt-form-field__message` | — | Icon + chữ theo trạng thái (`data-status`); lỗi có thêm class `.nxt-form-field__error`. Đứng **trên** hướng dẫn |
| 11 | Hướng dẫn `.nxt-form-field__hint` | — | Khi có `hint`; **giữ nguyên** khi có thông điệp (không bị thay) |
| 12 | Bộ đếm `.nxt-form-field__counter` | — | Khi `counter` và control có `maxlength`: "120/500", căn cuối dòng |

## 3. API (Angular)
Selector: `nxt-form-field`; `input[nxtInput]`, `textarea[nxtInput]`, `select[nxtInput]`.

| Loại | Tên | Kiểu | Mặc định | Mô tả |
|------|-----|------|----------|-------|
| `nxt-form-field` input | `label` | `string` | (bắt buộc) | Nhãn hiển thị và tên truy cập |
| `nxt-form-field` input | `hint` | `string` | `undefined` | Hướng dẫn dưới control |
| `nxt-form-field` input | `error` | `string \| null` | `undefined` | Lỗi: giá trị sai, **chặn lưu**. Chuỗi khác rỗng → trạng thái `error` |
| `nxt-form-field` input | `warning` | `string \| null` | `undefined` | Cảnh báo: giá trị hợp lệ nhưng cần xem lại, **không chặn lưu** |
| `nxt-form-field` input | `info` | `string \| null` | `undefined` | Thông tin: giá trị do hệ thống đề xuất / tự điền, hoặc điều cần lưu ý |
| `nxt-form-field` input | `success` | `string \| null` | `undefined` | Thành công: chỉ khi hệ thống **vừa** xác nhận giá trị (đối chiếu máy chủ). Không tô cho mọi trường hợp lệ |
| `nxt-form-field` input | `statusLabels` | `NxtFieldStatusLabels` | `{ warning: 'Cảnh báo', info: 'Thông tin', success: 'Thành công' }` | Chữ ẩn đọc trước thông điệp cho screen reader (i18n) |
| `nxt-form-field` input | `required` | `boolean` | `false` | Hiện `*` và đặt `aria-required` lên control (bỏ khi `readonly`) |
| `nxt-form-field` input | `readonly` | `boolean` | `false` | Chỉ đọc trong form đang sửa: control focus và copy được, không sửa được; style riêng; phản ánh `data-readonly` |
| `nxt-form-field` input | `counter` | `boolean` | `false` | Hiện bộ đếm ký tự theo `maxlength` của control |
| `nxt-form-field` input | `counterText` | `(count: number, max: number) => string` | `Đã nhập {count} trên {max} ký tự` | Câu đầy đủ cho screen reader của bộ đếm (i18n) |
| `nxt-form-field` input | `hideLabel` | `boolean` | `false` | Ẩn nhãn khỏi màn hình (vẫn đọc được); chỉ cho ô tìm kiếm rõ mục đích |
| `nxt-form-field` input | `size` | `'sm' \| 'md'` | `'md'` | Phản ánh ra `data-size` |
| `nxt-form-field` (readonly) | `status` | `Signal<NxtFieldStatus \| null>` | | Trạng thái giá trị đang hiển thị (để pattern tính tóm tắt lỗi) |
| `nxt-form-field` content | `[nxtPrefix]`, (default), `[nxtSuffix]` | | | Prefix, control, suffix |
| `nxtInput` input | `numeric` | `boolean` | `false` | Số tiền / số lượng / số giờ: căn cuối + `tabular-nums`. Không dùng cho mã, số điện thoại, CCCD |
| `nxtInput` (readonly) | `kind` | `'input' \| 'textarea' \| 'select'` | theo tag | Dùng để thêm chevron, style textarea |

Export type: `NxtFieldStatus = 'error' | 'warning' | 'info' | 'success'`, `NxtFieldStatusLabels`.

`nxt-form-field` không giữ giá trị và không validate: nơi dùng gắn `formControl` / `ngModel` lên control native và truyền thông điệp vào `error` / `warning` / `info` / `success`. Id được sinh tự động (`nxt-field-{n}`, `-message`, `-hint`, `-counter`).

### Dành cho control ghép (date picker, combobox, value help)
Control ghép lấy field bằng DI, không cần token riêng: `inject(NxtFormField, { optional: true })` (field là ancestor injector của component đặt trong nó). Ô nhập bên trong control ghép vẫn mang `nxtInput`, nên `id`, `label[for]`, `aria-describedby`, `aria-invalid`, `aria-required` tự nối như control thường. Các signal công khai để đọc:

| Thành viên | Kiểu | Dùng để |
|------------|------|---------|
| `label()` | `string` | Đặt tên nút phụ ("Chọn ngày, Ngày sinh") |
| `status()` | `NxtFieldStatus | null` | Biết trạng thái giá trị đang hiện |
| `statusMessage()` | `string | null` | Lặp lại thông điệp trong panel nổi khi cần |
| `describedIds()` | `string[]` | Id thông điệp, hướng dẫn, bộ đếm theo thứ tự đọc: đặt làm `aria-describedby` cho panel / dialog nổi (cùng document nên tham chiếu được dù panel nằm trong overlay), để thông điệp vẫn được đọc khi focus đang ở trong panel |
| `messageId`, `hintId` | `string` | Id từng phần tử, khi chỉ cần một |
| `readonly()` | `boolean` | Control ghép tự khoá phần sửa của nó (ẩn nút mở panel, chặn phím mở panel). Field chỉ đặt `readonly` native lên ô `nxtInput` |
| `isRequired()` | `boolean` | `required` và không `readonly` |
| `controlId()` | `string` | Id của ô nhập (đích của `label[for]`) |

**Vì sao bốn input song song thay cho `state` + `message`:** lỗi đến từ validator, cảnh báo đến từ luật nghiệp vụ, thông tin đến từ hệ thống đề xuất: ba nguồn khác nhau. Input song song cho nơi dùng bind thẳng từng nguồn (`[error]="errors().salary" [warning]="salaryWarning()"`) mà không phải tự gộp thành một object; `error` giữ nguyên nên tương thích ngược. Mỗi lúc field chỉ hiện **một** trạng thái theo thứ tự ưu tiên **error > warning > info > success** (theo SAP Fiori: mỗi phần tử chỉ có một value state tại một thời điểm).

## 4. Variants & sizes
| Loại control | Ghi chú |
|--------------|---------|
| `input` | Một dòng |
| `textarea` | Cao tối thiểu 2,5 × chiều cao control, kéo giãn theo chiều dọc; bộ đếm khi có `maxlength` |
| `select` | `appearance: none`, chevron do field thêm |

| Size | comfortable | compact | spacious |
|------|-------------|---------|----------|
| `sm` | 28px | 24px | 32px |
| `md` | 32px | 28px | 40px |

### Trạng thái giá trị (value state)
Theo SAP Fiori: value state (lỗi / cảnh báo / thông tin / thành công / không có).

| Trạng thái | Khi nào | Chặn lưu | Viền (component → semantic) | Icon | ARIA |
|------------|---------|----------|-----------------------------|------|------|
| (không) | Trước khi kiểm tra, **và sau khi kiểm tra đạt** | — | `control-border` → `border.input` | — | — |
| `error` | Giá trị sai hoặc thiếu; người dùng phải sửa mới lưu được | **Có** | `control-border-invalid` → `border.danger` | `alert-circle` | `aria-invalid="true"` |
| `warning` | Hợp lệ nhưng bất thường, có thể gây lỗi về sau (ngày nghỉ trùng lễ, lương dưới mức tham chiếu) | Không | `control-border-warning` → `border.warning` | `alert-triangle` | chữ ẩn "Cảnh báo:" |
| `info` | Hệ thống đề xuất / tự điền giá trị, hoặc lưu ý không phải lỗi | Không | `control-border-info` → `border.info` | `info-circle` | chữ ẩn "Thông tin:" |
| `success` | Hệ thống **vừa** xác nhận giá trị (đối chiếu mã số thuế, kiểm tra trùng mã) | Không | `control-border-success` → `border.success` | `circle-check` | chữ ẩn "Thành công:" |

Thông điệp luôn có **icon + chữ** (không chỉ đổi màu viền, WCAG 1.4.1). Không có trạng thái "hợp lệ màu xanh" cho mọi trường đã nhập đúng.

## 5. States
| Rest | Hover | Focus-visible | Active/Pressed | Selected | Disabled | Loading | Error | Read-only | Empty |
|------|-------|---------------|----------------|----------|----------|---------|-------|-----------|-------|
| ✓ | ✓ viền `input-hover` (không đổi khi `readonly` / có trạng thái giá trị) | ✓ viền accent 2px (vòng focus đè lên viền 1px) + vòng mờ `focus-halo`, nền chuyển sang `bg.surface`; cả khi `readonly` (không đổi nền) | — | — | ✓ control `disabled` native: nền `bg.disabled`, viền nhạt `border.default`, chữ `text.disabled` | — (chưa có) | ✓ `error` (+ `warning` / `info` / `success`, xem §4): viền theo trạng thái, nền nhạt (chỉ `error` / `warning`), icon + chữ | ✓ `readonly`: nền trong suốt, viền nhạt `border.default`, chữ giữ `text.strong`, không chevron, không `*`; focus và chọn / copy được | ✓ placeholder màu `text.subtle` (không thay nhãn) |

`readonly` khác `disabled`: chỉ đọc vẫn nằm trong thứ tự Tab, đọc rõ đủ tương phản, copy được; disabled bị bỏ qua khi Tab và mờ đi (dùng khi điều kiện bật lại là hiển nhiên, ghi lý do trong `hint`).

## 6. Keyboard & ARIA
APG pattern: không áp dụng (control native).

| Phím | Hành vi |
|------|---------|
| Tab / Shift+Tab | Focus vào control (native); control `disabled` bị bỏ qua; control `readonly` vẫn nhận focus |
| Các phím khác | Hành vi native của `input` / `textarea` / `select` |
| Phím đổi giá trị trên `select` `readonly` (↑ ↓ ← → Home End PageUp PageDown Space Enter F4, gõ ký tự) | Bị chặn (`preventDefault`): giá trị không đổi. Tab, phím tắt trình duyệt (Ctrl/⌘ + phím) vẫn chạy |

Bấm chuột vào nhãn cũng focus control (`label[for]`). Bấm chuột vào `select` `readonly` chỉ focus, không mở danh sách.

`nxtInput` đặt lên control:
- `id`: id tĩnh nơi dùng tự đặt (`<input nxtInput id="ma-nv">`) được **giữ** và dùng cho `label[for]`; không có thì sinh `nxt-field-{n}`.
- `aria-describedby` = id thông điệp trạng thái, rồi hướng dẫn, rồi bộ đếm, rồi **id tĩnh nơi dùng tự đặt** (`<input nxtInput aria-describedby="ghi-chu">` được nối vào cuối, không bị ghi đè). Không có gì thì bỏ thuộc tính.
- `aria-invalid="true"` chỉ khi trạng thái là `error`; `aria-required="true"` khi `required` và không `readonly`.
- `readonly`: `input` / `textarea` nhận thuộc tính `readonly` native (trình duyệt tự báo chỉ đọc); `select` không có `readonly` native nên nhận `aria-readonly="true"` + chặn phím / chuột như bảng trên. `readonly` do field đặt thì field tự gỡ; `readonly` nơi dùng tự bind lên control không bị field đụng tới (vẫn có style chỉ đọc qua `:has([readonly])`).

Thông điệp `warning` / `info` / `success` có chữ ẩn ("Cảnh báo: …") để screen reader phân biệt với hướng dẫn; lỗi không cần vì đã có `aria-invalid`. Bộ đếm hiện "120/500" (`aria-hidden`) và có câu ẩn đầy đủ ("Đã nhập 120 trên 500 ký tự") nằm trong `aria-describedby`: đọc khi focus vào trường, không đọc mỗi lần gõ phím.

Dấu `*` có `aria-hidden="true"` (trạng thái bắt buộc đi qua `aria-required`). Icon trạng thái là trang trí.

Đã kiểm bằng Playwright e2e (2026-10-19): form trong drawer của template catalog (focus về trường lỗi đầu tiên khi validate) và template phê duyệt.

## 7. Tokens
`packages/tokens/src/component/form-field.tokens.json`:

| Token | Alias semantic |
|-------|----------------|
| `label-text` | `color.text.default` |
| `hint-text`, `counter-text` | `color.text.subtle` |
| `error-text`, `required-text` | `color.text.danger` |
| `warning-text` / `info-text` / `success-text` | `color.text.warning` / `color.text.info` / `color.text.success` |
| `control-bg` / `control-bg-disabled` / `control-bg-readonly` | `color.bg.muted` (nền đặc kiểu iOS, không có token `field` riêng) / `color.bg.disabled` / `color.bg.transparent` |
| `control-bg-focus` | `color.bg.surface` (field nổi lên trắng khi focus) |
| `control-bg-invalid` / `control-bg-warning` | `color.bg.danger-subtle` / `color.bg.warning-subtle` (nền nhạt đi kèm viền trạng thái) |
| `focus-halo` | `color.bg.selected-hover` (vòng mờ 4px quanh field khi focus, tĩnh, không animate) |
| `control-text` | `color.text.strong` |
| `control-placeholder` | `color.text.subtle` |
| `control-border` / `-hover` | `color.border.input` / `color.border.input-hover` |
| `control-border-invalid` / `-warning` / `-info` / `-success` | `color.border.danger` / `color.border.warning` / `color.border.info` / `color.border.success` |
| `control-border-readonly` / `-disabled` | `color.border.default` |
| `control-border-focus` | `color.border.selected` (accent; cùng vòng focus 2px tạo viền dày 2px) |
| `control-radius` | `radius.control` |
| `control-height`, `control-height-sm` | `size.control.md`, `size.control.sm` |
| `affix-color` | `color.icon.subtle` |

Dùng thẳng semantic: `space.gap.{xs,sm}`, `space.inset.{sm,md,lg}`, `size.icon.sm`, `border-width.default`, `typography.{label-md,body-md,caption}`, `focus.ring.*`, `motion.duration.fast`, `color.text.disabled`. Cặp `border.{input,danger,warning,success,info}` / `surface` (3:1) và `text.danger` / `surface` (4.5:1) có trong `contrastPairs`; ❓ cần thêm `text.{warning,info,success}` / `bg.surface` (4.5:1) vào `contrastPairs` (đo tay từ `dist/json` 2026-11-06: sáng 6,49 / 6,26 / 5,92; tối 9,82 / 10,00 / 10,15).

Kiểu iOS (2026-11-16): field có nền đặc `bg.muted`, bo `radius.control` (14px), padding ngang `space.inset.lg`; ranh giới 1px `border.input` giữ nguyên để đạt 3:1 (cặp `border.input` / `bg.muted` có trong `contrastPairs`). ❓ chưa có trong `contrastPairs`: `border.danger` / `bg.danger-subtle` và `border.warning` / `bg.warning-subtle` (3:1), `text.strong` / `bg.muted` và `text.subtle` / `bg.danger-subtle` (4.5:1).

Viền chỉ đọc `border.default` không cần 3:1: ranh giới chỉ đọc không phải thông tin bắt buộc để thao tác (chữ giá trị mới là thông tin, và giữ `text.strong`).

## 8. Density, responsive, i18n
- Chiều cao control theo density; khoảng cách nhãn – control – chân field theo density.
- Field co giãn theo bề rộng cha; đặt trong `nxt-grid` để form 2 cột tự về 1 cột ở drawer hẹp (luật số cột: pattern "Form nhập liệu").
- Nhãn `label-md` và control `body-md` (14 / 20px) đủ chỗ cho dấu chồng tiếng Việt. Thông điệp, hướng dẫn tự xuống dòng; bộ đếm không xuống dòng.
- Hướng dẫn định dạng theo locale `vi`: "dd/MM/yyyy", "1.250.000 ₫". Bộ đếm định dạng số theo `vi-VN` ("1.200/2.000").
- Mọi chữ mặc định (`statusLabels`, `counterText`) override được qua input.

## 9. Content guidelines
- Nhãn là danh từ ngắn, sentence case, không có dấu hai chấm: "Ngày bắt đầu", "Phòng ban". Không gõ tay `*` vào nhãn.
- Placeholder chỉ là ví dụ ("VD: 0901 234 567"), không thay nhãn, không lặp lại nhãn và không chứa thông tin bắt buộc.
- `hint` nói định dạng hoặc ràng buộc: "Theo định dạng dd/MM/yyyy".
- `error` nói chuyện gì sai và cách sửa: "Ngày kết thúc phải sau ngày bắt đầu. Hãy chọn lại ngày kết thúc." Không viết "Không hợp lệ". Thiếu trường bắt buộc: "Nhập họ và tên." / "Chọn phòng ban."
- `warning` nói điều bất thường và hệ quả, không ra lệnh: "Ngày 02/09/2026 là ngày lễ, ngày này không tính phép."
- `info` nói nguồn của giá trị: "Lấy theo hợp đồng HĐ-2026-0142. Sửa nếu đã có phụ lục."
- `success` ngắn, nói điều đã được xác nhận: "Đã đối chiếu với cơ quan thuế."
- Số tiền, số lượng khi **sửa**: `nxtInput numeric` (căn cuối, `tabular-nums`), đơn vị ở `nxtSuffix` và nhắc trong nhãn/hint. Khi **xem** (`nxt-descriptions`): căn đầu như chữ.
- Form dài có tóm tắt lỗi ở đầu form và focus về trường lỗi đầu tiên. Cảnh báo không chặn lưu và không đưa vào tóm tắt lỗi.

## 10. Acceptance (Definition of Done)
- [ ] Mọi trạng thái ở §5, ba loại control, prefix/suffix, `hideLabel` có trong docs example (trạng thái giá trị: `form-field-value-states`; chỉ đọc: `form-field-readonly`; bộ đếm: `form-field-textarea-select`) — chưa chạy `docs:generate` / xem bản render
- [x] Unit test: nhãn nối với control không cần id thủ công, `hint` + `aria-required`, lỗi + `aria-invalid` (hướng dẫn giữ lại), chevron cho `select`, nhãn ẩn vẫn được đọc
- [x] Unit test (2026-11-06): thứ tự ưu tiên trạng thái và viền `data-status`, chữ ẩn trạng thái override được, `aria-describedby` nối id tĩnh của nơi dùng, id tĩnh được giữ, `readonly` (native trên input, `aria-readonly` + chặn phím trên select, không `*`), bộ đếm, `numeric`
- [x] Playwright e2e: focus trường lỗi trong drawer (template catalog), template phê duyệt (2026-10-19)
- [ ] axe: 0 vi phạm ở sáng/tối/gọn — lần chạy gần nhất 2026-10-19 (trước khi thêm trạng thái giá trị / chỉ đọc); cần chạy lại
- [x] `npm run ds:check` sạch (tokens + hardcoded)
- [x] Docs page đủ mục (skill `nxt-docs-page`)

## 11. Việc còn mở
- Lỗi xuất hiện không được thông báo (không có live region); người dùng screen reader chỉ nghe thấy khi quay lại trường. Hiện dựa vào tóm tắt lỗi / focus của pattern (pattern "Form nhập liệu").
- Chưa có `loading` (kiểm tra máy chủ đang chạy, ví dụ trước khi hiện `success`).
- `src/form-field.ts`: mỗi field chỉ nhận một `nxtInput`; control đăng ký sau ghi đè control trước, không cảnh báo.
- Control ghép phải tự đọc `field.readonly()` (date picker hiện chỉ đọc input `readonly` của chính nó; bind `[readOnly]` của nó và effect của field cùng ghi lên ô nhập) và tự đặt `aria-describedby` cho panel nổi từ `field.describedIds()`. Việc nối này thuộc component date picker / combobox.
- `aria-describedby` / `id` nơi dùng **bind động** (`[attr.aria-describedby]`) vẫn xung đột với host binding của `nxtInput`; chỉ giá trị tĩnh được nối.
- `select` `readonly` dựa vào chặn `mousedown`: trên một số trình duyệt di động, chạm vẫn có thể mở bảng chọn native (giá trị vẫn không đổi trên desktop). Trường chọn chỉ đọc lâu dài nên hiển thị dạng chữ.
- Bộ đếm chỉ đọc `maxlength` native (trình duyệt chặn gõ quá giới hạn). Chế độ "cho gõ vượt rồi báo lỗi" (dán văn bản dài không bị cắt) chưa làm.
- `src/form-field.css`: margin của `*` dùng primitive `--nxt-space-0-5`; chữ control disabled dùng thẳng `--nxt-color-text-disabled`.

### Thay đổi 2026-11-06 (theo SAP Fiori: value state, read-only, text area)
- Thêm `warning` / `info` / `success` + `statusLabels`; thông điệp đứng trên hướng dẫn, **hướng dẫn không còn bị lỗi thay chỗ** (người dùng giữ được hướng dẫn định dạng đúng lúc cần).
- Thêm `readonly`, `counter` / `counterText`, `nxtInput numeric`; signal công khai `statusMessage`, `describedIds` cho control ghép. Style chỉ đọc nhận cả ô `nxtInput[readonly]` nằm sâu trong control ghép.
- Sửa: `aria-describedby` / `id` tĩnh của nơi dùng không còn bị ghi đè. `nxtInput` đứng ngoài field không còn nhận `id="null"`.
- Khoảng cách icon – chữ của thông điệp chuyển từ primitive `--nxt-space-1` sang `space.gap.xs`.
