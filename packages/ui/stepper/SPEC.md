---
component: stepper
status: draft
owner: "NXT core"
updated: 2026-11-16
apg-pattern: spinbutton
---

# Stepper: Spec

## 1. Mục đích
- **Vấn đề người dùng giải quyết:** nhập hoặc chỉnh **một con số trong khoảng hẹp** bằng cách bấm tăng / giảm từng bước, hoặc gõ thẳng khi biết số cần nhập: số ngày nghỉ, số lượng cần tuyển, hệ số lương, số giờ làm thêm.
- **Khi nào dùng:**
  - Số nguyên hoặc số thập phân có **khoảng giá trị nhỏ** và **bước cố định** (0–30 ngày, hệ số 1,0–10,0 bước 0,1).
  - Người dùng thường chỉnh lên xuống vài bước quanh một giá trị có sẵn, hoặc dùng cảm ứng và bấm nhanh hơn gõ.
- **Khi nào KHÔNG dùng:**
  - Số có khoảng rộng hoặc nhập số chính xác (lương, mã, số điện thoại, số CCCD): dùng `input[nxtInput]` trong `nxt-form-field` (bấm từng bước không đủ nhanh, không hợp mã định danh).
  - Chọn một giá trị trong khoảng liên tục, chỉ cần ước lượng và thấy vị trí trong khoảng: dùng `nxt-slider`.
  - Chọn một trong vài giá trị rời rạc có nhãn: `nxt-radio-group` / `nxt-segmented`.
  - Ngày, giờ: dùng `nxt-date-picker`; không dựng ngày bằng hai stepper.

Theo Apple HIG (Steppers): stepper tăng / giảm một giá trị **theo bước nhỏ** và luôn đi kèm **giá trị đang hiện**; chỉ dùng khi người dùng biết con số cần nhập nằm gần giá trị hiện tại; nhấn giữ lặp tăng / giảm. Theo WAI-ARIA APG (spinbutton): phần tử lấy focus là ô giá trị có `role="spinbutton"`; hai nút tăng / giảm chỉ là đường tắt cho chuột và cảm ứng.

## 2. Anatomy
| # | Phần tử | Bắt buộc | Ghi chú |
|---|---------|----------|---------|
| 1 | Host `nxt-stepper` | ✓ | `inline-grid`; `labelPosition` quyết định nhãn nằm trên (cột) hay đứng trước (hàng) |
| 2 | Nhãn `label.nxt-stepper__label` | ✓ | `for` = id của ô giá trị; ẩn bằng `.nxt-visually-hidden` khi `hideLabel` |
| 3 | Khung `.nxt-stepper__control` | ✓ | Bo `radius.control`, nền xám nhạt kiểu iOS; chứa nút giảm, ô giá trị, nút tăng; vẽ vòng focus quanh cả khung |
| 4 | Nút giảm `button.nxt-stepper__button` | ✓ | Icon `minus`; vuông, cạnh bằng chiều cao khung; ngoài thứ tự Tab (`tabindex="-1"`) |
| 5 | Ô giá trị `input.nxt-stepper__input[role=spinbutton]` | ✓ | `type="text"` + `inputmode`; con số hiện theo `vi-VN`; **phần tử duy nhất nhận focus** |
| 6 | Đơn vị `.nxt-stepper__unit` | — | Khi có `unit`: sau con số, `aria-hidden` (đã nằm trong `aria-valuetext`) |
| 7 | Nút tăng `button.nxt-stepper__button` | ✓ | Icon `plus`; như nút giảm |
| 8 | Gợi ý `p.nxt-stepper__hint` | — | Khi có `hint`; dưới khung, nối `aria-describedby` |
| 9 | Thông báo lỗi `p.nxt-stepper__error` | — | Khi `error` hoặc giá trị sai: icon `alert-circle` + chữ, dưới khung, nối `aria-describedby` |

## 3. API (Angular)
Selector: `nxt-stepper`. Implement `ControlValueAccessor` (`formControl`, `formControlName`, `ngModel`).

| Loại | Tên | Kiểu | Mặc định | Mô tả |
|------|-----|------|----------|-------|
| model | `value` | `number \| null` | `null` | Giá trị, two-way `[(value)]`; `null` = chưa nhập (ô trống) |
| input | `label` | `string` | (bắt buộc) | Đại lượng đang chỉnh: "Số ngày nghỉ phép" |
| input | `labelPosition` | `'top' \| 'start'` | `'top'` | `top`: nhãn trên khung như `nxt-form-field`; `start`: nhãn trước khung cùng hàng (danh sách thiết lập) |
| input | `hideLabel` | `boolean` | `false` | Ẩn nhãn khỏi màn hình (vẫn đọc được), ví dụ stepper trong ô bảng đã có tiêu đề cột |
| input | `hint` | `string` | `undefined` | Quy tắc hoặc hệ quả: "Tối đa 30 ngày mỗi năm." |
| input | `error` | `string \| null` | `undefined` | Lỗi do nơi dùng báo (từ form, từ máy chủ); đặt trạng thái lỗi |
| input | `required` | `boolean` | `false` | Dấu `*` (`aria-hidden`) sau nhãn và `aria-required` |
| input | `min` / `max` | `number` | `undefined` | Cận dưới / trên (gồm cả hai đầu); không đặt = không giới hạn phía đó |
| input | `step` | `number` | `1` | Bước của nút và phím mũi tên; số `≤ 0` coi như `1` |
| input | `unit` | `string` | `undefined` | Đơn vị sau con số: "ngày", "giờ", "%" |
| input | `fractionDigits` | `number` | theo `step` | Số chữ số thập phân hiện và làm tròn; mặc định là số chữ số thập phân của `step` / `min` (bước 0,5 → 1 chữ số) |
| input | `locale` | `string` | `'vi-VN'` | Locale đọc và hiện số (dấu `.` nghìn, dấu `,` thập phân với `vi-VN`) |
| input | `autoRepeat` | `boolean` | `true` | Nhấn giữ nút tăng / giảm thì lặp bước |
| input | `invalidText` | `string \| null` | `undefined` | Thay lời nhắc mặc định khi giá trị gõ không hợp lệ (i18n) |
| input | `decreaseLabel` / `increaseLabel` | `string` | `'Giảm'` / `'Tăng'` | Tên nút (i18n); tên đầy đủ là "Giảm, <nhãn>" |
| input | `disabled` | `boolean` | `false` | Gộp với disabled của form control; vẫn thấy giá trị |
| input | `readonly` | `boolean` | `false` | Thấy giá trị, focus được, không đổi được, `aria-readonly` |
| output | `valueChange` | `number \| null` | | Từ `model`; chỉ phát khi người dùng đổi hoặc nơi dùng đặt `value` |

Không có content slot.

## 4. Variants & sizes
| Cấu hình | Dùng khi | Không dùng khi |
|----------|----------|----------------|
| `labelPosition="top"` (mặc định) | Trong lưới form cạnh `nxt-form-field` | Danh sách thiết lập dài |
| `labelPosition="start"` | Danh sách thiết lập: nhãn bên trái, stepper bên phải | Đứng trong lưới form cạnh các field có nhãn trên |
| `unit` | Con số cần đơn vị mới rõ nghĩa (ngày, giờ, %) | Nhãn đã nêu đơn vị và con số một mình đủ rõ |
| `step` thập phân + `fractionDigits` | Hệ số, giờ nửa tiếng | Số nguyên |

Không có `size`: chiều cao khung là `size.control.md` theo mật độ (gọn 28 · vừa 36 · rộng 46px); mật độ rộng cho cảm ứng và đạt vùng chạm 44px+.

## 5. States
| Rest | Hover | Focus-visible | Active/Pressed | Selected | Disabled | Loading | Error | Read-only | Empty |
|------|-------|---------------|----------------|----------|----------|---------|-------|-----------|-------|
| ✓ khung `bg.muted`, nút icon `icon.default` | ✓ nút: nền `bg.surface` | ✓ vòng `focus.ring.*` quanh **cả khung** (ô giá trị lấy focus); nền khung giữ nguyên để hover của nút vẫn thấy | ✓ nút: nền `bg.primary-subtle` | — (không có lựa chọn) | ✓ `disabled`: khung `bg.disabled`, chữ + icon mờ, vẫn thấy giá trị; nút chạm tới cận bị `disabled` riêng | — (giá trị đổi ngay trong trình duyệt; lưu nền do nơi dùng báo qua `nxt-alert` / live region) | ✓ `error`, hoặc giá trị ngoài khoảng / gõ không phải số: khung `bg.danger-subtle` + viền `border.danger` + icon và chữ dưới khung | ✓ `readonly`: khung không nền, viền `border.default`, **ẩn hai nút**, vẫn focus được | ✓ `value = null`: ô trống, tăng / giảm bắt đầu từ `0` rồi kẹp vào khoảng |

Trạng thái lỗi không chỉ bằng màu (WCAG 1.4.1): có icon `alert-circle` và câu chữ nói cách sửa.

**Giá trị được kiểm ở đâu:**
- Nút, phím và `Enter` / blur: kết quả luôn được **kẹp** vào `[min, max]` và làm tròn theo `fractionDigits`; không có cách tạo giá trị ngoài khoảng bằng thao tác của người dùng.
- Gõ số: không báo lỗi khi đang gõ (gõ "1" trên đường tới "15" không nhấp nháy đỏ); xử lý lúc **chốt** (blur hoặc `Enter`). Ngoài khoảng thì kẹp và hiện con số đã kẹp. Không phải số (chữ, "1,2,3") thì **giữ nguyên chữ đã gõ**, giá trị trước đó không đổi, hiện trạng thái lỗi và lời nhắc cho tới khi gõ lại hoặc bấm `Esc`.
- Giá trị nơi dùng đặt từ ngoài (form, máy chủ) mà nằm ngoài khoảng: **không tự sửa** (dữ liệu đúng quan trọng hơn), hiện trạng thái lỗi; nút tăng / giảm kéo giá trị về trong khoảng.

## 6. Keyboard & ARIA
APG pattern: https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/

| Phím (khi focus ở ô giá trị) | Hành vi |
|------|---------|
| Tab / Shift+Tab | Vào / ra ô giá trị (một điểm dừng; hai nút không nằm trong thứ tự Tab); `disabled` bị bỏ qua, `readonly` vẫn nhận focus |
| ↑ | Tăng một `step` (chốt chữ đang gõ trước) |
| ↓ | Giảm một `step` |
| Page Up | Tăng `10 × step` |
| Page Down | Giảm `10 × step` |
| Home | Về `min` (không làm gì khi không đặt `min`) |
| End | Lên `max` (không làm gì khi không đặt `max`) |
| Gõ số, dấu `-`, `.`, `,` | Sửa chữ trong ô; chưa đổi giá trị |
| Enter | Chốt chữ đang gõ (kẹp, làm tròn); form chứa nó vẫn gửi như ô nhập thường |
| Esc | Bỏ chữ đang gõ, trả về giá trị hiện tại; không làm gì khi không có chữ đang gõ (nên không chặn Esc đóng dialog) |
| Blur | Chốt chữ đang gõ; đánh dấu `touched` khi focus rời khỏi cả khung |
| Bất kỳ phím đổi giá trị khi `readonly` / `disabled` | Không đổi |

- Ô giá trị: `input type="text" role="spinbutton"` + `aria-valuenow` (số), `aria-valuemin`, `aria-valuemax` (khi có), `aria-valuetext` (con số đã định dạng + đơn vị, "12,5 giờ"), `aria-invalid="true"` khi lỗi, `aria-required="true"` khi `required`, `aria-readonly="true"` khi `readonly`, `aria-describedby` = gợi ý và lời nhắc lỗi. Khi `value = null` bỏ `aria-valuenow` và `aria-valuetext`. Tên truy cập từ `label[for]`.
- Hai nút: `button type="button"`, `aria-label` "Giảm, <nhãn>" / "Tăng, <nhãn>", `aria-controls` = id ô giá trị, `tabindex="-1"`: người dùng bàn phím và screen reader đã có mũi tên trên ô giá trị (APG); nút vẫn ở cây trợ năng cho điều khiển bằng giọng nói và công tắc. Icon là trang trí.
- Nút `disabled` native khi tới cận (`min` / `max`) hoặc khi cả control bị khoá: lý do hiển nhiên (con số đang hiện đúng cận).
- Chuột / cảm ứng: bấm = một bước, nhấn giữ (`autoRepeat`) sau 400 ms thì lặp mỗi 100 ms tới khi thả hoặc chạm cận. Bấm nút không cướp focus khỏi ô giá trị đang gõ (`mousedown` bị chặn mặc định).
- Không dùng con lăn chuột đổi giá trị (cuộn trang rất dễ đổi nhầm).
- Thông báo cho screen reader: giá trị mới đọc qua `aria-valuenow` / `aria-valuetext` của ô đang focus; không thêm live region (tránh đọc đôi).
- Focus ring: `:focus-within` của khung bằng `focus.ring.*` (cùng cách `nxt-form-field` làm). Forced colors: khung có viền `ButtonText`, vòng focus tô `Highlight`.

## 7. Tokens
`packages/tokens/src/component/stepper.tokens.json`:

| Token | Alias semantic | Ghi chú |
|-------|----------------|---------|
| `height` | `size.control.md` | Chiều cao khung theo mật độ (28 · 36 · 46px); cạnh của nút |
| `radius` | `radius.control` | |
| `bg` | `color.bg.muted` | Khung: nền xám nhạt không viền (kiểu iOS) |
| `bg-invalid` | `color.bg.danger-subtle` | |
| `bg-disabled` | `color.bg.disabled` | |
| `bg-readonly` | `color.bg.transparent` | |
| `border` | `color.border.transparent` | Giữ độ dày viền để đổi trạng thái không nhảy layout |
| `border-invalid` | `color.border.danger` | |
| `border-readonly` | `color.border.default` | |
| `button-icon` | `color.icon.default` | Icon `minus` / `plus` |
| `button-icon-disabled` | `color.icon.disabled` | |
| `button-bg-hover` | `color.bg.surface` | Nút khi hover |
| `button-bg-active` | `color.bg.primary-subtle` | Nút khi đang nhấn |
| `value-text` | `color.text.strong` | Con số |
| `value-text-disabled` | `color.text.disabled` | Chỉ con số; đơn vị là chữ ngoài ô nhập nên giữ `unit-text` (không được miễn tương phản như control bị khoá) |
| `unit-text` | `color.text.subtle` | Đơn vị |
| `label-text` | `color.text.default` | |
| `hint-text` | `color.text.subtle` | |
| `error-text` | `color.text.danger` | |

Dùng thẳng semantic: `space.inset.{sm,md}`, `space.gap.{xs,sm}`, `border-width.default`, `typography.{body-md,label-md,caption}`, `focus.ring.*`, `size.icon.{sm,md}`, `motion.duration.fast`, `motion.ease.standard`.

Tương phản (đo từ `dist/json` 2026-11-16, sáng / tối): `icon.default` / `bg.muted` 9,02 / 9,60; `text.strong` / `bg.muted` 17,19 / 14,49; `text.strong` / `bg.surface` 19,80 / 17,16; `text.subtle` / `bg.muted` 5,66 / 5,85; `text.danger` / `bg.danger-subtle` 6,42 / 7,92; `border.danger` / `bg.danger-subtle` 5,01 / 5,34; `icon.default` / `bg.primary-subtle` 9,57 / 9,22; `focus.ring.color` / `bg.muted` 4,32 / 5,74. ❓ Cần thêm vào `contrastPairs` (chưa có): `text.strong` / `bg.muted` (≥ 4,5, con số trên khung), `icon.default` / `bg.muted` (≥ 3, nút), `icon.default` / `bg.primary-subtle` (≥ 3, nút đang nhấn), `focus.ring.color` / `bg.muted` (≥ 3, vòng focus trên khung).

## 8. Density, responsive, i18n
- Chiều cao khung và cạnh nút theo `size.control.md`: gọn 28px (vẫn ≥ 24 theo WCAG 2.5.8), vừa 36px, rộng 46px (≥ 44, dùng cho cảm ứng). Không đổi cỡ chữ.
- Bề rộng ô giá trị tính theo số ký tự dài nhất có thể (con số của `min`, `max`, hoặc chữ đang gõ, tối thiểu 3, tối đa 14 ký tự `ch`) để khung **không đổi bề rộng** khi bấm tăng / giảm; số dùng `tabular-nums`.
- Đọc và hiện số theo `locale` (`vi-VN`: "1.250,5"). Đọc chữ gõ: nhận cả `,` và `.` làm dấu thập phân; một dấu `.` hoặc `,` đúng ba chữ số theo sau và đứng đúng chỗ dấu nghìn của locale thì coi là dấu nghìn ("1.500" → 1500 với `vi-VN`); nhận dấu trừ Unicode `−`; bỏ khoảng trắng.
- Số có thể đặt dấu âm: `inputmode` là `text` khi `min < 0` (bàn phím số của iOS không có dấu trừ), `decimal` khi có phần thập phân, `numeric` còn lại.
- Chuỗi mặc định (`decreaseLabel`, `increaseLabel`, lời nhắc lỗi) viết bằng tiếng Việt và override được qua input (`invalidText` thay lời nhắc lỗi giá trị).
- Nhãn dài tự xuống dòng; khung giữ kích thước, không co.

## 9. Content guidelines
- Nhãn là **đại lượng** đang chỉnh, danh từ: "Số ngày nghỉ phép", "Hệ số lương", "Số lượng cần tuyển". Không viết "Nhập số ngày" hay "Tăng/giảm số ngày".
- Đơn vị ngắn, một từ, viết thường: "ngày", "giờ", "%". Không lặp đơn vị trong nhãn và trong `unit`.
- `hint` nêu quy tắc giới hạn: "Tối đa 30 ngày mỗi năm." Không nhắc lại khoảng đã có trong lời nhắc lỗi.
- Lời nhắc lỗi giá trị nói cách sửa: "Nhập số từ 0 đến 30." (ngoài khoảng), "Nhập một số từ 0 đến 30." (không phải số); chỉ có một cận thì "Nhập số từ 1 trở lên." / "Nhập số không quá 5."
- `error` từ nơi dùng nói nguyên nhân và cách sửa như mọi field: "Số ngày nghỉ vượt quá số ngày còn lại. Hãy nhập tối đa 5 ngày."

## 10. Acceptance (Definition of Done)
- [ ] Mọi trạng thái ở §5 có trong docs example (`stepper-basic`, `stepper-decimal`, `stepper-states`) — chưa chạy `docs:generate` / xem bản render
- [x] Unit test phủ keyboard map §6: ↑ ↓ Page Up Page Down Home End, Enter / blur chốt, Esc, kẹp khoảng, đọc số `vi-VN`, lỗi không phải số, giá trị ngoài khoảng từ ngoài, nút (bấm và nhấn giữ), `disabled`, `readonly`, Angular forms (giá trị, disabled, touched)
- [ ] axe: 0 vi phạm ở sáng/tối/gọn — chưa chạy
- [x] `npm run ds:check` sạch (tokens + hardcoded)
- [x] Docs page đủ mục (skill `nxt-docs-page`)

## 11. Việc còn mở
- `contrastPairs` chưa có các cặp ở §7 (❓), validator chưa tự kiểm.
- Chưa có `size` (`sm` / `lg`): một cỡ theo density là đủ cho form; bảng dày cần stepper gọn sẽ dùng density `compact`.
- Chưa tự khoá nút quá cận theo `aria-disabled` kèm tooltip (xem foundations/states): nút không nằm trong thứ tự Tab, lý do hiển nhiên.
- Chưa có `NxtStepperHarness` (đợt B, xem component-conventions §5).
- Giá trị gõ tay không được "bắt" về lưới bước (`min + n × step`): chỉ kẹp khoảng và làm tròn theo `fractionDigits`; nơi cần lưới bước kiểm ở validator của form.
