---
title: Date picker
description: Ô nhập ngày (một ngày hoặc một khoảng) gõ được `06112026` hay `6/11/2026` hoặc chọn trên lịch; lưu ISO `yyyy-MM-dd`, hiển thị `dd/MM/yyyy`, không bao giờ đọc nhầm tháng trước ngày.
status: beta
group: Nhập liệu
order: 9
package: "@nxt/ui/date-picker"
keywords:
  - chon ngay
  - o ngay
  - ngay sinh
  - ngay hieu luc
  - khoang ngay
  - ky nghi phep
  - loc theo ky
  - date picker
  - date range
  - datepicker
---

# Date picker

Entry `@nxt/ui/date-picker` có hai component chạy **bên trong** [Form field](/components/form-field): `nxt-date-picker` (một ngày) và `nxt-date-range-picker` (một khoảng). Form field lo nhãn, hint, lỗi và viền; picker lo ô nhập, nút "Chọn ngày" và lịch ([Calendar](/components/calendar)) trong lớp phủ.

## Khi nào dùng

- Mọi trường ngày trong form, drawer, bộ lọc.
- Khi người dùng biết sẵn ngày cần nhập (ngày sinh trên CCCD, ngày ký trên hợp đồng giấy): gõ nhanh hơn chọn.

## Khi nào không dùng

- **Lịch là nội dung chính**: [Calendar](/components/calendar).
- **Hiển thị ngày chỉ đọc ở trang chi tiết**: [Descriptions](/components/descriptions), không dùng picker `readonly`.
- **Giờ, ngày + giờ, mốc tương đối**: chưa có, xem bảng dưới.

## Chọn control ngày giờ nào

| Nhu cầu | Control | Ví dụ HRM |
|---------|---------|-----------|
| Một ngày cụ thể, nhập nhanh bằng bàn phím | `nxt-date-picker` | Ngày sinh, ngày ký hợp đồng, ngày hiệu lực quyết định, ngày vào làm |
| Hai mốc của **một** khoảng, chọn khoảng là việc chính | `nxt-date-range-picker` | Kỳ nghỉ phép, đợt công tác, lọc danh sách theo kỳ, kỳ chấm công |
| Hai mốc có luật riêng, nhãn riêng | Hai `nxt-date-picker`, ô sau có `min` = ô trước | "Ngày ký hợp đồng" và "Ngày hiệu lực" |
| Lịch luôn hiện, chọn ngày là trọng tâm màn hình | [`nxt-calendar`](/components/calendar) | Chọn ngày phỏng vấn còn trống |
| Mốc tương đối ("30 ngày qua", "Tháng trước") cho bộ lọc lưu lại | Chưa có (`nxt-date-filter`, dự kiến). Tạm dùng `select[nxtInput]` | Lọc "Cập nhật lần cuối" |
| Giờ trong ngày | Chưa có (`nxt-time-picker`, dự kiến). Tạm dùng `input[nxtInput]` có hint `HH:mm` (24 giờ) | Giờ vào ca |
| Ngày + giờ trong một ô | Chưa có (`nxt-datetime-picker`). Tạm dùng date picker và ô giờ cạnh nhau | Lịch phỏng vấn, hạn duyệt |
| Thời lượng (8 giờ, 0,5 ngày) | Không dùng picker: ô số có đơn vị ở `nxtSuffix`, hoặc `select` cho các mức chuẩn | Thời hạn xử lý, số ngày phép |

Không dùng `input type="date"` native: định dạng theo trình duyệt (có thể ra `11/06/2026`), không gõ được `06112026`, lịch không có ngày lễ của công ty.

## Ví dụ

::example{date-picker-basic}

Gõ theo **ngày – tháng – năm**: `18031994`, `18/3/1994`, `18-03-1994`, `18.03.1994`, hoặc dán ISO `1994-03-18`. Rời ô hoặc bấm <kbd>Enter</kbd> thì ô chuẩn hoá về `18/03/1994`. Năm phải đủ 4 chữ số; `12/25/2026` là lỗi (không có tháng 25), **không bao giờ** được hiểu thành 25 tháng 12.

### Ngày liên quan nhau

`min` của ô sau lấy từ giá trị ô trước; `startAt` cho lịch mở ở tháng của ô trước khi ô sau còn trống. `todayButton` thêm nút "Hôm nay" trong lịch (chọn hôm nay và đóng).

::example{date-picker-contract}

## Khoảng ngày

`nxt-date-range-picker` có **một** ô `dd/MM/yyyy – dd/MM/yyyy` và trả về `{ start, end }` (ISO). Trên lịch: bấm ngày đầu, di chuột để xem khoảng tạm, bấm ngày cuối là lịch đóng. Ngày cuối trước ngày đầu thì tự đảo; đầu = cuối hợp lệ (nghỉ một ngày).

**Khoảng tính cả ngày cuối**: `{ start: '2026-12-28', end: '2027-01-04' }` là 8 ngày lịch, từ 00:00 ngày 28/12 đến 23:59:59 ngày 04/01. Khi backend lọc theo thời điểm, so sánh `< end + 1 ngày`, không phải `< end`.

::example{date-picker-range}

Gõ khoảng: hai ngày, phân cách bằng `–`, `-`, `~` hoặc "đến". Gõ một ngày là khoảng một ngày.

## Lỗi

Picker là `Validator`: nơi dùng đọc lỗi từ form control và truyền câu chữ vào `nxt-form-field [error]`. Chữ gõ sai **được giữ nguyên** trong ô để người dùng sửa; giá trị là `null`.

| Lỗi | Khi nào | Nên viết |
|-----|---------|----------|
| `nxtDateParse` `{ text }` | Không đọc được thành ngày (gồm `31/02/2026`, năm 2 chữ số) | Chưa đọc được ngày "31/02/2026". Nhập theo dạng dd/mm/yyyy, ví dụ 02/12/2026. |
| `nxtDateMin` `{ min, actual }` | Trước `min` (khoảng: ngày đầu) | Ngày hiệu lực phải từ 06/11/2026 trở đi. |
| `nxtDateMax` `{ max, actual }` | Sau `max` (khoảng: ngày cuối) | Ngày sinh không được sau hôm nay (06/11/2026). |
| `nxtDateFilter` `{ actual }` | `dateFilter` trả `false` | Ngày 02/09/2026 đã có đơn nghỉ. Chọn ngày khác. |

::example{date-picker-error}

Không dùng forms: đọc `parseError()` qua template ref (`#dp="nxtDatePicker"`).

## Chỉ đọc và vô hiệu

- `readonly`: ô focus và copy được, không có nút lịch, phím không đổi giá trị. Dùng khi giá trị đến từ nơi khác nhưng người dùng cần thấy trong form.
- Vô hiệu (`disabled` hoặc `control.disable()`): luôn có hint nói vì sao và khi nào mở.

::example{date-picker-states}

## Anatomy

| # | Phần | Ghi chú |
|---|------|---------|
| 1 | Form field | Nhãn, hint, lỗi, dấu `*`, viền và focus ring |
| 2 | Ô nhập | Placeholder `dd/mm/yyyy` (mẫu định dạng, không phải ngày mẫu) |
| 3 | Nút "Chọn ngày" | Icon lịch cuối ô; có nền khi lịch đang mở |
| 4 | Panel lịch | Neo dưới ô, lật lên trên khi thiếu chỗ; chứa [Calendar](/components/calendar) và nút "Hôm nay" (tuỳ chọn) |

## Hành vi & trạng thái

- Gõ không đổi giá trị ngay; giá trị được xác nhận khi rời ô, bấm <kbd>Enter</kbd>, mở lịch, hoặc dùng <kbd>PageUp</kbd> / <kbd>PageDown</kbd>.
- Chọn trên lịch là điền ô và đóng. Bấm ra ngoài hoặc <kbd>Esc</kbd>: đóng, giá trị không đổi.
- `min`, `max`, `dateFilter` khoá ngày trên lịch và kiểm tra chữ gõ. Ngày lễ, ngày nghỉ (`specialDays`, `nonWorkingWeekdays`) chỉ để nhìn, không khoá.
- Lịch mở ở ngày đã chọn; ô trống thì ở `startAt`, nếu không thì hôm nay.

## Accessibility

| Phím | Ở đâu | Hành vi |
|------|-------|---------|
| <kbd>Alt</kbd>+<kbd>↓</kbd> | ô nhập | Mở lịch, focus vào ngày đã chọn |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | nút lịch | Mở lịch |
| <kbd>Enter</kbd> | ô nhập | Xác nhận chữ đang gõ (vẫn gửi form như thường) |
| <kbd>PageUp</kbd> / <kbd>PageDown</kbd> | ô nhập | +1 / −1 ngày (ô trống: bắt đầu từ hôm nay); bỏ qua ngày bị khoá, dừng ở `min` / `max`. Khoảng: đổi ngày ở phía con trỏ |
| <kbd>Shift</kbd>+<kbd>PageUp</kbd> / <kbd>Shift</kbd>+<kbd>PageDown</kbd> | ô nhập | +1 / −1 tháng |
| <kbd>Esc</kbd> | ô nhập | Đang gõ dở: trả ô về giá trị đã xác nhận. Không có gì để hoàn tác: <kbd>Esc</kbd> đi tiếp tới drawer / dialog chứa form |
| Mũi tên, <kbd>Home</kbd>, <kbd>End</kbd>, <kbd>PageUp</kbd>, <kbd>PageDown</kbd> | lịch | Như [Calendar](/components/calendar#accessibility) |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | lịch | Chọn ngày, đóng, focus về nơi đã mở lịch. Khoảng: lần hai mới đóng |
| <kbd>Tab</kbd> | lịch | Đi vòng trong panel |
| <kbd>Esc</kbd> / <kbd>Alt</kbd>+<kbd>↑</kbd> | lịch | Đóng, không đổi giá trị |

<kbd>PageUp</kbd> **tăng** ngày trong ô nhập (như ô số), còn trong lưới lịch <kbd>PageUp</kbd> **lùi** về tháng trước (như APG). Hai vai trò khác nhau nên hai quy ước khác nhau.

- Ô nhập nhận nhãn, `aria-describedby`, `aria-invalid`, `aria-required` từ form field.
- Nút lịch: tên "Chọn ngày, Ngày sinh" (thêm nhãn trường để phân biệt khi form có nhiều trường ngày), `aria-haspopup="dialog"`, `aria-expanded`.
- Panel: `role="dialog"`, `aria-modal="true"`, tên "Chọn ngày" / "Chọn khoảng ngày"; focus giữ trong panel và trả về khi đóng.

## Nội dung

| Nên | Không nên |
|-----|-----------|
| Ngày sinh · Ngày hiệu lực · Thời gian nghỉ | Ngày sinh (dd/MM/yyyy) — định dạng đã ở placeholder |
| Không sau hôm nay. · Từ 01/12/2026 trở đi. | Ngày phải hợp lệ. |
| Chưa đọc được ngày "31/02/2026". Nhập theo dạng dd/mm/yyyy, ví dụ 02/12/2026. | Ngày không hợp lệ. |
| 28/12/2026 – 04/01/2027 | 28/12 - 4/1 · 12/28/2026 |

Mọi chuỗi đổi được qua `labels` (`openCalendar`, `dialog`, `today`, và `calendar` cho chuỗi trong lịch) và `placeholder`.

## API

::api{date-picker}

## Token

::tokens{component.date-picker}

Ô lịch dùng token của [Calendar](/components/calendar#token).

## Changelog

- **Chưa phát hành**: thêm `nxt-date-picker` và `nxt-date-range-picker` (beta): gõ trực tiếp (`d/M/yyyy`, `dd-MM-yyyy`, `ddMMyyyy`, ISO), lịch trong overlay CDK, Alt+↓, PageUp/PageDown trong ô, `min`, `max`, `dateFilter`, `specialDays`, `startAt`, `todayButton`, `readonly`; ControlValueAccessor + Validator (`nxtDateParse`, `nxtDateMin`, `nxtDateMax`, `nxtDateFilter`); token `component.date-picker.*`.
