---
component: date-picker
status: beta
owner: "NXT core"
updated: 2026-11-06
apg-pattern: dialog-modal (Date Picker Dialog) — nút mở dialog chứa lưới ngày `nxt-calendar`
---

# Date picker & Date range picker: Spec

Entry `@nxt/ui/date-picker` gồm `nxt-date-picker` (một ngày) và `nxt-date-range-picker` (một khoảng, cùng entry). Cả hai là ô nhập gõ được + nút "Chọn ngày" mở `nxt-calendar` trong overlay CDK, chạy **bên trong `nxt-form-field`**.

## 1. Mục đích
- **Vấn đề người dùng giải quyết:** nhập ngày nhanh bằng bàn phím (gõ `06112026`, PageUp/PageDown) hoặc chọn trên lịch khi cần thấy thứ trong tuần, mà không bao giờ bị hiểu nhầm ngày/tháng; giá trị lưu là ISO, tách khỏi cách hiển thị.
- **Khi nào dùng:**
  - `nxt-date-picker`: một ngày cụ thể — ngày sinh, ngày ký hợp đồng, ngày hiệu lực quyết định, ngày vào làm.
  - `nxt-date-range-picker`: hai mốc của **một** khoảng — kỳ nghỉ phép, đợt công tác, kỳ chấm công, lọc danh sách theo kỳ.
- **Khi nào KHÔNG dùng:**
  - Lịch luôn hiện trên trang, chọn ngày là việc chính: [`nxt-calendar`](/components/calendar).
  - Mốc tương đối ("30 ngày qua", "Tháng trước") cho bộ lọc lưu lại: chưa có (`nxt-date-filter`, P2); tạm dùng `select[nxtInput]`.
  - Giờ, ngày + giờ: chưa có (`nxt-time-picker`, `nxt-datetime-picker`); tạm dùng hai trường.
  - Hiển thị ngày chỉ đọc ở trang chi tiết: dùng `nxt-descriptions`, không dùng picker `readonly`.
  - Không dùng `input type="date"` native: định dạng theo locale trình duyệt (có thể ra `11/06/2026`), không gõ được `ddMMyyyy`, lịch không có ngày lễ.

## 2. Anatomy
| # | Phần tử | Bắt buộc | Ghi chú |
|---|---------|----------|---------|
| 1 | `nxt-form-field` (bọc ngoài) | ✓ | Nhãn, hint, lỗi, dấu bắt buộc, viền và focus ring |
| 2 | Ô nhập `input[nxtInput]` | ✓ | Do picker dựng; nhận id/`aria-describedby`/`aria-invalid` từ form-field. Placeholder `dd/mm/yyyy` (range: `dd/mm/yyyy – dd/mm/yyyy`) |
| 3 | Nút "Chọn ngày" | ✓ (trừ `readonly`) | `nxtIconButton` ghost, icon `calendar`, cuối ô; `aria-haspopup="dialog"`, `aria-expanded` |
| 4 | Panel (overlay) | ✓ khi mở | CDK Dialog neo dưới ô (lật lên trên khi thiếu chỗ), `role="dialog"` `aria-modal="true"`, tên "Chọn ngày" / "Chọn khoảng ngày" |
| 5 | `nxt-calendar` | ✓ | Mode `single` / `range`, nhận `min`/`max`/`dateFilter`/`specialDays` |
| 6 | Nút "Hôm nay" | — | Khi `todayButton`: chọn hôm nay rồi đóng (khoá nếu hôm nay không chọn được) |

## 3. API (Angular)
Selector `nxt-date-picker`, `nxt-date-range-picker`. Cả hai implement `ControlValueAccessor` và `Validator` (`formControl`, `formControlName`, `ngModel`), hoặc dùng `[(value)]`.

| Loại | Tên | Kiểu | Mặc định | Mô tả |
|------|-----|------|----------|-------|
| model | `value` | date: `string \| null` (ISO `yyyy-MM-dd`); range: `NxtDateRange \| null` (`{ start, end }`) | `null` | Giá trị đã xác nhận |
| input | `min`, `max` | `string \| null` | `null` | Chặn trên lịch; gõ ngoài khoảng → lỗi validator |
| input | `dateFilter` | `((date: string) => boolean) \| null` | `null` | Khoá ngày rời rạc (range: kiểm tra hai đầu) |
| input | `specialDays`, `nonWorkingWeekdays` | như `nxt-calendar` | `[]` | Ngày lễ, ngày nghỉ hiển thị trên lịch |
| input | `startAt` | `string \| null` | `null` | Tháng mở ra khi ô trống (ví dụ "Đến ngày" mở ở tháng của "Từ ngày") |
| input | `today` | `string` | ngày hiện tại | Cố định cho test/example |
| input | `todayButton` | `boolean` | `false` | Nút "Hôm nay" trong panel |
| input | `disabled` | `boolean` | `false` | Cùng với trạng thái disabled của form control |
| input | `readonly` | `boolean` | `false` | Ô chỉ đọc (focus, copy được), ẩn nút lịch |
| input | `placeholder` | `string` | `'dd/mm/yyyy'` (range `'dd/mm/yyyy – dd/mm/yyyy'`) | Mẫu định dạng, không phải ngày mẫu |
| input | `labels` | `Partial<NxtDatePickerLabels>` | tiếng Việt | Tên nút, tên panel, "Hôm nay"; `calendar` lồng `Partial<NxtCalendarLabels>` |
| readonly signal | `parseError` | `string \| null` | | Chữ người dùng gõ mà không đọc được (để hiện lỗi khi không dùng forms) |
| method | `open()`, `close()`, `focus()` | | | |

Lỗi validator (khoá trong `control.errors`):

| Khoá | Khi nào | Dữ liệu |
|------|---------|---------|
| `nxtDateParse` | Chữ gõ không đọc được thành ngày (gồm `31/02/2026`, năm 2 chữ số) | `{ text }` |
| `nxtDateMin` | Ngày (range: ngày đầu) trước `min` | `{ min, actual }` |
| `nxtDateMax` | Ngày (range: ngày cuối) sau `max` | `{ max, actual }` |
| `nxtDateFilter` | `dateFilter` trả `false` | `{ actual }` |

Nơi dùng đổi lỗi thành câu chữ và truyền vào `nxt-form-field [error]` (form-field không tự đọc `control.errors`). Giá trị gõ sai làm `value = null` và giữ nguyên chữ trong ô để người dùng sửa.

**Gõ và xác nhận:** gõ không đổi giá trị ngay; giá trị được xác nhận khi rời ô (blur), bấm <kbd>Enter</kbd>, mở lịch, hoặc dùng PageUp/PageDown. Hợp lệ thì ô chuẩn hoá về `dd/MM/yyyy`. Định dạng nhận: `nxtParseDate` / `nxtParseDateRange` (xem `calendar/SPEC.md` §3) — luôn ngày–tháng–năm, không bao giờ đoán MM/dd.

**Khoảng:** bao gồm cả ngày cuối (00:00 ngày đầu → 23:59:59.999 ngày cuối khi backend đổi sang thời điểm); `start = end` hợp lệ (nghỉ một ngày). Trên lịch: chọn ngày đầu → di chuột/focus tô khoảng tạm → chọn ngày cuối thì đóng; ngày cuối trước ngày đầu thì tự đảo. Gõ: hai ngày phân cách bằng `–`, `-`, `~` hoặc "đến"; gõ một ngày = khoảng một ngày.

## 4. Variants & sizes
| Component | Dùng khi | Không dùng khi |
|-----------|----------|----------------|
| `nxt-date-picker` | Một mốc ngày | Hai mốc của cùng một khoảng |
| `nxt-date-range-picker` | Kỳ nghỉ, kỳ lọc, kỳ công: một trường, một giá trị `{ start, end }` | Hai mốc có luật riêng từng mốc, cần nhãn riêng (ví dụ "Ngày ký" và "Ngày hiệu lực"): dùng hai date picker, "Đến ngày" có `min` = "Từ ngày" |

Size theo `nxt-form-field` (`sm` / `md`) và density; nút lịch là `nxtIconButton size="sm"`.

## 5. States
| Rest | Hover | Focus-visible | Active/Pressed | Selected | Disabled | Loading | Error | Read-only | Empty |
|------|-------|---------------|----------------|----------|----------|---------|-------|-----------|-------|
| ✓ | ✓ (viền form-field, nền nút ghost) | ✓ ring trên khung form-field (`:focus-within`); ring riêng trên nút | ✓ nút "pressed" khi panel mở: `aria-expanded="true"` + nền | ✓ ngày/khoảng trong lịch (xem calendar) | ✓ input `disabled` native, nút `aria-disabled` | — (giá trị đồng bộ) | ✓ `nxtDateParse`/`Min`/`Max`/`Filter` → nơi dùng truyền `error` cho form-field (viền đỏ, icon + chữ, `aria-invalid`) | ✓ `readonly`: ô focus/copy được, không có nút lịch, PageUp/PageDown không đổi giá trị | ✓ placeholder `dd/mm/yyyy` |

Theo SAP Fiori: Date Picker, value state cảnh báo / thông tin / thành công và thông điệp lặp lại trong panel cần `nxt-form-field` hỗ trợ trước (xem §11).

## 6. Keyboard & ARIA
APG: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/. Phím trong ô nhập theo SAP Fiori: Date Picker và Date Range Selection (đề xuất P1 trong ghi chú Fiori).

| Phím | Nơi | Hành vi |
|------|-----|---------|
| <kbd>Tab</kbd> | ô → nút | Ô nhập rồi nút "Chọn ngày"; panel vẫn đóng |
| <kbd>Alt</kbd>+<kbd>↓</kbd> | ô nhập | Xác nhận chữ đang gõ, mở lịch, focus vào ngày đã chọn (trống: `startAt`, nếu không thì hôm nay) |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | nút | Mở lịch như trên |
| <kbd>Enter</kbd> | ô nhập | Xác nhận chữ đang gõ (không chặn submit form) |
| <kbd>PageUp</kbd> / <kbd>PageDown</kbd> | ô nhập | +1 / −1 ngày (ô trống: bắt đầu từ hôm nay); bỏ qua ngày bị `dateFilter` khoá, dừng ở `min`/`max`. Range: đổi ngày ở phía con trỏ (đầu hoặc cuối) |
| <kbd>Shift</kbd>+<kbd>PageUp</kbd> / <kbd>Shift</kbd>+<kbd>PageDown</kbd> | ô nhập | +1 / −1 tháng (31/01 → 28/02) |
| <kbd>Esc</kbd> | ô nhập | Có chữ đang gõ dở: trả ô về giá trị đã xác nhận (và không lan ra drawer/dialog cha). Không có: để sự kiện lan (drawer đóng như thường) |
| (các phím lưới) | lịch | Như `nxt-calendar` §6: mũi tên, Home/End, PageUp/PageDown tháng, Shift+PageUp/PageDown năm |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | lịch | Chọn ngày → điền ô, đóng, focus về nơi đã mở (nút hoặc ô). Range: lần một đặt ngày đầu, lần hai hoàn tất và đóng |
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | panel | Đi vòng trong panel (focus trap) |
| <kbd>Esc</kbd> / <kbd>Alt</kbd>+<kbd>↑</kbd> | panel | Đóng, **không** đổi giá trị (range: bỏ ngày đầu đang chọn dở), trả focus |
| Bấm ra ngoài | panel | Đóng, không đổi giá trị |

PageUp tăng ngày trong ô nhập (như spinbutton), còn trong lưới PageUp lùi về tháng trước (như APG grid): hai quy ước của hai vai trò khác nhau, ghi rõ trong docs.

- Ô nhập: `id`, `aria-describedby`, `aria-invalid`, `aria-required` do `nxtInput` + form-field đặt; `autocomplete="off"`.
- Nút: tên "Chọn ngày, <nhãn trường>" (ví dụ "Chọn ngày, Ngày sinh") để phân biệt khi form có nhiều trường ngày; `aria-haspopup="dialog"`, `aria-expanded`.
- Panel: CDK Dialog, `role="dialog"`, `aria-modal="true"`, `aria-label` "Chọn ngày" / "Chọn khoảng ngày"; focus ban đầu là ô `tabindex="0"` của lưới; đóng thì CDK trả focus về phần tử đã mở.
- Mở bằng chuột từ nút cũng xác nhận chữ đang gõ (blur xảy ra trước).

## 7. Tokens
`packages/tokens/src/component/date-picker.tokens.json`:

| Token | Alias semantic | Ghi chú |
|-------|----------------|---------|
| `panel-bg` | `color.bg.surface-raised` | |
| `panel-border` | `color.border.default` | |
| `panel-radius` | `radius.overlay` | Bo 32px; padding panel `space.inset.lg` |
| `trigger-bg-open` | `color.bg.selected` | Nút lịch khi panel mở |
| `trigger-icon` | `color.icon.subtle` | |

Dùng thẳng semantic: `elevation.overlay`, `space.inset.*`, `space.gap.*`, `border-width.default`. Màu ô lịch lấy từ token `calendar`.

## 8. Density, responsive, RTL/i18n
- Chiều cao ô theo form-field + density; ô lịch theo `size.control.md`.
- Panel neo vào khung form-field, đẩy vào trong màn hình (`withPush`); màn rất hẹp vẫn là popover rộng 7 ô lịch (~ 7 × 40px ở spacious).
- Nội dung: `dd/MM/yyyy` (10 ký tự) luôn vừa; range 23 ký tự cần ô ≥ 16 ký tự — đặt range ở cột rộng trong `nxt-grid`.
- Mọi chuỗi qua `labels` (ngx-translate cấp `labels` hoặc `NXT_CALENDAR_LABELS`).

## 9. Content guidelines
- Nhãn trường: "Ngày sinh", "Ngày hiệu lực", "Thời gian nghỉ", "Kỳ chấm công". Không thêm "(dd/MM/yyyy)" vào nhãn: định dạng ở placeholder và hint.
- Hint khi có ràng buộc: "Không sau hôm nay.", "Từ 01/12/2026 trở đi.", "Tính cả ngày cuối; ngày lễ không trừ phép."
- Lỗi nói cách sửa:
  - `nxtDateParse`: "Chưa đọc được ngày "31/02/2026". Nhập theo dạng dd/mm/yyyy, ví dụ 06/11/2026."
  - `nxtDateMin`: "Ngày hiệu lực phải từ 01/12/2026 trở đi."
  - `nxtDateMax`: "Ngày sinh không được sau hôm nay (06/11/2026)."
  - Không viết "Ngày không hợp lệ".

## 10. Acceptance (Definition of Done)
- [x] Unit test phủ keyboard map §6 (Alt+↓ mở và focus ô lịch, Esc đóng không đổi giá trị và trả focus, Enter chọn và đóng, PageUp/PageDown ±1 ngày, Shift+PageUp/PageDown ±1 tháng, Esc trong ô hoàn tác chữ gõ dở, range: đổi ngày theo vị trí con trỏ)
- [x] Unit test CVA + validator với `FormControl`: ghi/đọc ISO, disabled, touched khi blur, `nxtDateParse`/`Min`/`Max`/`Filter`, range tự đảo và tính cả ngày cuối
- [x] Unit test ARIA: nối nhãn form-field vào ô, `aria-haspopup`/`aria-expanded`, `role="dialog"` có tên, readonly ẩn nút
- [x] Example: ngày sinh (`max`), ngày hiệu lực hợp đồng (`min` + "Hôm nay"), kỳ nghỉ phép (range + ngày lễ), lỗi parse, disabled/readonly (`apps/docs/src/examples/date-picker/`)
- [ ] axe: 0 vi phạm ở sáng/tối/gọn (chưa chạy: `npm run test:a11y` thuộc phiên chính)
- [ ] Test bàn phím e2e trong `apps/docs/e2e` (file dùng chung, đề xuất cho phiên chính)
- [x] `npm run ds:check` sạch cho file của date-picker (tokens + hardcoded)
- [x] Docs page đủ mục (skill `nxt-docs-page`), có bảng "Chọn control ngày giờ nào"

## 11. Việc còn mở
- **Cần ở `nxt-form-field` (nhánh S1):** value state `warning`/`info`/`success`; thông điệp lỗi lặp lại trong panel khi đang mở (Fiori); style `readonly`; giữ cả hint lẫn lỗi trong `aria-describedby`. Picker sẽ đọc các trạng thái đó khi form-field có API.
- Màn hẹp: mở lịch dạng dialog/bottom sheet toàn màn, tiêu đề = nhãn trường, nút "Huỷ" · P2.
- Phím tắt chữ tiếng Việt ("hôm nay", "+3") · P2. F4 mở lịch · P3.
- Footer "Áp dụng / Huỷ" cho range trong panel lọc nhiều thay đổi · P3.
- Kiểu tháng (`MM/yyyy`) và năm (`yyyy`) · P2.
